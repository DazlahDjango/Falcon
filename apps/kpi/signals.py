from django.db.models.signals import post_save, pre_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
from django.utils import timezone
from django.db import transaction
from django.db.models import Q
import logging
from apps.structure.models import Department, Hierarchy
from .models import (
    KPI, KPIWeight, AnnualTarget, MonthlyActual, ValidationRecord,
    Score, MonthlyPhasing, Escalation, ActualAdjustment, CascadeMap
)
from .utils.cache_keys import invalidate_kpi_cache, invalidate_user_dashboards
from .tasks import (
    calculate_kpi_score_task, update_aggregated_scores_task,
    send_validation_notification_task, send_red_alert_check_task, send_escalation_notification_task,
    update_traffic_light_task, refresh_materialized_views_task, create_in_app_notification_task
)
from .services import ScoreCalculator, KPIValidator, TargetCascader, RealtimeDashboard
logger = logging.getLogger(__name__)

# KPI Signals
# =============


@receiver(post_save, sender=KPI)
def kpi_post_save_handler(sender, instance, created, **kwargs):
    logger.info(f"KPI {instance.code} {'created' if created else 'updated'}")
    invalidate_kpi_cache(str(instance.id))
    if not created and not instance.is_active:
        calculator = ScoreCalculator()
        affected_users = KPIWeight.objects.filter(
            kpi=instance).values_list('user_id', flat=True)
        for user_id in affected_users:
            now = timezone.now()
            calculator.calculate_user_period(
                str(user_id), now.year, now.month, force=True)


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
# ====================


@receiver([post_save, post_delete], sender=KPIWeight)
def kpi_weight_changed_handler(sender, instance, **kwargs):
    logger.info(
        f"KPI weight changed for {instance.kpi.code} - user {instance.user.email}")
    invalidate_user_dashboards(str(instance.user_id))
    from django.utils import timezone
    now = timezone.now()
    calculate_kpi_score_task.delay(
        user_id=str(instance.user_id),
        year=now.year,
        month=now.month,
        force=True
    )
    validator = KPIValidator()
    is_valid, message = validator.validate_weight_sum(
        str(instance.kpi_id), str(instance.user_id))
    if not is_valid:
        logger.warning(
            f"Weight validation failed for user {instance.user.email}: {message}")
        create_in_app_notification_task.delay(
            user_id=str(instance.user_id),
            title="KPI Weight Error",
            message=f"Your KPI weights for {instance.kpi.name} sum to an invalid total. Please review.",
            data={'kpi_id': str(instance.kpi_id), 'error': message}
        )

# Target Signals
# ================


@receiver(post_save, sender=AnnualTarget)
def annual_target_post_save_handler(sender, instance, created, **kwargs):
    logger.info(
        f"Annual target {'created' if created else 'updated'} for {instance.kpi.code} - {instance.year}")
    cache_key = f"kpi:target:{instance.kpi_id}:{instance.user_id}:{instance.year}"
    cache.delete(cache_key)
    if instance.approved_by and not created:
        cascader = TargetCascader()
        if not Department.objects.filter(manager=instance.user).exists():
            transaction.on_commit(lambda: update_aggregated_scores_task.delay(
                tenant_id=str(instance.tenant_id),
                year=instance.year,
                month=1
            ))


@receiver(post_save, sender=MonthlyPhasing)
def monthly_phasing_post_save_handler(sender, instance, created, **kwargs):
    if created or instance.is_locked:
        logger.info(
            f"Monthly phasing {'locked' if instance.is_locked else 'updated'} for period {instance.month}")
        cache.delete(f"kpi:phasing:{instance.annual_target_id}")
        calculate_kpi_score_task.delay(
            user_id=str(instance.annual_target.user_id),
            year=instance.annual_target.year,
            month=instance.month,
            force=True
        )

# Actual Data Signals
# =====================


@receiver(post_save, sender=MonthlyActual)
def monthly_actual_post_save_handler(sender, instance, created, **kwargs):
    """Handle actual data changes - trigger calculation and validation workflow"""
    logger.info(f"Monthly actual {'created' if created else 'updated'} for {instance.kpi.code} - "
                f"period {instance.year}-{instance.month:02d}, status: {instance.status}")
    invalidate_user_dashboards(str(instance.user_id))
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
    dashboard = RealtimeDashboard()
    manager = Hierarchy.objects.filter(employee_id=instance.user_id).first()
    if manager:
        import asyncio
        try:
            asyncio.create_task(
                dashboard.push_team_update(
                    str(manager.manager_id),
                    {'user_id': str(instance.user_id),
                     'status': instance.status}
                )
            )
        except RuntimeError:
            pass


@receiver(post_save, sender=ActualAdjustment)
def actual_adjustment_post_save_handler(sender, instance, created, **kwargs):
    if created:
        logger.info(
            f"Adjustment requested for actual {instance.original_actual_id} by {instance.requested_by.email}")
        from .tasks import send_adjustment_notification_task
        send_adjustment_notification_task.delay(
            adjustment_id=str(instance.id),
            notification_type='requested'
        )
    elif instance.status == 'APPROVED':
        logger.info(
            f"Adjustment approved for actual {instance.original_actual_id}")
        actual = instance.original_actual
        calculate_kpi_score_task.delay(
            user_id=str(actual.user_id),
            year=actual.year,
            month=actual.month,
            force=True
        )

# Validation Signals
# ===================


@receiver(post_save, sender=ValidationRecord)
def validation_record_post_save_handler(sender, instance, created, **kwargs):
    if created:
        logger.info(
            f"Validation {instance.status} for actual {instance.actual_id} by {instance.validated_by.email}")
        from .tasks import send_validation_notification_task
        send_validation_notification_task.delay(
            validation_id=str(instance.id),
            notification_type=instance.status.lower()
        )
        transaction.on_commit(lambda: refresh_materialized_views_task.delay(
            tenant_id=str(instance.tenant_id)
        ))


@receiver(post_save, sender=Escalation)
def escalation_post_save_handler(sender, instance, created, **kwargs):
    if created:
        logger.info(
            f"Escalation created for actual {instance.actual_id} to {instance.escalated_to.email}")
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

# Score Signals
# ================


@receiver(post_save, sender=Score)
def score_post_save_handler(sender, instance, created, **kwargs):
    if created:
        logger.info(
            f"Score calculated for {instance.kpi.code} - {instance.user.email}: {instance.score}%")
        update_traffic_light_task.delay(
            score_id=str(instance.id)
        )
        transaction.on_commit(lambda: update_aggregated_scores_task.delay(
            tenant_id=str(instance.tenant_id),
            year=instance.year,
            month=instance.month
        ))
        dashboard = RealtimeDashboard()
        try:
            import asyncio
            asyncio.create_task(
                dashboard.push_score_update(
                    str(instance.user_id),
                    {
                        'kpi_id': str(instance.kpi_id),
                        'score': float(instance.score),
                        'period': f"{instance.year}-{instance.month:02d}"
                    }
                )
            )
        except RuntimeError:
            pass


@receiver(post_save, sender=Score)
def score_post_save_trend_handler(sender, instance, **kwargs):
    previous_scores = Score.objects.filter(
        kpi=instance.kpi,
        user=instance.user,
        year__lte=instance.year,
        month__lt=instance.month
    ).order_by('-year', '-month')[:6]
    if previous_scores.exists():
        from .engine.traffic_light import TrendAnalyzer
        analyzer = TrendAnalyzer()
        scores_list = [s.score for s in reversed(
            previous_scores)] + [instance.score]
        trend = analyzer.analyze(scores_list)
        cache_key = f"kpi:trend:{instance.kpi_id}:{instance.user_id}"
        cache.set(cache_key, trend, 86400)  # 24 hours

# Cascade Signals
# =================


@receiver(post_save, sender=AnnualTarget)
def target_cascade_check(sender, instance, **kwargs):
    is_cascaded = CascadeMap.objects.filter(
        Q(organization_target=instance) |
        Q(department_target=instance) |
        Q(individual_target=instance)
    ).exists()

    if not is_cascaded and instance.kpi.strategic_objective:
        cascader = TargetCascader()
        from .models import CascadeRule
        default_rule = CascadeRule.objects.filter(
            is_default=True, is_active=True).first()
        if default_rule:
            departments = Department.objects.filter(
                tenant_id=instance.tenant_id, is_active=True)
            if departments.exists():
                targets = [
                    {
                        'entity_type': 'DEPARTMENT',
                        'entity_id': str(dept.id),
                        'contribution_percentage': 100 / departments.count()
                    }
                    for dept in departments
                ]
                transaction.on_commit(lambda: cascader.cascade_from_organization(
                    org_target_id=str(instance.id),
                    rule_id=str(default_rule.id),
                    targets=targets,
                    user=instance.created_by
                ))

# Cleanup Signals
# ==================


@receiver(post_delete, sender=KPI)
def kpi_post_delete_handler(sender, instance, **kwargs):
    logger.info(f"KPI {instance.code} deleted")
    invalidate_kpi_cache(str(instance.id))
    cache.delete_pattern(f"kpi:score:{instance.id}:*")
    cache.delete_pattern(f"kpi:target:{instance.id}:*")


@receiver(post_delete, sender=MonthlyActual)
def monthly_actual_post_delete_handler(sender, instance, **kwargs):
    logger.info(
        f"Monthly actual deleted for {instance.kpi.code} - period {instance.year}-{instance.month:02d}")
    calculate_kpi_score_task.delay(
        user_id=str(instance.user_id),
        year=instance.year,
        month=instance.month,
        force=True
    )
