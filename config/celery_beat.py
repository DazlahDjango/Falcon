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

    # --------- Reviews App Tasks --------- 
    # ----- Cycle Management -----
    'reviews-check-cycle-deadlines': {
        'task': 'apps.reviews.tasks.check_cycle_deadlines',
        'schedule': crontab(hour=9, minute=0),  # Daily at 9 AM
        'options': {'expires': 3600},
    },
    'reviews-close-expired-cycles': {
        'task': 'apps.reviews.tasks.close_expired_cycles',
        'schedule': crontab(hour=1, minute=0),  # Daily at 1 AM
        'options': {'expires': 7200},
    },
    'reviews-batch-create-self-assessments': {
        'task': 'apps.reviews.tasks.batch_create_self_assessments',
        'schedule': crontab(hour=0, minute=30),  # Daily at 12:30 AM
        'options': {'expires': 3600},
    },
    'reviews-batch-generate-final-ratings': {
        'task': 'apps.reviews.tasks.batch_generate_final_ratings',
        'schedule': crontab(hour=3, minute=0),  # Daily at 3 AM
        'options': {'expires': 10800},
    },
    
    # ----- PIP (Performance Improvement Plans) -----
    'reviews-check-pip-deadlines': {
        'task': 'apps.reviews.tasks.check_pip_deadlines',
        'schedule': crontab(hour=10, minute=0),  # Daily at 10 AM
        'options': {'expires': 3600},
    },
    'reviews-check-pip-action-deadlines': {
        'task': 'apps.reviews.tasks.check_pip_action_deadlines',
        'schedule': crontab(hour=10, minute=30),  # Daily at 10:30 AM
        'options': {'expires': 3600},
    },
    'reviews-auto-escalate-pips': {
        'task': 'apps.reviews.tasks.auto_escalate_pip',
        'schedule': crontab(hour=0, minute=15),  # Daily at 12:15 AM
        'options': {'expires': 7200},
    },
    'reviews-detect-stalled-pips': {
        'task': 'apps.reviews.tasks.detect_stalled_pips',
        'schedule': crontab(day_of_week=1, hour=8, minute=0),  # Monday at 8 AM
        'options': {'expires': 86400},
        'kwargs': {'stalled_days': 14},
    },
    
    # ----- Feedback Management -----
    'reviews-send-feedback-reminders': {
        'task': 'apps.reviews.tasks.send_feedback_reminders',
        'schedule': crontab(hour=11, minute=0),  # Daily at 11 AM
        'options': {'expires': 3600},
    },
    'reviews-batch-generate-feedback-summaries': {
        'task': 'apps.reviews.tasks.batch_generate_feedback_summaries',
        'schedule': crontab(hour=2, minute=0),  # Daily at 2 AM
        'options': {'expires': 7200},
    },
    'reviews-escalate-unanswered-feedback': {
        'task': 'apps.reviews.tasks.escalate_unanswered_feedback',
        'schedule': crontab(day_of_week=3, hour=9, minute=0),  # Wednesday at 9 AM
        'options': {'expires': 86400},
        'kwargs': {'overdue_days': 7},
    },
    
    # ----- Calibration Sessions -----
    'reviews-send-calibration-reminders': {
        'task': 'apps.reviews.tasks.send_calibration_reminders',
        'schedule': crontab(hour=9, minute=30),  # Daily at 9:30 AM
        'options': {'expires': 3600},
    },
    'reviews-calibration-followup': {
        'task': 'apps.reviews.tasks.calibration_followup',
        'schedule': crontab(hour=14, minute=0, day_of_week=4),  # Thursday at 2 PM
        'options': {'expires': 86400},
        'kwargs': {'days_since_session': 3},
    },
    
    # ----- Review Reminders (Recurring) -----
    'reviews-self-assessment-reminder': {
        'task': 'apps.reviews.tasks.send_self_assessment_reminders',
        'schedule': crontab(minute=0, hour='*/6'),  # Every 6 hours
        'options': {'expires': 3600},
    },
    'reviews-supervisor-review-reminder': {
        'task': 'apps.reviews.tasks.send_supervisor_review_reminders',
        'schedule': crontab(minute=0, hour='*/4'),  # Every 4 hours
        'options': {'expires': 3600},
    },
    
    # ----- Cleanup & Maintenance -----
    'reviews-cleanup-old-notifications': {
        'task': 'apps.reviews.tasks.cleanup_old_notifications',
        'schedule': crontab(day_of_week=0, hour=2, minute=0),  # Sunday at 2 AM
        'options': {'expires': 86400},
        'kwargs': {'retention_days': 90},
    },
    'reviews-archive-completed-cycles': {
        'task': 'apps.reviews.tasks.archive_completed_cycles',
        'schedule': crontab(day_of_month=1, hour=3, minute=0),  # 1st of month at 3 AM
        'options': {'expires': 86400},
        'kwargs': {'archive_days': 365},
    },
    'reviews-cleanup-orphaned-ratings': {
        'task': 'apps.reviews.tasks.cleanup_orphaned_ratings',
        'schedule': crontab(hour=4, minute=30, day_of_week=0),  # Sunday at 4:30 AM
        'options': {'expires': 86400},
    },
    'reviews-validate-data-integrity': {
        'task': 'apps.reviews.tasks.validate_data_integrity',
        'schedule': crontab(day_of_month=15, hour=5, minute=0),  # 15th of month at 5 AM
        'options': {'expires': 86400},
    },
    
    # ----- Reporting -----
    'reviews-generate-monthly-report': {
        'task': 'apps.reviews.tasks.generate_monthly_report',
        'schedule': crontab(day_of_month=1, hour=6, minute=0),  # 1st of month at 6 AM
        'options': {'expires': 86400},
        'kwargs': {'report_type': 'monthly'},
    },
    'reviews-generate-quarterly-report': {
        'task': 'apps.reviews.tasks.generate_quarterly_report',
        'schedule': crontab(day_of_month=1, month='1,4,7,10', hour=7, minute=0), # Every quarter
        'options': {'expires': 86400},
        'kwargs': {'report_type': 'quarterly'},
    },
    
    # ----- Analytics & Insights -----
    'reviews-calculate-rating-distribution': {
        'task': 'apps.reviews.tasks.calculate_rating_distribution',
        'schedule': crontab(hour=1, minute=30, day_of_week=0),  # Sunday at 1:30 AM
        'options': {'expires': 7200},
    },
    'reviews-detect-rating-inflation': {
        'task': 'apps.reviews.tasks.detect_rating_inflation',
        'schedule': crontab(day_of_month=1, hour=4, minute=0),  # 1st of month at 4 AM
        'options': {'expires': 86400},
        'kwargs': {'threshold_percentage': 15},
    },
    'reviews-calculate-manager-consistency': {
        'task': 'apps.reviews.tasks.calculate_manager_consistency',
        'schedule': crontab(day_of_week=1, hour=5, minute=0),  # Monday at 5 AM
        'options': {'expires': 86400},
    },
    
    # ----- Integration Syncs -----
    'reviews-sync-kpi-data': {
        'task': 'apps.reviews.tasks.sync_kpi_data',
        'schedule': crontab(minute=0, hour='*/2'),  # Every 2 hours
        'options': {'expires': 3600},
    },
    'reviews-sync-mission-data': {
        'task': 'apps.reviews.tasks.sync_mission_data',
        'schedule': crontab(hour=1, minute=0),  # Daily at 1 AM
        'options': {'expires': 7200},
    },
    'reviews-sync-task-data': {
        'task': 'apps.reviews.tasks.sync_task_data',
        'schedule': crontab(hour=1, minute=30),  # Daily at 1:30 AM
        'options': {'expires': 7200},
    },
    
    # ----- Cache Management -----
    'reviews-warm-dashboard-cache': {
        'task': 'apps.reviews.tasks.warm_dashboard_cache',
        'schedule': crontab(hour=5, minute=0),  # Daily at 5 AM
        'options': {'expires': 3600},
    },
    'reviews-clear-stale-cache': {
        'task': 'apps.reviews.tasks.clear_stale_cache',
        'schedule': crontab(hour=4, minute=0),  # Daily at 4 AM
        'options': {'expires': 3600},
    },
    
    # ----- Health Checks -----
    'reviews-health-check': {
        'task': 'apps.reviews.tasks.health_check',
        'schedule': crontab(minute='*/30'),  # Every 30 minutes
        'options': {'expires': 1700},
    },
    'reviews-check-missing-reviews': {
        'task': 'apps.reviews.tasks.check_missing_reviews',
        'schedule': crontab(day_of_week=1, hour=8, minute=0),  # Monday at 8 AM
        'options': {'expires': 86400},
        'kwargs': {'threshold_days': 7},
    
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