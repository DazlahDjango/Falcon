import PropTypes from 'prop-types';

export const ScheduleType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  schedule_type: PropTypes.oneOf(['backup', 'maintenance', 'health_check', 'dr_drill']).isRequired,
  status: PropTypes.oneOf(['active', 'paused', 'expired', 'deleted']).isRequired,
  cron_expression: PropTypes.string.isRequired,
  timezone: PropTypes.string,
  weekday_only: PropTypes.bool,
  start_date: PropTypes.string,
  end_date: PropTypes.string,
  last_run_at: PropTypes.string,
  next_run_at: PropTypes.string,
  last_run_status: PropTypes.string,
  run_count: PropTypes.number,
  failure_count: PropTypes.number,
  max_consecutive_failures: PropTypes.number,
  is_disaster_override: PropTypes.bool,
  created_by: PropTypes.string,
  created_by_role: PropTypes.string,
  associated_backup_policy: PropTypes.string,
  associated_maintenance: PropTypes.string,
  associated_dr_plan: PropTypes.string,
  created_at: PropTypes.string,
  updated_at: PropTypes.string
});