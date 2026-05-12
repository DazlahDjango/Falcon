from kombu import Queue, Exchange

# Exchange definitions
default_exchange = Exchange('default', type='direct')
priority_exchange = Exchange('priority', type='direct')
billing_exchange = Exchange('billing', type='direct')
webhook_exchange = Exchange('webhook', type='direct')
email_exchange = Exchange('email', type='direct')

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

    # ======== Billing ======
    Queue('priority', priority_exchange, routing_key='priority'),
    Queue('billing', billing_exchange, routing_key='billing'),
    Queue('webhook', webhook_exchange, routing_key='webhook'),
    Queue('email', email_exchange, routing_key='email'),
    Queue('default', default_exchange, routing_key='default'),
]

# Queue configuration
QUEUE_CONFIG = {
    'priority': {
        'max_retries': 3,
        'time_limit': 300,  # 5 minutes
        'soft_time_limit': 240,
    },
    'billing': {
        'max_retries': 5,
        'time_limit': 600,  # 10 minutes
        'soft_time_limit': 540,
    },
    'webhook': {
        'max_retries': 3,
        'time_limit': 120,  # 2 minutes
        'soft_time_limit': 100,
        'prefetch_count': 1,  # Process one webhook at a time
    },
    'email': {
        'max_retries': 5,
        'time_limit': 60,  # 1 minute
        'soft_time_limit': 50,
    },
    'default': {
        'max_retries': 3,
        'time_limit': 300,
        'soft_time_limit': 240,
    },
}

task_default_queue = 'default'
task_default_exchange = 'default'
task_default_routing_key = 'default'