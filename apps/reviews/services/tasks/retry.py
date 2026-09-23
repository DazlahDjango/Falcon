"""Celery retry defaults with exponential backoff for Reviews tasks."""

from celery import shared_task


def reviews_shared_task(*args, **kwargs):
    """Decorator: autoretry with exponential backoff for stability tasks.
    Supports both @reviews_shared_task and @reviews_shared_task(...) syntax.
    """
    defaults = {
        'bind': True,
        'autoretry_for': (Exception,),
        'retry_backoff': True,
        'retry_backoff_max': 600,
        'max_retries': 5,
        'retry_jitter': True,
    }
    if args and callable(args[0]):
        fn = args[0]
        return shared_task(**defaults)(fn)
    defaults.update(kwargs)
    return shared_task(**defaults)

