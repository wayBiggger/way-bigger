from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import time
import logging
from typing import Dict, Set
from app.core.security import SecurityConfig, RateLimiter, InputSanitizer

logger = logging.getLogger(__name__)

class SecurityMiddleware(BaseHTTPMiddleware):
    """Enhanced security middleware"""
    
    def __init__(self, app):
        super().__init__(app)
        self.rate_limiter = RateLimiter()
        self.blocked_ips: Set[str] = set()
        self.suspicious_ips: Dict[str, int] = {}
    
    async def dispatch(self, request: Request, call_next):
        # Get client IP
        client_ip = self._get_client_ip(request)
        
        # Check if IP is blocked
        if client_ip in self.blocked_ips:
            logger.warning(f"Blocked IP attempted access: {client_ip}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Rate limiting (temporarily disabled for debugging)
        # if not self.rate_limiter.is_allowed(client_ip):
        #     logger.warning(f"Rate limit exceeded for IP: {client_ip}")
        #     self._handle_suspicious_activity(client_ip)
        #     raise HTTPException(
        #         status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        #         detail="Rate limit exceeded. Please try again later."
        #     )
        
        # Security checks
        await self._perform_security_checks(request, client_ip)
        
        # Process request
        try:
            response = await call_next(request)
        except Exception as e:
            logger.error(f"Request processing error: {e}")
            self._handle_suspicious_activity(client_ip)
            raise
        
        # Add security headers
        self._add_security_headers(response)
        
        return response
    
    def _get_client_ip(self, request: Request) -> str:
        """Get client IP address"""
        # Check for forwarded IP first
        if 'x-forwarded-for' in request.headers:
            return request.headers['x-forwarded-for'].split(',')[0].strip()
        
        # Check for real IP
        if 'x-real-ip' in request.headers:
            return request.headers['x-real-ip']
        
        # Fallback to direct connection
        return request.client.host if request.client else "unknown"
    
    async def _perform_security_checks(self, request: Request, client_ip: str):
        """Perform various security checks"""
        # Check for suspicious patterns
        user_agent = request.headers.get('user-agent', '').lower()
        if any(pattern in user_agent for pattern in ['bot', 'crawler', 'spider', 'scraper']):
            logger.info(f"Bot detected: {user_agent}")
        
        # Check for SQL injection patterns (temporarily disabled for debugging)
        # if self._detect_sql_injection(request):
        #     logger.warning(f"SQL injection attempt from {client_ip}")
        #     self._handle_suspicious_activity(client_ip)
        #     raise HTTPException(
        #         status_code=status.HTTP_400_BAD_REQUEST,
        #         detail="Invalid request"
        #     )
        
        # Check for XSS patterns (temporarily disabled for debugging)
        # if self._detect_xss(request):
        #     logger.warning(f"XSS attempt from {client_ip}")
        #     self._handle_suspicious_activity(client_ip)
        #     raise HTTPException(
        #         status_code=status.HTTP_400_BAD_REQUEST,
        #         detail="Invalid request"
        #     )
    
    def _detect_sql_injection(self, request: Request) -> bool:
        """Detect potential SQL injection attempts"""
        suspicious_patterns = [
            'union select', 'drop table', 'delete from', 'insert into',
            'update set', 'alter table', 'create table', 'exec(',
            'execute(', 'script>', 'javascript:', 'vbscript:',
            'onload=', 'onerror=', 'onclick='
        ]
        
        # Check URL parameters
        for param in request.query_params.values():
            param_lower = param.lower()
            if any(pattern in param_lower for pattern in suspicious_patterns):
                return True
        
        # Check headers
        for header_value in request.headers.values():
            header_lower = header_value.lower()
            if any(pattern in header_lower for pattern in suspicious_patterns):
                return True
        
        return False
    
    def _detect_xss(self, request: Request) -> bool:
        """Detect potential XSS attempts"""
        xss_patterns = [
            '<script', '</script>', 'javascript:', 'vbscript:',
            'onload=', 'onerror=', 'onclick=', 'onmouseover=',
            'alert(', 'confirm(', 'prompt(', 'document.cookie',
            'document.location', 'window.location'
        ]
        
        # Check URL parameters
        for param in request.query_params.values():
            param_lower = param.lower()
            if any(pattern in param_lower for pattern in xss_patterns):
                return True
        
        return False
    
    def _handle_suspicious_activity(self, client_ip: str):
        """Handle suspicious activity"""
        if client_ip in self.suspicious_ips:
            self.suspicious_ips[client_ip] += 1
        else:
            self.suspicious_ips[client_ip] = 1
        
        # Block IP after 5 suspicious activities
        if self.suspicious_ips[client_ip] >= 5:
            self.blocked_ips.add(client_ip)
            logger.warning(f"IP blocked due to suspicious activity: {client_ip}")
    
    def _add_security_headers(self, response: Response):
        """Add security headers to response"""
        for header, value in SecurityConfig.SECURITY_HEADERS.items():
            response.headers[header] = value
        
        # Add custom security headers
        response.headers['X-Robots-Tag'] = 'noindex, nofollow'
        response.headers['X-Permitted-Cross-Domain-Policies'] = 'none'
        response.headers['Cross-Origin-Embedder-Policy'] = 'require-corp'
        response.headers['Cross-Origin-Opener-Policy'] = 'same-origin'
        response.headers['Cross-Origin-Resource-Policy'] = 'same-origin'

class InputValidationMiddleware(BaseHTTPMiddleware):
    """Input validation middleware"""
    
    async def dispatch(self, request: Request, call_next):
        # Validate request size
        content_length = request.headers.get('content-length')
        if content_length and int(content_length) > SecurityConfig.MAX_INPUT_LENGTH:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Request too large"
            )
        
        # Validate content type for POST/PUT requests
        if request.method in ['POST', 'PUT', 'PATCH']:
            content_type = request.headers.get('content-type', '')
            if not any(allowed_type in content_type for allowed_type in ['application/json', 'multipart/form-data', 'application/x-www-form-urlencoded']):
                raise HTTPException(
                    status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                    detail="Unsupported media type"
                )
        
        response = await call_next(request)
        return response

class CSRFMiddleware(BaseHTTPMiddleware):
    """CSRF protection middleware"""
    
    def __init__(self, app):
        super().__init__(app)
        self.exempt_paths = ['/api/v1/auth/login', '/api/v1/auth/signup', '/api/v1/health']
    
    async def dispatch(self, request: Request, call_next):
        # Skip CSRF check for exempt paths
        if request.url.path in self.exempt_paths:
            return await call_next(request)
        
        # Skip CSRF check for GET requests
        if request.method == 'GET':
            return await call_next(request)
        
        # Check CSRF token
        csrf_token = request.headers.get('x-csrf-token')
        if not csrf_token:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="CSRF token missing"
            )
        
        # Validate CSRF token (in real implementation, check against session)
        # For now, just check if token exists and is valid format
        if len(csrf_token) < 32:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid CSRF token"
            )
        
        response = await call_next(request)
        return response

class LoggingMiddleware(BaseHTTPMiddleware):
    """Security logging middleware"""
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        client_ip = request.client.host if request.client else "unknown"
        
        # Log request
        logger.info(f"Request: {request.method} {request.url.path} from {client_ip}")
        
        try:
            response = await call_next(request)
            process_time = time.time() - start_time
            
            # Log response
            logger.info(f"Response: {response.status_code} in {process_time:.3f}s")
            
            # Log slow requests
            if process_time > 5.0:
                logger.warning(f"Slow request: {request.method} {request.url.path} took {process_time:.3f}s")
            
            return response
        
        except Exception as e:
            process_time = time.time() - start_time
            logger.error(f"Request error: {e} in {process_time:.3f}s")
            raise
