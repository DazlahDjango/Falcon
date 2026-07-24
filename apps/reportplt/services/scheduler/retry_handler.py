# apps/reportplt/services/scheduler/retry_handler.py
import logging
import traceback
from typing import Dict, Any, Optional
from datetime import timedelta
from django.utils import timezone
from apps.reportplt.models import ReportSchedule, ReportExecution
from apps.reportplt.exceptions import ReportScheduleError

logger = logging.getLogger(__name__)

class RetryHandler:
    def __init__(self):
        self.max_retries = 3
        self.retry_delay = 300

    def handle_failure(self, schedule: ReportSchedule, execution: ReportExecution, result: Dict) -> bool:
        if schedule.can_retry():
            next_run = timezone.now() + timedelta(seconds=schedule.retry_delay or self.retry_delay)
            schedule.next_run_at = next_run
            schedule.retry_count += 1
            schedule.status = 'pending'
            schedule.save(update_fields=['next_run_at', 'retry_count', 'status'])
            logger.info(f"Schedule {schedule.id} scheduled for retry at {next_run}")
            return True
        else:
            schedule.mark_failed()
            logger.error(f"Schedule {schedule.id} exceeded max retries")
            return False

    def handle_retryable_error(self, schedule: ReportSchedule, error: Exception) -> bool:
        if schedule.can_retry():
            next_run = timezone.now() + timedelta(seconds=schedule.retry_delay or self.retry_delay)
            schedule.next_run_at = next_run
            schedule.retry_count += 1
            schedule.status = 'pending'
            schedule.last_run_status = 'failed'
            schedule.save(update_fields=['next_run_at', 'retry_count', 'status', 'last_run_status'])
            logger.info(f"Schedule {schedule.id} scheduled for retry due to error")
            return True
        return False

    def reset_retry_count(self, schedule: ReportSchedule) -> None:
        schedule.retry_count = 0
        schedule.last_run_status = 'success'
        schedule.save(update_fields=['retry_count', 'last_run_status'])

    def get_retryable_schedules(self) -> list:
        from apps.reportplt.models import ReportSchedule
        return ReportSchedule.objects.filter(
            is_active=True,
            is_paused=False,
            status='failed',
            retry_count__lt=models.F('max_retries'),
            next_run_at__lte=timezone.now()
        )

    def retry_failed_schedules(self) -> Dict[str, int]:
        schedules = self.get_retryable_schedules()
        results = {'retried': 0, 'failed': 0}
        from apps.reportplt.services.scheduler.scheduler_runner import SchedulerRunner
        runner = SchedulerRunner()
        for schedule in schedules:
            try:
                result = runner.run_schedule(str(schedule.id))
                if result.get('status') == 'success':
                    results['retried'] += 1
                else:
                    results['failed'] += 1
            except Exception as e:
                logger.error(f"Failed to retry schedule {schedule.id}: {str(e)}")
                results['failed'] += 1
        return results

    def should_retry(self, error: Exception) -> bool:
        retryable_errors = [
            'timeout',
            'connection',
            'rate_limit',
            'service_unavailable',
            'temporary_failure'
        ]
        error_str = str(error).lower()
        return any(term in error_str for term in retryable_errors)

    def calculate_backoff(self, retry_count: int) -> int:
        base_delay = 300
        max_delay = 3600
        delay = base_delay * (2 ** retry_count)
        return min(delay, max_delay)

    def get_next_retry_time(self, schedule: ReportSchedule) -> Optional[timezone.datetime]:
        if not schedule.can_retry():
            return None
        backoff = self.calculate_backoff(schedule.retry_count)
        return timezone.now() + timedelta(seconds=backoff)

class RetryManager:
    def __init__(self):
        self.handler = RetryHandler()

    def process_failure(self, schedule: ReportSchedule, execution: ReportExecution, error: Exception) -> bool:
        if self.handler.should_retry(error):
            return self.handler.handle_retryable_error(schedule, error)
        return self.handler.handle_failure(schedule, execution, {'error': str(error)})

    def retry_schedule(self, schedule_id: str) -> Dict[str, Any]:
        from apps.reportplt.services.scheduler.scheduler_runner import SchedulerRunner
        runner = SchedulerRunner()
        try:
            result = runner.run_schedule(schedule_id)
            return result
        except Exception as e:
            logger.error(f"Retry failed: {str(e)}")
            return {'status': 'failed', 'error': str(e)}

    def retry_all_failed(self) -> Dict[str, int]:
        return self.handler.retry_failed_schedules()

    def reset_schedule_retries(self, schedule_id: str) -> bool:
        from apps.reportplt.models import ReportSchedule
        try:
            schedule = ReportSchedule.objects.get(id=schedule_id)
            self.handler.reset_retry_count(schedule)
            return True
        except ReportSchedule.DoesNotExist:
            return False

    def get_retry_status(self, schedule_id: str) -> Dict[str, Any]:
        from apps.reportplt.models import ReportSchedule
        try:
            schedule = ReportSchedule.objects.get(id=schedule_id)
            return {
                'retry_count': schedule.retry_count,
                'max_retries': schedule.max_retries,
                'can_retry': schedule.can_retry(),
                'next_retry_time': self.handler.get_next_retry_time(schedule)
            }
        except ReportSchedule.DoesNotExist:
            return {'error': 'Schedule not found'}