from django.utils import timezone
from apps.configs.services.security.access_enforcer import AccessEnforcer
from apps.configs.services.security.audit_logger import AuditLogger
from apps.configs.services.disaster_recovery.dr_plan_executor import DisasterRecoveryPlanExecutor
from apps.configs.services.disaster_recovery.dr_drill import DisasterRecoveryDrill
from apps.configs.services.disaster_recovery.failover import FailoverService
from apps.configs.services.disaster_recovery.failback import FailbackService
from apps.configs.services.disaster_recovery.dr_metrics import DisasterRecoveryMetrics
from apps.configs.models import DisasterRecoveryPlan, DisasterRecoveryExecution
from apps.configs.constants import DisasterRecoveryType, DisasterRecoveryStatus
from apps.configs.services.realtime import ConfigProgressBroadcaster

class DisasterRecoveryOrchestrator:
    def __init__(self):
        self.access_enforcer = AccessEnforcer()
        self.audit_logger = AuditLogger()
        self.plan_executor = DisasterRecoveryPlanExecutor()
        self.drill = DisasterRecoveryDrill()
        self.failover = FailoverService()
        self.failback = FailbackService()
        self.metrics = DisasterRecoveryMetrics()
    def execute_dr_plan(self, plan_id, triggered_by, triggered_by_role, execution_type=DisasterRecoveryType.ACTUAL):
        self.access_enforcer.enforce_super_admin(triggered_by_role)
        plan = DisasterRecoveryPlan.objects.select_related('app').get(id=plan_id)
        execution = DisasterRecoveryExecution.objects.create(
            dr_plan=plan,
            execution_type=execution_type,
            status=DisasterRecoveryStatus.INITIATED,
            triggered_by=triggered_by,
            triggered_by_role=triggered_by_role,
        )
        try:
            result = self.plan_executor.execute(plan, execution)
            execution.status = DisasterRecoveryStatus.SUCCESS if result.get('success') else DisasterRecoveryStatus.PARTIAL 
            execution.completed_at = timezone.now()
            execution.rto_achieved_minutes = result.get('rto_achieved')
            execution.rpo_achieved_minutes = result.get('rpo_achieved')
            execution.steps_executed = result.get('steps', [])
            execution.save()
            self.audit_logger.log_success('execute_dr', triggered_by, triggered_by_role, target_app=plan.app, target_id=str(plan_id))
            return execution
        except Exception as e:
            execution.status = DisasterRecoveryStatus.FAILED
            execution.completed_at = timezone.now()
            execution.issues_encountered = [str(e)]
            execution.save()
            ConfigProgressBroadcaster.broadcast_dr_progress(
                str(execution.id),
                status=DisasterRecoveryStatus.FAILED,
                progress_percent=0,
                current_step=str(e),
            )
            self.audit_logger.log_failure('execute_dr', triggered_by, triggered_by_role, error_message=str(e), target_app=plan.app)
            raise e
    def run_dr_drill(self, plan_id, triggered_by, triggered_by_role):
        self.access_enforcer.enforce_super_admin(triggered_by_role)
        return self.drill.execute(plan_id, triggered_by, triggered_by_role)
    def perform_failover(self, app_name, triggered_by, triggered_by_role):
        self.access_enforcer.enforce_super_admin(triggered_by_role)
        return self.failover.execute(app_name, triggered_by, triggered_by_role)
    def perform_failback(self, app_name, triggered_by, triggered_by_role):
        self.access_enforcer.enforce_super_admin(triggered_by_role)
        return self.failback.execute(app_name, triggered_by, triggered_by_role)