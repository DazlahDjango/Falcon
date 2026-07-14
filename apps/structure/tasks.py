from celery import shared_task
from django.core.cache import cache
from django.utils import timezone
from uuid import UUID
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)


@shared_task(name='structure.tasks.warm_structure_cache')
def warm_structure_cache(tenant_id_str: str) -> dict:
    from .services.sync.cache_warmer import CacheWarmerService
    tenant_id = UUID(tenant_id_str)
    warmer = CacheWarmerService()
    results = warmer.warm_all(tenant_id)
    logger.info(f"Cache warming completed for tenant {tenant_id}: {results}")
    return results


@shared_task(name='structure.tasks.rebuild_hierarchy_indexes')
def rebuild_hierarchy_indexes(tenant_id_str: str) -> dict:
    from .services.sync.index_rebuilder import IndexRebuilder
    tenant_id = UUID(tenant_id_str)
    rebuilder = IndexRebuilder()
    results = rebuilder.rebuild_all_indices()
    logger.info(f"Index rebuild completed for tenant {tenant_id}")
    return results


@shared_task(name='structure.tasks.refresh_materialized_views')
def refresh_materialized_views(tenant_id_str: Optional[str] = None) -> dict:
    from .services.sync.view_refresher import ViewRefresherService
    refresher = ViewRefresherService()
    if tenant_id_str:
        tenant_id = UUID(tenant_id_str)
        results = refresher.refresh_for_tenant(tenant_id)
    else:
        results = refresher.refresh_all()
    logger.info(f"Materialized views refreshed: {results}")
    return results


@shared_task(name='structure.tasks.detect_orphaned_nodes')
def detect_orphaned_nodes(tenant_id_str: str) -> dict:
    from .models.organizational_unit import OrganizationalUnit
    from .models.employment import Employment
    from .models.employment import Employment
    tenant_id = UUID(tenant_id_str)
    
    orphaned_units = OrganizationalUnit.objects.filter(
        tenant_id=tenant_id,
        is_deleted=False,
        parent__is_deleted=True
    ).values_list('code', flat=True)
    
    employments_without_user = Employment.objects.filter(
        tenant_id=tenant_id,
        is_deleted=False,
        user_id__isnull=True
    ).count()
    
    employments_without_employee = Employment.objects.filter(
        tenant_id=tenant_id,
        is_deleted=False,
        employee__isnull=True
    ).count()
    
    results = {
        'tenant_id': tenant_id_str,
        'orphaned_organizational_units': list(orphaned_units),
        'employments_without_user': employments_without_user,
        'employments_without_employee': employments_without_employee,
        'has_orphans': any([
            orphaned_units.exists(),
            employments_without_user > 0,
            employments_without_employee > 0
        ])
    }
    logger.warning(f"Orphan detection for tenant {tenant_id}: {results}")
    return results


@shared_task(name='structure.tasks.repair_orphaned_nodes')
def repair_orphaned_nodes(tenant_id_str: str, dry_run: bool = True) -> dict:
    from .models.organizational_unit import OrganizationalUnit
    tenant_id = UUID(tenant_id_str)
    
    repairs = {
        'units_unlinked': [],
        'dry_run': dry_run
    }
    
    orphaned_units = OrganizationalUnit.objects.filter(
        tenant_id=tenant_id,
        is_deleted=False,
        parent__is_deleted=True
    )
    
    for unit in orphaned_units:
        repairs['units_unlinked'].append(unit.code)
        if not dry_run:
            unit.parent = None
            unit.save(update_fields=['parent', 'path', 'depth', 'updated_at'])
    
    logger.info(f"Orphan repair for tenant {tenant_id} (dry_run={dry_run}): {repairs}")
    return repairs


@shared_task(name='structure.tasks.validate_org_integrity')
def validate_org_integrity(tenant_id_str: str) -> dict:
    from .services.validation.org_validator import OrgValidatorService
    tenant_id = UUID(tenant_id_str)
    validator = OrgValidatorService()
    result = validator.validate_org_integrity(tenant_id)
    logger.info(f"Integrity validation for tenant {tenant_id}: {'valid' if result['is_valid'] else 'invalid'} ({result['issue_count']} issues)")
    return result


@shared_task(name='structure.tasks.export_org_chart_async')
def export_org_chart_async(tenant_id_str: str, format_type: str = 'json', root_unit_id: Optional[str] = None) -> dict:
    from .services.export.org_chart_generator import OrgChartGeneratorService
    from .services.export.json_exporter import JSONExporterService
    from .services.export.csv_exporter import CSVExporterService
    tenant_id = UUID(tenant_id_str)
    root_id = UUID(root_unit_id) if root_unit_id else None
    
    result = {
        'tenant_id': tenant_id_str,
        'format': format_type,
        'exported_at': timezone.now().isoformat(),
        'data': None
    }
    
    if format_type == 'json':
        if root_id:
            data = OrgChartGeneratorService().generate_json_org_chart(tenant_id, root_id)
        else:
            data = JSONExporterService().export_full_org(tenant_id)
        result['data'] = data
    elif format_type == 'csv':
        data = CSVExporterService.export_org_units(tenant_id)
        result['data'] = data
    elif format_type == 'flat_json':
        data = OrgChartGeneratorService().generate_flat_org_chart(tenant_id)
        result['data'] = data
    
    logger.info(f"Org chart export for tenant {tenant_id} as {format_type}")
    return result


@shared_task(name='structure.tasks.process_bulk_employment_update')
def process_bulk_employment_update(tenant_id_str: str, updates: List[dict], user_id_str: Optional[str] = None) -> dict:
    from .models.employment import Employment
    from .services.audit.change_logger import ChangeLoggerService
    tenant_id = UUID(tenant_id_str)
    user_id = UUID(user_id_str) if user_id_str else None
    
    results = {
        'total': len(updates),
        'successful': 0,
        'failed': 0,
        'errors': []
    }
    
    logger_service = ChangeLoggerService()
    
    for idx, update in enumerate(updates):
        try:
            employment_id = update.get('id')
            if employment_id:
                employment = Employment.objects.filter(
                    id=employment_id,
                    tenant_id=tenant_id,
                    is_deleted=False
                ).first()
                if employment:
                    for key, value in update.items():
                        if key != 'id' and hasattr(employment, key):
                            setattr(employment, key, value)
                    employment.save()
                    if user_id:
                        logger_service.log_employment_change(
                            tenant_id, user_id, employment.user_id,
                            'bulk_update', update
                        )
                    results['successful'] += 1
            else:
                results['failed'] += 1
                results['errors'].append(f"Row {idx}: Missing ID")
        except Exception as e:
            results['failed'] += 1
            results['errors'].append(f"Row {idx}: {str(e)}")
    
    logger.info(f"Bulk employment update for tenant {tenant_id}: {results['successful']}/{results['total']} successful")
    return results


@shared_task(name='structure.tasks.cleanup_orphaned_versions')
def cleanup_orphaned_versions(tenant_id_str: str, keep_count: int = 10) -> dict:
    from .models.hierarchy_version import HierarchyVersion
    from .services.sync.cache_warmer import CacheWarmerService
    tenant_id = UUID(tenant_id_str)
    
    versions = HierarchyVersion.objects.filter(
        tenant_id=tenant_id,
        is_deleted=False,
        is_current=False
    ).order_by('-version_number')
    
    to_delete = versions[keep_count:]
    deleted_count = to_delete.count()
    
    for version in to_delete:
        version.is_deleted = True
        version.deleted_at = timezone.now()
        version.save(update_fields=['is_deleted', 'deleted_at'])
    
    warmer = CacheWarmerService()
    warmer.invalidate_tenant_cache(tenant_id)
    
    logger.info(f"Cleaned up {deleted_count} old versions for tenant {tenant_id}")
    return {
        'tenant_id': tenant_id_str,
        'versions_deleted': deleted_count,
        'versions_kept': versions.count() - deleted_count
    }


@shared_task(name='structure.tasks.detect_circular_references')
def detect_circular_references(tenant_id_str: str) -> dict:
    from .services.hierarchy.cycle_detector import CycleDetector
    tenant_id = UUID(tenant_id_str)
    
    cycles = CycleDetector().find_all_cycles(tenant_id)
    
    result = {
        'tenant_id': tenant_id_str,
        'cycles': len(cycles),
        'cycle_details': [
            {'node_id': str(cycle['node_id']), 'code': cycle.get('code', '')}
            for cycle in cycles
        ]
    }
    
    if cycles:
        logger.warning(f"Circular references detected for tenant {tenant_id}: {len(cycles)} cycles")
    
    return result


@shared_task(name='structure.tasks.sync_tenant_structure')
def sync_tenant_structure(source_tenant_id_str: str, target_tenant_id_str: str, sync_org_units: bool = True, sync_positions: bool = True) -> dict:
    from .models.organizational_unit import OrganizationalUnit
    from .models.position import Position
    source_tenant_id = UUID(source_tenant_id_str)
    target_tenant_id = UUID(target_tenant_id_str)
    
    results = {
        'org_units_created': 0,
        'positions_created': 0,
        'errors': []
    }
    
    if sync_org_units:
        source_units = OrganizationalUnit.objects.filter(
            tenant_id=source_tenant_id,
            is_deleted=False
        )
        for unit in source_units:
            try:
                OrganizationalUnit.objects.create(
                    tenant_id=target_tenant_id,
                    code=unit.code,
                    name=unit.name,
                    description=unit.description,
                    level=unit.level,
                    is_active=unit.is_active
                )
                results['org_units_created'] += 1
            except Exception as e:
                results['errors'].append(f"Organizational Unit {unit.code}: {str(e)}")
    
    if sync_positions:
        source_positions = Position.objects.filter(
            tenant_id=source_tenant_id,
            is_deleted=False
        )
        for pos in source_positions:
            try:
                Position.objects.create(
                    tenant_id=target_tenant_id,
                    job_code=pos.job_code,
                    title=pos.title,
                    grade=pos.grade,
                    level=pos.level,
                    is_single_incumbent=pos.is_single_incumbent,
                    max_incumbents=pos.max_incumbents
                )
                results['positions_created'] += 1
            except Exception as e:
                results['errors'].append(f"Position {pos.job_code}: {str(e)}")
    
    logger.info(f"Structure sync from {source_tenant_id} to {target_tenant_id}: {results}")
    return results
