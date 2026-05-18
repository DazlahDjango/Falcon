import logging
from django.utils import timezone
from apps.configs.models import Schedule, BackupJob
from apps.configs.services.backup.backup_orchestrator import BackupOrchestrator
from apps.configs.services.scheduling.cron_parser import CronParser
from apps.configs.services.scheduling.calendar_manager import CalendarManager

class BackupScheduler:
    def __init__(self):
        self.orchestrator = BackupOrchestrator()
        self.cron_parser = CronParser()
        self.calendar = CalendarManager()
    def process_due_backups(self, system_user_id):
        due_schedules = Schedule.objects.filter(
            schedule_type='backup',
            status='active',
            next_run_at__lte=timezone.now()
        )
        results = []
        for schedule in due_schedules:
            if schedule.weekday_only and not self.calendar.is_weekday():
                schedule.next_run_at = self.cron_parser.get_next_run(schedule.cron_expression)
                schedule.save(update_fields=['next_run_at'])
                continue
            if schedule.associated_backup_policy:
                app = schedule.associated_backup_policy.app
                backup_type = schedule.associated_backup_policy.backup_type
                try:
                    job = self.orchestrator.trigger_backup(
                        app_name=app.name,
                        backup_type=backup_type,
                        triggered_by=system_user_id,
                        triggered_by_role='system',
                    )
                    schedule.last_run_at = timezone.now()
                    schedule.last_run_status = 'success'
                    schedule.run_count += 1
                    schedule.next_run_at = self.cron_parser.get_next_run(schedule.cron_expression)
                    schedule.save()
                    results.append({'schedule': schedule.name, 'job_id': str(job.id), 'status': 'triggered'})
                except Exception as e:
                    schedule.last_run_status = f'failed: {str(e)}'
                    schedule.failure_count += 1
                    schedule.save()
                    results.append({'schedule': schedule.name, 'error': str(e), 'status': 'failed'})
        return results