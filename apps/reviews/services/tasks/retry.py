"""Celery retry defaults with exponential backoff for Reviews tasks."""

from celery import shared_task


def reviews_shared_task(**kwargs):
    """Decorator: autoretry with exponential backoff for stability tasks."""
    defaults = {
        'bind': True,
        'autoretry_for': (Exception,),
        'retry_backoff': True,
        'retry_backoff_max': 600,
        'max_retries': 5,
        'retry_jitter': True,
    }
    defaults.update(kwargs)
    return shared_task(**defaults)
