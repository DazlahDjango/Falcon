from apps.configs.models import MaintenanceWindow, BackupJob
from django.utils import timezone
from datetime import timedelta

class ConflictDetector:
    def check_maintenance_conflicts(self, proposed_start, proposed_end, exclude_window_id=None):
        qs = MaintenanceWindow.objects.filter(
            status__in=['scheduled', 'in_progress'],
            scheduled_start__lte=proposed_end,
            scheduled_end__gte=proposed_start
        )
        if exclude_window_id:
            qs = qs.exclude(id=exclude_window_id)
        return list(qs)
    def check_backup_during_maintenance(self, backup_start_time):
        active_maintenance = MaintenanceWindow.objects.filter(
            status__in=['scheduled', 'in_progress'],
            scheduled_start__lte=backup_start_time,
            scheduled_end__gte=backup_start_time
        ).first()
        return active_maintenance is not None
    def get_available_window(self, duration_minutes, lookahead_days=7):
        from apps.configs.services.scheduling.calendar_manager import CalendarManager
        calendar = CalendarManager()
        start_time = timezone.now()
        end_time = start_time + timedelta(days=lookahead_days)
        current = start_time
        while current < end_time:
            if calendar.is_weekday(current):
                proposed_end = current + timedelta(minutes=duration_minutes)
                conflicts = self.check_maintenance_conflicts(current, proposed_end)
                if not conflicts:
                    return current
            current += timedelta(hours=1)
        return None