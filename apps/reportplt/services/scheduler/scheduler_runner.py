# apps/reportplt/services/scheduler/scheduler_runner.py
import logging
import traceback
from typing import Dict, Any, Optional
from datetime import datetime
from django.utils import timezone
from django.db import transaction
from celery import shared_task
from apps.reportplt.models import ReportSchedule, ReportExecution
from apps.reportplt.services.generation.report_generator import ReportGenerator
from apps.reportplt.services.scheduler.delivery_service import DeliveryService
from apps.reportplt.services.scheduler.retry_handler import RetryHandler
from apps.reportplt.exceptions import ReportScheduleError, ReportGenerationError

logger = logging.getLogger(__name__)

class SchedulerRunner:
    def __init__(self):
        self.delivery_service = DeliveryService()
        self.retry_handler = RetryHandler()

    def run_schedule(self, schedule_id: str) -> Dict[str, Any]:
        try:
            schedule = ReportSchedule.objects.get(id=schedule_id)
            if not schedule.is_active or schedule.is_paused:
                return {'status': 'skipped', 'reason': 'Schedule is inactive or paused'}
            if schedule.is_expired():
                schedule.deactivate()
                return {'status': 'skipped', 'reason': 'Schedule has expired'}
            with transaction.atomic():
                schedule.mark_running()
                execution = self._create_execution(schedule)
                result = self._generate_report(schedule, execution)
                self._handle_result(schedule, execution, result)
                schedule.schedule_next_run()
            return {'status': 'success', 'execution_id': str(execution.id)}
        except Exception as e:
            logger.error(f"Schedule run failed: {str(e)}")
            return {'status': 'failed', 'error': str(e)}

    def _create_execution(self, schedule: ReportSchedule) -> ReportExecution:
        from apps.reportplt.models import ReportExecution
        execution = ReportExecution(
            tenant_id=schedule.tenant_id,
            report=schedule.report,
            schedule=schedule,
            triggered_by=schedule.owner,
            status='pending',
            parameters_used=schedule.custom_params,
            filters_used=schedule.report.filters
        )
        execution.save()
        return execution

    def _generate_report(self, schedule: ReportSchedule, execution: ReportExecution) -> Dict:
        try:
            generator = ReportGenerator()
            result = generator.generate_report(
                report_id=str(schedule.report.id),
                params=schedule.custom_params,
                async_mode=False
            )
            return result
        except Exception as e:
            logger.error(f"Report generation failed: {str(e)}")
            raise ReportGenerationError(f"Failed to generate report: {str(e)}")

    def _handle_result(self, schedule: ReportSchedule, execution: ReportExecution, result: Dict) -> None:
        if result.get('status') == 'success':
            execution.mark_completed(
                row_count=result.get('row_count', 0),
                data_size=result.get('data_size', 0)
            )
            self._deliver_report(schedule, execution, result)
        else:
            execution.mark_failed(
                result.get('error', 'Unknown error'),
                result.get('traceback', '')
            )
            self.retry_handler.handle_failure(schedule, execution, result)

    def _deliver_report(self, schedule: ReportSchedule, execution: ReportExecution, result: Dict) -> None:
        try:
            delivery_result = self.delivery_service.deliver(
                schedule=schedule,
                execution=execution,
                report_data=result.get('data'),
                export_path=result.get('export_path')
            )
            execution.add_log_entry(f"Delivery completed: {delivery_result}")
        except Exception as e:
            logger.error(f"Delivery failed: {str(e)}")
            execution.add_log_entry(f"Delivery failed: {str(e)}", level='error')
            raise

    def run_due_schedules(self) -> Dict[str, Any]:
        from apps.reportplt.models import ReportSchedule
        due_schedules = ReportSchedule.objects.filter(
            is_active=True,
            is_paused=False,
            next_run_at__lte=timezone.now()
        )
        results = {'success': 0, 'failed': 0, 'skipped': 0}
        for schedule in due_schedules:
            result = self.run_schedule(str(schedule.id))
            if result.get('status') == 'success':
                results['success'] += 1
            elif result.get('status') == 'failed':
                results['failed'] += 1
            else:
                results['skipped'] += 1
        return results

    def run_schedule_async(self, schedule_id: str):
        run_schedule_task.delay(schedule_id)

@shared_task
def run_schedule_task(schedule_id: str) -> Dict[str, Any]:
    runner = SchedulerRunner()
    return runner.run_schedule(schedule_id)

@shared_task
def run_all_due_schedules() -> Dict[str, Any]:
    runner = SchedulerRunner()
    return runner.run_due_schedules()

class ScheduleRunner:
    def __init__(self):
        self.runner = SchedulerRunner()

    def execute_schedule(self, schedule_id: str) -> Dict[str, Any]:
        return self.runner.run_schedule(schedule_id)

    def execute_all_due(self) -> Dict[str, Any]:
        return self.runner.run_due_schedules()

    def execute_async(self, schedule_id: str) -> str:
        run_schedule_task.delay(schedule_id)
        return f"Schedule {schedule_id} queued for execution"

    def schedule_recurring_task(self):
        return run_all_due_schedules.delay()