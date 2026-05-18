import PropTypes from 'prop-types';

export const AuditLogType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  action: PropTypes.string.isRequired,
  performed_by: PropTypes.string,
  performed_by_role: PropTypes.oneOf(['super_admin', 'client_admin', 'system', 'unknown']),
  performed_by_email: PropTypes.string,
  performed_at: PropTypes.string.isRequired,
  ip_address: PropTypes.string,
  user_agent: PropTypes.string,
  target_app: PropTypes.string,
  target_app_name: PropTypes.string,
  target_id: PropTypes.string,
  details: PropTypes.object,
  result: PropTypes.oneOf(['success', 'failure', 'partial', 'pending']),
  error_message: PropTypes.string,
  request_id: PropTypes.string,
  created_at: PropTypes.string
});

export const AuditStatsType = PropTypes.shape({
  totalLogs: PropTypes.number,
  successfulActions: PropTypes.number,
  failedActions: PropTypes.number,
  actionsByType: PropTypes.object
});