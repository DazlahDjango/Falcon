"""Canonical defaults for persisted structure platform settings (CIA: Integrity via versioning)."""

DEFAULT_STRUCTURE_SYSTEM_SETTINGS = {
    'hierarchy': {
        'max_depth': 12,
        'allow_matrix_reporting': True,
        'cycle_detection_on_save': True,
    },
    'validation': {
        'enforce_headcount_limits': True,
        'enforce_budget_caps': True,
        'block_delete_with_children': True,
    },
    'security': {
        'hierarchy_access_enforced': True,
        'sensitivity_classification_enabled': True,
        'scope_enforcement_enabled': True,
    },
    'sync': {
        'cache_warm_on_change': True,
        'publish_org_events': True,
    },
    'realtime': {
        'websocket_enabled': True,
        'push_department_changes': True,
        'push_team_changes': True,
        'push_employment_changes': True,
        'use_channels_primary': True,
    },
}
