import secrets
import hashlib
import hmac
import time
from typing import Optional, Dict, Any
from fastapi import HTTPException, Request, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class SecurityConfig:
    """Security configuration and utilities"""
    
    # Rate limiting
    RATE_LIMIT_REQUESTS = 100  # requests per window
    RATE_LIMIT_WINDOW = 60  # seconds
    RATE_LIMIT_BURST = 10  # burst allowance
    
    # Security headers
    SECURITY_HEADERS = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'Content-Security-Policy': (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https:; "
            "connect-src 'self' https:; "
            "frame-ancestors 'none';"
        )
    }
    
    # CSRF protection
    CSRF_TOKEN_LENGTH = 32
    CSRF_TOKEN_EXPIRY = 3600  # 1 hour
    
    # Input validation
    MAX_INPUT_LENGTH = 10000
    ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

class RateLimiter:
    """Rate limiting implementation"""
    
    def __init__(self):
        self.requests = {}  # {ip: [(timestamp, count)]}
    
    def is_allowed(self, ip: str) -> bool:
        """Check if request is allowed based on rate limit"""
        now = time.time()
        window_start = now - SecurityConfig.RATE_LIMIT_WINDOW
        
        # Clean old entries
        if ip in self.requests:
            self.requests[ip] = [
                (timestamp, count) for timestamp, count in self.requests[ip]
                if timestamp > window_start
            ]
        else:
            self.requests[ip] = []
        
        # Count requests in current window
        current_requests = sum(count for _, count in self.requests[ip])
        
        if current_requests >= SecurityConfig.RATE_LIMIT_REQUESTS:
            return False
        
        # Add current request
        self.requests[ip].append((now, 1))
        return True

class CSRFProtection:
    """CSRF token generation and validation"""
    
    @staticmethod
    def generate_token() -> str:
        """Generate a secure CSRF token"""
        return secrets.token_urlsafe(SecurityConfig.CSRF_TOKEN_LENGTH)
    
    @staticmethod
    def validate_token(token: str, session_token: str) -> bool:
        """Validate CSRF token against session token"""
        if not token or not session_token:
            return False
        
        try:
            # Use constant-time comparison
            return hmac.compare_digest(token, session_token)
        except Exception:
            return False

class InputSanitizer:
    """Input sanitization and validation"""
    
    @staticmethod
    def sanitize_string(input_str: str, max_length: int = SecurityConfig.MAX_INPUT_LENGTH) -> str:
        """Sanitize string input"""
        if not input_str:
            return ""
        
        # Truncate if too long
        if len(input_str) > max_length:
            input_str = input_str[:max_length]
        
        # Remove potentially dangerous characters
        dangerous_chars = ['<', '>', '"', "'", '&', '\x00', '\r', '\n']
        for char in dangerous_chars:
            input_str = input_str.replace(char, '')
        
        return input_str.strip()
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format"""
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    @staticmethod
    def validate_password(password: str) -> Dict[str, Any]:
        """Validate password strength"""
        result = {
            'valid': True,
            'errors': []
        }
        
        if len(password) < 8:
            result['valid'] = False
            result['errors'].append('Password must be at least 8 characters long')
        
        if not any(c.isupper() for c in password):
            result['valid'] = False
            result['errors'].append('Password must contain at least one uppercase letter')
        
        if not any(c.islower() for c in password):
            result['valid'] = False
            result['errors'].append('Password must contain at least one lowercase letter')
        
        if not any(c.isdigit() for c in password):
            result['valid'] = False
            result['errors'].append('Password must contain at least one number')
        
        return result

class SecurityMiddleware(BaseHTTPMiddleware):
    """Security middleware for adding security headers and rate limiting"""
    
    def __init__(self, app):
        super().__init__(app)
        self.rate_limiter = RateLimiter()
    
    async def dispatch(self, request: Request, call_next):
        # Get client IP
        client_ip = request.client.host
        if 'x-forwarded-for' in request.headers:
            client_ip = request.headers['x-forwarded-for'].split(',')[0].strip()
        
        # Rate limiting
        if not self.rate_limiter.is_allowed(client_ip):
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please try again later."
            )
        
        # Process request
        response = await call_next(request)
        
        # Add security headers
        for header, value in SecurityConfig.SECURITY_HEADERS.items():
            response.headers[header] = value
        
        # Add HSTS header for HTTPS
        if request.url.scheme == 'https':
            response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
        
        return response

class SecurityHeaders:
    """Security headers management"""
    
    @staticmethod
    def get_security_headers() -> Dict[str, str]:
        """Get all security headers"""
        return SecurityConfig.SECURITY_HEADERS.copy()
    
    @staticmethod
    def add_csp_header(response: Response, additional_directives: str = ""):
        """Add Content Security Policy header"""
        csp = SecurityConfig.SECURITY_HEADERS['Content-Security-Policy']
        if additional_directives:
            csp += f"; {additional_directives}"
        response.headers['Content-Security-Policy'] = csp

class RequestValidator:
    """Request validation and sanitization"""
    
    @staticmethod
    def validate_request_size(request: Request, max_size: int = 10 * 1024 * 1024) -> bool:
        """Validate request size"""
        content_length = request.headers.get('content-length')
        if content_length and int(content_length) > max_size:
            return False
        return True
    
    @staticmethod
    def validate_content_type(request: Request, allowed_types: list) -> bool:
        """Validate content type"""
        content_type = request.headers.get('content-type', '')
        return any(allowed_type in content_type for allowed_type in allowed_types)
    
    @staticmethod
    def sanitize_request_data(data: Dict[str, Any]) -> Dict[str, Any]:
        """Sanitize request data"""
        sanitized = {}
        for key, value in data.items():
            if isinstance(value, str):
                sanitized[key] = InputSanitizer.sanitize_string(value)
            elif isinstance(value, dict):
                sanitized[key] = RequestValidator.sanitize_request_data(value)
            else:
                sanitized[key] = value
        return sanitized

# Security utilities
def generate_secure_token(length: int = 32) -> str:
    """Generate a secure random token"""
    return secrets.token_urlsafe(length)

def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    """Hash password with salt"""
    if salt is None:
        salt = secrets.token_hex(32)
    
    password_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000  # iterations
    )
    
    return password_hash.hex(), salt

def verify_password(password: str, password_hash: str, salt: str) -> bool:
    """Verify password against hash"""
    computed_hash, _ = hash_password(password, salt)
    return hmac.compare_digest(computed_hash, password_hash)

def generate_csrf_token() -> str:
    """Generate CSRF token"""
    return CSRFProtection.generate_token()

def validate_csrf_token(token: str, session_token: str) -> bool:
    """Validate CSRF token"""
    return CSRFProtection.validate_token(token, session_token)

# JWT Token functions (for compatibility with existing auth)
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm="HS256")
    return encoded_jwt

def get_password_hash(password: str) -> str:
    """Hash password using PBKDF2"""
    password_hash, _ = hash_password(password)
    return password_hash

def get_current_user(token: str = Depends(HTTPBearer()), db: Session = Depends(get_db)):
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token.credentials, settings.secret_key, algorithms=["HS256"])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == username).first()
    if user is None:
        raise credentials_exception
    return user

def get_optional_user(token: Optional[str] = Depends(HTTPBearer(auto_error=False)), db: Session = Depends(get_db)):
    """Get current user from JWT token (optional, returns None if not authenticated)"""
    if not token:
        return None
    
    try:
        payload = jwt.decode(token.credentials, settings.secret_key, algorithms=["HS256"])
        username: str = payload.get("sub")
        if username is None:
            return None
    except JWTError:
        return None

    user = db.query(User).filter(User.email == username).first()
    return user

# Export security components
__all__ = [
    'SecurityConfig',
    'RateLimiter',
    'CSRFProtection',
    'InputSanitizer',
    'SecurityMiddleware',
    'SecurityHeaders',
    'RequestValidator',
    'generate_secure_token',
    'hash_password',
    'verify_password',
    'generate_csrf_token',
    'validate_csrf_token',
    'create_access_token',
    'get_password_hash',
    'get_current_user',
    'get_optional_user'
]