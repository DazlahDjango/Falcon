"""Canonical defaults for persisted KPI system settings (CIA: Integrity via versioning)."""

DEFAULT_KPI_SYSTEM_SETTINGS = {
    'validation': {
        'submission_deadline_day': 5,
        'supervisor_review_hours': 48,
        'auto_approve_within_percent': None,
        'require_evidence_for_financial': True,
    },
    'calculation': {
        'recalculate_on_approve': True,
        'traffic_light_enabled': True,
        'red_alert_consecutive_months': 2,
    },
    'cascade': {
        'default_rule': 'EQUAL_SPLIT',
        'allow_mid_year_adjustment': True,
        'lock_phasing_on_cycle_start': True,
    },
    'notifications': {
        'remind_before_deadline_days': [1, 3],
        'notify_manager_on_submit': True,
        'notify_on_red_alert': True,
    },
    'realtime': {
        'websocket_enabled': True,
        'push_score_updates': True,
        'push_validation_updates': True,
    },
}
