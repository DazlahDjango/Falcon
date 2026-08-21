"""
Celery Configuration Component

Task queue broker, result backend, task timeouts, serializers, and Beat scheduler.
"""

from config.settings.base import env, TIME_ZONE

# CELERY CONFIGURATION (Task Queue)
CELERY_BROKER_URL = env('CELERY_BROKER_URL', default=env('REDIS_URL'))
CELERY_RESULT_BACKEND = env('CELERY_RESULT_BACKEND', default=env('REDIS_URL'))
CELERY_ACCEPT_CONTENT = ['application/json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60  # 30 minutes
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True

# Celery Beat (scheduled tasks)
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'
