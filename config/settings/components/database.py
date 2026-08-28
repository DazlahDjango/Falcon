"""
Database Configuration Component

PostgreSQL connection settings, connection pooling, multi-tenancy routing,
and PgBouncer options.
"""

from config.settings.base import env

# Connection Management Settings
# Set to False so Django relies on high-performance TenantDatabaseRouterMiddleware
ENABLE_CONNECTION_MIDDLEWARE = False
CONNECTION_IDLE_TIMEOUT_MINUTES = 5
CONNECTION_MAX_LIFETIME_MINUTES = 120
CONNECTION_POOL_MAX_SIZE = 20
CONNECTION_WAIT_TIMEOUT_SECONDS = 10
CONNECTION_RETRY_COUNT = 3
CONNECTION_RETRY_BACKOFF_BASE_SECONDS = 0.2
CONNECTION_CLEANUP_INTERVAL_SECONDS = 60
CONNECTION_MIDDLEWARE_EXCLUDED_PATHS = [
    '/health/',
    '/metrics/',
    '/static/',
    '/media/',
    '/api/v1/auth/',
]

# Database Settings
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases
DB_PORT_VAL = env('DB_PORT', default='5432')
DB_OPTIONS_CFG = {}
if str(DB_PORT_VAL) != '6432':
    DB_OPTIONS_CFG['options'] = '-c search_path=public'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('DB_NAME', default='postgres'),
        'USER': env('DB_USER', default='postgress'),
        'PASSWORD': env('DB_PASSWORD', default='postgress'),
        'HOST': env('DB_HOST', default='localhost'),
        'PORT': DB_PORT_VAL,
        'OPTIONS': DB_OPTIONS_CFG,
        'DISABLE_SERVER_SIDE_CURSORS': True,
        # Connection pooling
        'CONN_MAX_AGE': env.int('CONN_MAX_AGE', default=60),  # Persistent connections
        'CONN_HEALTH_CHECKS': True,
    }
}

DATABASE_ROUTERS = [
    'apps.tenant.services.router_service.OrganizationDatabaseRouter',
]

# Tenant Connection & Multi-Tenant Schema Caching Configuration
TENANT_SCHEMA_CACHE_TTL = env.int('TENANT_SCHEMA_CACHE_TTL', default=300)
ENABLE_PGBOUNCER_MODE = env.bool('ENABLE_PGBOUNCER_MODE', default=True)
CONNECTION_METRICS_ASYNC = env.bool('CONNECTION_METRICS_ASYNC', default=False)
