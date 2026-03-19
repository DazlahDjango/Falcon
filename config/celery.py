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


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')


@app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # Calls test('hello') every 10 seconds
    sender.add_periodic_task(10.0, test.s('hello'), name='hello every 10')
    
    # Calls test('world') every 30 seconds (with expiration)
    sender.add_periodic_task(30.0, test.s('world'), expires=10, name='hello every 30')
    
    # Executes backup_database() at 2:00 AM daily
    sender.add_periodic_task(
        crontab(hour=2, minute=0), 
        backup_database.s(), 
        name='backup_database_daily'
    )


@app.task
def test(arg):
    print(f"Test task: {arg}")
    return arg


@app.task
def backup_database():
    print('Backing up database at 2:00 AM')
    # TODO: Implement actual database backup logic
    # You could call a management command here
    # from django.core.management import call_command
    # call_command('dbbackup')
    return "Database backup completed"