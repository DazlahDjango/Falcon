DEFAULT_ORGANIZATION_SETTINGS = {
    'isolation': {
        'enforce_schema_isolation': True,
        'connection_pool_max': 20,
        'idle_connection_timeout_seconds': 300,
    },
    'quotas': {
        'sync_live_counts': True,
        'warn_threshold_percent': 80,
        'block_on_exceeded': True,
        'reconcile_on_usage_read': True,
    },
    'provisioning': {
        'auto_provision_on_create': True,
        'seed_default_structure': True,
        'notify_on_complete': True,
    },
    'security': {
        'require_verified_domain_for_sso': True,
        'suspend_on_subscription_expiry': True,
        'audit_admin_actions': True,
        'mfa_required_for_super_admin': True,
    },
    'realtime': {
        'websocket_enabled': True,
        'push_status_changes': True,
        'push_quota_warnings': True,
        'push_resource_usage': True,
    },
    'branding': {
        'allow_custom_logo': True,
        'allow_custom_colors': True,
        'allow_custom_domains': True,
    },
    'domains': {
        'auto_issue_ssl': True,
        'ssl_renewal_days_before_expiry': 30,
        'max_custom_domains_per_organization': 10,
    },
}