# config/celery_beat.py
from celery.schedules import crontab

beat_schedule = {
    # ========== Accounts Tasks ==========
    'cleanup-expired-sessions': {
        'task': 'accounts.cleanup_expired_sessions',
        'schedule': crontab(minute=0, hour='*/1'),  # Every hour
        'options': {'expires': 3600},
    },
    'cleanup-expired-blacklist': {
        'task': 'accounts.cleanup_expired_blacklist',
        'schedule': crontab(minute=0, hour=0),  # Daily at midnight
        'options': {'expires': 86400},
    },
    'cleanup-old-audit-logs': {
        'task': 'accounts.cleanup_old_audit_logs',
        'schedule': crontab(minute=0, hour=2, day_of_month=1),  # 1st day of month at 2 AM
        'options': {'expires': 86400},
        'kwargs': {'retention_days': 365},
    },
    'cleanup-old-login-attempts': {
        'task': 'accounts.cleanup_old_login_attempts',
        'schedule': crontab(minute=0, hour=3, day_of_week=0),  # Sunday at 3 AM
        'options': {'expires': 86400},
        'kwargs': {'retention_days': 90},
    },
    'unlock-locked-accounts': {
        'task': 'accounts.unlock_locked_accounts',
        'schedule': crontab(minute='*/15'),  # Every 15 minutes
        'options': {'expires': 900},
    },
    'remind-inactive-users': {
        'task': 'accounts.remind_inactive_users',
        'schedule': crontab(minute=0, hour=9, day_of_week=1),  # Monday at 9 AM
        'options': {'expires': 86400},
        'kwargs': {'days_inactive': 30},
    },
    'check-password-expiry': {
        'task': 'accounts.check_password_expiry',
        'schedule': crontab(minute=0, hour=8),  # Daily at 8 AM
        'options': {'expires': 86400},
        'kwargs': {'expiry_days': 90},
    },
    
    # ========== KPI Tasks ==========
    'calculate-scores-daily': {
        'task': 'apps.kpi.tasks.calculations.scheduled_calculation_task',
        'schedule': crontab(hour=2, minute=0),
        'options': {'expires': 3600},
    },
    'send-missing-data-reminders': {
        'task': 'apps.kpi.tasks.notifications.scheduled_reminder_task',
        'schedule': crontab(day_of_month=5, hour=8, minute=0),
        'options': {'expires': 86400},
    },
    'check-red-alerts': {
        'task': 'apps.kpi.tasks.alerts.scheduled_red_alert_task',
        'schedule': crontab(hour=9, minute=0),
        'options': {'expires': 3600},
    },
    'refresh-materialized-views': {
        'task': 'apps.kpi.tasks.aggregates.refresh_materialized_views_task',
        'schedule': crontab(minute=0),
        'options': {'expires': 3600},
    },
    'precompute-dashboard-cache': {
        'task': 'apps.kpi.tasks.aggregates.precompute_dashboard_cache_task',
        'schedule': crontab(hour=3, minute=0),
        'options': {'expires': 7200},
    },
    'cleanup-calculation-logs': {
        'task': 'apps.kpi.tasks.cleanup.cleanup_old_calculation_logs_task',
        'schedule': crontab(day_of_week=0, hour=2, minute=0),
        'args': [30],
        'options': {'expires': 86400},
    },
    'cleanup-expired-cache': {
        'task': 'apps.kpi.tasks.cleanup.cleanup_expired_cache_task',
        'schedule': crontab(hour=4, minute=0),
        'options': {'expires': 3600},
    },
    'check-pending-validations': {
        'task': 'apps.kpi.tasks.alerts.send_pending_validation_alerts_task',
        'schedule': crontab(minute=0, hour='*/2'),
        'options': {'expires': 3600},
    },
    'check-threshold-breaches': {
        'task': 'apps.kpi.tasks.alerts.send_threshold_breach_alerts_task',
        'schedule': crontab(hour=10, minute=0),
        'options': {'expires': 3600},
    },

    # ======== Structure =======
    'warm-structure-cache-daily': {
        'task': 'structure.tasks.warm_structure_cache',
        'schedule': crontab(hour=3, minute=0),
        'args': [],
    },
    'refresh-materialized-views-hourly': {
        'task': 'structure.tasks.refresh_materialized_views',
        'schedule': crontab(minute=0),
        'args': [],
    },
    'detect-orphaned-nodes-daily': {
        'task': 'structure.tasks.detect_orphaned_nodes',
        'schedule': crontab(hour=2, minute=30),
        'args': [],
    },
    'validate-org-integrity-daily': {
        'task': 'structure.tasks.validate_org_integrity',
        'schedule': crontab(hour=4, minute=0),
        'args': [],
    },
    'detect-circular-references-daily': {
        'task': 'structure.tasks.detect_circular_references',
        'schedule': crontab(hour=4, minute=30),
        'args': [],
    },
    'cleanup-orphaned-versions-weekly': {
        'task': 'structure.tasks.cleanup_orphaned_versions',
        'schedule': crontab(day_of_week=0, hour=5, minute=0),
        'args': [],
    },
    'rebuild-hierarchy-indexes-monthly': {
        'task': 'structure.tasks.rebuild_hierarchy_indexes',
        'schedule': crontab(day_of_month=1, hour=6, minute=0),
        'args': [],
    },
    
    # ======== Billing =======
    # Daily tasks
    'check-expired-subscriptions': {
        'task': 'billing.tasks.check_expired_subscriptions',
        'schedule': crontab(hour=0, minute=0),  # Midnight daily
        'options': {'expires': 3600},
    },
    'reset-daily-api-quotas': {
        'task': 'billing.tasks.reset_daily_api_quotas',
        'schedule': crontab(hour=0, minute=5),  # 12:05 AM daily
        'options': {'expires': 1800},
    },
    'cleanup-old-webhook-events': {
        'task': 'billing.tasks.cleanup_old_webhook_events',
        'schedule': crontab(hour=2, minute=0),  # 2:00 AM daily
        'args': [30],  # Keep 30 days
        'options': {'expires': 7200},
    },
    'generate-monthly-invoice-report': {
        'task': 'billing.tasks.generate_monthly_invoice_report',
        'schedule': crontab(hour=0, minute=0, day_of_month=1),  # 1st of each month
        'options': {'expires': 86400},
    },
    
    # Hourly tasks
    'send-upcoming-invoice-reminders': {
        'task': 'billing.tasks.send_upcoming_invoice_reminder',
        'schedule': crontab(minute=0, hour='9,12,15'),  # 9 AM, 12 PM, 3 PM
        'args': [3],  # 3 days before
        'options': {'expires': 3600},
    },
    'handle-trial-ending-soon': {
        'task': 'billing.tasks.handle_trial_ending_soon',
        'schedule': crontab(minute=0, hour='10'),  # 10 AM daily
        'args': [3],  # 3 days before
        'options': {'expires': 3600},
    },
    
    # Every 30 minutes
    'send-payment-failed-notifications': {
        'task': 'billing.tasks.send_payment_failed_notification',
        'schedule': crontab(minute='*/30'),
        'options': {'expires': 1800},
    },
    
    # Every 6 hours
    'sync-invoices-recent': {
        'task': 'billing.tasks.sync_invoices_for_tenant',
        'schedule': crontab(minute=0, hour='*/6'),
        'options': {'expires': 21600},
    },
}