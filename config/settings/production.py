# FALCON PMS - PRODUCTION SETTINGS (HARDENED)
# My 3S Principles: SECURITY first, STABILITY, SOLIDITY
# ============================================================================

from .base import *
import logging
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.celery import CeleryIntegration
from sentry_sdk.integrations.redis import RedisIntegration
from sentry_sdk.integrations.logging import LoggingIntegration

# SECRET KEY
SECRET_KEY = env('DJANGO_SECRET_KEY')
SECRET_KEY_FALLBACKS = env.list('DJANGO_SECRET_KEY_FALLBACKS', default=[])

# DEBUG MUST BE FALSE IN PRODUCTION
DEBUG = False
TEMPLATE_DEBUG = False

# SECURITY CRITICAL: Update your ALLOWED_HOSTS in .env
ALLOWED_HOSTS = env.list('DJANGO_ALLOWED_HOSTS')
CSRF_TRUSTED_ORIGINS = [
    f'https://{host}' for host in ALLOWED_HOSTS
    if not host.startswith('http://')
]

# HTTPS & SECURITY HEADERS (HARDENED)
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# HSTS - tell browsers to always use HTTPS
SECURE_HSTS_SECONDS = env.int('SECURE_HSTS_SECONDS', default=31536000)  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Secure cookies
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = True
SESSION_COOKIE_HTTPONLY = True

# Additional security headers
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'

# Referrer policy
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'

# ----------------------------------------------------------------------------
# CONTENT SECURITY POLICY (CSP) - Hardened
# ----------------------------------------------------------------------------
CSP_DEFAULT_SRC = ("'self'",)
CSP_SCRIPT_SRC = ("'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net")  # Adjust as needed
CSP_STYLE_SRC = ("'self'", "'unsafe-inline'", "https://fonts.googleapis.com")
CSP_FONT_SRC = ("'self'", "https://fonts.gstatic.com")
CSP_IMG_SRC = ("'self'", "data:", "https:")
CSP_CONNECT_SRC = ("'self'",)
CSP_FRAME_ANCESTORS = ("'none'",)
CSP_FORM_ACTION = ("'self'",)
CSP_BASE_URI = ("'self'",)
CSP_OBJECT_SRC = ("'none'",)

# ----------------------------------------------------------------------------
# CORS (Restricted in production)
# ----------------------------------------------------------------------------
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS')
CORS_ALLOW_CREDENTIALS = True

# ----------------------------------------------------------------------------
# DATABASE CONNECTION POOLING (Stability)
# ----------------------------------------------------------------------------
DATABASES['default']['CONN_MAX_AGE'] = 60  # Persistent connections
DATABASES['default']['OPTIONS']['sslmode'] = env('DB_SSLMODE', default='require')

# ----------------------------------------------------------------------------
# CACHING (Redis - must be configured)
# ----------------------------------------------------------------------------
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': env('REDIS_URL'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'CONNECTION_POOL_CLASS': 'redis.connection.BlockingConnectionPool',
            'CONNECTION_POOL_CLASS_KWARGS': {
                'max_connections': 50,
                'timeout': 20,
            },
            'PASSWORD': env('REDIS_PASSWORD'),
            'SSL': True,
            'SOCKET_CONNECT_TIMEOUT': 5,
            'SOCKET_TIMEOUT': 5,
            'RETRY_ON_TIMEOUT': True,
            'HEALTH_CHECK_INTERVAL': 30,
        },
        'KEY_PREFIX': 'falcon',
        'TIMEOUT': 300,
    }
}

# ----------------------------------------------------------------------------
# FILE STORAGE (Use S3 in production)
# ----------------------------------------------------------------------------
if env('AWS_ACCESS_KEY_ID', default=None):
    INSTALLED_APPS += ['storages']
    
    AWS_ACCESS_KEY_ID = env('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = env('AWS_SECRET_ACCESS_KEY')
    AWS_STORAGE_BUCKET_NAME = env('AWS_STORAGE_BUCKET_NAME')
    AWS_S3_REGION_NAME = env('AWS_S3_REGION_NAME')
    AWS_S3_CUSTOM_DOMAIN = env('AWS_S3_CUSTOM_DOMAIN', default=None)
    AWS_S3_FILE_OVERWRITE = False
    AWS_DEFAULT_ACL = None
    AWS_S3_VERIFY = True
    AWS_S3_MAX_MEMORY_SIZE = 20 * 1024 * 1024  # 20MB
    
    # Static files
    STATICFILES_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    STATIC_URL = f'https://{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/static/'
    
    # Media files
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    MEDIA_URL = f'https://{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/media/'
else:
    # Fallback to local (not recommended for production)
    STATIC_ROOT = BASE_DIR / 'staticfiles'
    MEDIA_ROOT = BASE_DIR / 'media'

# ----------------------------------------------------------------------------
# LOGGING (JSON format for production)
# ----------------------------------------------------------------------------
LOGGING['root']['handlers'] = ['console', 'file']
LOGGING['root']['level'] = 'WARNING'
LOGGING['handlers']['console']['formatter'] = 'json'
LOGGING['handlers']['file']['formatter'] = 'json'

# ----------------------------------------------------------------------------
# SENTRY (Error tracking)
# ----------------------------------------------------------------------------
# Define filter function FIRST before using it
def filter_sensitive_data(event):
    """Remove sensitive data before sending to Sentry"""
    # Remove authorization headers
    if 'request' in event and 'headers' in event['request']:
        headers = event['request']['headers']
        sensitive_headers = ['Authorization', 'Cookie', 'X-CSRFToken']
        for header in sensitive_headers:
            if header in headers:
                headers[header] = '[Filtered]'
    
    # Remove password fields from request data
    if 'request' in event and 'data' in event['request']:
        data = event['request']['data']
        sensitive_fields = ['password', 'password2', 'old_password', 'new_password', 
                           'token', 'access_token', 'refresh_token', 'secret']
        if isinstance(data, dict):
            for field in sensitive_fields:
                if field in data:
                    data[field] = '[Filtered]'
    
    return event

# Get Sentry DSN
SENTRY_DSN = env('SENTRY_DSN', default=None)

if SENTRY_DSN:
    # Determine environment (production/staging/development)
    SENTRY_ENVIRONMENT = env('SENTRY_ENVIRONMENT', default='production')
    
    # Get release version (from env or generate)
    SENTRY_RELEASE = env('SENTRY_RELEASE', default='falcon-pms@1.0.0')
    
    # Configure sample rate based on environment
    if SENTRY_ENVIRONMENT == 'production':
        TRACES_SAMPLE_RATE = env.float('SENTRY_TRACES_SAMPLE_RATE', default=0.1)  # 10% in prod
    else:
        TRACES_SAMPLE_RATE = env.float('SENTRY_TRACES_SAMPLE_RATE', default=1.0)  # 100% in dev/staging
    
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[
            # Django integration (automatically captures request/response data)
            DjangoIntegration(
                transaction_style='url',
                middleware_spans=True,
                signals_spans=False,
                cache_spans=False,
            ),
            # Celery integration (tracks task execution)
            CeleryIntegration(
                monitor_beat_tasks=True,  # Track periodic tasks
            ),
            # Redis integration (tracks Redis queries)
            RedisIntegration(
                describe_queries=True,  # Show Redis commands in traces
            ),
            # Logging integration (captures logs as Sentry events)
            LoggingIntegration(
                level=logging.INFO,  # Capture info and above as breadcrumbs
                event_level=logging.ERROR,  # Send errors as events
            ),
        ],
        
        # Performance monitoring
        traces_sample_rate=TRACES_SAMPLE_RATE,  # ← KEEP THIS ONE
        profiles_sample_rate=env.float('SENTRY_PROFILES_SAMPLE_RATE', default=0.1),  # ← KEEP THIS ONE
        
        # Environment and release info
        environment=SENTRY_ENVIRONMENT,  # ← KEEP THIS ONE
        release=SENTRY_RELEASE,  # ← KEEP THIS ONE
        
        # Security settings
        send_default_pii=False,  # Don't send personal data
        attach_stacktrace=True,
        max_request_body_size='never',
        auto_session_tracking=True,
        
        # Before send (filter sensitive data)
        before_send=filter_sensitive_data,  # Pass function directly, not lambda
        
        # Error sampling (optional)
        before_breadcrumb=lambda crumb, hint: crumb if crumb['category'] != 'http' else None,
    )
    
    # Add custom tags/context
    sentry_sdk.set_tag('app', 'falcon-pms')
    sentry_sdk.set_tag('database', 'postgresql')
    sentry_sdk.set_tag('cache', 'redis')
    
    print(f"✓ Sentry initialized for {SENTRY_ENVIRONMENT} environment")
else:
    print("⚠ Sentry DSN not configured - error tracking disabled")



# ----------------------------------------------------------------------------
# ADMIN URL (Change from default for security)
# ----------------------------------------------------------------------------
ADMIN_URL = env('ADMIN_URL', default='admin/')

# ----------------------------------------------------------------------------
# EMAIL (SMTP with TLS)
# ----------------------------------------------------------------------------
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = env('EMAIL_HOST')
EMAIL_PORT = env.int('EMAIL_PORT')
EMAIL_HOST_USER = env('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD')
EMAIL_USE_TLS = env.bool('EMAIL_USE_TLS')
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL')

# ----------------------------------------------------------------------------
# REMOVE DEVELOPMENT APPS
# ----------------------------------------------------------------------------
INSTALLED_APPS = [app for app in INSTALLED_APPS if app not in [
    'debug_toolbar',
    'django_extensions',
]]