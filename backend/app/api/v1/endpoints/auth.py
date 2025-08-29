from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Optional
import httpx
from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token, get_password_hash, verify_password, get_current_user
from app.models.user import User
from app.schemas.auth import UserCreate, UserLogin, Token, UserProfile
from fastapi.responses import RedirectResponse

router = APIRouter()


@router.post("/signup", response_model=dict)
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """User registration endpoint"""
    # Check if user already exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return {"message": "User created successfully", "user_id": db_user.id}


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """User login endpoint"""
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserProfile)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user


# -------------------- OAuth2 (Google & GitHub) --------------------
@router.get("/oauth/{provider}/login")
async def oauth_login(provider: str, request: Request):
    """Redirect user to provider's authorization page."""
    provider = provider.lower()
    if provider not in {"google", "github"}:
        raise HTTPException(status_code=404, detail="Unsupported provider")

    callback_url = request.url_for("oauth_callback", provider=provider)

    if provider == "google":
        if not settings.google_client_id or not settings.google_client_secret:
            raise HTTPException(status_code=400, detail="Google OAuth not configured")
        params = {
            "client_id": settings.google_client_id,
            "redirect_uri": str(callback_url),
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "offline",
            "prompt": "consent",
        }
        url = "https://accounts.google.com/o/oauth2/v2/auth"
    else:  # github
        if not settings.github_client_id or not settings.github_client_secret:
            raise HTTPException(status_code=400, detail="GitHub OAuth not configured")
        params = {
            "client_id": settings.github_client_id,
            "redirect_uri": str(callback_url),
            "scope": "read:user user:email",
        }
        url = "https://github.com/login/oauth/authorize"

    # Build a safe, properly encoded redirect URL
    try:
        from urllib.parse import urlencode
        query = urlencode(params)
        redirect_url = f"{url}?{query}"
    except Exception:
        # Fallback using httpx utilities
        redirect_url = str(httpx.URL(url).include_query_params(**params))
    return RedirectResponse(url=redirect_url)


@router.get("/oauth/{provider}/callback", name="oauth_callback")
async def oauth_callback(provider: str, request: Request, code: Optional[str] = None, db: Session = Depends(get_db)):
    provider = provider.lower()
    if provider not in {"google", "github"}:
        raise HTTPException(status_code=404, detail="Unsupported provider")
    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")

    callback_url = request.url_for("oauth_callback", provider=provider)

    async with httpx.AsyncClient() as client:
        if provider == "google":
            token_resp = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": settings.google_client_id,
                    "client_secret": settings.google_client_secret,
                    "redirect_uri": str(callback_url),
                    "grant_type": "authorization_code",
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            token_resp.raise_for_status()
            token_json = token_resp.json()
            access_token = token_json.get("access_token")
            if not access_token:
                raise HTTPException(status_code=400, detail="Failed to obtain Google token")

            userinfo_resp = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            userinfo_resp.raise_for_status()
            info = userinfo_resp.json()
            email = info.get("email")
            username = info.get("name") or (email.split("@")[0] if email else None)
            full_name = info.get("name") or username or ""

        else:  # github
            token_resp = await client.post(
                "https://github.com/login/oauth/access_token",
                data={
                    "client_id": settings.github_client_id,
                    "client_secret": settings.github_client_secret,
                    "code": code,
                    "redirect_uri": str(callback_url),
                },
                headers={"Accept": "application/json"},
            )
            token_resp.raise_for_status()
            token_json = token_resp.json()
            access_token = token_json.get("access_token")
            if not access_token:
                raise HTTPException(status_code=400, detail="Failed to obtain GitHub token")

            user_resp = await client.get(
                "https://api.github.com/user",
                headers={"Authorization": f"Bearer {access_token}", "Accept": "application/vnd.github+json"},
            )
            user_resp.raise_for_status()
            user = user_resp.json()
            email = user.get("email")
            if not email:
                emails_resp = await client.get(
                    "https://api.github.com/user/emails",
                    headers={"Authorization": f"Bearer {access_token}", "Accept": "application/vnd.github+json"},
                )
                emails_resp.raise_for_status()
                emails = emails_resp.json()
                primary = next((e for e in emails if e.get("primary") and e.get("verified")), None)
                email = primary.get("email") if primary else (emails[0]["email"] if emails else None)
            username = user.get("login")
            full_name = user.get("name") or username or ""

    if not email:
        raise HTTPException(status_code=400, detail="Provider did not return an email")

    # Upsert user
    db_user = db.query(User).filter(User.email == email).first()
    if not db_user:
        db_user = User(
            email=email,
            username=(username or email.split("@")[0]),
            full_name=full_name or (username or email.split("@")[0]),
            hashed_password=get_password_hash("oauth-login-placeholder"),
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

    # Issue JWT and redirect back to frontend
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    jwt_token = create_access_token(data={"sub": db_user.email}, expires_delta=access_token_expires)

    redirect_to = f"{settings.frontend_url}/auth/callback?token={jwt_token}"
    return RedirectResponse(url=redirect_to)
