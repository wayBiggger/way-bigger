from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from typing import Optional, Dict
import httpx
import time
from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token, get_password_hash, verify_password, get_current_user
from app.models.user import User
from app.schemas.auth import UserCreate, UserLogin, Token, UserProfile
from fastapi.responses import RedirectResponse

# Simple in-memory rate limiting (use Redis in production)
login_attempts: Dict[str, list] = {}
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_DURATION = 300  # 5 minutes

router = APIRouter()


@router.post("/signup", response_model=dict)
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """User registration endpoint"""
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        existing_username = db.query(User).filter(User.username == user_data.username).first()
        if existing_username:
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
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user account"
        )


def check_rate_limit(email: str) -> bool:
    """Check if user is rate limited"""
    current_time = time.time()
    
    # Clean old attempts
    if email in login_attempts:
        login_attempts[email] = [
            attempt_time for attempt_time in login_attempts[email]
            if current_time - attempt_time < LOCKOUT_DURATION
        ]
    else:
        login_attempts[email] = []
    
    # Check if user is locked out
    if len(login_attempts[email]) >= MAX_LOGIN_ATTEMPTS:
        return False
    
    return True

def record_failed_attempt(email: str):
    """Record a failed login attempt"""
    current_time = time.time()
    if email not in login_attempts:
        login_attempts[email] = []
    login_attempts[email].append(current_time)

def clear_failed_attempts(email: str):
    """Clear failed attempts on successful login"""
    if email in login_attempts:
        del login_attempts[email]

@router.post("/login", response_model=dict)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """User login endpoint"""
    try:
        # Check rate limiting
        if not check_rate_limit(form_data.username):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many failed login attempts. Please try again later.",
                headers={"Retry-After": str(LOCKOUT_DURATION)},
            )
        
        user = db.query(User).filter(User.email == form_data.username).first()
        if not user or not verify_password(form_data.password, user.hashed_password):
            # Record failed attempt
            record_failed_attempt(form_data.username)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Clear failed attempts on successful login
        clear_failed_attempts(form_data.username)
        
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "full_name": user.full_name
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed due to server error"
        )


@router.post("/refresh", response_model=dict)
async def refresh_token(current_user: User = Depends(get_current_user)):
    """Refresh access token"""
    try:
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            data={"sub": current_user.email}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "user": {
                "id": current_user.id,
                "email": current_user.email,
                "username": current_user.username,
                "full_name": current_user.full_name
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )

@router.get("/me", response_model=UserProfile)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@router.get("/profile", response_model=dict)
async def get_user_profile(current_user: User = Depends(get_current_user)):
    """Get user profile with selected field"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "selected_field": getattr(current_user, 'selected_field', None)
    }

@router.post("/logout")
async def logout():
    """Logout endpoint - client should clear local storage"""
    return {"message": "Logged out successfully"}


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
        
        # Build Google OAuth URL manually to ensure no extra parameters
        base_url = "https://accounts.google.com/o/oauth2/v2/auth"
        params = [
            ("client_id", settings.google_client_id),
            ("redirect_uri", str(callback_url)),
            ("response_type", "code"),
            ("scope", "email profile"),
            ("access_type", "offline")
        ]
        
        # Manual URL construction
        query_string = "&".join([f"{k}={v}" for k, v in params])
        redirect_url = f"{base_url}?{query_string}"
        
        print(f"DEBUG: Google OAuth URL: {redirect_url}")
        print(f"DEBUG: Callback URL: {callback_url}")
        
        return RedirectResponse(url=redirect_url)
        
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
        from urllib.parse import urlencode
        query = urlencode(params)
        redirect_url = f"{url}?{query}"
        
        return RedirectResponse(url=redirect_url)

@router.get("/oauth/test")
async def oauth_test():
    """Test OAuth endpoint to debug the issue"""
    return {
        "message": "OAuth test endpoint",
        "google_client_id": settings.google_client_id,
        "frontend_url": settings.frontend_url
    }


@router.get("/oauth/{provider}/callback", name="oauth_callback")
async def oauth_callback(provider: str, request: Request, code: Optional[str] = None, db: Session = Depends(get_db)):
    try:
        provider = provider.lower()
        if provider not in {"google", "github"}:
            raise HTTPException(status_code=404, detail="Unsupported provider")
        if not code:
            raise HTTPException(status_code=400, detail="Missing authorization code")

        callback_url = request.url_for("oauth_callback", provider=provider)
        print(f"DEBUG: OAuth callback for {provider}, code: {code[:10]}..., callback_url: {callback_url}")

        async with httpx.AsyncClient() as client:
            if provider == "google":
                try:
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
                    print(f"DEBUG: Google token response status: {token_resp.status_code}")
                    if token_resp.status_code != 200:
                        print(f"DEBUG: Google token error: {token_resp.text}")
                        raise HTTPException(status_code=400, detail=f"Google token exchange failed: {token_resp.text}")
                    
                    token_json = token_resp.json()
                    access_token = token_json.get("access_token")
                    if not access_token:
                        raise HTTPException(status_code=400, detail="Failed to obtain Google token")

                    userinfo_resp = await client.get(
                        "https://www.googleapis.com/oauth2/v3/userinfo",
                        headers={"Authorization": f"Bearer {access_token}"},
                    )
                    print(f"DEBUG: Google userinfo response status: {userinfo_resp.status_code}")
                    if userinfo_resp.status_code != 200:
                        print(f"DEBUG: Google userinfo error: {userinfo_resp.text}")
                        raise HTTPException(status_code=400, detail=f"Google userinfo failed: {userinfo_resp.text}")
                    
                    info = userinfo_resp.json()
                    email = info.get("email")
                    username = info.get("name") or (email.split("@")[0] if email else None)
                    full_name = info.get("name") or username or ""
                    print(f"DEBUG: Google user info - email: {email}, username: {username}, full_name: {full_name}")
                    
                except httpx.HTTPStatusError as e:
                    print(f"DEBUG: HTTP error in Google OAuth: {e.response.status_code} - {e.response.text}")
                    raise HTTPException(status_code=400, detail=f"Google OAuth error: {e.response.text}")
                except Exception as e:
                    print(f"DEBUG: Unexpected error in Google OAuth: {str(e)}")
                    raise HTTPException(status_code=500, detail=f"Google OAuth error: {str(e)}")

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
        print(f"DEBUG: Creating/updating user - email: {email}, username: {username}, full_name: {full_name}")
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
            print(f"DEBUG: Created new user with ID: {db_user.id}")
        else:
            print(f"DEBUG: Found existing user with ID: {db_user.id}")

        # Issue JWT and redirect back to frontend
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        jwt_token = create_access_token(data={"sub": db_user.email}, expires_delta=access_token_expires)

        # For development, redirect to frontend with token and user data
        import urllib.parse
        user_data = {
            "id": db_user.id,
            "email": db_user.email,
            "username": db_user.username,
            "full_name": db_user.full_name
        }
        user_data_encoded = urllib.parse.quote(urllib.parse.urlencode(user_data))
        redirect_to = f"{settings.frontend_url}/auth/callback?token={jwt_token}&user={user_data_encoded}"
        print(f"DEBUG: Redirecting to: {redirect_to}")
        return RedirectResponse(url=redirect_to)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Unexpected error in OAuth callback: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"OAuth callback error: {str(e)}")
