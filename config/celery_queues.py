# config/celery_queues.py
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

    # ======== Reviews App Queues ==========
    Queue('reviews_default', Exchange('reviews_default'), routing_key='reviews_default'),
    Queue('reviews_batch', Exchange('reviews_batch'), routing_key='reviews_batch'),
    Queue('reviews_notifications', Exchange('reviews_notifications'), routing_key='reviews_notifications'),
    Queue('reviews_deadlines', Exchange('reviews_deadlines'), routing_key='reviews_deadlines'),
    Queue('reviews_calibration', Exchange('reviews_calibration'), routing_key='reviews_calibration'),
    Queue('reviews_feedback', Exchange('reviews_feedback'), routing_key='reviews_feedback'),
    Queue('reviews_pip', Exchange('reviews_pip'), routing_key='reviews_pip'),
    Queue('reviews_cleanup', Exchange('reviews_cleanup'), routing_key='reviews_cleanup'),
    # ADD THESE TWO MISSING QUEUES:
    Queue('reviews_reports', Exchange('reviews_reports'), routing_key='reviews_reports'),      # NEW - for report generation
    Queue('reviews_aggregation', Exchange('reviews_aggregation'), routing_key='reviews_aggregation'),  # NEW - for data aggregation
]

task_default_queue = 'default'
task_default_exchange = 'default'
task_default_routing_key = 'default'