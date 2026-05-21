"""
CI / automated test settings for Falcon PMS.
Uses PostgreSQL and Redis from environment variables when provided.
"""
from .base import *

DEBUG = False
SECRET_KEY = env('DJANGO_SECRET_KEY', default='ci-test-secret-key-not-for-production')

ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'testserver']

# Database — GitHub Actions service container
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('DB_NAME', default='test_db'),
        'USER': env('DB_USER', default='test_user'),
        'PASSWORD': env('DB_PASSWORD', default='test_pass'),
        'HOST': env('DB_HOST', default='localhost'),
        'PORT': env('DB_PORT', default='5432'),
        'OPTIONS': {'options': '-c search_path=public'},
        'TEST': {'NAME': 'test_falcon_pms'},
    }
}

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'ci-cache',
    }
}

CELERY_TASK_ALWAYS_EAGER = True
CELERY_BROKER_URL = env('CELERY_BROKER_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = env('CELERY_RESULT_BACKEND', default='redis://localhost:6379/0')

EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']

AXES_ENABLED = False

LOGGING['root']['level'] = 'WARNING'

# Skip heavy app ready() side effects where possible
PAYSTACK_VERIFY_WEBHOOK_SIGNATURE = False
