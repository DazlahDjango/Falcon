import logging
from celery import shared_task
from typing import Dict, List, Optional
logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def send_validation_notification_task(self, actual_id: str, notification_type: str) -> Optional[Dict]:
    from apps.kpi.models import MonthlyActual
    from apps.kpi.services import NotificationTrigger

    try:
        actual = MonthlyActual.objects.select_related('user', 'kpi', 'user__manager').get(id=actual_id)
        trigger = NotificationTrigger()
        supervisor = actual.user.manager if hasattr(actual.user, 'manager') else None

        context = {
            'employee_name': actual.user.get_full_name(),
            'kpi_name': actual.kpi.name,
            'actual_value': float(actual.actual_value),
            'period': f"{actual.year}-{actual.month:02d}",
            'submitted_at': actual.submitted_at
        }

        if notification_type == 'submitted' and supervisor:
            trigger.send_email(
                to=supervisor.email,
                subject=f"KPI Data Pending Validation - {actual.user.get_full_name()}",
                template='kpi_validation_pending',
                context=context
            )
            trigger.send_in_app(
                user_id=str(supervisor.id),
                title="KPI Data Pending",
                message=f"{actual.user.get_full_name()} submitted data for {actual.kpi.name}",
                data={'actual_id': actual_id}
            )
        elif notification_type == 'approved':
            trigger.send_in_app(
                user_id=str(actual.user_id),
                title="KPI Data Approved",
                message=f"Your data for {actual.kpi.name} has been approved",
                data={'actual_id': actual_id}
            )
        elif notification_type == 'rejected':
            trigger.send_in_app(
                user_id=str(actual.user_id),
                title="KPI Data Rejected",
                message=f"Your data for {actual.kpi.name} was rejected. Please review and resubmit.",
                data={'actual_id': actual_id}
            )

        return {'status': 'SUCCESS', 'notification_type': notification_type}
    except MonthlyActual.DoesNotExist:
        logger.warning(f"Actual {actual_id} not found for validation notification")
        return None
    except Exception as e:
        logger.exception(f"Validation notification failed: {e}")
        raise self.retry(exc=e)


@shared_task(bind=True)
def send_red_alert_check_task(self, tenant_id: str, year: int, month: int) -> Dict:
    from apps.kpi.services import RedAlertService

    logger.info(f"Checking red alerts for tenant {tenant_id}, period {year}-{month:02d}")
    try:
        alert_service = RedAlertService()
        alerts = alert_service.check_and_alert(tenant_id, year, month)
        return {'status': 'SUCCESS', 'alerts_sent': len(alerts) if alerts else 0}
    except Exception as e:
        logger.exception(f"Red alert check failed: {e}")
        return {'status': 'FAILED', 'error': str(e)}


@shared_task(bind=True)
def send_missing_data_reminders_task(self, tenant_id: str, year: int, month: int) -> Dict:
    from apps.kpi.services import MissingDataReminder

    logger.info(f"Sending missing data reminders for tenant {tenant_id}, period {year}-{month:02d}")
    try:
        reminder_service = MissingDataReminder()
        result = reminder_service.send_reminders(tenant_id, year, month)
        return {'status': 'SUCCESS', 'result': result}
    except Exception as e:
        logger.exception(f"Missing data reminders failed: {e}")
        return {'status': 'FAILED', 'error': str(e)}


@shared_task(bind=True)
def send_threshold_breach_alerts_task(self, tenant_id: str, year: int, month: int) -> Dict:
    from apps.kpi.services import ThresholdBreachService

    logger.info(f"Checking threshold breaches for tenant {tenant_id}, period {year}-{month:02d}")
    try:
        breach_service = ThresholdBreachService()
        result = breach_service.check_threshold_breaches(tenant_id, year, month)
        return {'status': 'SUCCESS', 'result': result}
    except Exception as e:
        logger.exception(f"Threshold breach check failed: {e}")
        return {'status': 'FAILED', 'error': str(e)}


@shared_task(bind=True)
def send_escalation_notification_task(self, escalation_id: str, notification_type: str) -> Optional[Dict]:
    from apps.kpi.models import Escalation
    from apps.kpi.services import NotificationTrigger

    try:
        escalation = Escalation.objects.select_related('actual__kpi', 'escalated_to').get(id=escalation_id)
        trigger = NotificationTrigger()

        if notification_type == 'created':
            trigger.send_in_app(
                user_id=str(escalation.escalated_to_id),
                title="Escalation Assigned",
                message=f"Please review escalated KPI data: {escalation.actual.kpi.name}",
                data={'escalation_id': escalation_id}
            )
        return {'status': 'SUCCESS', 'notification_type': notification_type}
    except Escalation.DoesNotExist:
        logger.warning(f"Escalation {escalation_id} not found")
        return None
    except Exception as e:
        logger.exception(f"Escalation notification failed: {e}")
        return {'status': 'FAILED', 'error': str(e)}


# ============================================================================
# Bulk Notification Tasks
# ============================================================================

@shared_task(bind=True)
def send_bulk_notifications_task(self, notification_data: List[Dict]) -> Dict:
    """Send bulk notifications to multiple users"""
    from apps.kpi.services import NotificationTrigger

    trigger = NotificationTrigger()
    results = {'sent': 0, 'failed': 0, 'errors': []}

    for data in notification_data:
        try:
            user_id = data.get('user_id')
            title = data.get('title')
            message = data.get('message')
            notification_type = data.get('type', 'info')

            trigger.send_in_app(user_id, title, message, data.get('data', {}))
            results['sent'] += 1

        except Exception as e:
            results['failed'] += 1
            results['errors'].append({'user_id': data.get('user_id'), 'error': str(e)})

    logger.info(f"Bulk notifications sent: {results['sent']} succeeded, {results['failed']} failed")
    return results


@shared_task(bind=True)
def send_scheduled_reminders_task(self) -> Dict:
    """Send scheduled reminders for pending validations"""
    from django.utils import timezone
    from apps.tenant.models import Client
    from apps.kpi.services import PendingValidationAlert

    tenants = Client.objects.filter(is_active=True)
    alert_service = PendingValidationAlert()
    results = {}

    for tenant in tenants:
        try:
            alerts = alert_service.check_pending_validations(str(tenant.id))
            results[str(tenant.id)] = {'alerts_sent': len(alerts) if alerts else 0}
        except Exception as e:
            results[str(tenant.id)] = {'error': str(e)}

    logger.info(f"Scheduled reminders sent for {len(results)} tenants")
    return results


# ============================================================================
# Scheduled Report Generation Tasks
# ============================================================================

@shared_task(bind=True)
def generate_periodic_reports_task(self, tenant_id: str, report_type: str, period: str) -> Dict:
    """Generate scheduled reports"""
    from apps.kpi.services import ReportGenerator

    generator = ReportGenerator()

    try:
        if report_type == 'monthly':
            year, month = map(int, period.split('-'))
            report = generator.generate_monthly_report(tenant_id, year, month)
        elif report_type == 'quarterly':
            year, quarter = map(int, period.split('-Q'))
            report = generator.generate_quarterly_report(tenant_id, year, quarter)
        elif report_type == 'annual':
            report = generator.generate_annual_report(tenant_id, int(period))
        else:
            return {'status': 'ERROR', 'message': f'Unknown report type: {report_type}'}

        logger.info(f"Generated {report_type} report for tenant {tenant_id}: {report.get('id')}")
        return {
            'status': 'SUCCESS',
            'report_id': report.get('id'),
            'report_url': report.get('url'),
            'period': period
        }
    except Exception as e:
        logger.exception(f"Report generation failed: {e}")
        return {'status': 'ERROR', 'error': str(e)}


@shared_task(bind=True)
def generate_all_monthly_reports_task(self, year: int, month: int) -> Dict:
    """Generate monthly reports for all tenants"""
    from apps.tenant.models import Client

    tenants = Client.objects.filter(is_active=True)
    results = {}

    for tenant in tenants:
        try:
            task = generate_periodic_reports_task.delay(
                str(tenant.id), 'monthly', f"{year}-{month:02d}"
            )
            results[str(tenant.id)] = {'task_id': task.id, 'status': 'SCHEDULED'}
        except Exception as e:
            results[str(tenant.id)] = {'error': str(e)}

    logger.info(f"Scheduled monthly reports for {len(results)} tenants")
    return results


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def generate_custom_report_task(self, tenant_id: str, report_data: Dict, user_id: str) -> Dict:
    """Generate a custom report asynchronously"""
    from apps.kpi.services import ReportGenerator

    logger.info(f"Generating custom report for tenant {tenant_id}, user {user_id}")

    try:
        generator = ReportGenerator()
        report_type = report_data.get('report_type')
        format_type = report_data.get('format', 'pdf')
        filters = report_data.get('filters', {})

        if report_type == 'kpi_performance':
            report = generator.generate_kpi_performance_report(
                tenant_id,
                tenant_id,
                filters.get('kpi_ids', []),
                filters.get('year'),
                filters.get('month'),
                format_type
            )
        elif report_type == 'department_comparison':
            report = generator.generate_department_comparison_report(
                tenant_id,
                tenant_id,
                filters.get('year'),
                filters.get('month'),
                format_type
            )
        elif report_type == 'trend_analysis':
            report = generator.generate_trend_analysis_report(
                tenant_id,
                tenant_id,
                filters.get('kpi_ids', []),
                filters.get('months', 12),
                format_type
            )
        else:
            return {'status': 'ERROR', 'error': f'Unknown report type: {report_type}'}

        logger.info(f"Report generated successfully for tenant {tenant_id}")
        
        # Update report task status if you have a ReportTask model
        try:
            from apps.kpi.models import ReportTask
            ReportTask.objects.filter(id=report_data.get('task_id')).update(
                status='COMPLETED',
                result_url=report.get('url') if isinstance(report, dict) else None
            )
        except Exception:
            pass

        return {
            'status': 'SUCCESS',
            'report_type': report_type,
            'format': format_type,
            'data': report.get('data') if isinstance(report, dict) else report
        }

    except Exception as e:
        logger.exception(f"Report generation failed: {e}")
        
        # Update report task status to failed
        try:
            from apps.kpi.models import ReportTask
            ReportTask.objects.filter(id=report_data.get('task_id')).update(
                status='FAILED',
                error_message=str(e)
            )
        except Exception:
            pass
        
        raise self.retry(exc=e)


# ============================================================================
# Data Sync Tasks
# ============================================================================

@shared_task(bind=True)
def sync_external_data_task(self, tenant_id: str, source: str, data: Dict) -> Dict:
    """Sync data from external source"""
    from apps.kpi.services import DataSyncService

    sync_service = DataSyncService()
    try:
        result = sync_service.sync_from_external(tenant_id, source, data)
        logger.info(f"Data sync completed for tenant {tenant_id} from {source}")
        return {'status': 'SUCCESS', 'result': result}
    except Exception as e:
        logger.exception(f"Data sync failed: {e}")
        return {'status': 'ERROR', 'error': str(e)}


# ============================================================================
# Session Cleanup Tasks
# ============================================================================

@shared_task(bind=True)
def cleanup_expired_sessions_task(self) -> Dict:
    """Clean up expired user sessions"""
    from django.contrib.sessions.models import Session
    from django.utils import timezone

    try:
        expired_sessions = Session.objects.filter(expire_date__lt=timezone.now())
        count = expired_sessions.count()
        expired_sessions.delete()
        logger.info(f"Cleaned up {count} expired sessions")
        return {'status': 'SUCCESS', 'deleted': count}
    except Exception as e:
        logger.exception(f"Session cleanup failed: {e}")
        return {'status': 'FAILED', 'error': str(e)}


# ============================================================================
# Data Quality Tasks
# ============================================================================

@shared_task(bind=True)
def validate_data_quality_task(self, tenant_id: str, year: int, month: int) -> Dict:
    """Validate data quality for a period"""
    from apps.kpi.services import ComplianceChecker

    checker = ComplianceChecker()
    try:
        validation_compliance = checker.check_validation_compliance(tenant_id, year, month)
        data_quality = checker.check_data_quality(tenant_id, year, month)
        timeliness = checker.check_timeliness(tenant_id, year, month)

        logger.info(f"Data quality validation completed for tenant {tenant_id}")
        return {
            'status': 'SUCCESS',
            'validation_compliance': validation_compliance,
            'data_quality': data_quality,
            'timeliness': timeliness
        }
    except Exception as e:
        logger.exception(f"Data quality validation failed: {e}")
        return {'status': 'FAILED', 'error': str(e)}


@shared_task(bind=True)
def detect_anomalies_task(self, tenant_id: str, year: int, month: int) -> Dict:
    """Detect anomalies in KPI scores"""
    from apps.kpi.engine.traffic_light import RiskPredictor
    from apps.kpi.models import Score

    predictor = RiskPredictor()
    anomalies = []

    try:
        scores = Score.objects.filter(
            tenant_id=tenant_id,
            year=year,
            month=month
        ).select_related('kpi', 'user')

        for score in scores:
            historical = Score.objects.filter(
                kpi=score.kpi,
                user=score.user,
                year__lte=year,
                month__lt=month
            ).order_by('-year', '-month')[:6]

            historical_values = [float(s.score) for s in historical]

            if len(historical_values) >= 3:
                prediction = predictor.predict_risk(
                    str(score.kpi_id), str(score.user_id), historical_values + [float(score.score)]
                )
                if prediction.get('risk_level') == 'HIGH':
                    anomalies.append({
                        'score_id': str(score.id),
                        'kpi_id': str(score.kpi_id),
                        'kpi_name': score.kpi.name,
                        'user_id': str(score.user_id),
                        'user_name': score.user.get_full_name(),
                        'score': float(score.score),
                        'prediction': prediction
                    })

        logger.info(f"Detected {len(anomalies)} anomalies for tenant {tenant_id}")
        return {'status': 'SUCCESS', 'anomalies': anomalies, 'count': len(anomalies)}
    except Exception as e:
        logger.exception(f"Anomaly detection failed: {e}")
        return {'status': 'FAILED', 'error': str(e)}