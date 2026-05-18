from django.utils import timezone
from apps.configs.models import Schedule, MaintenanceWindow
from apps.configs.services.maintenance.maintenance_orchestrator import MaintenanceOrchestrator
from apps.configs.services.scheduling.cron_parser import CronParser
from apps.configs.services.scheduling.calendar_manager import CalendarManager

class MaintenanceScheduler:
    def __init__(self):
        self.orchestrator = MaintenanceOrchestrator()
        self.cron_parser = CronParser()
        self.calendar = CalendarManager()
    def process_due_maintenance(self, system_user_id):
        due_schedules = Schedule.objects.filter(
            schedule_type='maintenance',
            status='active',
            next_run_at__lte=timezone.now()
        )
        results = []
        for schedule in due_schedules:
            if schedule.weekday_only and not self.calendar.is_weekday():
                schedule.next_run_at = self.cron_parser.get_next_run(schedule.cron_expression)
                schedule.save(update_fields=['next_run_at'])
                continue
            if schedule.associated_maintenance:
                try:
                    window = self.orchestrator.schedule_maintenance(
                        title=schedule.name,
                        maintenance_type='partial',
                        scheduled_start=timezone.now(),
                        scheduled_end=timezone.now() + timezone.timedelta(hours=1),
                        triggered_by=system_user_id,
                        triggered_by_role='system',
                        reason=f"Automated scheduled maintenance: {schedule.name}",
                        affected_app_ids=list(schedule.associated_maintenance.affected_apps.values_list('id', flat=True)) if schedule.associated_maintenance else None
                    )
                    schedule.last_run_at = timezone.now()
                    schedule.last_run_status = 'success'
                    schedule.run_count += 1
                    schedule.next_run_at = self.cron_parser.get_next_run(schedule.cron_expression)
                    schedule.save()
                    results.append({'schedule': schedule.name, 'window_id': str(window.id), 'status': 'scheduled'})
                except Exception as e:
                    schedule.last_run_status = f'failed: {str(e)}'
                    schedule.failure_count += 1
                    schedule.save()
                    results.append({'schedule': schedule.name, 'error': str(e), 'status': 'failed'})
        return results