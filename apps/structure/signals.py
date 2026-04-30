from django.db.models.signals import pre_save, post_save, pre_delete, post_delete, m2m_changed
from django.dispatch import receiver
from django.core.cache import cache
from django.db import models
import logging
from .models.department import Department
from .models.team import Team
from .models.employment import Employment
from .models.reporting_line import ReportingLine
from .models.position import Position
from .constants import CACHE_KEY_REPORTING_CHAIN_UP, CACHE_KEY_REPORTING_CHAIN_DOWN, CACHE_KEY_EMPLOYMENT_CURRENT
from .services.sync.event_publisher import EventPublisherService
from .services.sync.cache_warmer import CacheWarmerService

logger = logging.getLogger(__name__)
event_publisher = EventPublisherService()
cache_warmer = CacheWarmerService()

@receiver(pre_save, sender=Department)
def department_pre_save(sender, instance, **kwargs):
    from .services.hierarchy.cycle_detector import CycleDetector
    if instance.pk:
        old_instance = Department.objects.filter(pk=instance.pk).first()
        if old_instance and old_instance.parent_id != instance.parent_id:
            CycleDetector.validate_assignment(instance.parent_id, instance.pk, instance.tenant_id, 'department')

@receiver(post_save, sender=Department)
def department_post_save(sender, instance, created, **kwargs):
    if created:
        logger.info(f"Department created: {instance.code} - {instance.name} (Tenant: {instance.tenant_id})")
        event_publisher.publish_department_change(
            instance.tenant_id, instance.id, 'created',
            new_data={'code': instance.code, 'name': instance.name}
        )
    else:
        logger.info(f"Department updated: {instance.code} - {instance.name} (Tenant: {instance.tenant_id})")
        event_publisher.publish_department_change(
            instance.tenant_id, instance.id, 'updated',
            new_data={'code': instance.code, 'name': instance.name}
        )
    cache_warmer.invalidate_tenant_cache(instance.tenant_id)

@receiver(pre_delete, sender=Department)
def department_pre_delete(sender, instance, **kwargs):
    if instance.children.filter(is_deleted=False).exists():
        from .exceptions import DeleteWithChildrenError
        raise DeleteWithChildrenError('Department', instance.id, instance.children.count())

@receiver(post_delete, sender=Department)
def department_post_delete(sender, instance, **kwargs):
    logger.info(f"Department deleted: {instance.code} - {instance.name} (Tenant: {instance.tenant_id})")
    event_publisher.publish_department_change(
        instance.tenant_id, instance.id, 'deleted',
        old_data={'code': instance.code, 'name': instance.name}
    )
    cache_warmer.invalidate_tenant_cache(instance.tenant_id)


@receiver(pre_save, sender=Team)
def team_pre_save(sender, instance, **kwargs):
    from .services.hierarchy.cycle_detector import CycleDetector
    if instance.pk:
        old_instance = Team.objects.filter(pk=instance.pk).first()
        if old_instance and old_instance.parent_team_id != instance.parent_team_id:
            CycleDetector.validate_assignment(instance.parent_team_id, instance.pk, instance.tenant_id, 'team')

@receiver(post_save, sender=Team)
def team_post_save(sender, instance, created, **kwargs):
    if created:
        logger.info(f"Team created: {instance.code} - {instance.name} (Tenant: {instance.tenant_id})")
        event_publisher.publish_team_change(
            instance.tenant_id, instance.id, 'created',
            new_data={'code': instance.code, 'name': instance.name, 'department_id': str(instance.department_id)}
        )
    else:
        logger.info(f"Team updated: {instance.code} - {instance.name} (Tenant: {instance.tenant_id})")
        event_publisher.publish_team_change(
            instance.tenant_id, instance.id, 'updated',
            new_data={'code': instance.code, 'name': instance.name}
        )
    cache_warmer.invalidate_tenant_cache(instance.tenant_id)

@receiver(post_save, sender=Employment)
def employment_post_save(sender, instance, created, **kwargs):
    cache_key = CACHE_KEY_EMPLOYMENT_CURRENT.format(
        tenant_id=instance.tenant_id,
        user_id=instance.user_id
    )
    cache.delete(cache_key)
    if instance.is_current:
        cache_keys = [
            CACHE_KEY_REPORTING_CHAIN_UP.format(tenant_id=instance.tenant_id, user_id=instance.user_id),
            CACHE_KEY_REPORTING_CHAIN_DOWN.format(tenant_id=instance.tenant_id, user_id=instance.user_id)
        ]
        for key in cache_keys:
            cache.delete(key)
    if created:
        logger.info(f"Employment created: User {instance.user_id} → Position {instance.position_id} (Tenant: {instance.tenant_id})")
        if instance.position and instance.position.is_single_incumbent:
            Position.objects.filter(id=instance.position_id).update(
                current_incumbents_count=models.F('current_incumbents_count') + 1
            )
        event_publisher.publish_employment_change(
            instance.tenant_id, instance.user_id, 'created',
            new_data={'position_id': str(instance.position_id), 'department_id': str(instance.department_id)}
        )
    else:
        logger.info(f"Employment updated: User {instance.user_id} (Tenant: {instance.tenant_id})")
        event_publisher.publish_employment_change(
            instance.tenant_id, instance.user_id, 'updated',
            new_data={'is_current': instance.is_current, 'is_active': instance.is_active}
        )
    cache_warmer.invalidate_tenant_cache(instance.tenant_id)


@receiver(post_save, sender=ReportingLine)
def reporting_line_post_save(sender, instance, created, **kwargs):
    if instance.employee and instance.manager:
        cache_keys = [
            CACHE_KEY_REPORTING_CHAIN_UP.format(tenant_id=instance.tenant_id, user_id=instance.employee.user_id),
            CACHE_KEY_REPORTING_CHAIN_DOWN.format(tenant_id=instance.tenant_id, user_id=instance.manager.user_id)
        ]
        for key in cache_keys:
            cache.delete(key)
    if created:
        logger.info(f"Reporting line created: {instance.employee.user_id} → {instance.manager.user_id} ({instance.relation_type})")
        event_publisher.publish_reporting_change(
            instance.tenant_id, instance.employee.user_id, instance.manager.user_id,
            'created', new_data={'relation_type': instance.relation_type, 'weight': float(instance.reporting_weight)}
        )
    else:
        logger.info(f"Reporting line updated: {instance.id} (Tenant: {instance.tenant_id})")
        event_publisher.publish_reporting_change(
            instance.tenant_id, instance.employee.user_id, instance.manager.user_id,
            'updated', new_data={'is_active': instance.is_active}
        )    
    cache_warmer.invalidate_tenant_cache(instance.tenant_id)

@receiver(post_save, sender=Position)
def position_post_save(sender, instance, created, **kwargs):
    if created:
        logger.info(f"Position created: {instance.job_code} - {instance.title} (Tenant: {instance.tenant_id})")
    else:
        logger.info(f"Position updated: {instance.job_code} - {instance.title} (Tenant: {instance.tenant_id})")
    cache_warmer.invalidate_tenant_cache(instance.tenant_id)
