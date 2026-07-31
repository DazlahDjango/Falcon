from .base import *

# DEBUG MODE
DEBUG = True
TEMPLATE_DEBUG = True
# ALLOWED HOSTS
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '*']
# CORS DEV CONF
CORS_ALLOW_ALL_ORIGINS = True
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
    'x-request-id',
    'x-correlation-id',
    'x-request-time',
    'x-csrf-protection',
    'x-idempotency-key',
    'X-Tenant-ID',
    'X-Correlation-ID',
    'X-Request-ID',
    'X-Requested-With',
]
CORS_ALLOWED_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173', "https://politely-nebulizer-veal.ngrok-free.dev"]
# CSRF
CSRF_COOKIE_SECURE = False
CSRF_COOKIE_HTTPONLY = True
CSRF_TRUSTED_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173']
# SESSION
SESSION_COOKIE_SECURE = False
# SECURITY
SECURE_SSL_REDIRECT = False
SECURE_HSTS_SECONDS = 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_HSTS_PRELOAD = False
# DEBUG TOOLBAR
INSTALLED_APPS += ['debug_toolbar']
MIDDLEWARE = MIDDLEWARE.copy()
MIDDLEWARE.insert(                                                   # Security middleware should always come first
    MIDDLEWARE.index('django.middleware.security.SecurityMiddleware') + 1,
    'debug_toolbar.middleware.DebugToolbarMiddleware'
)

INTERNAL_IPS = [
    '127.0.0.1',
    'localhost',
]

DEBUG_TOOLBAR_CONFIG = {
    'SHOW_TOOLBAR_CALLBACK': lambda request: True,
    'DISABLE_PANELS': {
        'debug_toolbar.panels.redirects.RedirectsPanel',
    },
    'IS_RUNNING_TESTS': False,
}
# EMAIL CONF
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
# CACHES
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}
# LOGGING (more verbose in development)
LOGGING['root']['level'] = 'DEBUG'
LOGGING['loggers']['django.db.backends']['level'] = 'INFO'
# DEVELOPMENT-SPECIFIC APPS
INSTALLED_APPS += [
    'django_extensions',
]

# PAYSTACK DEV 
PAYSTACK_SECRET_KEY = env("PAYSTACK_SECRET_KEY", default="sk_test_7400c09c4522e332d65cecc290afee0dda124d03")
PAYSTACK_PUBLIC_KEY = env("PAYSTACK_PUBLIC_KEY", default="pk_test_3a7cd5da94bc9d3192f198056aff00e379819403")
# Use ngrok URL for webhook testing
PAYSTACK_WEBHOOK_BASE_URL = env("BASE_URL", default="https://politely-nebulizer-veal.ngrok-free.dev")
PAYSTACK_VERIFY_WEBHOOK_SIGNATURE = env.bool("PAYSTACK_VERIFY_WEBHOOK_SIGNATURE", default=False)
# Log webhook payloads for debugging
BILLING_LOG_WEBHOOK_PAYLOADS = True

# CELERY DEV SETTINGS
# Force asynchronous tasks to execute synchronously in-process for easier local testing/simulations
CELERY_TASK_ALWAYS_EAGER = True

# BACKUP & RESTORE DEV SETTINGS
# Use local file storage instead of S3 to avoid AWS connection failures during local simulation
BACKUP_STORAGE_TYPE = 'local'

# CONFIG APP — internal health probe base (Availability monitoring)
CONFIG_INTERNAL_HEALTH_BASE_URL = env('CONFIG_INTERNAL_HEALTH_BASE_URL', default='http://127.0.0.1:8000')

# Disable API throttling in development
REST_FRAMEWORK = REST_FRAMEWORK.copy()
REST_FRAMEWORK['DEFAULT_THROTTLE_CLASSES'] = []