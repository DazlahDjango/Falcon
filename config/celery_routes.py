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
}

# Function-based routes for complex patterns
# ====== Structure =======
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
    return None

task_routes = ([task_routes_dict, route_structure_tasks])