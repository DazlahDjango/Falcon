import PropTypes from 'prop-types';

export const MaintenanceWindowType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  maintenance_type: PropTypes.oneOf(['full', 'partial', 'rolling', 'emergency']).isRequired,
  status: PropTypes.oneOf(['scheduled', 'in_progress', 'completed', 'cancelled', 'failed']).isRequired,
  affected_apps: PropTypes.arrayOf(PropTypes.string),
  affected_app_names: PropTypes.arrayOf(PropTypes.string),
  scheduled_start: PropTypes.string.isRequired,
  scheduled_end: PropTypes.string.isRequired,
  actual_start: PropTypes.string,
  actual_end: PropTypes.string,
  triggered_by: PropTypes.string,
  triggered_by_role: PropTypes.oneOf(['super_admin', 'client_admin', 'system']),
  reason: PropTypes.string,
  expected_downtime_minutes: PropTypes.number,
  is_weekday_only: PropTypes.bool,
  notification_sent_at: PropTypes.string,
  notification_message: PropTypes.string,
  rollback_plan: PropTypes.string,
  created_at: PropTypes.string
});

export const MaintenanceLogType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  maintenance_window: PropTypes.string,
  action: PropTypes.oneOf(['start', 'stop', 'extend', 'cancel', 'fail', 'rollback']),
  performed_by: PropTypes.string,
  performed_by_role: PropTypes.string,
  performed_at: PropTypes.string,
  details: PropTypes.object,
  previous_status: PropTypes.string,
  new_status: PropTypes.string,
  duration_seconds: PropTypes.number
});

export const MaintenanceStatsType = PropTypes.shape({
  totalMaintenances: PropTypes.number,
  completedMaintenances: PropTypes.number,
  cancelledMaintenances: PropTypes.number,
  failedMaintenances: PropTypes.number,
  totalDowntimeMinutes: PropTypes.number,
  active: PropTypes.number,
  scheduled: PropTypes.number
});