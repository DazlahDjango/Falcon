# apps/reportplt/signals.py
import logging
from django.db.models.signals import post_save, pre_save, post_delete, m2m_changed
from django.dispatch import receiver
from django.utils import timezone
from django.core.cache import cache
from apps.reportplt.models import (
    Report, ReportTemplate, ReportSchedule, ReportExecution,
    ReportExport, ReportDashboard, ReportWidget, ReportFilter,
    ReportShare, ReportAudit, ReportCache
)
from apps.reportplt.services.dashboard.realtime_dashboard import RealtimeDashboard
from apps.reportplt.tasks import (
    send_report_notification, send_export_notification,
    refresh_report_cache, generate_dashboard_snapshot
)

logger = logging.getLogger(__name__)

@receiver(pre_save, sender=Report)
def report_pre_save(sender, instance, **kwargs):
    if instance.id:
        try:
            old = sender.objects.get(id=instance.id)
            if old.status != instance.status and instance.status == 'completed':
                instance.last_generated_at = timezone.now()
            if old.allowed_roles != instance.allowed_roles:
                ReportAudit.objects.create(
                    tenant_id=instance.tenant_id,
                    report=instance,
                    user=None,
                    action='permission_change',
                    details={'allowed_roles_changed': True}
                )
        except sender.DoesNotExist:
            pass

@receiver(post_save, sender=Report)
def report_post_save(sender, instance, created, **kwargs):
    if created:
        ReportAudit.objects.create(
            tenant_id=instance.tenant_id,
            report=instance,
            user=instance.created_by,
            action='create',
            details={'report_name': instance.name, 'report_type': instance.report_type}
        )
    else:
        if instance.needs_refresh:
            refresh_report_cache.delay(str(instance.id))
        if instance.is_published and instance.owner:
            send_report_notification.delay(
                str(instance.owner.id),
                str(instance.id),
                'published',
                f"Your report '{instance.name}' has been published."
            )

@receiver(post_delete, sender=Report)
def report_post_delete(sender, instance, **kwargs):
    cache.delete(f"report_{instance.id}")
    ReportCache.objects.filter(report=instance).delete()

@receiver(post_save, sender=ReportSchedule)
def schedule_post_save(sender, instance, created, **kwargs):
    if created:
        from apps.reportplt.tasks import run_scheduled_report
        if instance.is_active and not instance.is_paused:
            run_scheduled_report.delay(str(instance.id))
        ReportAudit.objects.create(
            tenant_id=instance.tenant_id,
            report=instance.report,
            user=instance.created_by,
            action='schedule',
            details={'schedule_name': instance.name, 'frequency': instance.frequency}
        )

@receiver(post_save, sender=ReportExecution)
def execution_post_save(sender, instance, created, **kwargs):
    if created:
        if instance.triggered_by:
            send_report_notification.delay(
                str(instance.triggered_by.id),
                str(instance.report.id),
                'generation_started',
                f"Report '{instance.report.name}' generation started."
            )
    if instance.status == 'completed':
        if instance.triggered_by:
            send_report_notification.delay(
                str(instance.triggered_by.id),
                str(instance.report.id),
                'generation_completed',
                f"Report '{instance.report.name}' generation completed."
            )
        cache.delete(f"report_{instance.report.id}")
    if instance.status == 'failed':
        if instance.triggered_by:
            send_report_notification.delay(
                str(instance.triggered_by.id),
                str(instance.report.id),
                'generation_failed',
                f"Report '{instance.report.name}' generation failed: {instance.error_message}"
            )

@receiver(post_save, sender=ReportExport)
def export_post_save(sender, instance, created, **kwargs):
    if created:
        ReportAudit.objects.create(
            tenant_id=instance.tenant_id,
            report=instance.report,
            user=instance.exported_by,
            action='export',
            details={'format': instance.format, 'file_name': instance.file_name}
        )
    if instance.status == 'completed' and instance.exported_by:
        send_export_notification.delay(str(instance.exported_by.id), str(instance.id))

@receiver(post_save, sender=ReportDashboard)
def dashboard_post_save(sender, instance, created, **kwargs):
    if created:
        ReportAudit.objects.create(
            tenant_id=instance.tenant_id,
            dashboard=instance,
            user=instance.created_by,
            action='create',
            details={'dashboard_name': instance.name, 'dashboard_type': instance.dashboard_type}
        )
    if instance.is_shared:
        generate_dashboard_snapshot.delay(str(instance.id))

@receiver(post_save, sender=ReportWidget)
def widget_post_save(sender, instance, created, **kwargs):
    if created:
        instance.dashboard.add_widget(instance)
        ReportAudit.objects.create(
            tenant_id=instance.tenant_id,
            dashboard=instance.dashboard,
            user=instance.created_by,
            action='create',
            details={'widget_name': instance.name, 'widget_type': instance.widget_type}
        )
    realtime = RealtimeDashboard()
    realtime.broadcast_widget_update(str(instance.id))

@receiver(post_delete, sender=ReportWidget)
def widget_post_delete(sender, instance, **kwargs):
    if instance.dashboard:
        instance.dashboard.remove_widget(instance)
    realtime = RealtimeDashboard()
    realtime.broadcast_dashboard_update(str(instance.dashboard_id))

@receiver(post_save, sender=ReportShare)
def share_post_save(sender, instance, created, **kwargs):
    if created:
        ReportAudit.objects.create(
            tenant_id=instance.tenant_id,
            report=instance.report,
            user=instance.shared_by,
            action='share',
            details={'shared_with': str(instance.shared_with.id), 'permission': instance.permission}
        )
        if instance.notify_recipient and instance.shared_with:
            send_report_notification.delay(
                str(instance.shared_with.id),
                str(instance.report.id),
                'shared',
                f"Report '{instance.report.name}' has been shared with you by {instance.shared_by.get_full_name()}"
            )

@receiver(post_save, sender=ReportAudit)
def audit_post_save(sender, instance, created, **kwargs):
    if created and instance.action in ['view', 'export']:
        if instance.report:
            cache_key = f"report_{instance.report.id}_audit_count"
            try:
                cache.incr(cache_key)
            except ValueError:
                cache.set(cache_key, 1)

@receiver(post_save, sender=ReportCache)
def cache_post_save(sender, instance, created, **kwargs):
    if created:
        logger.info(f"Cache created for report {instance.report_id}: {instance.cache_key}")
    if instance.is_stale:
        logger.info(f"Cache marked stale for report {instance.report_id}: {instance.cache_key}")

@receiver(pre_save, sender=ReportTemplate)
def template_pre_save(sender, instance, **kwargs):
    if instance.id:
        try:
            old = sender.objects.get(id=instance.id)
            if old.is_default != instance.is_default and instance.is_default:
                sender.objects.filter(
                    tenant_id=instance.tenant_id,
                    template_type=instance.template_type,
                    is_default=True
                ).exclude(id=instance.id).update(is_default=False)
        except sender.DoesNotExist:
            pass

@receiver(post_save, sender=ReportTemplate)
def template_post_save(sender, instance, created, **kwargs):
    if created:
        ReportAudit.objects.create(
            tenant_id=instance.tenant_id,
            user=instance.created_by,
            action='create',
            details={'template_name': instance.name, 'template_type': instance.template_type}
        )

@receiver(post_save, sender=ReportFilter)
def filter_post_save(sender, instance, created, **kwargs):
    if created:
        ReportAudit.objects.create(
            tenant_id=instance.tenant_id,
            user=instance.created_by,
            action='create',
            details={'filter_name': instance.name, 'filter_type': instance.filter_type}
        )

@receiver(pre_save, sender=ReportDashboard)
def dashboard_pre_save(sender, instance, **kwargs):
    if instance.id:
        try:
            old = sender.objects.get(id=instance.id)
            if old.allowed_roles != instance.allowed_roles:
                ReportAudit.objects.create(
                    tenant_id=instance.tenant_id,
                    dashboard=instance,
                    user=None,
                    action='permission_change',
                    details={'dashboard_permissions_changed': True}
                )
        except sender.DoesNotExist:
            pass

def connect_report_signals():
    """Explicitly connect all signals for the reports app"""
    pass