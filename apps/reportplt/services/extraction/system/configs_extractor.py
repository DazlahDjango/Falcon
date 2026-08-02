# apps/reportplt/services/extraction/system/configs_extractor.py
import logging
from typing import Dict, Any, List, Optional
from datetime import timedelta
from django.db import models
from django.utils import timezone
from apps.configs.models import (
    RegisteredApp, BackupPolicy, BackupJob, BackupArtifact,
    MaintenanceWindow, MaintenanceLog, DisasterRecoveryPlan,
    DisasterRecoveryExecution, HealthCheck, HealthCheckHistory,
    Schedule, EncryptionKey, ConfigAuditLog, BackupQuota, RiskAssessment
)
from apps.configs.constants import BackupStatus, MaintenanceStatus, HealthStatus, DisasterRecoveryStatus, RiskLevel

logger = logging.getLogger(__name__)

class ConfigsBackupExtractor:
    """Extracts real-time backup metrics, artifact distributions, and storage utilization from apps.configs."""
    
    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        jobs = BackupJob.objects.all()
        artifacts = BackupArtifact.objects.all()
        policies = BackupPolicy.objects.all()
        quotas = BackupQuota.objects.all()

        if self.tenant_id:
            quotas = quotas.filter(tenant_id=self.tenant_id)

        app_name = self.filters.get('app_name')
        if app_name:
            jobs = jobs.filter(app__name=app_name)
            artifacts = artifacts.filter(backup_job__app__name=app_name)
            policies = policies.filter(app__name=app_name)

        days = int(self.filters.get('days', 30))
        cutoff = timezone.now() - timedelta(days=days)
        jobs_recent = jobs.filter(started_at__gte=cutoff)

        total_jobs = jobs_recent.count()
        completed_jobs = jobs_recent.filter(status=BackupStatus.COMPLETED).count()
        failed_jobs = jobs_recent.filter(status=BackupStatus.FAILED).count()
        pending_jobs = jobs_recent.filter(status=BackupStatus.PENDING).count()
        running_jobs = jobs_recent.filter(status=BackupStatus.RUNNING).count()
        success_rate = round((completed_jobs / total_jobs * 100), 2) if total_jobs > 0 else 0.0

        total_original_bytes = jobs_recent.filter(status=BackupStatus.COMPLETED).aggregate(total=models.Sum('original_size_bytes'))['total'] or 0
        total_compressed_bytes = jobs_recent.filter(status=BackupStatus.COMPLETED).aggregate(total=models.Sum('size_bytes'))['total'] or 0
        avg_compression_ratio = round((total_original_bytes / total_compressed_bytes), 2) if total_compressed_bytes > 0 else 1.0

        storage_by_location = {}
        for location, label in [('s3', 'AWS S3'), ('gcs', 'Google Cloud'), ('azure', 'Azure Blob'), ('local', 'Local FS'), ('nfs', 'NFS')]:
            count = artifacts.filter(storage_location=location).count()
            if count > 0:
                storage_by_location[location] = count

        verified_artifacts = artifacts.filter(status='verified').count()
        corrupt_artifacts = artifacts.filter(status='corrupt').count()
        unverified_artifacts = artifacts.exclude(status__in=['verified', 'corrupt']).count()

        job_list = []
        for job in jobs_recent.order_by('-started_at')[:200]:
            job_list.append({
                'id': str(job.id),
                'app_name': job.app.name if job.app else 'System',
                'backup_type': job.backup_type,
                'status': job.status,
                'started_at': job.started_at.isoformat() if job.started_at else None,
                'completed_at': job.completed_at.isoformat() if job.completed_at else None,
                'duration_seconds': job.duration_seconds,
                'size_bytes': job.size_bytes,
                'original_size_bytes': job.original_size_bytes,
                'checksum': job.checksum,
                'triggered_by_role': job.triggered_by_role,
            })

        quota_list = []
        for q in quotas:
            quota_list.append({
                'tenant_id': str(q.tenant_id) if q.tenant_id else None,
                'app_name': q.app.name if q.app else 'Global',
                'total_storage_bytes': q.total_backup_storage_bytes,
                'used_storage_bytes': q.used_backup_storage_bytes,
                'usage_percent': round((q.used_backup_storage_bytes / q.total_backup_storage_bytes * 100), 2) if q.total_backup_storage_bytes > 0 else 0.0,
                'is_exceeded': q.is_quota_exceeded,
            })

        return {
            'summary': {
                'total_jobs': total_jobs,
                'completed_jobs': completed_jobs,
                'failed_jobs': failed_jobs,
                'pending_jobs': pending_jobs,
                'running_jobs': running_jobs,
                'success_rate': success_rate,
                'total_original_gb': round(total_original_bytes / (1024**3), 2),
                'total_compressed_gb': round(total_compressed_bytes / (1024**3), 2),
                'avg_compression_ratio': avg_compression_ratio,
                'verified_artifacts': verified_artifacts,
                'corrupt_artifacts': corrupt_artifacts,
                'unverified_artifacts': unverified_artifacts,
            },
            'storage_distribution': storage_by_location,
            'jobs': job_list,
            'quotas': quota_list,
        }


class ConfigsDRExtractor:
    """Extracts real Disaster Recovery plans, executions, drill performance, and RTO/RPO targets."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        plans = DisasterRecoveryPlan.objects.all()
        executions = DisasterRecoveryExecution.objects.all()

        days = int(self.filters.get('days', 90))
        cutoff = timezone.now() - timedelta(days=days)
        executions_recent = executions.filter(created_at__gte=cutoff)

        total_plans = plans.count()
        active_plans = plans.filter(status='active').count()
        tested_plans = plans.filter(last_tested_at__isnull=False).count()

        total_drills = executions_recent.filter(execution_type='drill').count()
        successful_drills = executions_recent.filter(execution_type='drill', status=DisasterRecoveryStatus.SUCCESS).count()
        failed_drills = executions_recent.filter(execution_type='drill', status=DisasterRecoveryStatus.FAILED).count()
        drill_pass_rate = round((successful_drills / total_drills * 100), 2) if total_drills > 0 else 0.0

        avg_achieved_rto = executions_recent.filter(status=DisasterRecoveryStatus.SUCCESS).aggregate(avg=models.Avg('rto_achieved_minutes'))['avg'] or 0.0
        avg_achieved_rpo = executions_recent.filter(status=DisasterRecoveryStatus.SUCCESS).aggregate(avg=models.Avg('rpo_achieved_minutes'))['avg'] or 0.0

        plan_list = []
        for p in plans:
            plan_list.append({
                'id': str(p.id),
                'name': p.name,
                'app_name': p.app.name if p.app else 'System',
                'target_rpo_minutes': p.target_rpo_minutes,
                'target_rto_minutes': p.target_rto_minutes,
                'status': p.status,
                'last_tested_at': p.last_tested_at.isoformat() if p.last_tested_at else None,
                'version': p.version,
                'approved_by_super_admin': p.approved_by_super_admin,
            })

        execution_list = []
        for ex in executions_recent.order_by('-started_at')[:100]:
            execution_list.append({
                'id': str(ex.id),
                'plan_name': ex.dr_plan.name if ex.dr_plan else 'Emergency Failover',
                'app_name': ex.dr_plan.app.name if ex.dr_plan and ex.dr_plan.app else 'System',
                'execution_type': ex.execution_type,
                'status': ex.status,
                'rpo_achieved_minutes': ex.rpo_achieved_minutes,
                'rto_achieved_minutes': ex.rto_achieved_minutes,
                'started_at': ex.started_at.isoformat() if ex.started_at else None,
                'completed_at': ex.completed_at.isoformat() if ex.completed_at else None,
            })

        return {
            'summary': {
                'total_plans': total_plans,
                'active_plans': active_plans,
                'tested_plans': tested_plans,
                'total_drills': total_drills,
                'successful_drills': successful_drills,
                'failed_drills': failed_drills,
                'drill_pass_rate': drill_pass_rate,
                'avg_achieved_rto_minutes': round(avg_achieved_rto, 2),
                'avg_achieved_rpo_minutes': round(avg_achieved_rpo, 2),
            },
            'plans': plan_list,
            'executions': execution_list,
        }


class ConfigsHealthExtractor:
    """Extracts real application health checks, endpoint response latencies, and system metrics."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        health_checks = HealthCheck.objects.all()
        history = HealthCheckHistory.objects.all()
        apps = RegisteredApp.objects.filter(is_registered=True)

        total_apps = apps.count()
        healthy_apps = health_checks.filter(status=HealthStatus.HEALTHY).values('app').distinct().count()
        degraded_apps = health_checks.filter(status=HealthStatus.DEGRADED).values('app').distinct().count()
        unhealthy_apps = health_checks.filter(status=HealthStatus.UNHEALTHY).values('app').distinct().count()
        uptime_percent = round((healthy_apps / total_apps * 100), 2) if total_apps > 0 else 0.0

        avg_latency_ms = health_checks.aggregate(avg=models.Avg('response_time_ms'))['avg'] or 0.0
        avg_error_rate = health_checks.aggregate(avg=models.Avg('error_rate_percent'))['avg'] or 0.0

        app_health = []
        for app in apps:
            check = health_checks.filter(app=app).first()
            app_health.append({
                'app_name': app.name,
                'display_name': app.display_name,
                'is_critical': app.is_critical,
                'recovery_priority': app.recovery_priority,
                'status': check.status if check else 'unknown',
                'response_time_ms': check.response_time_ms if check else 0,
                'error_rate_percent': check.error_rate_percent if check else 0.0,
                'consecutive_failures': check.consecutive_failures if check else 0,
                'last_checked_at': check.last_checked_at.isoformat() if check and check.last_checked_at else None,
            })

        return {
            'summary': {
                'total_apps': total_apps,
                'healthy_apps': healthy_apps,
                'degraded_apps': degraded_apps,
                'unhealthy_apps': unhealthy_apps,
                'uptime_percent': uptime_percent,
                'avg_latency_ms': round(avg_latency_ms, 2),
                'avg_error_rate': round(avg_error_rate, 2),
            },
            'apps_health': app_health,
        }


class ConfigsMaintenanceExtractor:
    """Extracts real maintenance window schedules, downtime durations, and maintenance execution logs."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        windows = MaintenanceWindow.objects.all()
        logs = MaintenanceLog.objects.all()

        days = int(self.filters.get('days', 30))
        cutoff = timezone.now() - timedelta(days=days)
        windows_recent = windows.filter(scheduled_start__gte=cutoff)

        total_windows = windows_recent.count()
        active_windows = windows.filter(status=MaintenanceStatus.IN_PROGRESS).count()
        scheduled_windows = windows.filter(status=MaintenanceStatus.SCHEDULED).count()
        completed_windows = windows_recent.filter(status=MaintenanceStatus.COMPLETED).count()

        total_downtime_minutes = 0
        for w in windows_recent.filter(status=MaintenanceStatus.COMPLETED):
            if w.actual_start and w.actual_end:
                total_downtime_minutes += (w.actual_end - w.actual_start).total_seconds() / 60
            else:
                total_downtime_minutes += w.expected_downtime_minutes or 0

        window_list = []
        for w in windows_recent.order_by('-scheduled_start')[:100]:
            actual_dur_min = (w.actual_end - w.actual_start).total_seconds() / 60 if (w.actual_end and w.actual_start) else w.expected_downtime_minutes
            window_list.append({
                'id': str(w.id),
                'title': w.title,
                'maintenance_type': w.maintenance_type,
                'status': w.status,
                'scheduled_start': w.scheduled_start.isoformat() if w.scheduled_start else None,
                'scheduled_end': w.scheduled_end.isoformat() if w.scheduled_end else None,
                'actual_start': w.actual_start.isoformat() if w.actual_start else None,
                'actual_end': w.actual_end.isoformat() if w.actual_end else None,
                'actual_duration_minutes': actual_dur_min,
                'reason': w.reason,
            })

        return {
            'summary': {
                'total_windows': total_windows,
                'active_windows': active_windows,
                'scheduled_windows': scheduled_windows,
                'completed_windows': completed_windows,
                'total_downtime_minutes': round(total_downtime_minutes, 2),
            },
            'windows': window_list,
        }


class ConfigsSecurityExtractor:
    """Extracts real KMS key lifecycle events, risk assessment scores, and platform audit logs."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        keys = EncryptionKey.objects.all()
        audits = ConfigAuditLog.objects.all()
        risks = RiskAssessment.objects.all()

        total_keys = keys.count()
        active_keys = keys.filter(key_status='active').count()
        keys_needing_rotation = keys.filter(key_status='active', activated_at__lte=timezone.now() - timedelta(days=90)).count()

        high_risk_count = risks.filter(risk_level__in=[RiskLevel.HIGH, RiskLevel.CRITICAL], expires_at__gt=timezone.now()).count()

        days = int(self.filters.get('days', 7))
        cutoff = timezone.now() - timedelta(days=days)
        audits_recent = audits.filter(performed_at__gte=cutoff)

        total_audit_actions = audits_recent.count()
        failed_audit_actions = audits_recent.filter(result='failure').count()

        key_list = []
        for k in keys:
            key_list.append({
                'id': str(k.id),
                'key_alias': k.key_alias,
                'key_source': k.key_source,
                'status': k.key_status,
                'is_default': k.is_default,
                'activated_at': k.activated_at.isoformat() if k.activated_at else None,
                'usage_count': k.usage_count,
            })

        audit_list = []
        for a in audits_recent.order_by('-performed_at')[:100]:
            audit_list.append({
                'id': str(a.id),
                'action': a.action,
                'user_role': a.performed_by_role,
                'result': a.result,
                'target_app': a.target_app.name if a.target_app else None,
                'timestamp': a.performed_at.isoformat() if a.performed_at else None,
                'ip_address': a.ip_address,
            })

        return {
            'summary': {
                'total_keys': total_keys,
                'active_keys': active_keys,
                'keys_needing_rotation': keys_needing_rotation,
                'high_risk_count': high_risk_count,
                'total_audit_actions': total_audit_actions,
                'failed_audit_actions': failed_audit_actions,
            },
            'keys': key_list,
            'audits': audit_list,
        }


class ConfigsUnifiedExtractor:
    """Master Unified Extractor extracting complete real-data metrics across all apps.configs sub-domains."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}
        self.backup_extractor = ConfigsBackupExtractor(tenant_id, filters)
        self.dr_extractor = ConfigsDRExtractor(tenant_id, filters)
        self.health_extractor = ConfigsHealthExtractor(tenant_id, filters)
        self.maintenance_extractor = ConfigsMaintenanceExtractor(tenant_id, filters)
        self.security_extractor = ConfigsSecurityExtractor(tenant_id, filters)


    def extract(self) -> Dict[str, Any]:
        backup_data = self.backup_extractor.extract()
        dr_data = self.dr_extractor.extract()
        health_data = self.health_extractor.extract()
        maintenance_data = self.maintenance_extractor.extract()
        security_data = self.security_extractor.extract()

        return {
            'source': 'configs',
            'extracted_at': timezone.now().isoformat(),
            'backup': backup_data,
            'disaster_recovery': dr_data,
            'health': health_data,
            'maintenance': maintenance_data,
            'security': security_data,
            'summary': {
                'total_registered_apps': health_data['summary']['total_apps'],
                'healthy_apps': health_data['summary']['healthy_apps'],
                'backup_success_rate': backup_data['summary']['success_rate'],
                'dr_pass_rate': dr_data['summary']['drill_pass_rate'],
                'active_maintenance_windows': maintenance_data['summary']['active_windows'],
                'keys_needing_rotation': security_data['summary']['keys_needing_rotation'],
            }
        }
