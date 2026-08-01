# apps/reportplt/tasks.py
import logging
import uuid
from typing import Dict, Any, Optional
from datetime import timedelta
from celery import shared_task
from django.utils import timezone
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.core.files.storage import default_storage
from apps.reportplt.models import Report, ReportSchedule, ReportExecution, ReportExport, ReportCache
from apps.reportplt.services.generation.report_generator import ReportGenerator
from apps.reportplt.services.export.export_factory import ExportFactory
from apps.reportplt.services.scheduler.delivery_service import DeliveryService
from apps.reportplt.services.scheduler.retry_handler import RetryHandler
from apps.reportplt.exceptions import ReportGenerationError, ReportExportError
from apps.accounts.models import User

logger = logging.getLogger(__name__)

def check_maintenance_pause():
    try:
        from apps.configs.services.maintenance.full_maintenance import FullMaintenance
        if FullMaintenance.is_worker_stop_requested():
            logger.warning("Report task paused: Full maintenance mode is active.")
            return True
    except Exception:
        pass
    return False


@shared_task(bind=True, max_retries=3)
def generate_report_task(self, report_id: str, params: Optional[Dict] = None):
    if check_maintenance_pause():
        return {'status': 'paused', 'reason': 'System full maintenance active'}
    try:
        generator = ReportGenerator()
        result = generator.generate_report(report_id, params, async_mode=False)
        if result.get('status') == 'failed':
            raise ReportGenerationError(result.get('error', 'Report generation failed'))
        return result
    except Exception as e:
        logger.error(f"Report generation task failed: {str(e)}")
        raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))

@shared_task(bind=True, max_retries=3)
def export_report_task(self, report_id: str, format: str, params: Optional[Dict] = None, user_id: Optional[str] = None):
    if check_maintenance_pause():
        return {'status': 'paused', 'reason': 'System full maintenance active'}
    try:

        generator = ReportGenerator()
        result = generator.generate_report(report_id, params, async_mode=False)
        if result.get('status') == 'failed':
            raise ReportGenerationError(result.get('error', 'Report generation failed'))
        report_data = result.get('data', {})
        report_name = report_data.get('report_name', 'report')
        export_path = ExportFactory.export(
            format=format,
            data=report_data,
            report_name=report_name,
            config={'user_id': user_id}
        )
        export = ReportExport.objects.create(
            tenant_id=result.get('tenant_id'),
            report_id=report_id,
            format=format,
            status='completed',
            exported_by_id=user_id,
            file_path=export_path,
            file_name=f"{report_name}_{timezone.now().strftime('%Y%m%d_%H%M%S')}{ExportFactory.get_format_extension(format)}"
        )
        return {
            'status': 'success',
            'export_id': str(export.id),
            'file_path': export_path
        }
    except Exception as e:
        logger.error(f"Export task failed: {str(e)}")
        raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))

@shared_task
def run_scheduled_report(schedule_id: str):
    try:
        schedule = ReportSchedule.objects.get(id=schedule_id)
        if not schedule.is_active or schedule.is_paused:
            return {'status': 'skipped', 'reason': 'Schedule inactive or paused'}
        generator = ReportGenerator()
        result = generator.generate_report(str(schedule.report.id), schedule.custom_params, async_mode=False)
        if result.get('status') == 'success':
            execution = ReportExecution.objects.create(
                tenant_id=schedule.tenant_id,
                report=schedule.report,
                schedule=schedule,
                triggered_by=schedule.owner,
                status='completed',
                parameters_used=schedule.custom_params
            )
            if schedule.delivery_method:
                delivery_service = DeliveryService()
                delivery_service.deliver(schedule, execution, result.get('data'))
            schedule.last_run_at = timezone.now()
            schedule.last_run_status = 'success'
            schedule.save(update_fields=['last_run_at', 'last_run_status'])
        schedule.schedule_next_run()
        return {'status': 'success', 'schedule_id': str(schedule.id)}
    except ReportSchedule.DoesNotExist:
        logger.error(f"Schedule {schedule_id} not found")
        return {'status': 'failed', 'error': 'Schedule not found'}
    except Exception as e:
        logger.error(f"Scheduled report failed: {str(e)}")
        try:
            schedule = ReportSchedule.objects.get(id=schedule_id)
            schedule.last_run_status = 'failed'
            schedule.save(update_fields=['last_run_status'])
            retry_handler = RetryHandler()
            retry_handler.handle_failure(schedule, None, {'error': str(e)})
        except:
            pass
        return {'status': 'failed', 'error': str(e)}

@shared_task
def run_all_due_schedules():
    from apps.reportplt.models import ReportSchedule
    due_schedules = ReportSchedule.objects.filter(
        is_active=True,
        is_paused=False,
        next_run_at__lte=timezone.now()
    )
    results = {'success': 0, 'failed': 0, 'skipped': 0}
    for schedule in due_schedules:
        result = run_scheduled_report.delay(str(schedule.id))
        results['success'] += 1
    return results

@shared_task
def retry_failed_schedules():
    from apps.reportplt.models import ReportSchedule
    failed_schedules = ReportSchedule.objects.filter(
        is_active=True,
        is_paused=False,
        status='failed',
        retry_count__lt=models.F('max_retries')
    )
    results = {'retried': 0, 'failed': 0}
    for schedule in failed_schedules:
        try:
            result = run_scheduled_report.delay(str(schedule.id))
            results['retried'] += 1
        except Exception as e:
            logger.error(f"Failed to retry schedule {schedule.id}: {str(e)}")
            results['failed'] += 1
    return results

@shared_task
def clean_expired_cache():
    from apps.reportplt.models import ReportCache
    expired = ReportCache.objects.filter(expires_at__lte=timezone.now())
    count = expired.count()
    expired.delete()
    return {'deleted': count}

@shared_task
def clean_old_exports(days: int = 30):
    from apps.reportplt.models import ReportExport
    cutoff = timezone.now() - timedelta(days=days)
    old_exports = ReportExport.objects.filter(
        created_at__lte=cutoff,
        status='completed'
    )
    count = old_exports.count()
    for export in old_exports:
        if export.file_path and default_storage.exists(export.file_path):
            default_storage.delete(export.file_path)
    old_exports.delete()
    return {'deleted': count}

@shared_task
def generate_dashboard_snapshot(dashboard_id: str, user_id: Optional[str] = None):
    from apps.reportplt.services.dashboard.realtime_dashboard import RealtimeDashboard
    try:
        realtime = RealtimeDashboard()
        snapshot = realtime.get_dashboard_snapshot(dashboard_id)
        from apps.reportplt.models import ReportCache
        cache_key = f"dashboard_{dashboard_id}_{user_id or 'public'}"
        ReportCache.objects.update_or_create(
            report_id=dashboard_id,
            cache_key=cache_key,
            defaults={
                'tenant_id': snapshot.get('tenant_id'),
                'data': snapshot,
                'expires_at': timezone.now() + timedelta(hours=1)
            }
        )
        return {'status': 'success', 'dashboard_id': dashboard_id}
    except Exception as e:
        logger.error(f"Dashboard snapshot failed: {str(e)}")
        return {'status': 'failed', 'error': str(e)}

@shared_task
def send_report_notification(user_id: str, report_id: str, notification_type: str, message: str):
    try:
        user = User.objects.get(id=user_id)
        report = Report.objects.get(id=report_id)
        context = {
            'user': user,
            'report': report,
            'notification_type': notification_type,
            'message': message,
            'timestamp': timezone.now()
        }
        subject = f"Report Notification: {report.name}"
        html_body = render_to_string('reportplt/email/report_notification.html', context)
        send_mail(
            subject=subject,
            message=message,
            from_email=None,
            recipient_list=[user.email],
            html_message=html_body
        )
        return {'status': 'success', 'user_id': str(user_id)}
    except Exception as e:
        logger.error(f"Failed to send notification: {str(e)}")
        return {'status': 'failed', 'error': str(e)}

@shared_task
def send_export_notification(user_id: str, export_id: str):
    try:
        user = User.objects.get(id=user_id)
        export = ReportExport.objects.get(id=export_id)
        context = {
            'user': user,
            'export': export,
            'report': export.report,
            'timestamp': timezone.now()
        }
        subject = f"Export Ready: {export.report.name}"
        html_body = render_to_string('reportplt/email/export_ready.html', context)
        send_mail(
            subject=subject,
            message=f"Your report export is ready for download.",
            from_email=None,
            recipient_list=[user.email],
            html_message=html_body
        )
        return {'status': 'success', 'export_id': str(export_id)}
    except Exception as e:
        logger.error(f"Failed to send export notification: {str(e)}")
        return {'status': 'failed', 'error': str(e)}

@shared_task
def sync_report_templates():
    from apps.reportplt.services.templates.prebuilt_templates import PrebuiltTemplates
    try:
        prebuilt = PrebuiltTemplates()
        templates = prebuilt.seed_prebuilt_templates()
        return {'status': 'success', 'created': len(templates)}
    except Exception as e:
        logger.error(f"Template sync failed: {str(e)}")
        return {'status': 'failed', 'error': str(e)}

@shared_task
def refresh_report_cache(report_id: str):
    try:
        report = Report.objects.get(id=report_id)
        report.needs_refresh = True
        report.save(update_fields=['needs_refresh'])
        generator = ReportGenerator()
        result = generator.generate_report(report_id)
        return {'status': 'success', 'report_id': report_id}
    except Exception as e:
        logger.error(f"Cache refresh failed: {str(e)}")
        return {'status': 'failed', 'error': str(e)}