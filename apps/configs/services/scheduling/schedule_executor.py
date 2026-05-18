import logging
from django.utils import timezone
from apps.configs.models import Schedule
from apps.configs.services.scheduling.cron_parser import CronParser
from apps.configs.services.scheduling.calendar_manager import CalendarManager
from apps.configs.services.backup.backup_scheduler import BackupScheduler
from apps.configs.services.maintenance.maintenance_scheduler import MaintenanceScheduler

class ScheduleExecutor:
    def __init__(self):
        self.cron_parser = CronParser()
        self.calendar = CalendarManager()
        self.backup_scheduler = BackupScheduler()
        self.maintenance_scheduler = MaintenanceScheduler()
    def execute_due_schedules(self, system_user_id):
        results = {
            'backups': [],
            'maintenance': [],
            'health_checks': [],
            'dr_drills': [],
        }
        due_schedules = Schedule.objects.filter(
            status='active',
            next_run_at__lte=timezone.now()
        )
        for schedule in due_schedules:
            if schedule.weekday_only and not self.calendar.is_weekday():
                self._update_next_run(schedule)
                continue
            try:
                if schedule.schedule_type == 'backup':
                    result = self.backup_scheduler.process_due_backups(system_user_id)
                    results['backups'].extend(result)
                elif schedule.schedule_type == 'maintenance':
                    result = self.maintenance_scheduler.process_due_maintenance(system_user_id)
                    results['maintenance'].extend(result)
                schedule.last_run_at = timezone.now()
                schedule.last_run_status = 'success'
                schedule.run_count += 1
                self._update_next_run(schedule)
                schedule.save()
            except Exception as e:
                schedule.last_run_status = f'failed: {str(e)}'
                schedule.failure_count += 1
                schedule.save()
                results['errors'].append({'schedule': schedule.name, 'error': str(e)})
        return results
    def _update_next_run(self, schedule):
        schedule.next_run_at = self.cron_parser.get_next_run(schedule.cron_expression)
        schedule.save(update_fields=['next_run_at'])