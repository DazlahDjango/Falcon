"""
Canonical defaults for Reviews system settings (CIA + realtime + stability).
"""

DEFAULT_REVIEWS_SYSTEM_SETTINGS = {
    'security': {
        'field_encryption_enabled': True,
        'audit_trail_enabled': True,
        'integrity_checksums_enabled': True,
        'api_rate_limit_per_minute': 100,
    },
    'realtime': {
        'websocket_enabled': True,
        'push_submission_updates': True,
        'push_approval_updates': True,
        'push_dependency_sync': True,
        'dashboard_metrics_interval_seconds': 30,
    },
    'stability': {
        'auto_close_expired_cycles': True,
        'pip_escalation_days': 30,
        'draft_assessment_retention_days': 90,
        'warm_dashboard_cache': True,
        'orphan_rating_cleanup_enabled': True,
    },
    'dependencies': {
        'sync_structure_on_change': True,
        'sync_accounts_on_change': True,
        'sync_kpi_on_change': True,
        'recalculate_on_kpi_change': True,
    },
    'availability': {
        'circuit_breaker_enabled': True,
        'circuit_breaker_failure_threshold': 5,
        'circuit_breaker_reset_seconds': 60,
        'external_call_fallback_enabled': True,
    },
}
