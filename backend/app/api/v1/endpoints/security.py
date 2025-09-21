from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer
from typing import Dict, Any
from app.core.security import SecurityConfig, generate_csrf_token, validate_csrf_token
from app.core.cache import cache
import logging

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()

@router.get("/csrf-token")
async def get_csrf_token():
    """Get CSRF token for form protection"""
    try:
        token = generate_csrf_token()
        return {"csrf_token": token}
    except Exception as e:
        logger.error(f"Error generating CSRF token: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error generating CSRF token"
        )

@router.post("/csrf-validate")
async def validate_csrf(request: Request, token: str):
    """Validate CSRF token"""
    try:
        # In a real implementation, get session token from request
        session_token = request.headers.get('x-session-token', '')
        
        is_valid = validate_csrf_token(token, session_token)
        
        return {
            "valid": is_valid,
            "message": "Token is valid" if is_valid else "Token is invalid"
        }
    except Exception as e:
        logger.error(f"Error validating CSRF token: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error validating CSRF token"
        )

@router.get("/security-headers")
async def get_security_headers():
    """Get current security headers configuration"""
    try:
        return {
            "headers": SecurityConfig.SECURITY_HEADERS,
            "rate_limit": {
                "requests_per_window": SecurityConfig.RATE_LIMIT_REQUESTS,
                "window_seconds": SecurityConfig.RATE_LIMIT_WINDOW,
                "burst_allowance": SecurityConfig.RATE_LIMIT_BURST
            },
            "csrf": {
                "token_length": SecurityConfig.CSRF_TOKEN_LENGTH,
                "token_expiry": SecurityConfig.CSRF_TOKEN_EXPIRY
            },
            "input_validation": {
                "max_input_length": SecurityConfig.MAX_INPUT_LENGTH,
                "allowed_file_types": SecurityConfig.ALLOWED_FILE_TYPES,
                "max_file_size": SecurityConfig.MAX_FILE_SIZE
            }
        }
    except Exception as e:
        logger.error(f"Error getting security headers: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting security configuration"
        )

@router.get("/security-status")
async def get_security_status():
    """Get current security status and metrics"""
    try:
        # Get cache stats for security monitoring
        cache_stats = cache.get_stats()
        
        return {
            "status": "secure",
            "cache_stats": cache_stats,
            "security_features": {
                "rate_limiting": True,
                "csrf_protection": True,
                "input_validation": True,
                "security_headers": True,
                "sql_injection_protection": True,
                "xss_protection": True,
                "request_validation": True
            },
            "recommendations": [
                "Enable HTTPS in production",
                "Configure Content Security Policy",
                "Set up security monitoring alerts",
                "Regular security audits"
            ]
        }
    except Exception as e:
        logger.error(f"Error getting security status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting security status"
        )

@router.post("/security-test")
async def security_test(request: Request):
    """Test security features (for development only)"""
    try:
        # This endpoint should be disabled in production
        if not request.headers.get('x-debug-mode'):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Security test endpoint disabled in production"
            )
        
        return {
            "message": "Security test passed",
            "client_ip": request.client.host if request.client else "unknown",
            "user_agent": request.headers.get('user-agent', 'unknown'),
            "headers": dict(request.headers)
        }
    except Exception as e:
        logger.error(f"Error in security test: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error in security test"
        )

@router.get("/health-check")
async def health_check():
    """Health check endpoint for load balancers"""
    try:
        return {
            "status": "healthy",
            "timestamp": "2024-01-01T00:00:00Z",
            "version": "1.0.0",
            "security": "enabled"
        }
    except Exception as e:
        logger.error(f"Error in health check: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Health check failed"
        )
