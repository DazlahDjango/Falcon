"""
Channels Configuration Component

ASGI application and Redis Channel Layer setup for WebSockets.
"""

from config.settings.base import env, SECRET_KEY

# CHANNELS CONFIGURATION (WebSockets)
ASGI_APPLICATION = 'config.asgi.application'
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [env('REDIS_URL')],
            'symmetric_encryption_keys': [SECRET_KEY],
            'capacity': 1000,
            'expiry': 60,
        },
    },
}
