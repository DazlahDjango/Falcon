"""
Django base settings for Falcon project.

Imports modular setting components from config/settings/components/
and reads environment configuration files from envs/ directory.
"""

from pathlib import Path
import os
import environ

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

env = environ.Env(
    DEBUG=(bool, False),
    DJANGO_ENV=(str, 'development'),
    SECURE_SSL_REDIRECT=(bool, False),
    SESSION_COOKIE_SECURE=(bool, False),
    CSRF_COOKIE_SECURE=(bool, False),
    CORS_ALLOW_ALL_ORIGINS=(bool, False),
    RATELIMIT_ENABLE=(bool, True),
    BACKUP_ENCRYPTION_ENABLED=(bool, True),
    BACKUP_COMPRESSION_ENABLED=(bool, True),
    DR_AUTO_FAILOVER_ENABLED=(bool, False),
    DR_AUTO_FAILBACK_ENABLED=(bool, False),
    MAINTENANCE_AUTO_APPROVE=(bool, False),
    HEALTH_CONDITIONAL_MAINTENANCE_ENABLED=(bool, True),
    FEATURE_DR_ENABLED=(bool, True),
    FEATURE_BACKUP_ENABLED=(bool, True),
    FEATURE_MAINTENANCE_ENABLED=(bool, True),
    FEATURE_HEALTH_MONITORING_ENABLED=(bool, True),
    FEATURE_ADVANCED_ANALYTICS=(bool, False),
    CONFIG_DEBUG=(bool, False),
    LOG_BACKUP_OPERATIONS=(bool, True),
    LOG_DR_OPERATIONS=(bool, True),
    LOG_MAINTENANCE_OPERATIONS=(bool, True),
    LOG_HEALTH_CHECKS=(bool, False),
    AUDIT_API_ACCESS_ENABLED=(bool, True),
    AUDIT_DATA_CHANGES_ENABLED=(bool, True),
    AUDIT_EXPORT_EXTERNAL=(bool, False),
    STORAGE_LIFECYCLE_ENABLED=(bool, True),
    SMS_ALERTS_ENABLED=(bool, False),
    BACKUP_SCHEDULE_ENABLED=(bool, True),
)

# Read modular env files from envs/ directory
ENVS_DIR = BASE_DIR / 'envs'
if ENVS_DIR.exists():
    for env_file in sorted(ENVS_DIR.glob('*.env')):
        environ.Env.read_env(str(env_file))

# Read root .env file as fallback/override if present
main_env = os.path.join(BASE_DIR, '.env')
if os.path.exists(main_env):
    environ.Env.read_env(main_env)

SECRET_KEY = env('DJANGO_SECRET_KEY', default='django-insecure-dev-key-not-for-production')
DEBUG = env('DEBUG')
ALLOWED_HOSTS = env.list('DJANGO_ALLOWED_HOSTS', default=['localhost', '127.0.0.1', '.ngrok.io'])
ADMIN_URL = env('ADMIN_URL', default='admin/')

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Nairobi'
USE_I18N = True
USE_TZ = True

# URLs & Applications
ROOT_URLCONF = 'config.urls'
WSGI_APPLICATION = 'config.wsgi.application'

# ============================================================
# COMPONENT SETTINGS IMPORTS
# (Loads all active setting components via components/__init__.py)
# ============================================================
from .components import *
