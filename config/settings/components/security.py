"""
Security Configuration Component

CORS, CSRF, django-axes lockout monitoring, audit logging,
rate limiting, and security HTTP headers / CSP.
"""

from datetime import timedelta
from config.settings.base import env, DEBUG

# CORS CONFIGURATION
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=[])
if not CORS_ALLOWED_ORIGINS and env('CORS_ALLOWED_ORIGINS', default=''):
    CORS_ALLOWED_ORIGINS = [env('CORS_ALLOWED_ORIGINS')]

CORS_ALLOW_ALL_ORIGINS = env.bool('CORS_ALLOW_ALL_ORIGINS', default=False)
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'x-tenant-id',
    'x-organization-id',
    'x-request-id',
    'x-correlation-id',
    'x-request-time',
    'x-csrf-protection',
    'x-idempotency-key',
]

# CSRF CONFIGURATION
CSRF_TRUSTED_ORIGINS = env.list('CSRF_TRUSTED_ORIGINS', default=[])
if DEBUG:
    CSRF_TRUSTED_ORIGINS.extend([
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ])

CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SECURE = env('CSRF_COOKIE_SECURE')
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_USE_SESSIONS = False

# AXES CONFIGURATION (Login attempt monitoring)
AXES_ENABLED = True
AXES_FAILURE_LIMIT = 5
AXES_COOLOFF_TIME = timedelta(minutes=15)
AXES_LOCK_OUT_AT_FAILURE = True
AXES_RESET_ON_SUCCESS = True
AXES_LOCKOUT_PARAMETERS = [
    ['username', 'ip_address', 'user_agent'],
]

# AUDITLOG CONFIGURATION
AUDITLOG_INCLUDE_ALL_MODELS = False

# RATE LIMITING
RATELIMIT_ENABLE = env('RATELIMIT_ENABLE')
RATELIMIT_USE_CACHE = 'default'
RATELIMIT_VIEW = 'apps.core.views.rate_limited'

# SECURITY HEADERS
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_REFERRER_POLICY = 'same-origin'

# Content Security Policy
CSP_DEFAULT_SRC = ("'self'",)
CSP_STYLE_SRC = ("'self'", "'unsafe-inline'",)
CSP_SCRIPT_SRC = ("'self'",)
CSP_IMG_SRC = ("'self'", "data:",)
