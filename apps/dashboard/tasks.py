from celery import shared_task
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta
import logging
logger = logging.getLogger(__name__)

@shared_task(name="dashboard.warm_user_dashboards")
def warm_user_dashboards(user_id, tenant_id, dashboard_types=None):
    from apps.dashboard.services import DashboardCacheService
    from apps.accounts.models import User
    try:
        user = User.objects.get(id=user_id, tenant_id=tenant_id)
        service = DashboardCacheService(user, tenant_id)
        if not dashboard_types:
            from apps.dashboard.constants import DashboardType
            dashboard_types = DashboardType.ROLE_DASHBOARD_MAP.get(user.role, [])
        service.warm_user_dashboards(user_id, dashboard_types)
        logger.info(f"Warmed dashboards for user {user_id}: {dashboard_types}")
        return {'status': 'success', 'user_id': user_id, 'dashboard_types': dashboard_types}
    except Exception as e:
        logger.error(f"Failed to warm dashboards for user {user_id}: {e}")
        return {'status': 'error', 'user_id': user_id, 'error': str(e)}

@shared_task(name="dashboard.warm_all_tenant_dashboards")
def warm_all_tenant_dashboards(tenant_id):
    from apps.accounts.models import User
    users = User.objects.filter(tenant_id=tenant_id, is_active=True)
    results = []
    for user in users:
        result = warm_user_dashboards.delay(str(user.id), tenant_id)
        results.append(result.id)
    logger.info(f"Started warming dashboards for {users.count()} users in tenant {tenant_id}")
    return {'status': 'started', 'tenant_id': tenant_id, 'task_count': len(results)}

@shared_task(name="dashboard.refresh_tenant_snapshots")
def refresh_tenant_snapshots():
    from apps.tenant.models import Organization
    from apps.dashboard.services import SuperAdminDashboardService
    from apps.accounts.models import User
    super_user = User.objects.filter(is_superuser=True).first()
    if not super_user:
        logger.error("No super user found for snapshot refresh")
        return {'status': 'error', 'error': 'No super user found'}
    tenants = Organization.objects.filter(is_active=True)
    service = SuperAdminDashboardService(super_user, None)
    results = []
    for tenant in tenants:
        try:
            result = service.refresh_tenant_snapshot(str(tenant.id))
            results.append(result)
        except Exception as e:
            logger.error(f"Failed to refresh snapshot for tenant {tenant.id}: {e}")
            results.append({'client_id': str(tenant.id), 'error': str(e)})
    logger.info(f"Refreshed snapshots for {len(results)} tenants")
    return {'status': 'success', 'tenants_processed': len(results), 'results': results}

@shared_task(name="dashboard.clean_expired_exports")
def clean_expired_exports():
    from apps.dashboard.models import ExportSchedule
    thirty_days_ago = timezone.now() - timedelta(days=30)
    deleted = ExportSchedule.objects.filter(
        last_run_at__lt=thirty_days_ago,
        is_active=False
    ).delete()
    logger.info(f"Cleaned {deleted[0] if deleted else 0} expired export schedules")
    return {'status': 'success', 'deleted_count': deleted[0] if deleted else 0}

@shared_task(name="dashboard.process_due_exports")
def process_due_exports():
    from apps.dashboard.models import ExportSchedule
    from apps.dashboard.services import ExecutiveDashboardService
    from apps.dashboard.services import ClientAdminDashboardService
    from apps.dashboard.services import SuperAdminDashboardService
    from apps.accounts.models import User
    due_exports = ExportSchedule.objects.filter(
        is_active=True,
        next_run_at__lte=timezone.now()
    )
    results = []
    for export in due_exports:
        try:
            user = User.objects.get(id=export.user_id, tenant_id=export.tenant_id)
            
            if export.dashboard_type == 'executive':
                service = ExecutiveDashboardService(user, export.tenant_id)
                data = service.get_dashboard_data(str(user.id))
            elif export.dashboard_type == 'client_admin':
                service = ClientAdminDashboardService(user, export.tenant_id)
                data = service.get_dashboard_data()
            elif export.dashboard_type == 'super_admin':
                service = SuperAdminDashboardService(user, export.tenant_id)
                data = service.get_dashboard_data()
            else:
                continue       
            export.last_run_at = timezone.now()
            export.last_run_status = 'success'
            if export.schedule_type == 'daily':
                export.next_run_at = timezone.now() + timedelta(days=1)
            elif export.schedule_type == 'weekly':
                export.next_run_at = timezone.now() + timedelta(weeks=1)
            elif export.schedule_type == 'monthly':
                export.next_run_at = timezone.now() + timedelta(days=30)
            export.save()
            results.append({
                'export_id': str(export.id),
                'status': 'success',
                'next_run': export.next_run_at.isoformat()
            })
        except Exception as e:
            logger.error(f"Failed to process export {export.id}: {e}")
            export.last_run_status = 'failed'
            export.save()
            results.append({'export_id': str(export.id), 'status': 'failed', 'error': str(e)})
    return {'status': 'success', 'exports_processed': len(results), 'results': results}

@shared_task(name="dashboard.check_alerts")
def check_alerts():
    from apps.dashboard.models import DashboardAlert
    from apps.kpi.models import KPI
    from apps.accounts.models import User
    from channels.layers import get_channel_layer
    from asgiref.sync import async_to_sync
    alerts = DashboardAlert.objects.filter(is_active=True)
    triggered = []
    for alert in alerts:
        should_trigger = False
        alert_data = None
        if alert.alert_type == 'red_kpi':
            red_kpis = KPI.objects.filter(
                tenant_id=alert.tenant_id,
                current_status='red',
                current_score__lt=50
            ).count()
            should_trigger = red_kpis > 0
            alert_data = {'red_kpi_count': red_kpis}
        elif alert.alert_type == 'tenant_expiry':
            from apps.tenant.models import Organization
            tenant = Organization.objects.filter(id=alert.tenant_id).first()
            if tenant and hasattr(tenant, 'subscription_expires_at'):
                days_left = (tenant.subscription_expires_at - timezone.now()).days
                should_trigger = days_left <= 30
                alert_data = {'days_left': days_left}
        if should_trigger and alert.should_trigger():
            alert.record_trigger(alert.id, alert.user_id, alert.tenant_id)
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"notifications_{alert.tenant_id}_{alert.user_id}",
                {
                    'type': 'send_notification',
                    'notification_id': str(alert.id),
                    'title': f"{alert.get_alert_type_display()} Alert",
                    'message': f"Alert triggered: {alert.get_alert_type_display()}",
                    'severity': alert.severity,
                    'created_at': str(timezone.now())
                }
            )
            triggered.append({
                'alert_id': str(alert.id),
                'type': alert.alert_type,
                'user_id': alert.user_id
            })
    logger.info(f"Checked {alerts.count()} alerts, triggered {len(triggered)}")
    return {'status': 'success', 'alerts_checked': alerts.count(), 'triggered': len(triggered)}

@shared_task(name="dashboard.send_daily_digest")
def send_daily_digest():
    from apps.accounts.models import User
    from apps.dashboard.services import ExecutiveDashboardService
    from apps.dashboard.services import ClientAdminDashboardService
    users = User.objects.filter(
        is_active=True,
        preferences__email_frequency='daily'
    )
    for user in users:
        try:
            if user.role in ['executive', 'client_admin', 'super_admin']:
                if user.role == 'executive':
                    service = ExecutiveDashboardService(user, user.tenant_id)
                    data = service.get_dashboard_data(str(user.id))
                elif user.role == 'client_admin':
                    service = ClientAdminDashboardService(user, user.tenant_id)
                    data = service.get_dashboard_data()
                else:
                    continue
                _send_digest_email.delay(str(user.id), data)           
        except Exception as e:
            logger.error(f"Failed to send digest for user {user.id}: {e}")
    return {'status': 'success', 'users_processed': users.count()}

@shared_task(name="dashboard._send_digest_email")
def _send_digest_email(user_id, dashboard_data):
    from django.core.mail import send_mail
    from django.template.loader import render_to_string
    from apps.accounts.models import User
    try:
        user = User.objects.get(id=user_id)
        subject = f"Daily Dashboard Digest - {timezone.now().date()}"
        html_content = render_to_string('dashboard/email/daily_digest.html', {
            'user': user,
            'data': dashboard_data,
            'date': timezone.now()
        })
        send_mail(
            subject=subject,
            message="View your dashboard digest",
            from_email=None,
            recipient_list=[user.email],
            html_message=html_content,
            fail_silently=True
        )
        logger.info(f"Sent daily digest to {user.email}")
        return {'status': 'success', 'user_id': user_id}
    except Exception as e:
        logger.error(f"Failed to send digest email to {user_id}: {e}")
        return {'status': 'error', 'user_id': user_id, 'error': str(e)}