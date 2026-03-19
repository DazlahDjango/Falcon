""""
Falcon settings configuration
"""
import os
from django.urls import path
import warnings
from django.core.exceptions import ImproperlyConfigured
# Determine settings to be loaded
ENV = os.environ.get('DJANGO_ENV', 'development')

if ENV == 'production':
    from .production import *
elif ENV == 'staging':
    from .staging import *
elif ENV == 'development':
    from .development import *
else:
    raise ImproperlyConfigured(f"Unknown DJANGO_ENV: {ENV}")
# Validate critical settings 
if not SECRET_KEY:
    raise ImproperlyConfigured("Secret key must be set in production")

# Warning suppression
if ENV == 'production':
    warnings.filterwarnings('ignore', category=DeprecationWarning)
    warnings.filterwarnings('ignore', category=UserWarning)

# Display active config
if ENV == 'production':
    print(f"Falcon Production Environment running in {ENV.upper()} mode")
    print(f"Database: {DATABASES['default']['NAME']}")
    print(f"Debug: {DEBUG}\n")

# After determining ENV, add validation
if ENV == 'production':
    required_vars = [
        'DJANGO_SECRET_KEY',
        'DJANGO_ALLOWED_HOSTS',
        'DB_NAME', 'DB_USER', 'DB_PASSWORD',
        'REDIS_URL',
    ]
    
    missing_vars = [var for var in required_vars if not os.environ.get(var)]
    if missing_vars:
        raise ImproperlyConfigured(
            f"Missing required environment variables in production: {', '.join(missing_vars)}"
        )