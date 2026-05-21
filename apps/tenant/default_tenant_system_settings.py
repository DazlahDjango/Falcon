"""Canonical defaults for persisted tenant platform settings (CIA: Integrity via versioning)."""

DEFAULT_TENANT_SYSTEM_SETTINGS = {
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
        'audit_tenant_admin_actions': True,
    },
    'realtime': {
        'websocket_enabled': True,
        'push_status_changes': True,
        'push_quota_warnings': True,
        'push_resource_usage': True,
    },
}
