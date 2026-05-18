from kombu import Queue, Exchange

task_queues = [
    # ========= KPI ======
    Queue('default', Exchange('default'), routing_key='default'),
    Queue('high_priority', Exchange('high_priority'), routing_key='high_priority'),
    Queue('calculations', Exchange('calculations'), routing_key='calculations'),
    Queue('aggregation', Exchange('aggregation'), routing_key='aggregation'),
    Queue('analytics', Exchange('analytics'), routing_key='analytics'),
    Queue('dashboard', Exchange('dashboard'), routing_key='dashboard'),
    Queue('cascade', Exchange('cascade'), routing_key='cascade'),
    Queue('notifications', Exchange('notifications'), routing_key='notifications'),
    Queue('email', Exchange('email'), routing_key='email'),
    Queue('cleanup', Exchange('cleanup'), routing_key='cleanup'),

    # ======== Structure ======
    Queue('default', Exchange('default'), routing_key='default'),
    Queue('structure', Exchange('structure'), routing_key='structure.#'),
    Queue('cache', Exchange('cache'), routing_key='cache.#'),
    Queue('export', Exchange('export'), routing_key='export.#'),
    Queue('notification', Exchange('notification'), routing_key='notification.#'),
    Queue('priority', Exchange('priority'), routing_key='priority.#'),

    # ======== Config =============
    Queue('default', Exchange('default'), routing_key='default'),
    Queue('backup', Exchange('backup'), routing_key='backup', consumer_arguments={'prefetch_count': 1}),
    Queue('restore', Exchange('restore'), routing_key='restore', consumer_arguments={'prefetch_count': 1}),
    Queue('maintenance', Exchange('maintenance'), routing_key='maintenance'),
    Queue('dr', Exchange('dr'), routing_key='dr', consumer_arguments={'prefetch_count': 1}),
    Queue('health_check', Exchange('health_check'), routing_key='health_check'),
    Queue('scheduler', Exchange('scheduler'), routing_key='scheduler'),
    Queue('analytics', Exchange('analytics'), routing_key='analytics'),
    Queue('notifications', Exchange('notifications'), routing_key='notifications'), 
]

# Queue for billing
QUEUE_CONFIG = {
    'billing': {
        'exchange': 'billing',
        'routing_key': 'billing',
    },
    'notifications': {
        'exchange': 'notifications',
        'routing_key': 'notifications',
    },
    'webhooks': {
        'exchange': 'webhooks',
        'routing_key': 'webhooks',
    },
    'cleanup': {
        'exchange': 'cleanup',
        'routing_key': 'cleanup',
    },
    'default': {
        'exchange': 'default',
        'routing_key': 'default',
    },
}

task_default_queue = 'default'
task_default_exchange = 'default'
task_default_routing_key = 'default'