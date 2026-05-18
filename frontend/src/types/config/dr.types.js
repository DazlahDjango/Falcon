import PropTypes from 'prop-types';

export const DRPlanType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  app: PropTypes.string,
  app_name: PropTypes.string,
  name: PropTypes.string.isRequired,
  version: PropTypes.string,
  status: PropTypes.oneOf(['draft', 'active', 'tested', 'expired', 'archived']).isRequired,
  rpo_target_minutes: PropTypes.number,
  rto_target_minutes: PropTypes.number,
  recovery_steps: PropTypes.arrayOf(PropTypes.string),
  validation_steps: PropTypes.arrayOf(PropTypes.string),
  failover_script_path: PropTypes.string,
  failback_script_path: PropTypes.string,
  standby_replica_arn: PropTypes.string,
  standby_endpoint: PropTypes.string,
  last_tested_at: PropTypes.string,
  test_frequency_days: PropTypes.number,
  test_successful: PropTypes.bool,
  test_notes: PropTypes.string,
  owned_by: PropTypes.string,
  approval_required: PropTypes.bool,
  approved_by: PropTypes.string,
  approved_at: PropTypes.string,
  created_at: PropTypes.string,
  updated_at: PropTypes.string
});

export const DRExecutionType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  dr_plan: PropTypes.string,
  plan_name: PropTypes.string,
  app_name: PropTypes.string,
  execution_type: PropTypes.oneOf(['drill', 'actual', 'failover', 'failback']).isRequired,
  status: PropTypes.oneOf(['initiated', 'in_progress', 'validating', 'success', 'partial', 'failed', 'aborted']).isRequired,
  triggered_by: PropTypes.string,
  triggered_by_role: PropTypes.string,
  triggered_at: PropTypes.string,
  started_at: PropTypes.string,
  completed_at: PropTypes.string,
  backup_job_used: PropTypes.string,
  rto_achieved_minutes: PropTypes.number,
  rpo_achieved_minutes: PropTypes.number,
  steps_executed: PropTypes.array,
  validation_results: PropTypes.object,
  issues_encountered: PropTypes.array,
  notes: PropTypes.string
});

export const DRMetricsType = PropTypes.shape({
  rtoAchievementRate: PropTypes.number,
  rpoAchievementRate: PropTypes.number,
  drillSuccessRate: PropTypes.number,
  totalDisastersRecovered: PropTypes.number,
  activePlans: PropTypes.number,
  successfulDrills: PropTypes.number,
  highRiskApps: PropTypes.number
});