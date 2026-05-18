from django.utils import timezone
from apps.configs.models import MaintenanceWindow, MaintenanceLog
from apps.configs.services.security.access_enforcer import AccessEnforcer
from apps.configs.services.security.audit_logger import AuditLogger
from apps.configs.services.maintenance.full_maintenance import FullMaintenance
from apps.configs.services.maintenance.partial_maintenance import PartialMaintenance
from apps.configs.services.maintenance.maintenance_notifier import MaintenanceNotifier
from apps.configs.constants import MaintenanceStatus
from apps.configs.exceptions import MaintenanceConflictError

class MaintenanceOrchestrator:
    def __init__(self):
        self.access_enforcer = AccessEnforcer()
        self.audit_logger = AuditLogger()
        self.full_maintenance = FullMaintenance()
        self.partial_maintenance = PartialMaintenance()
        self.notifier = MaintenanceNotifier()
    def schedule_maintenance(self, title, maintenance_type, scheduled_start, scheduled_end, triggered_by, triggered_by_role, reason, affected_app_ids=None):
        if maintenance_type == 'full':
            self.access_enforcer.enforce_super_admin(triggered_by_role)
        else:
            self.access_enforcer.enforce_config_access(triggered_by_role)
        overlapping = MaintenanceWindow.objects.filter(
            status__in=['scheduled', 'in_progress'],
            scheduled_start__lte=scheduled_end,
            scheduled_end__gte=scheduled_start
        )
        if overlapping.exists():
            raise MaintenanceConflictError("Maintenance window overlaps with existing window")
        window = MaintenanceWindow.objects.create(
            title=title,
            maintenance_type=maintenance_type,
            status=MaintenanceStatus.SCHEDULED,
            scheduled_start=scheduled_start,
            scheduled_end=scheduled_end,
            triggered_by=triggered_by,
            triggered_by_role=triggered_by_role,
            reason=reason,
            expected_downtime_minutes=int((scheduled_end - scheduled_start).total_seconds() / 60),
            is_weekday_only=True,
        )
        if affected_app_ids:
            window.affected_apps.set(affected_app_ids)
        self.audit_logger.log_success('create_maintenance', triggered_by, triggered_by_role, target_id=str(window.id))
        return window
    def start_maintenance(self, window_id, triggered_by, triggered_by_role):
        window = MaintenanceWindow.objects.get(id=window_id)
        if window.maintenance_type == 'full':
            self.access_enforcer.enforce_super_admin(triggered_by_role)
        else:
            self.access_enforcer.enforce_config_access(triggered_by_role)
        window.status = MaintenanceStatus.IN_PROGRESS
        window.actual_start = timezone.now()
        window.save()
        if window.maintenance_type == 'full':
            self.full_maintenance.enable(window)
        else:
            self.partial_maintenance.enable(window)
        MaintenanceLog.objects.create(
            maintenance_window=window,
            action='start',
            performed_by=triggered_by,
            performed_by_role=triggered_by_role,
            details={'affected_apps': list(window.affected_apps.values_list('name', flat=True))}
        )
        self.notifier.notify_users(window)
        return window
    def stop_maintenance(self, window_id, triggered_by, triggered_by_role):
        window = MaintenanceWindow.objects.get(id=window_id)
        if window.maintenance_type == 'full':
            self.access_enforcer.enforce_super_admin(triggered_by_role)
        else:
            self.access_enforcer.enforce_config_access(triggered_by_role)
        if window.maintenance_type == 'full':
            self.full_maintenance.disable(window)
        else:
            self.partial_maintenance.disable(window)
        window.status = MaintenanceStatus.COMPLETED
        window.actual_end = timezone.now()
        window.save()
        MaintenanceLog.objects.create(
            maintenance_window=window,
            action='stop',
            performed_by=triggered_by,
            performed_by_role=triggered_by_role,
            duration_seconds=(window.actual_end - window.actual_start).total_seconds()
        )
        return window