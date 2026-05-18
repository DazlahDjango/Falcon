# apps/config/api/v1/views/dashboard_views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db import models
from django.utils import timezone
from datetime import timedelta
from apps.configs.api.v1.permissions import IsConfigAccess
from apps.configs.api.v1.throttles import ConfigReadThrottle
from apps.configs.models import (
    RegisteredApp, BackupJob, BackupArtifact, MaintenanceWindow,
    DisasterRecoveryPlan, DisasterRecoveryExecution, HealthCheck,
    RiskAssessment, Schedule, BackupQuota, EncryptionKey, HealthCheckHistory, ConfigAuditLog
)
from apps.configs.api.v1.serializers import (
    MaintenanceWindowSerializer, DisasterRecoveryExecutionSerializer,
    HealthCheckHistorySerializer, BackupJobSerializer, ScheduleSerializer, ConfigAuditLogSerializer
)
from apps.configs.constants import BackupStatus, MaintenanceStatus, HealthStatus, DisasterRecoveryStatus, RiskLevel


class ConfigDashboardOverview(APIView):
    permission_classes = [IsAuthenticated, IsConfigAccess]
    throttle_classes = [ConfigReadThrottle]

    def get(self, request):
        role = getattr(request.user, 'role', None)
        tenant_id = getattr(request.user, 'tenant_id', None)

        total_apps = RegisteredApp.objects.filter(is_registered=True).count()
        critical_apps = RegisteredApp.objects.filter(is_registered=True, is_critical=True).count()
        
        healthy_apps = HealthCheck.objects.filter(status=HealthStatus.HEALTHY).values('app').distinct().count()
        unhealthy_apps = HealthCheck.objects.filter(status=HealthStatus.UNHEALTHY).values('app').distinct().count()
        
        active_maintenance = MaintenanceWindow.objects.filter(status=MaintenanceStatus.IN_PROGRESS).count()
        scheduled_maintenance = MaintenanceWindow.objects.filter(status=MaintenanceStatus.SCHEDULED).count()
        
        pending_backups = BackupJob.objects.filter(status=BackupStatus.PENDING).count()
        running_backups = BackupJob.objects.filter(status=BackupStatus.RUNNING).count()
        failed_backups_today = BackupJob.objects.filter(
            status=BackupStatus.FAILED,
            started_at__date=timezone.now().date()
        ).count()
        
        total_backup_size = BackupArtifact.objects.filter(
            backup_job__status=BackupStatus.COMPLETED
        ).aggregate(total=models.Sum('backup_job__size_bytes'))['total'] or 0
        
        dr_plans_active = DisasterRecoveryPlan.objects.filter(status='active').count()
        dr_drills_passed = DisasterRecoveryExecution.objects.filter(
            execution_type='drill',
            status=DisasterRecoveryStatus.SUCCESS
        ).count()
        
        high_risk_apps = RiskAssessment.objects.filter(
            risk_level__in=[RiskLevel.HIGH, RiskLevel.CRITICAL],
            expires_at__gt=timezone.now()
        ).values('app').distinct().count()
        
        active_schedules = Schedule.objects.filter(status='active').count()
        
        quota_usage = 0
        if role == 'super_admin':
            total_quota = BackupQuota.objects.aggregate(total=models.Sum('total_backup_storage_bytes'))['total'] or 1
            used_quota = BackupQuota.objects.aggregate(used=models.Sum('used_backup_storage_bytes'))['used'] or 0
            quota_usage = (used_quota / total_quota * 100) if total_quota > 0 else 0
        elif role == 'client_admin' and tenant_id:
            quotas = BackupQuota.objects.filter(tenant_id=tenant_id)
            total_quota = quotas.aggregate(total=models.Sum('total_backup_storage_bytes'))['total'] or 0
            used_quota = quotas.aggregate(used=models.Sum('used_backup_storage_bytes'))['used'] or 0
            quota_usage = (used_quota / total_quota * 100) if total_quota > 0 else 0

        return Response({
            'apps': {
                'total': total_apps,
                'critical': critical_apps,
                'healthy': healthy_apps,
                'unhealthy': unhealthy_apps,
            },
            'maintenance': {
                'active': active_maintenance,
                'scheduled': scheduled_maintenance,
            },
            'backups': {
                'pending': pending_backups,
                'running': running_backups,
                'failed_today': failed_backups_today,
                'total_storage_gb': round(total_backup_size / (1024**3), 2),
            },
            'disaster_recovery': {
                'active_plans': dr_plans_active,
                'successful_drills': dr_drills_passed,
                'high_risk_apps': high_risk_apps,
            },
            'schedules': {
                'active': active_schedules,
            },
            'quota': {
                'usage_percent': round(quota_usage, 2),
            },
            'timestamp': timezone.now().isoformat(),
        })


class ConfigBackupDashboard(APIView):
    permission_classes = [IsAuthenticated, IsConfigAccess]
    throttle_classes = [ConfigReadThrottle]

    def get(self, request):
        role = getattr(request.user, 'role', None)
        tenant_id = getattr(request.user, 'tenant_id', None)
        
        last_24h = timezone.now() - timedelta(hours=24)
        last_7d = timezone.now() - timedelta(days=7)
        last_30d = timezone.now() - timedelta(days=30)

        backup_stats = {
            'last_24h': {
                'total': BackupJob.objects.filter(started_at__gte=last_24h).count(),
                'successful': BackupJob.objects.filter(started_at__gte=last_24h, status=BackupStatus.COMPLETED).count(),
                'failed': BackupJob.objects.filter(started_at__gte=last_24h, status=BackupStatus.FAILED).count(),
                'size_gb': BackupArtifact.objects.filter(
                    backup_job__started_at__gte=last_24h,
                    backup_job__status=BackupStatus.COMPLETED
                ).aggregate(total=models.Sum('backup_job__size_bytes'))['total'] or 0,
            },
            'last_7d': {
                'total': BackupJob.objects.filter(started_at__gte=last_7d).count(),
                'successful': BackupJob.objects.filter(started_at__gte=last_7d, status=BackupStatus.COMPLETED).count(),
                'failed': BackupJob.objects.filter(started_at__gte=last_7d, status=BackupStatus.FAILED).count(),
                'size_gb': BackupArtifact.objects.filter(
                    backup_job__started_at__gte=last_7d,
                    backup_job__status=BackupStatus.COMPLETED
                ).aggregate(total=models.Sum('backup_job__size_bytes'))['total'] or 0,
            },
            'last_30d': {
                'total': BackupJob.objects.filter(started_at__gte=last_30d).count(),
                'successful': BackupJob.objects.filter(started_at__gte=last_30d, status=BackupStatus.COMPLETED).count(),
                'failed': BackupJob.objects.filter(started_at__gte=last_30d, status=BackupStatus.FAILED).count(),
                'size_gb': BackupArtifact.objects.filter(
                    backup_job__started_at__gte=last_30d,
                    backup_job__status=BackupStatus.COMPLETED
                ).aggregate(total=models.Sum('backup_job__size_bytes'))['total'] or 0,
            },
        }

        backup_by_app = []
        apps = RegisteredApp.objects.filter(is_registered=True)
        for app in apps:
            last_backup = BackupJob.objects.filter(app=app, status=BackupStatus.COMPLETED).order_by('-completed_at').first()
            backup_by_app.append({
                'app_name': app.name,
                'display_name': app.display_name,
                'last_backup_at': last_backup.completed_at.isoformat() if last_backup else None,
                'last_backup_status': last_backup.status if last_backup else 'never',
                'total_backups_30d': BackupJob.objects.filter(app=app, started_at__gte=last_30d).count(),
                'success_rate_30d': self._calculate_success_rate(app, last_30d),
            })

        artifact_status = BackupArtifact.objects.aggregate(
            verified=models.Count('id', filter=models.Q(status='verified')),
            corrupt=models.Count('id', filter=models.Q(status='corrupt')),
            archived=models.Count('id', filter=models.Q(status='archived')),
            total=models.Count('id'),
        )

        return Response({
            'stats': backup_stats,
            'backup_by_app': backup_by_app,
            'artifact_status': artifact_status,
        })

    def _calculate_success_rate(self, app, since):
        total = BackupJob.objects.filter(app=app, started_at__gte=since).count()
        if total == 0:
            return 0
        successful = BackupJob.objects.filter(app=app, started_at__gte=since, status=BackupStatus.COMPLETED).count()
        return round((successful / total) * 100, 2)


class ConfigMaintenanceDashboard(APIView):
    permission_classes = [IsAuthenticated, IsConfigAccess]
    throttle_classes = [ConfigReadThrottle]

    def get(self, request):
        now = timezone.now()
        next_24h = now + timedelta(hours=24)

        upcoming_maintenance = MaintenanceWindow.objects.filter(
            status=MaintenanceStatus.SCHEDULED,
            scheduled_start__gte=now,
            scheduled_start__lte=next_24h
        ).order_by('scheduled_start')

        active_maintenance = MaintenanceWindow.objects.filter(
            status=MaintenanceStatus.IN_PROGRESS
        ).order_by('scheduled_start')

        recent_maintenance = MaintenanceWindow.objects.filter(
            status=MaintenanceStatus.COMPLETED,
            actual_end__gte=now - timedelta(days=7)
        ).order_by('-actual_end')[:10]

        maintenance_by_type = MaintenanceWindow.objects.filter(
            created_at__gte=now - timedelta(days=30)
        ).values('maintenance_type').annotate(
            count=models.Count('id'),
            avg_duration=models.Avg('expected_downtime_minutes')
        )

        total_downtime_minutes = MaintenanceWindow.objects.filter(
            status=MaintenanceStatus.COMPLETED,
            actual_start__isnull=False,
            actual_end__isnull=False,
            created_at__gte=now - timedelta(days=30)
        ).aggregate(
            total=models.Sum(models.F('actual_end') - models.F('actual_start'))
        )['total'] or timedelta(0)

        return Response({
            'upcoming': MaintenanceWindowSerializer(upcoming_maintenance, many=True).data,
            'active': MaintenanceWindowSerializer(active_maintenance, many=True).data,
            'recent': MaintenanceWindowSerializer(recent_maintenance, many=True).data,
            'maintenance_by_type': list(maintenance_by_type),
            'total_downtime_hours_last_30d': round(total_downtime_minutes.total_seconds() / 3600, 2),
            'active_count': active_maintenance.count(),
            'scheduled_count': upcoming_maintenance.count(),
        })


class ConfigHealthDashboard(APIView):
    permission_classes = [IsAuthenticated, IsConfigAccess]
    throttle_classes = [ConfigReadThrottle]

    def get(self, request):
        now = timezone.now()
        last_hour = now - timedelta(hours=1)
        last_24h = now - timedelta(hours=24)

        current_health = {}
        apps = RegisteredApp.objects.filter(is_registered=True)
        for app in apps:
            latest = HealthCheck.objects.filter(app=app).order_by('-created_at').first()
            current_health[app.name] = {
                'status': latest.status if latest else 'unknown',
                'response_time_ms': latest.response_time_ms if latest else None,
                'last_check_at': latest.created_at.isoformat() if latest else None,
            }

        unhealthy_apps = [app.name for app in apps if current_health.get(app.name, {}).get('status') == HealthStatus.UNHEALTHY]
        degraded_apps = [app.name for app in apps if current_health.get(app.name, {}).get('status') == HealthStatus.DEGRADED]

        health_history = HealthCheckHistory.objects.filter(
            changed_at__gte=last_24h
        ).order_by('-changed_at')[:20]

        error_rate_summary = HealthCheck.objects.filter(
            created_at__gte=last_hour
        ).aggregate(
            avg_error_rate=models.Avg('error_rate_percent'),
            max_error_rate=models.Max('error_rate_percent'),
        )

        return Response({
            'current_health': current_health,
            'summary': {
                'total_apps': apps.count(),
                'healthy_apps': apps.count() - len(unhealthy_apps) - len(degraded_apps),
                'degraded_apps': len(degraded_apps),
                'unhealthy_apps': len(unhealthy_apps),
            },
            'recent_changes': HealthCheckHistorySerializer(health_history, many=True).data,
            'error_rate': {
                'avg_percent_last_hour': round(error_rate_summary['avg_error_rate'] or 0, 2),
                'max_percent_last_hour': round(error_rate_summary['max_error_rate'] or 0, 2),
            },
            'timestamp': now.isoformat(),
        })


class ConfigDRDashboard(APIView):
    permission_classes = [IsAuthenticated, IsConfigAccess]
    throttle_classes = [ConfigReadThrottle]

    def get(self, request):
        now = timezone.now()
        last_30d = now - timedelta(days=30)

        dr_plans = DisasterRecoveryPlan.objects.filter(status='active').select_related('app')
        
        plan_status = []
        for plan in dr_plans:
            last_execution = DisasterRecoveryExecution.objects.filter(
                dr_plan=plan
            ).order_by('-triggered_at').first()
            days_since_test = (now - plan.last_tested_at).days if plan.last_tested_at else 999
            needs_testing = days_since_test > plan.test_frequency_days if plan.test_frequency_days else True
            
            plan_status.append({
                'app_name': plan.app.name,
                'plan_name': plan.name,
                'rto_target': plan.rto_target_minutes,
                'rpo_target': plan.rpo_target_minutes,
                'last_tested_at': plan.last_tested_at.isoformat() if plan.last_tested_at else None,
                'test_successful': plan.test_successful,
                'needs_testing': needs_testing,
                'last_execution_status': last_execution.status if last_execution else None,
            })

        recent_executions = DisasterRecoveryExecution.objects.filter(
            triggered_at__gte=last_30d
        ).order_by('-triggered_at')[:20]

        rto_achievement = DisasterRecoveryExecution.objects.filter(
            execution_type='actual',
            status=DisasterRecoveryStatus.SUCCESS,
            triggered_at__gte=last_30d
        ).aggregate(
            avg_rto=models.Avg('rto_achieved_minutes'),
            avg_rpo=models.Avg('rpo_achieved_minutes'),
            total=models.Count('id'),
        )

        drill_success_count = DisasterRecoveryExecution.objects.filter(
            execution_type='drill',
            status=DisasterRecoveryStatus.SUCCESS,
            triggered_at__gte=last_30d
        ).count()
        drill_total_count = DisasterRecoveryExecution.objects.filter(
            execution_type='drill',
            triggered_at__gte=last_30d
        ).count()
        drill_success_rate = (drill_success_count / drill_total_count * 100) if drill_total_count > 0 else 0

        return Response({
            'plans': plan_status,
            'recent_executions': DisasterRecoveryExecutionSerializer(recent_executions, many=True).data,
            'metrics': {
                'avg_rto_achieved_minutes': round(rto_achievement['avg_rto'] or 0, 2),
                'avg_rpo_achieved_minutes': round(rto_achievement['avg_rpo'] or 0, 2),
                'total_disasters_recovered': rto_achievement['total'] or 0,
                'drill_success_rate_percent': round(drill_success_rate, 2),
            },
            'high_risk_apps': RiskAssessment.objects.filter(
                risk_level__in=[RiskLevel.HIGH, RiskLevel.CRITICAL],
                expires_at__gt=now
            ).values('app__name', 'risk_level', 'risk_score'),
        })


class ConfigSchedulingDashboard(APIView):
    permission_classes = [IsAuthenticated, IsConfigAccess]
    throttle_classes = [ConfigReadThrottle]

    def get(self, request):
        now = timezone.now()
        next_24h = now + timedelta(hours=24)

        active_schedules = Schedule.objects.filter(status='active')
        
        upcoming_executions = []
        for schedule in active_schedules:
            if schedule.next_run_at and schedule.next_run_at <= next_24h:
                upcoming_executions.append({
                    'schedule_id': str(schedule.id),
                    'name': schedule.name,
                    'type': schedule.schedule_type,
                    'next_run_at': schedule.next_run_at.isoformat(),
                    'cron': schedule.cron_expression,
                })

        recent_executions = Schedule.objects.filter(
            last_run_at__isnull=False,
            last_run_at__gte=now - timedelta(days=7)
        ).order_by('-last_run_at')[:20]

        failed_schedules = Schedule.objects.filter(
            failure_count__gte=models.F('max_consecutive_failures'),
            status='active'
        )

        schedule_stats = active_schedules.aggregate(
            backup=models.Count('id', filter=models.Q(schedule_type='backup')),
            maintenance=models.Count('id', filter=models.Q(schedule_type='maintenance')),
            health_check=models.Count('id', filter=models.Q(schedule_type='health_check')),
            dr_drill=models.Count('id', filter=models.Q(schedule_type='dr_drill')),
        )

        return Response({
            'upcoming_executions': upcoming_executions,
            'recent_executions': ScheduleSerializer(recent_executions, many=True).data,
            'failed_schedules': ScheduleSerializer(failed_schedules, many=True).data,
            'stats': schedule_stats,
            'total_active_schedules': active_schedules.count(),
        })


class ConfigSecurityDashboard(APIView):
    permission_classes = [IsAuthenticated, IsConfigAccess]
    throttle_classes = [ConfigReadThrottle]

    def get(self, request):
        now = timezone.now()
        
        active_keys = EncryptionKey.objects.filter(key_status='active')
        default_key = active_keys.filter(is_default=True).first()
        
        keys_needing_rotation = []
        for key in active_keys:
            from apps.configs.services.security.rotation_manager import RotationManager
            if key.rotated_at and (now - key.rotated_at).days > 90:
                keys_needing_rotation.append({
                    'key_id': str(key.id),
                    'key_alias': key.key_alias,
                    'rotated_at': key.rotated_at.isoformat(),
                    'days_since_rotation': (now - key.rotated_at).days,
                })

        recent_audit_actions = ConfigAuditLog.objects.filter(
            performed_at__gte=now - timedelta(days=7)
        ).values('action').annotate(count=models.Count('id')).order_by('-count')[:10]

        failed_audit_actions = ConfigAuditLog.objects.filter(
            result='failure',
            performed_at__gte=now - timedelta(days=7)
        ).count()

        actions_by_role = ConfigAuditLog.objects.filter(
            performed_at__gte=now - timedelta(days=7)
        ).values('performed_by_role').annotate(count=models.Count('id'))

        return Response({
            'encryption': {
                'active_keys_count': active_keys.count(),
                'default_key_alias': default_key.key_alias if default_key else None,
                'keys_needing_rotation': keys_needing_rotation,
                'keys_needing_rotation_count': len(keys_needing_rotation),
            },
            'audit': {
                'top_actions_last_7d': list(recent_audit_actions),
                'failed_actions_last_7d': failed_audit_actions,
                'actions_by_role': list(actions_by_role),
                'total_audit_entries_7d': ConfigAuditLog.objects.filter(performed_at__gte=now - timedelta(days=7)).count(),
            },
            'role_access': {
                'super_admin_only_endpoints': ['/api/v1/config/encryption/rotate/', '/api/v1/config/quota/modify/', '/api/v1/config/dr/execute/'],
                'client_admin_allowed_endpoints': ['/api/v1/config/backup/trigger/', '/api/v1/config/maintenance/schedule/', '/api/v1/config/restore/'],
            },
            'timestamp': now.isoformat(),
        })


class ConfigRecentActivityDashboard(APIView):
    permission_classes = [IsAuthenticated, IsConfigAccess]
    throttle_classes = [ConfigReadThrottle]

    def get(self, request):
        now = timezone.now()
        last_24h = now - timedelta(hours=24)

        recent_backups = BackupJob.objects.filter(
            started_at__gte=last_24h
        ).order_by('-started_at')[:10]

        recent_maintenance = MaintenanceWindow.objects.filter(
            created_at__gte=last_24h
        ).order_by('-created_at')[:10]

        recent_dr = DisasterRecoveryExecution.objects.filter(
            triggered_at__gte=last_24h
        ).order_by('-triggered_at')[:10]

        recent_audit = ConfigAuditLog.objects.filter(
            performed_at__gte=last_24h
        ).order_by('-performed_at')[:10]

        return Response({
            'recent_backups': BackupJobSerializer(recent_backups, many=True).data,
            'recent_maintenance': MaintenanceWindowSerializer(recent_maintenance, many=True).data,
            'recent_disaster_recovery': DisasterRecoveryExecutionSerializer(recent_dr, many=True).data,
            'recent_audit_actions': ConfigAuditLogSerializer(recent_audit, many=True).data,
            'timestamp': now.isoformat(),
        })


class ConfigSystemStatus(APIView):
    permission_classes = [IsAuthenticated, IsConfigAccess]
    throttle_classes = [ConfigReadThrottle]

    def get(self, request):
        from apps.configs.services.maintenance.maintenance_mode import MaintenanceMode
        mode = MaintenanceMode()
        
        from apps.configs.services.backup.backup_storage import BackupStorage
        storage = BackupStorage()
        
        from celery import current_app
        celery_status = current_app.control.ping(timeout=2) if current_app.control else []

        return Response({
            'maintenance': {
                'active': mode.is_active(),
                'type': mode.get_type(),
                'message': mode.get_message(),
                'affected_apps': mode.get_affected_apps(),
            },
            'celery': {
                'workers_available': len(celery_status),
                'workers': celery_status,
            },
            'storage': {
                'type': storage.get_storage_type(),
                'available': True,
            },
            'timestamp': timezone.now().isoformat(),
        })