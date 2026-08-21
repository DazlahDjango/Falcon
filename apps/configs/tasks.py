from celery import shared_task
from django.utils import timezone
from apps.configs.services.backup.backup_orchestrator import BackupOrchestrator
from apps.configs.services.backup.backup_retention import BackupRetention
from apps.configs.services.backup.backup_verification import BackupVerification
from apps.configs.services.maintenance.maintenance_risk import MaintenanceRisk
from apps.configs.services.maintenance.full_maintenance import FullMaintenance
from apps.configs.services.health.health_checker import HealthChecker
from apps.configs.services.health.conditional_trigger import ConditionalTrigger
from apps.configs.services.scheduling.schedule_executor import ScheduleExecutor
from apps.configs.services.disaster_recovery.dr_metrics import DisasterRecoveryMetrics
import logging

logger = logging.getLogger(__name__)

def check_maintenance_pause(task_name: str) -> bool:
    """Return True if background task should pause due to full system maintenance."""
    if FullMaintenance.is_worker_stop_requested():
        logger.warning(f"Task '{task_name}' skipped: full system maintenance active (workers paused).")
        return True
    return False

@shared_task(bind=True, max_retries=3)
def execute_backup_task(self, job_id, tenant_id=None):
    if check_maintenance_pause('execute_backup_task'):
        return {'status': 'paused', 'reason': 'full_maintenance_active', 'job_id': job_id}
    orchestrator = BackupOrchestrator()
    try:
        result = orchestrator.execute_backup(job_id, tenant_id=tenant_id)
        return {'status': 'success', 'job_id': job_id, 'result': str(result)}
    except Exception as e:
        logger.error(f"Backup task failed for job {job_id}: {e}")
        self.retry(exc=e, countdown=60 * (2 ** self.request.retries))
        raise


@shared_task
def apply_retention_policies_task():
    if check_maintenance_pause('apply_retention_policies_task'):
        return {'status': 'paused', 'reason': 'full_maintenance_active'}
    retention = BackupRetention()
    deleted_count = retention.apply_retention_policy()
    logger.info(f"Retention policy applied, deleted {deleted_count} backups")
    return {'deleted_count': deleted_count}

@shared_task
def verify_backups_task():
    if check_maintenance_pause('verify_backups_task'):
        return {'status': 'paused', 'reason': 'full_maintenance_active'}
    from apps.configs.models import BackupArtifact
    verifier = BackupVerification()
    unverified = BackupArtifact.objects.filter(status__in=['uploaded', 'verifying'])[:100]
    results = []
    for artifact in unverified:
        try:
            verifier.verify_and_update_status(artifact.id)
            results.append({'artifact_id': str(artifact.id), 'status': 'verified'})
        except Exception as e:
            results.append({'artifact_id': str(artifact.id), 'status': 'failed', 'error': str(e)})
    return results

@shared_task
def risk_based_maintenance_task():
    if check_maintenance_pause('risk_based_maintenance_task'):
        return {'status': 'paused', 'reason': 'full_maintenance_active'}
    risk = MaintenanceRisk()
    system_user_id = '00000000-0000-0000-0000-000000000000'
    results = risk.assess_and_schedule(system_user_id)
    logger.info(f"Risk-based maintenance scheduled: {len(results)} windows")
    return results

@shared_task
def health_check_all_apps_task():
    if check_maintenance_pause('health_check_all_apps_task'):
        return {'status': 'paused', 'reason': 'full_maintenance_active'}
    checker = HealthChecker()
    results = checker.check_all_apps()
    logger.info(f"Health check completed for {len(results)} apps")
    return [{'app': r.app.name, 'status': r.status} for r in results]

@shared_task
def conditional_maintenance_trigger_task():
    if check_maintenance_pause('conditional_maintenance_trigger_task'):
        return {'status': 'paused', 'reason': 'full_maintenance_active'}
    trigger = ConditionalTrigger()
    system_user_id = '00000000-0000-0000-0000-000000000000'
    windows = trigger.check_and_trigger(system_user_id)
    logger.info(f"Conditional maintenance triggered: {len(windows)} windows")
    return {'windows_triggered': len(windows)}

@shared_task
def execute_due_schedules_task():
    if check_maintenance_pause('execute_due_schedules_task'):
        return {'status': 'paused', 'reason': 'full_maintenance_active'}
    executor = ScheduleExecutor()
    system_user_id = '00000000-0000-0000-0000-000000000000'
    results = executor.execute_due_schedules(system_user_id)
    logger.info(f"Schedules executed: {results}")
    return results

@shared_task
def disaster_recovery_drill_task(plan_id):
    if check_maintenance_pause('disaster_recovery_drill_task'):
        return {'status': 'paused', 'reason': 'full_maintenance_active'}
    from apps.configs.services.disaster_recovery.dr_drill import DisasterRecoveryDrill
    drill = DisasterRecoveryDrill()
    system_user_id = '00000000-0000-0000-0000-000000000000'
    result = drill.execute(plan_id, system_user_id, 'system')
    return {'plan_id': plan_id, 'status': result.status}

@shared_task
def cleanup_old_artifacts_task(days=90):
    if check_maintenance_pause('cleanup_old_artifacts_task'):
        return {'status': 'paused', 'reason': 'full_maintenance_active'}
    from apps.configs.services.backup.backup_retention import BackupRetention
    retention = BackupRetention()
    retention.archive_to_glacier(days)
    logger.info(f"Archived artifacts older than {days} days to Glacier")
    return {'days': days, 'action': 'archived_to_glacier'}

@shared_task
def sync_dr_metrics_task():
    if check_maintenance_pause('sync_dr_metrics_task'):
        return {'status': 'paused', 'reason': 'full_maintenance_active'}
    metrics = DisasterRecoveryMetrics()
    from apps.configs.models import RegisteredApp
    results = {}
    for app in RegisteredApp.objects.filter(is_registered=True):
        results[app.name] = {
            'rto_rate': metrics.get_rto_achievement_rate(app.id),
            'rpo_rate': metrics.get_rpo_achievement_rate(app.id),
            'drill_rate': metrics.get_drill_success_rate(app.id),
        }
    logger.info(f"DR metrics synced for {len(results)} apps")
    return results