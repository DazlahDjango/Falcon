task_routes_dict = {
    # Accounts Tasks
    'apps.accounts.tasks.send_*': {'queue': 'email'},
    'apps.accounts.tasks.cleanup_*': {'queue': 'cleanup'},
    'apps.accounts.tasks.unlock_*': {'queue': 'cleanup'},
    'apps.accounts.tasks.remind_*': {'queue': 'email'},
    'apps.accounts.tasks.check_*': {'queue': 'cleanup'},
    
    # KPI Tasks
    'apps.kpi.tasks.calculations.calculate_*': {'queue': 'calculations'},
    'apps.kpi.tasks.calculations.update_traffic_light_task': {'queue': 'calculations'},
    'apps.kpi.tasks.aggregates.update_aggregated_scores_task': {'queue': 'aggregation'},
    'apps.kpi.tasks.aggregates.refresh_materialized_views_task': {'queue': 'analytics'},
    'apps.kpi.tasks.aggregates.precompute_dashboard_cache_task': {'queue': 'dashboard'},
    'apps.kpi.tasks.notifications.send_*': {'queue': 'notifications'},
    'apps.kpi.tasks.notifications.*_reminder_task': {'queue': 'notifications'},
    'apps.kpi.tasks.alerts.*_alert_task': {'queue': 'notifications'},
    'apps.kpi.tasks.alerts.send_*': {'queue': 'notifications'},
    'apps.kpi.tasks.email_tasks.send_*_email_task': {'queue': 'email'},
    'apps.kpi.tasks.cleanup.cleanup_*': {'queue': 'cleanup'},
    'apps.kpi.tasks.cascade.cascade_*': {'queue': 'cascade'},
    
    # ======== Reviews App Routes ==========
    # Batch Processing
    'apps.reviews.tasks.batch_*': {'queue': 'reviews_batch'},
    'apps.reviews.tasks.batch_create_self_assessments': {'queue': 'reviews_batch'},
    'apps.reviews.tasks.batch_generate_final_ratings': {'queue': 'reviews_batch'},
    'apps.reviews.tasks.batch_generate_feedback_summaries': {'queue': 'reviews_batch'},
    
    # Notifications
    'apps.reviews.tasks.*_reminder*': {'queue': 'reviews_notifications'},
    'apps.reviews.tasks.send_*': {'queue': 'reviews_notifications'},
    'apps.reviews.tasks.*_notification*': {'queue': 'reviews_notifications'},
    'apps.reviews.tasks.send_feedback_reminders': {'queue': 'reviews_feedback'},
    'apps.reviews.tasks.send_calibration_reminders': {'queue': 'reviews_calibration'},
    
    # Deadlines
    'apps.reviews.tasks.*_deadline*': {'queue': 'reviews_deadlines'},
    'apps.reviews.tasks.check_*_deadlines': {'queue': 'reviews_deadlines'},
    'apps.reviews.tasks.check_cycle_deadlines': {'queue': 'reviews_deadlines'},
    'apps.reviews.tasks.check_pip_deadlines': {'queue': 'reviews_deadlines'},
    'apps.reviews.tasks.check_pip_action_deadlines': {'queue': 'reviews_deadlines'},
    
    # Calibration
    'apps.reviews.tasks.*_calibration*': {'queue': 'reviews_calibration'},
    'apps.reviews.tasks.calibration_*': {'queue': 'reviews_calibration'},
    
    # Feedback
    'apps.reviews.tasks.*_feedback*': {'queue': 'reviews_feedback'},
    'apps.reviews.tasks.feedback_*': {'queue': 'reviews_feedback'},
    
    # PIP
    'apps.reviews.tasks.*_pip*': {'queue': 'reviews_pip'},
    'apps.reviews.tasks.pip_*': {'queue': 'reviews_pip'},
    'apps.reviews.tasks.generate_pip_*': {'queue': 'reviews_pip'},
    'apps.reviews.tasks.auto_escalate_pip': {'queue': 'reviews_pip'},
    
    # Cleanup
    'apps.reviews.tasks.cleanup_*': {'queue': 'reviews_cleanup'},
    'apps.reviews.tasks.close_*': {'queue': 'reviews_cleanup'},
    'apps.reviews.tasks.close_expired_cycles': {'queue': 'reviews_cleanup'},
    
    # ADD THESE MISSING ROUTES:
    # Reports (NEW)
    'apps.reviews.tasks.*_report*': {'queue': 'reviews_reports'},
    'apps.reviews.tasks.generate_*_report': {'queue': 'reviews_reports'},
    'apps.reviews.tasks.generate_monthly_report': {'queue': 'reviews_reports'},
    'apps.reviews.tasks.generate_quarterly_report': {'queue': 'reviews_reports'},
    
    # Aggregation (NEW)
    'apps.reviews.tasks.*_aggregat*': {'queue': 'reviews_aggregation'},
    'apps.reviews.tasks.refresh_aggregations': {'queue': 'reviews_aggregation'},
    'apps.reviews.tasks.calculate_rating_distribution': {'queue': 'reviews_aggregation'},
    'apps.reviews.tasks.detect_rating_inflation': {'queue': 'reviews_aggregation'},
    'apps.reviews.tasks.calculate_manager_consistency': {'queue': 'reviews_aggregation'},
    
    # Integration Syncs (NEW)
    'apps.reviews.tasks.sync_kpi_data': {'queue': 'reviews_aggregation'},
    'apps.reviews.tasks.sync_mission_data': {'queue': 'reviews_aggregation'},
    'apps.reviews.tasks.sync_task_data': {'queue': 'reviews_aggregation'},
    
    # Cache Management (NEW)
    'apps.reviews.tasks.warm_dashboard_cache': {'queue': 'reviews_default'},
    'apps.reviews.tasks.clear_stale_cache': {'queue': 'reviews_cleanup'},
    
    # Health Checks
    'apps.reviews.tasks.health_check': {'queue': 'reviews_default'},
    'apps.reviews.tasks.check_missing_reviews': {'queue': 'reviews_deadlines'},
    
    # Default for all other reviews tasks
    'apps.reviews.tasks.*': {'queue': 'reviews_default'},
    # Billing Tasks
    'billing.tasks.process_due_renewals': {'queue': 'billing'},
    'billing.tasks.process_expired_trials': {'queue': 'billing'},
    'billing.tasks.apply_pending_plan_changes': {'queue': 'billing'},
    'billing.tasks.sync_paystack_transactions': {'queue': 'billing'},
    'billing.tasks.send_renewal_reminders': {'queue': 'notifications'},
    'billing.tasks.send_invoice_emails': {'queue': 'notifications'},
    'billing.tasks.send_payment_confirmation': {'queue': 'notifications'},
    'billing.tasks.process_webhook': {'queue': 'webhooks'},
    'billing.tasks.retry_failed_webhooks': {'queue': 'webhooks'},
    'billing.tasks.cleanup_*': {'queue': 'cleanup'},
    'billing.tasks.generate_invoice_pdf': {'queue': 'billing'},
    'billing.tasks.store_invoice_pdf': {'queue': 'billing'},
    # Config Tasks
    'apps.configs.tasks.execute_backup_task': {'queue': 'backup'},
    'apps.configs.tasks.apply_retention_policies_task': {'queue': 'maintenance'},
    'apps.configs.tasks.verify_backups_task': {'queue': 'backup'},
    'apps.configs.tasks.risk_based_maintenance_task': {'queue': 'maintenance'},
    'apps.configs.tasks.health_check_all_apps_task': {'queue': 'health_check'},
    'apps.configs.tasks.conditional_maintenance_trigger_task': {'queue': 'maintenance'},
    'apps.configs.tasks.execute_due_schedules_task': {'queue': 'scheduler'},
    'apps.configs.tasks.cleanup_old_artifacts_task': {'queue': 'maintenance'},
    'apps.configs.tasks.sync_dr_metrics_task': {'queue': 'analytics'},
    'apps.configs.tasks.disaster_recovery_drill_task': {'queue': 'dr'},
    'apps.configs.tasks.restore_*': {'queue': 'restore'},
    'apps.configs.tasks.backup_*': {'queue': 'backup'},
    'apps.configs.tasks.dr_*': {'queue': 'dr'},

    # ========== Dashboard Cache Routes ==========
    'apps.dashboard.tasks.warm_*': {'queue': 'dashboard'},
    'apps.dashboard.tasks.warm_all_tenant_dashboards': {'queue': 'dashboard'},
    'apps.dashboard.tasks.clear_stale_cache': {'queue': 'cleanup'},
    'apps.dashboard.tasks.rebuild_org_tree_cache': {'queue': 'dashboard'},
    'apps.dashboard.tasks.precompute_widget_data': {'queue': 'dashboard'},
    'apps.dashboard.tasks.aggregate_dashboard_metrics': {'queue': 'aggregation'},
    
    # ========== Dashboard Export Routes ==========
    'apps.dashboard.tasks.process_due_exports': {'queue': 'export'},
    'apps.dashboard.tasks.process_user_exports': {'queue': 'export'},
    'apps.dashboard.tasks.clean_expired_exports': {'queue': 'cleanup'},
    'apps.dashboard.tasks.generate_monthly_reports': {'queue': 'export_high'},
    'apps.dashboard.tasks.generate_quarterly_reports': {'queue': 'export_high'},
    'apps.dashboard.tasks.export_*': {'queue': 'export'},
    
    # ========== Dashboard Alert Routes ==========
    'apps.dashboard.tasks.check_alerts': {'queue': 'notifications'},
    'apps.dashboard.tasks.send_daily_digest': {'queue': 'email'},
    'apps.dashboard.tasks.send_weekly_digest': {'queue': 'email'},
    'apps.dashboard.tasks.send_user_alerts': {'queue': 'notifications'},
    'apps.dashboard.tasks.check_missing_data': {'queue': 'notifications'},
    'apps.dashboard.tasks.alert_*': {'queue': 'notifications'},
    
    # ========== Dashboard Snapshot Routes ==========
    'apps.dashboard.tasks.refresh_tenant_snapshots': {'queue': 'analytics'},
    'apps.dashboard.tasks.refresh_executive_snapshots': {'queue': 'analytics'},
    'apps.dashboard.tasks.snapshot_*': {'queue': 'analytics'},
    
    # ========== Dashboard Cleanup Routes ==========
    'apps.dashboard.tasks.cleanup_old_audit_logs': {'queue': 'cleanup'},
    'apps.dashboard.tasks.archive_old_dashboard_data': {'queue': 'cleanup'},
    
    # ========== Dashboard Health Routes ==========
    'apps.dashboard.tasks.health_check': {'queue': 'health_check'},
    'apps.dashboard.tasks.health_*': {'queue': 'health_check'},
    
    # ========== Dashboard Sync Routes ==========
    'apps.dashboard.tasks.sync_permissions': {'queue': 'dashboard'},
    'apps.dashboard.tasks.sync_widget_configs': {'queue': 'dashboard'},
    'apps.dashboard.tasks.sync_*': {'queue': 'dashboard'},
    
    # ========== Dashboard Real-time Routes ==========
    'apps.dashboard.tasks.realtime_*': {'queue': 'realtime'},
    'apps.dashboard.tasks.websocket_*': {'queue': 'realtime'},
    
    # ========== Dashboard Calculation Routes ==========
    'apps.dashboard.tasks.calculate_*': {'queue': 'aggregation'},
    'apps.dashboard.tasks.compute_*': {'queue': 'aggregation'},
    
    # ========== Dashboard User Action Routes ==========
    'apps.dashboard.tasks.user_*': {'queue': 'dashboard'},
    'apps.dashboard.tasks.refresh_*': {'queue': 'dashboard'},
}

# Function-based routes for complex patterns
def route_structure_tasks(name, args, kwargs, options, task=None, **kw):
    if name.startswith('structure.tasks.'):
        if 'export' in name:
            return {'queue': 'export'}
        elif 'cache' in name or 'warm' in name:
            return {'queue': 'cache'}
        else:
            return {'queue': 'structure'}
    elif name.startswith('notifications.tasks.'):
        return {'queue': 'notification'}
    elif name.startswith('priority.'):
        return {'queue': 'priority'}
    # ADD Reviews route function (NEW)
    elif name.startswith('apps.reviews.tasks.'):
        if 'report' in name:
            return {'queue': 'reviews_reports'}
        elif 'aggregat' in name or 'sync' in name or 'calculate' in name:
            return {'queue': 'reviews_aggregation'}
    return None

task_routes = ([task_routes_dict, route_structure_tasks])