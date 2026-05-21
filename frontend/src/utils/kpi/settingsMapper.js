/** Mirrors apps/kpi/default_kpi_system_settings.py for form defaults. */
export const DEFAULT_KPI_FORM_SETTINGS = {
    validation: {
        submission_deadline_day: 5,
        supervisor_review_hours: 48,
        auto_approve_within_percent: null,
        require_evidence_for_financial: true,
    },
    calculation: {
        recalculate_on_approve: true,
        traffic_light_enabled: true,
        red_alert_consecutive_months: 2,
    },
    cascade: {
        default_rule: 'EQUAL_SPLIT',
        allow_mid_year_adjustment: true,
        lock_phasing_on_cycle_start: true,
    },
    notifications: {
        remind_before_deadline_days: [1, 3],
        notify_manager_on_submit: true,
        notify_on_red_alert: true,
    },
    realtime: {
        websocket_enabled: true,
        push_score_updates: true,
        push_validation_updates: true,
    },
};
