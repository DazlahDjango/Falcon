# config/celery.py
import os
from celery import Celery
from django.conf import settings

# Dynamically determine settings module based on DJANGO_ENV
DJANGO_ENV = os.environ.get('DJANGO_ENV', 'development')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', f'config.settings.{DJANGO_ENV}')

app = Celery('falcon_pms')

# Load config from Django settings
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)

# Import modular configurations
from .celery_beat import beat_schedule
from .celery_queues import task_queues
from .celery_routes import task_routes

# Apply configurations
app.conf.beat_schedule = beat_schedule
app.conf.task_queues = task_queues
app.conf.task_routes = task_routes

# Base task configuration
app.conf.update(
    # Time limits
    task_time_limit=30 * 60,
    task_soft_time_limit=25 * 60,
    # Result expiration
    result_expires=24 * 60 * 60,
    # Task tracking
    task_track_started=True,
    task_send_sent_event=True,
    # Worker configuration
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
    worker_concurrency=4,
)

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Debug task to test Celery is working"""
    print(f'Request: {self.request!r}')