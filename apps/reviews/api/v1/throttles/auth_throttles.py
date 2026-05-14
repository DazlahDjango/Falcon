# apps/reviews/api/v1/throttles/auth_throttles.py
"""
Throttle classes for authentication-related endpoints
"""

from rest_framework.throttling import SimpleRateThrottle


class LoginThrottle(SimpleRateThrottle):
    """
    Limits login attempts to prevent brute force attacks.
    Rate: 5 attempts per minute
    """
    scope = 'login'
    
    def get_cache_key(self, request, view):
        # Rate limit by username or IP
        ident = request.data.get('email') or self.get_ident(request)
        return self.cache_format % {'scope': self.scope, 'ident': ident}
    
    def allow_request(self, request, view):
        # Allow superusers unlimited attempts
        if request.user and request.user.is_superuser:
            return True
        return super().allow_request(request, view)


class RegistrationThrottle(SimpleRateThrottle):
    """
    Limits account registration attempts.
    Rate: 3 registrations per hour per IP
    """
    scope = 'registration'
    
    def get_cache_key(self, request, view):
        return self.cache_format % {
            'scope': self.scope,
            'ident': self.get_ident(request)
        }


class PasswordResetThrottle(SimpleRateThrottle):
    """
    Limits password reset requests to prevent abuse.
    Rate: 3 requests per hour per email
    """
    scope = 'password_reset'
    
    def get_cache_key(self, request, view):
        email = request.data.get('email', '')
        return self.cache_format % {
            'scope': self.scope,
            'ident': email.lower() if email else self.get_ident(request)
        }