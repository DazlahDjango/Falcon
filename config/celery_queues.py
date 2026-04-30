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
]

task_default_queue = 'default'
task_default_exchange = 'default'
task_default_routing_key = 'default'