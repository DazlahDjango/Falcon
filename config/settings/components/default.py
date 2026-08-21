"""
Default Configuration Component

Templates, Static & Media storage, Frontend URLs, Email settings,
and primary key / site defaults.
"""

import os
from config.settings.base import BASE_DIR, env

# TEMPLATES CONFIGURATION
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            BASE_DIR / 'templates',
            BASE_DIR / 'frontend' / 'src' / 'templates',
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# FRONTEND CONFIGURATION
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
FRONTEND_VERIFY_URL = os.environ.get('FRONTEND_VERIFY_URL', f"{FRONTEND_URL}/verify-email")
FRONTEND_RESET_PASSWORD_URL = os.environ.get('FRONTEND_RESET_PASSWORD_URL', f"{FRONTEND_URL}/reset-password")
FRONTEND_INVITE_URL = os.environ.get('FRONTEND_INVITE_URL', f"{FRONTEND_URL}/accept-invite")

# STATIC & MEDIA FILES
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static']

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# DEFAULT SETTINGS
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
SITE_ID = 1

# EMAIL CONFIGURATION
EMAIL_BACKEND = env('EMAIL_BACKEND', default='django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = env('EMAIL_HOST', default='')
EMAIL_PORT = env.int('EMAIL_PORT', default=587)
EMAIL_HOST_USER = env('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD', default='')
EMAIL_USE_TLS = env.bool('EMAIL_USE_TLS', default=True)
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', default='operations@falconigc.com')
