# signals.py
from django.db.models.signals import post_save, pre_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
from django.utils import timezone
from django.db import transaction
from django.db.models import Q
import logging
from apps.structure.models import Department, Employment, Employment
from .models import (
    KPI, KPIWeight, AnnualTarget, MonthlyActual, ValidationRecord,
    Score, MonthlyPhasing, Escalation, ActualAdjustment, CascadeMap
)
from .exceptions import PermissionDenied
from .utils.cache_keys import invalidate_kpi_cache, invalidate_user_dashboards

logger = logging.getLogger(__name__)


def _manager_user_id_for_employee(user_id):
    try:
        employment = Employment.objects.filter(
            user_id=user_id, is_current=True, is_active=True,
        ).first()
        if not employment:
            return None
        line = Employment.objects.filter(
            employee=employment, is_active=True, relation_type='solid',
        ).select_related('manager').first()
        if line and line.manager:
            return str(line.manager.user_id)
    except Exception as e:
        logger.warning(f"Failed to get manager for user {user_id}: {e}")
    return None


# KPI Signals
@receiver(post_save, sender=KPI)
def kpi_post_save_handler(sender, instance, created, **kwargs):
    logger.info(f"KPI {instance.code} {'created' if created else 'updated'}")
    invalidate_kpi_cache(str(instance.id))
    
    if created:
        try:
            from apps.tenant.services.monitoring.resource_sync import ResourceSyncService
            ResourceSyncService.sync_tenant(instance.tenant_id, broadcast=True)
        except ImportError:
            pass
        except Exception as e:
            logger.warning(f"Failed to sync tenant: {e}")
    
    if not created and not instance.is_active:
        try:
            from .tasks import calculate_kpi_score_task
            affected_users = KPIWeight.objects.filter(
                kpi=instance).values_list('user_id', flat=True)
            now = timezone.now()
            for user_id in affected_users:
                calculate_kpi_score_task.delay(
                    str(user_id), now.year, now.month, force=True
                )
        except ImportError:
            pass


@receiver(pre_save, sender=KPI)
def kpi_pre_save_handler(sender, instance, **kwargs):
    if instance.pk:
        try:
            old = sender.objects.get(pk=instance.pk)
            instance._changed_fields = {}
            for field in ['name', 'code', 'description', 'kpi_type', 'calculation_logic',
                          'measure_type', 'unit', 'decimal_places', 'is_active']:
                old_value = getattr(old, field)
                new_value = getattr(instance, field)
                if old_value != new_value:
                    instance._changed_fields[field] = {
                        'old': old_value, 'new': new_value}
        except sender.DoesNotExist:
            pass


# KPI Weight Signals
@receiver([post_save, post_delete], sender=KPIWeight)
def kpi_weight_changed_handler(sender, instance, **kwargs):
    logger.info(f"KPI weight changed for {instance.kpi.code} - user {instance.user.email}")
    invalidate_user_dashboards(str(instance.user_id))
    
    try:
        from .tasks import calculate_kpi_score_task, create_in_app_notification_task
        now = timezone.now()
        calculate_kpi_score_task.delay(
            user_id=str(instance.user_id),
            year=now.year,
            month=now.month,
            force=True
        )
        
        from .services import KPIValidator
        validator = KPIValidator()
        is_valid, message = validator.validate_weight_sum(
            str(instance.kpi_id), str(instance.user_id))
        if not is_valid:
            logger.warning(f"Weight validation failed for user {instance.user.email}: {message}")
            create_in_app_notification_task.delay(
                user_id=str(instance.user_id),
                title="KPI Weight Error",
                message=f"Your KPI weights for {instance.kpi.name} sum to an invalid total. Please review.",
                data={'kpi_id': str(instance.kpi_id), 'error': message}
            )
    except ImportError:
        pass


# Target Signals
@receiver(post_save, sender=AnnualTarget)
def annual_target_post_save_handler(sender, instance, created, **kwargs):
    logger.info(f"Annual target {'created' if created else 'updated'} for {instance.kpi.code} - {instance.year}")
    cache_key = f"kpi:target:{instance.kpi_id}:{instance.user_id}:{instance.year}"
    cache.delete(cache_key)
    
    if instance.approved_by and not created:
        try:
            from .tasks import update_aggregated_scores_task
            transaction.on_commit(lambda: update_aggregated_scores_task.delay(
                tenant_id=str(instance.tenant_id),
                year=instance.year,
                month=1
            ))
        except ImportError:
            pass


@receiver(post_save, sender=MonthlyPhasing)
def monthly_phasing_post_save_handler(sender, instance, created, **kwargs):
    if created or instance.is_locked:
        logger.info(f"Monthly phasing {'locked' if instance.is_locked else 'updated'} for period {instance.month}")
        cache.delete(f"kpi:phasing:{instance.annual_target_id}")
        
        try:
            from .tasks import calculate_kpi_score_task
            calculate_kpi_score_task.delay(
                user_id=str(instance.annual_target.user_id),
                year=instance.annual_target.year,
                month=instance.month,
                force=True
            )
        except ImportError:
            pass


# Actual Data Signals
@receiver(post_save, sender=MonthlyActual)
def monthly_actual_post_save_handler(sender, instance, created, **kwargs):
    logger.info(f"Monthly actual {'created' if created else 'updated'} for {instance.kpi.code} - "
                f"period {instance.year}-{instance.month:02d}, status: {instance.status}")
    invalidate_user_dashboards(str(instance.user_id))
    
    try:
        from .tasks import calculate_kpi_score_task, send_validation_notification_task, send_red_alert_check_task
        from .services.realtime import KPIEventBroadcaster
        
        if instance.status == 'APPROVED':
            calculate_kpi_score_task.delay(
                user_id=str(instance.user_id),
                year=instance.year,
                month=instance.month,
                force=True
            )
            transaction.on_commit(lambda: send_red_alert_check_task.delay(
                tenant_id=str(instance.tenant_id),
                year=instance.year,
                month=instance.month
            ))
        elif instance.status == 'PENDING' and instance.submitted_at:
            transaction.on_commit(lambda: send_validation_notification_task.delay(
                actual_id=str(instance.id),
                notification_type='submitted'
            ))
        
        manager_id = _manager_user_id_for_employee(instance.user_id)
        if instance.status == 'PENDING' and instance.submitted_at:
            KPIEventBroadcaster.actual_submitted(
                user_id=str(instance.user_id),
                actual_id=str(instance.id),
                manager_id=manager_id,
                year=instance.year,
                month=instance.month,
            )
        else:
            KPIEventBroadcaster.validation_updated(
                user_id=str(instance.user_id),
                actual_id=str(instance.id),
                status=instance.status,
                kpi_id=str(instance.kpi_id),
                supervisor_id=manager_id,
            )
    except ImportError as e:
        logger.warning(f"Failed to import task or service: {e}")


@receiver(post_save, sender=ActualAdjustment)
def actual_adjustment_post_save_handler(sender, instance, created, **kwargs):
    try:
        from .tasks import send_adjustment_notification_task, calculate_kpi_score_task
        
        if created:
            logger.info(f"Adjustment requested for actual {instance.original_actual_id} by {instance.requested_by.email}")
            send_adjustment_notification_task.delay(
                adjustment_id=str(instance.id),
                notification_type='requested'
            )
        elif instance.status == 'APPROVED':
            logger.info(f"Adjustment approved for actual {instance.original_actual_id}")
            actual = instance.original_actual
            calculate_kpi_score_task.delay(
                user_id=str(actual.user_id),
                year=actual.year,
                month=actual.month,
                force=True
            )
    except ImportError:
        pass


# Validation Signals
@receiver(post_save, sender=ValidationRecord)
def validation_record_post_save_handler(sender, instance, created, **kwargs):
    if created:
        logger.info(f"Validation {instance.status} for actual {instance.actual_id} by {instance.validated_by.email}")
        try:
            from .tasks import send_validation_notification_task, refresh_materialized_views_task
            send_validation_notification_task.delay(
                validation_id=str(instance.id),
                notification_type=instance.status.lower()
            )
            transaction.on_commit(lambda: refresh_materialized_views_task.delay(
                tenant_id=str(instance.tenant_id)
            ))
        except ImportError:
            pass


@receiver(post_save, sender=Escalation)
def escalation_post_save_handler(sender, instance, created, **kwargs):
    try:
        from .tasks import send_escalation_notification_task
        
        if created:
            logger.info(f"Escalation created for actual {instance.actual_id} to {instance.escalated_to.email}")
            send_escalation_notification_task.delay(
                escalation_id=str(instance.id),
                notification_type='created'
            )
        elif instance.status == 'RESOLVED':
            logger.info(f"Escalation resolved for actual {instance.actual_id}")
            send_escalation_notification_task.delay(
                escalation_id=str(instance.id),
                notification_type='resolved'
            )
    except ImportError:
        pass


# Score Signals
@receiver(post_save, sender=Score)
def score_post_save_handler(sender, instance, created, **kwargs):
    if created:
        logger.info(f"Score calculated for {instance.kpi.code} - {instance.user.email}: {instance.score}%")
        try:
            from .tasks import update_traffic_light_task, update_aggregated_scores_task
            from .services.realtime import KPIEventBroadcaster
            
            update_traffic_light_task.delay(score_id=str(instance.id))
            transaction.on_commit(lambda: update_aggregated_scores_task.delay(
                tenant_id=str(instance.tenant_id),
                year=instance.year,
                month=instance.month
            ))
            KPIEventBroadcaster.score_updated(
                user_id=str(instance.user_id),
                kpi_id=str(instance.kpi_id),
                score=float(instance.score),
                period=f'{instance.year}-{instance.month:02d}',
                manager_id=_manager_user_id_for_employee(instance.user_id),
            )
        except ImportError:
            pass


@receiver(post_save, sender=Score)
def score_post_save_trend_handler(sender, instance, **kwargs):
    try:
        previous_scores = Score.objects.filter(
            kpi=instance.kpi,
            user=instance.user,
            year__lte=instance.year,
            month__lt=instance.month
        ).order_by('-year', '-month')[:6]
        
        if previous_scores.exists():
            from .engine.traffic_light import TrendAnalyzer
            analyzer = TrendAnalyzer()
            scores_list = [s.score for s in reversed(list(previous_scores))] + [instance.score]
            trend = analyzer.analyze(scores_list)
            cache_key = f"kpi:trend:{instance.kpi_id}:{instance.user_id}"
            cache.set(cache_key, trend, 86400)
    except Exception as e:
        logger.warning(f"Failed to calculate trend: {e}")


# Cleanup Signals
@receiver(post_delete, sender=KPI)
def kpi_post_delete_handler(sender, instance, **kwargs):
    logger.info(f"KPI {instance.code} deleted")
    invalidate_kpi_cache(str(instance.id))
    cache.delete_pattern(f"kpi:score:{instance.id}:*")
    cache.delete_pattern(f"kpi:target:{instance.id}:*")


@receiver(post_delete, sender=MonthlyActual)
def monthly_actual_post_delete_handler(sender, instance, **kwargs):
    logger.info(f"Monthly actual deleted for {instance.kpi.code} - period {instance.year}-{instance.month:02d}")
    try:
        from .tasks import calculate_kpi_score_task
        calculate_kpi_score_task.delay(
            user_id=str(instance.user_id),
            year=instance.year,
            month=instance.month,
            force=True
        )
    except ImportError:
        pass
