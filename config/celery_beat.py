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
    'process-due-renewals': {
        'task': 'billing.tasks.process_due_renewals',
        'schedule': crontab(hour=2, minute=0),  # Daily at 2 AM
        'options': {'queue': 'billing'}
    },
    'process-expired-trials': {
        'task': 'billing.tasks.process_expired_trials',
        'schedule': crontab(hour=3, minute=0),  # Daily at 3 AM
        'options': {'queue': 'billing'}
    },
    'send-renewal-reminders': {
        'task': 'billing.tasks.send_renewal_reminders',
        'schedule': crontab(hour=9, minute=0),  # Daily at 9 AM
        'options': {'queue': 'notifications'}
    },
    'apply-pending-plan-changes': {
        'task': 'billing.tasks.apply_pending_plan_changes',
        'schedule': crontab(hour=1, minute=0),  # Daily at 1 AM
        'options': {'queue': 'billing'}
    },
    
    # Invoice tasks
    'send-invoice-emails': {
        'task': 'billing.tasks.send_invoice_emails',
        'schedule': crontab(hour=10, minute=0),  # Daily at 10 AM
        'options': {'queue': 'notifications'}
    },
    
    # Webhook tasks
    'retry-failed-webhooks': {
        'task': 'billing.tasks.retry_failed_webhooks',
        'schedule': crontab(minute='*/30'),  # Every 30 minutes
        'options': {'queue': 'webhooks'}
    },
    
    # Cleanup tasks
    'cleanup-expired-webhooks': {
        'task': 'billing.tasks.cleanup_expired_webhooks',
        'schedule': crontab(day_of_month=1, hour=0, minute=0),  # Monthly on 1st
        'options': {'queue': 'cleanup'}
    },
    'cleanup-expired-sessions': {
        'task': 'billing.tasks.cleanup_expired_sessions',
        'schedule': crontab(hour=4, minute=0),  # Daily at 4 AM
        'options': {'queue': 'cleanup'}
    },
    
    # Sync tasks
    'sync-paystack-transactions': {
        'task': 'billing.tasks.sync_paystack_transactions',
        'schedule': crontab(hour=5, minute=0),  # Daily at 5 AM
        'options': {'queue': 'billing'}
    },

    # ===== Config ====
    'health-check-all-apps': {
        'task': 'apps.configs.tasks.health_check_all_apps_task',
        'schedule': crontab(minute='*/5'),
        'options': {'queue': 'health_check', 'expires': 300},
    },
    'apply-retention-policies': {
        'task': 'apps.configs.tasks.apply_retention_policies_task',
        'schedule': crontab(hour=2, minute=0),
        'options': {'queue': 'maintenance', 'expires': 3600},
    },
    'verify-backups': {
        'task': 'apps.configs.tasks.verify_backups_task',
        'schedule': crontab(hour=3, minute=30),
        'options': {'queue': 'backup', 'expires': 7200},
    },
    'risk-based-maintenance': {
        'task': 'apps.configs.tasks.risk_based_maintenance_task',
        'schedule': crontab(hour='*/6', minute=15),
        'options': {'queue': 'maintenance', 'expires': 1800},
    },
    'conditional-maintenance-trigger': {
        'task': 'apps.configs.tasks.conditional_maintenance_trigger_task',
        'schedule': crontab(minute='*/10'),
        'options': {'queue': 'maintenance', 'expires': 600},
    },
    'execute-due-schedules': {
        'task': 'apps.configs.tasks.execute_due_schedules_task',
        'schedule': crontab(minute='*'),
        'options': {'queue': 'scheduler', 'expires': 60},
    },
    'cleanup-old-artifacts': {
        'task': 'apps.configs.tasks.cleanup_old_artifacts_task',
        'schedule': crontab(hour=1, minute=0, day_of_month='1'),
        'options': {'queue': 'maintenance', 'expires': 86400},
    },
    'sync-dr-metrics': {
        'task': 'apps.configs.tasks.sync_dr_metrics_task',
        'schedule': crontab(hour=0, minute=0),
        'options': {'queue': 'analytics', 'expires': 3600},
    },
    'weekly-dr-drill': {
        'task': 'apps.configs.tasks.disaster_recovery_drill_task',
        'schedule': crontab(day_of_week='saturday', hour=2, minute=0),
        'options': {'queue': 'dr', 'expires': 14400},
        'kwargs': {'plan_id': None},
    },
}