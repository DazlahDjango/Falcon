from apps.configs.services.disaster_recovery.dr_plan_executor import DisasterRecoveryPlanExecutor
from apps.configs.services.security.audit_logger import AuditLogger
from apps.configs.models import DisasterRecoveryExecution
from apps.configs.constants import DisasterRecoveryType, DisasterRecoveryStatus
from django.utils import timezone

class DisasterRecoveryDrill:
    def __init__(self):
        self.executor = DisasterRecoveryPlanExecutor()
        self.audit_logger = AuditLogger()
    def execute(self, plan_id, triggered_by, triggered_by_role):
        from apps.configs.models import DisasterRecoveryPlan
        plan = DisasterRecoveryPlan.objects.select_related('app').get(id=plan_id)
        execution = DisasterRecoveryExecution.objects.create(
            dr_plan=plan,
            execution_type=DisasterRecoveryType.DRILL,
            status=DisasterRecoveryStatus.INITIATED,
            triggered_by=triggered_by,
            triggered_by_role=triggered_by_role,
        )
        try:
            result = self.executor.execute(plan, execution)
            execution.status = DisasterRecoveryStatus.SUCCESS
            execution.completed_at = timezone.now()
            execution.steps_executed = result.get('steps', [])
            execution.save()
            plan.last_tested_at = timezone.now()
            plan.test_successful = True
            plan.save(update_fields=['last_tested_at', 'test_successful'])
            self.audit_logger.log_success('run_dr_drill', triggered_by, triggered_by_role, target_app=plan.app, target_id=str(plan_id))
            return execution
        except Exception as e:
            execution.status = DisasterRecoveryStatus.FAILED
            execution.completed_at = timezone.now()
            execution.issues_encountered = [str(e)]
            execution.save()
            plan.test_successful = False
            plan.save(update_fields=['test_successful'])
            self.audit_logger.log_failure('run_dr_drill', triggered_by, triggered_by_role, error_message=str(e), target_app=plan.app)
            raise e