from apps.configs.models import Schedule, MaintenanceWindow
from django.utils import timezone

class PriorityEngine:
    PRIORITY_ORDER = {
        'dr_drill': 1,
        'maintenance': 2,
        'backup': 3,
        'health_check': 4,
    }
    def get_highest_priority_schedule(self, schedules):
        if not schedules:
            return None
        return min(schedules, key=lambda s: self.PRIORITY_ORDER.get(s.schedule_type, 99))
    def disaster_override(self, app_name):
        Schedule.objects.filter(
            associated_backup_policy__app__name=app_name,
            schedule_type='backup',
            status='active'
        ).update(status='paused')
        Schedule.objects.filter(
            associated_maintenance__affected_apps__name=app_name,
            schedule_type='maintenance',
            status='active'
        ).update(status='paused')
        Schedule.objects.create(
            name=f"Disaster Recovery - {app_name}",
            schedule_type='dr_drill',
            status='active',
            cron_expression="0 0 * * *",
            is_disaster_override=True,
            created_by='system',
            created_by_role='system'
        )
    def restore_normal_schedule(self, app_name):
        Schedule.objects.filter(
            is_disaster_override=True,
            name__contains=app_name
        ).update(status='expired')
        Schedule.objects.filter(
            associated_backup_policy__app__name=app_name,
            status='paused'
        ).update(status='active')
        Schedule.objects.filter(
            associated_maintenance__affected_apps__name=app_name,
            status='paused'
        ).update(status='active')