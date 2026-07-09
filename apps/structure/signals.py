from django.db.models.signals import pre_save, post_save, pre_delete, post_delete
from django.dispatch import receiver
from django.core.cache import cache
from django.db import models
import logging
from .models.organizational_unit import OrganizationalUnit
from .models.division import Division
from .models.department import Department
from .models.section import Section
from .models.unit import Unit
from .models.employment import Employment
from .models.position import Position
from .models.interim_assignment import InterimAssignment
from .constants import CACHE_KEY_REPORTING_CHAIN_UP, CACHE_KEY_REPORTING_CHAIN_DOWN, CACHE_KEY_EMPLOYMENT_CURRENT
from .services.sync.event_publisher import EventPublisherService
from .services.sync.cache_warmer import CacheWarmerService

logger = logging.getLogger(__name__)
event_publisher = EventPublisherService()
cache_warmer = CacheWarmerService()


@receiver(pre_save, sender=OrganizationalUnit)
def org_unit_pre_save(sender, instance, **kwargs):
    from .services.hierarchy.cycle_detector import CycleDetector
    if instance.pk:
        old_instance = OrganizationalUnit.objects.filter(pk=instance.pk).first()
        if old_instance and old_instance.parent_id != instance.parent_id:
            CycleDetector.validate_assignment(instance.parent_id, instance.pk, instance.tenant_id)


@receiver(post_save, sender=OrganizationalUnit)
def org_unit_post_save(sender, instance, created, **kwargs):
    if created:
        logger.info(f"Organizational Unit created: {instance.code} - {instance.name} ({instance.level}) (Tenant: {instance.tenant_id})")
        event_publisher.publish_org_unit_change(
            instance.tenant_id, instance.id, 'created',
            new_data={'code': instance.code, 'name': instance.name, 'level': instance.level}
        )
    else:
        logger.info(f"Organizational Unit updated: {instance.code} - {instance.name} ({instance.level}) (Tenant: {instance.tenant_id})")
        event_publisher.publish_org_unit_change(
            instance.tenant_id, instance.id, 'updated',
            new_data={'code': instance.code, 'name': instance.name}
        )
    cache_warmer.invalidate_tenant_cache(instance.tenant_id)
    try:
        from apps.tenant.services.monitoring.resource_sync import ResourceSyncService
        ResourceSyncService.sync_tenant(instance.tenant_id, broadcast=True)
    except Exception:
        pass


@receiver(pre_delete, sender=OrganizationalUnit)
def org_unit_pre_delete(sender, instance, **kwargs):
    if instance.children.filter(is_deleted=False).exists():
        from .exceptions import DeleteWithChildrenError
        raise DeleteWithChildrenError('OrganizationalUnit', instance.id, instance.children.count())


@receiver(post_delete, sender=OrganizationalUnit)
def org_unit_post_delete(sender, instance, **kwargs):
    logger.info(f"Organizational Unit deleted: {instance.code} - {instance.name} (Tenant: {instance.tenant_id})")
    event_publisher.publish_org_unit_change(
        instance.tenant_id, instance.id, 'deleted',
        old_data={'code': instance.code, 'name': instance.name}
    )
    cache_warmer.invalidate_tenant_cache(instance.tenant_id)
    try:
        from apps.tenant.services.monitoring.resource_sync import ResourceSyncService
        ResourceSyncService.sync_tenant(instance.tenant_id, broadcast=True)
    except Exception:
        pass


@receiver(pre_save, sender=Division)
def division_pre_save(sender, instance, **kwargs):
    from .services.hierarchy.cycle_detector import CycleDetector
    if instance.pk:
        old_instance = Division.objects.filter(pk=instance.pk).first()
        if old_instance and old_instance.parent_id != instance.parent_id:
            CycleDetector.validate_assignment(instance.parent_id, instance.pk, instance.tenant_id)


@receiver(post_save, sender=Division)
def division_post_save(sender, instance, created, **kwargs):
    if created:
        logger.info(f"Division created: {instance.code} - {instance.name} (Tenant: {instance.tenant_id})")
        event_publisher.publish_division_change(
            instance.tenant_id, instance.id, 'created',
            new_data={'code': instance.code, 'name': instance.name}
        )
    else:
        logger.info(f"Division updated: {instance.code} - {instance.name} (Tenant: {instance.tenant_id})")
        event_publisher.publish_division_change(
            instance.tenant_id, instance.id, 'updated',
            new_data={'code': instance.code, 'name': instance.name}
        )
    cache_warmer.invalidate_tenant_cache(instance.tenant_id)


@receiver(pre_save, sender=Department)
def department_pre_save(sender, instance, **kwargs):
    from .services.hierarchy.cycle_detector import CycleDetector
    if instance.pk:
        old_instance = Department.objects.filter(pk=instance.pk).first()
        if old_instance and old_instance.parent_id != instance.parent_id:
            CycleDetector.validate_assignment(instance.parent_id, instance.pk, instance.tenant_id)


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
    try:
        from apps.tenant.services.monitoring.resource_sync import ResourceSyncService
        ResourceSyncService.sync_tenant(instance.tenant_id, broadcast=True)
    except Exception:
        pass


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


@receiver(pre_save, sender=Section)
def section_pre_save(sender, instance, **kwargs):
    from .services.hierarchy.cycle_detector import CycleDetector
    if instance.pk:
        old_instance = Section.objects.filter(pk=instance.pk).first()
        if old_instance and old_instance.parent_id != instance.parent_id:
            CycleDetector.validate_assignment(instance.parent_id, instance.pk, instance.tenant_id)


@receiver(post_save, sender=Section)
def section_post_save(sender, instance, created, **kwargs):
    if created:
        logger.info(f"Section created: {instance.code} - {instance.name} (Tenant: {instance.tenant_id})")
        event_publisher.publish_section_change(
            instance.tenant_id, instance.id, 'created',
            new_data={'code': instance.code, 'name': instance.name}
        )
    else:
        logger.info(f"Section updated: {instance.code} - {instance.name} (Tenant: {instance.tenant_id})")
        event_publisher.publish_section_change(
            instance.tenant_id, instance.id, 'updated',
            new_data={'code': instance.code, 'name': instance.name}
        )
    cache_warmer.invalidate_tenant_cache(instance.tenant_id)


@receiver(pre_save, sender=Unit)
def unit_pre_save(sender, instance, **kwargs):
    from .services.hierarchy.cycle_detector import CycleDetector
    if instance.pk:
        old_instance = Unit.objects.filter(pk=instance.pk).first()
        if old_instance and old_instance.parent_id != instance.parent_id:
            CycleDetector.validate_assignment(instance.parent_id, instance.pk, instance.tenant_id)


@receiver(post_save, sender=Unit)
def unit_post_save(sender, instance, created, **kwargs):
    if created:
        logger.info(f"Unit created: {instance.code} - {instance.name} (Tenant: {instance.tenant_id})")
        event_publisher.publish_unit_change(
            instance.tenant_id, instance.id, 'created',
            new_data={'code': instance.code, 'name': instance.name}
        )
    else:
        logger.info(f"Unit updated: {instance.code} - {instance.name} (Tenant: {instance.tenant_id})")
        event_publisher.publish_unit_change(
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
            new_data={'position_id': str(instance.position_id), 'unit_id': str(instance.unit_id) if instance.unit_id else None}
        )
    else:
        logger.info(f"Employment updated: User {instance.user_id} (Tenant: {instance.tenant_id})")
        event_publisher.publish_employment_change(
            instance.tenant_id, instance.user_id, 'updated',
            new_data={'is_current': instance.is_current, 'is_active': instance.is_active}
        )
    cache_warmer.invalidate_tenant_cache(instance.tenant_id)



@receiver(post_save, sender=InterimAssignment)
def interim_assignment_post_save(sender, instance, created, **kwargs):
    if created:
        logger.info(f"Interim assignment created: {instance.employee.user_id} → {instance.interim_manager.user_id}")
        event_publisher.publish_interim_change(
            instance.tenant_id, instance.employee.user_id, instance.interim_manager.user_id,
            'created', new_data={'effective_from': str(instance.effective_from), 'effective_to': str(instance.effective_to)}
        )
    else:
        logger.info(f"Interim assignment updated: {instance.id} (Tenant: {instance.tenant_id})")
        event_publisher.publish_interim_change(
            instance.tenant_id, instance.employee.user_id, instance.interim_manager.user_id,
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
