# config/celery_queues.py
task_queues = {
    'default': {
        'exchange': 'default',
        'routing_key': 'default',
    },
    'high_priority': {
        'exchange': 'high_priority',
        'routing_key': 'high_priority',
    },
    'calculations': {
        'exchange': 'calculations',
        'routing_key': 'calculations',
    },
    'aggregation': {
        'exchange': 'aggregation',
        'routing_key': 'aggregation',
    },
    'analytics': {
        'exchange': 'analytics',
        'routing_key': 'analytics',
    },
    'dashboard': {
        'exchange': 'dashboard',
        'routing_key': 'dashboard',
    },
    'cascade': {
        'exchange': 'cascade',
        'routing_key': 'cascade',
    },
    'notifications': {
        'exchange': 'notifications',
        'routing_key': 'notifications',
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