from .base import *

# DEBUG MODE
DEBUG = True
TEMPLATE_DEBUG = True
# AXES_ENABLED = False
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
]
CORS_ALLOWED_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173']
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
LOGGING['loggers']['django.db.backends']['level'] = 'DEBUG'
# DEVELOPMENT-SPECIFIC APPS
INSTALLED_APPS += [
    'django_extensions',
]