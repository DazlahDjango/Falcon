# ============================================================================
# FALCON PMS - CELERY CONFIGURATION
# For background tasks (notifications, reports, etc.)
# ============================================================================

import os
from celery import Celery
from celery.schedules import crontab
from django.conf import settings

# Dynamically determine settings module based on DJANGO_ENV
DJANGO_ENV = os.environ.get('DJANGO_ENV', 'development')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', f'config.settings.{DJANGO_ENV}')

app = Celery('falcon_pms')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# Namespace 'CELERY' means all celery-related config keys should start with 'CELERY_'
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)

app.conf.beat_schedule = {
    # Session cleanup - every hour
    'cleanup-expired-sessions': {
        'task': 'accounts.cleanup_expired_sessions',
        'schedule': crontab(minute=0, hour='*/1'),  # Every hour
        'options': {'expires': 3600},
    },
    
    # Token blacklist cleanup - daily at midnight
    'cleanup-expired-blacklist': {
        'task': 'accounts.cleanup_expired_blacklist',
        'schedule': crontab(minute=0, hour=0),  # Daily at midnight
        'options': {'expires': 86400},
    },
    
    # Audit log cleanup - monthly
    'cleanup-old-audit-logs': {
        'task': 'accounts.cleanup_old_audit_logs',
        'schedule': crontab(minute=0, hour=2, day_of_month=1),  # 1st day of month at 2 AM
        'options': {'expires': 86400},
        'kwargs': {'retention_days': 365},
    },
    
    # Login attempts cleanup - weekly
    'cleanup-old-login-attempts': {
        'task': 'accounts.cleanup_old_login_attempts',
        'schedule': crontab(minute=0, hour=3, day_of_week=0),  # Sunday at 3 AM
        'options': {'expires': 86400},
        'kwargs': {'retention_days': 90},
    },
    
    # Unlock locked accounts - every 15 minutes
    'unlock-locked-accounts': {
        'task': 'accounts.unlock_locked_accounts',
        'schedule': crontab(minute='*/15'),  # Every 15 minutes
        'options': {'expires': 900},
    },
    
    # Inactive user reminders - weekly
    'remind-inactive-users': {
        'task': 'accounts.remind_inactive_users',
        'schedule': crontab(minute=0, hour=9, day_of_week=1),  # Monday at 9 AM
        'options': {'expires': 86400},
        'kwargs': {'days_inactive': 30},
    },
    
    # Password expiry check - daily
    'check-password-expiry': {
        'task': 'accounts.check_password_expiry',
        'schedule': crontab(minute=0, hour=8),  # Daily at 8 AM
        'options': {'expires': 86400},
        'kwargs': {'expiry_days': 90},
    },
}

# Optional: Configure task time limits
app.conf.task_time_limit = 30 * 60  # 30 minutes
app.conf.task_soft_time_limit = 25 * 60  # 25 minutes

# Optional: Configure task result expiration
app.conf.result_expires = 24 * 60 * 60  # 24 hours

# Optional: Configure task tracking
app.conf.task_track_started = True
app.conf.task_send_sent_event = True

# Optional: Configure task queues (if using multiple queues)
app.conf.task_queues = {
    'default': {
        'exchange': 'default',
        'routing_key': 'default',
    },
    'high_priority': {
        'exchange': 'high_priority',
        'routing_key': 'high_priority',
    },
    'email': {
        'exchange': 'email',
        'routing_key': 'email',
    },
    'cleanup': {
        'exchange': 'cleanup',
        'routing_key': 'cleanup',
    },
}

# Optional: Configure task routing
app.conf.task_routes = {
    'accounts.send_*': {'queue': 'email'},
    'accounts.cleanup_*': {'queue': 'cleanup'},
    'accounts.unlock_*': {'queue': 'cleanup'},
    'accounts.remind_*': {'queue': 'email'},
    'accounts.check_*': {'queue': 'cleanup'},
}
