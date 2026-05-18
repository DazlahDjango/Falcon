import PropTypes from 'prop-types';

export const HealthCheckType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  app: PropTypes.string,
  app_name: PropTypes.string,
  status: PropTypes.oneOf(['healthy', 'degraded', 'unhealthy', 'unknown', 'maintenance']).isRequired,
  status_code: PropTypes.number,
  response_time_ms: PropTypes.number,
  error_rate_percent: PropTypes.number,
  message: PropTypes.string,
  details: PropTypes.object,
  consecutive_failures: PropTypes.number,
  last_successful_check: PropTypes.string,
  created_at: PropTypes.string
});

export const HealthHistoryType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  app: PropTypes.string,
  app_name: PropTypes.string,
  previous_status: PropTypes.string,
  new_status: PropTypes.string,
  changed_at: PropTypes.string,
  trigger_conditional_maintenance: PropTypes.bool,
  maintenance_window: PropTypes.string
});

export const SystemMetricsType = PropTypes.shape({
  cpu_percent: PropTypes.number,
  memory_percent: PropTypes.number,
  disk_usage: PropTypes.number,
  load_avg: PropTypes.arrayOf(PropTypes.number),
  active_connections: PropTypes.number,
  database_size_bytes: PropTypes.number,
  database_size_gb: PropTypes.number
});