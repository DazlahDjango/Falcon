"""
Cache & Session Configuration Component

Redis cache backend and Session management parameters.
"""

from config.settings.base import env

# SESSION CONFIGURATION
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'
SESSION_COOKIE_AGE = env.int('SESSION_COOKIE_AGE', default=1209600)  # 2 weeks
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = env('SESSION_COOKIE_SECURE')
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_SAVE_EVERY_REQUEST = True

# CACHE CONFIGURATION (Redis)
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
            'PASSWORD': env('REDIS_PASSWORD', default=None),
            'SOCKET_CONNECT_TIMEOUT': 0.5,
            'SOCKET_TIMEOUT': 0.5,
            'RETRY_ON_TIMEOUT': True,
            'IGNORE_EXCEPTIONS': True,
            'HEALTH_CHECK_INTERVAL': 30,
        },
        'KEY_PREFIX': 'falcon',
        'TIMEOUT': 300,  # 5 minutes
    }
}
