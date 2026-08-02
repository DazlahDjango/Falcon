# apps/reportplt/services/extraction/production/tenant_extractor.py
import logging
from typing import Dict, Any, List, Optional
from datetime import timedelta
from django.db import models
from django.utils import timezone
from apps.tenant.models import (
    Organization, OrganizationDomain, OrganizationSchema,
    OrganizationResource, OrganizationConnection, OrganizationMigration,
    TenantBackup, Client, OrganizationSector
)
from apps.tenant.constants import OrganizationStatus, SubscriptionTier, DomainStatus, SchemaStatus, MigrationStatus

logger = logging.getLogger(__name__)

class TenantLifecycleExtractor:
    """Extracts organization onboarding lifecycles, subscription tiers, and active status metrics."""
    
    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        orgs = Organization.objects.all()
        clients = Client.objects.all()

        if self.tenant_id:
            orgs = orgs.filter(models.Q(id=self.tenant_id) | models.Q(tenant_id=self.tenant_id))

        total_orgs = orgs.count()
        active_orgs = orgs.filter(status=OrganizationStatus.ACTIVE, is_active=True).count()
        pending_orgs = orgs.filter(status=OrganizationStatus.PENDING).count()
        provisioning_orgs = orgs.filter(status=OrganizationStatus.PROVISIONING).count()
        suspended_orgs = orgs.filter(status=OrganizationStatus.SUSPENDED).count()
        archived_orgs = orgs.filter(status=OrganizationStatus.ARCHIVED).count()
        failed_orgs = orgs.filter(status=OrganizationStatus.FAILED).count()
        onboarded_orgs = orgs.filter(is_onboarded=True).count()

        tier_counts = {}
        for tier, label in SubscriptionTier.choices:
            count = orgs.filter(subscription_tier=tier).count()
            if count > 0:
                tier_counts[tier] = count

        days = int(self.filters.get('days', 30))
        cutoff = timezone.now() - timedelta(days=days)
        recent_orgs_query = orgs.filter(created_at__gte=cutoff)

        org_list = []
        for org in orgs.order_by('-created_at')[:200]:
            org_list.append({
                'id': str(org.id),
                'name': org.name,
                'slug': org.slug,
                'status': org.status,
                'subscription_tier': org.subscription_tier,
                'is_active': org.is_active,
                'is_onboarded': org.is_onboarded,
                'onboarded_at': org.onboarded_at.isoformat() if org.onboarded_at else None,
                'created_at': org.created_at.isoformat() if org.created_at else None,
                'contact_email': org.contact_email,
                'sector': org.sector.name if org.sector else 'Unassigned',
            })

        return {
            'summary': {
                'total_organizations': total_orgs,
                'active_organizations': active_orgs,
                'pending_organizations': pending_orgs,
                'provisioning_organizations': provisioning_orgs,
                'suspended_organizations': suspended_orgs,
                'archived_organizations': archived_orgs,
                'failed_organizations': failed_orgs,
                'onboarded_organizations': onboarded_orgs,
                'onboarding_rate': round((onboarded_orgs / total_orgs * 100), 2) if total_orgs > 0 else 0.0,
            },
            'tier_distribution': tier_counts,
            'organizations': org_list,
        }


class TenantQuotaExtractor:
    """Extracts organization resource allocation, current usage, and quota breach warnings."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        resources = OrganizationResource.objects.all()
        if self.tenant_id:
            resources = resources.filter(organization_id=self.tenant_id)

        total_resources = resources.count()

        exceeded_list = []
        warning_list = []
        resource_summary = {}

        for r in resources:
            pct = r.percentage_used
            res_type = r.resource_type
            if res_type not in resource_summary:
                resource_summary[res_type] = {
                    'type_display': r.get_resource_type_display(),
                    'total_limit': 0,
                    'total_current': 0,
                    'count': 0,
                }
            resource_summary[res_type]['total_limit'] += r.limit_value
            resource_summary[res_type]['total_current'] += r.current_value
            resource_summary[res_type]['count'] += 1

            if r.is_exceeded:
                exceeded_list.append({
                    'organization_id': str(r.organization_id),
                    'organization_name': r.organization.name if r.organization else 'Unknown',
                    'resource_type': r.resource_type,
                    'current_value': r.current_value,
                    'limit_value': r.limit_value,
                    'percentage': pct,
                    'burst_allowed': r.burst_allowed,
                })
            elif r.is_warning_level:
                warning_list.append({
                    'organization_id': str(r.organization_id),
                    'organization_name': r.organization.name if r.organization else 'Unknown',
                    'resource_type': r.resource_type,
                    'current_value': r.current_value,
                    'limit_value': r.limit_value,
                    'percentage': pct,
                })

        return {
            'summary': {
                'total_monitored_resources': total_resources,
                'exceeded_count': len(exceeded_list),
                'warning_count': len(warning_list),
            },
            'resource_type_aggregations': resource_summary,
            'exceeded_resources': exceeded_list,
            'warning_resources': warning_list,
        }


class TenantSchemaExtractor:
    """Extracts tenant database schema sizes, table counts, connection pool health, and migration statuses."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        schemas = OrganizationSchema.objects.all()
        connections = OrganizationConnection.objects.all()
        migrations = OrganizationMigration.objects.all()

        if self.tenant_id:
            schemas = schemas.filter(organization_id=self.tenant_id)
            connections = connections.filter(organization_id=self.tenant_id)
            migrations = migrations.filter(organization_id=self.tenant_id)

        total_schemas = schemas.count()
        active_schemas = schemas.filter(status='ACTIVE').count()
        migrating_schemas = schemas.filter(status='MIGRATING').count()
        failed_schemas = schemas.filter(status='FAILED').count()
        total_size_mb = schemas.aggregate(total=models.Sum('size_mb'))['total'] or 0.0
        total_tables = schemas.aggregate(total=models.Sum('table_count'))['total'] or 0

        active_connections = connections.filter(status='ACTIVE').count()
        idle_connections = connections.filter(status='IDLE').count()
        error_connections = connections.filter(status='ERROR').count()

        total_migrations = migrations.count()
        completed_migrations = migrations.filter(status='COMPLETED').count()
        failed_migrations = migrations.filter(status='FAILED').count()
        rolled_back_migrations = migrations.filter(status='ROLLED_BACK').count()

        schema_list = []
        for s in schemas.order_by('-created_at')[:100]:
            schema_list.append({
                'id': str(s.id),
                'organization_name': s.organization.name if s.organization else 'Unknown',
                'schema_name': s.schema_name,
                'status': s.status,
                'is_ready': s.is_ready,
                'table_count': s.table_count,
                'size_mb': s.size_mb,
                'last_migration_name': s.last_migration_name,
                'last_migration_at': s.last_migration_at.isoformat() if s.last_migration_at else None,
            })

        return {
            'summary': {
                'total_schemas': total_schemas,
                'active_schemas': active_schemas,
                'migrating_schemas': migrating_schemas,
                'failed_schemas': failed_schemas,
                'total_size_mb': round(total_size_mb, 2),
                'total_tables': total_tables,
                'active_connections': active_connections,
                'idle_connections': idle_connections,
                'error_connections': error_connections,
                'completed_migrations': completed_migrations,
                'failed_migrations': failed_migrations,
                'rolled_back_migrations': rolled_back_migrations,
            },
            'schemas': schema_list,
        }


class TenantDomainExtractor:
    """Extracts tenant domain status, primary domain assignments, and SSL certificate expiration countdowns."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        domains = OrganizationDomain.objects.all()
        if self.tenant_id:
            domains = domains.filter(organization_id=self.tenant_id)

        total_domains = domains.count()
        active_domains = domains.filter(status='ACTIVE').count()
        pending_domains = domains.filter(status='PENDING').count()
        failed_domains = domains.filter(status='FAILED').count()
        expired_domains = domains.filter(status='EXPIRED').count()
        primary_domains = domains.filter(is_primary=True).count()

        cutoff_30 = timezone.now() + timedelta(days=30)
        ssl_expiring_soon = domains.filter(status='ACTIVE', ssl_expires_at__isnull=False, ssl_expires_at__lte=cutoff_30).count()

        domain_list = []
        for d in domains.order_by('-is_primary', '-created_at')[:100]:
            domain_list.append({
                'id': str(d.id),
                'domain': d.domain,
                'organization_name': d.organization.name if d.organization else 'Unknown',
                'is_primary': d.is_primary,
                'status': d.status,
                'verified_at': d.verified_at.isoformat() if d.verified_at else None,
                'ssl_expires_at': d.ssl_expires_at.isoformat() if d.ssl_expires_at else None,
                'ssl_issuer': d.ssl_issuer,
                'force_https': d.force_https,
            })

        return {
            'summary': {
                'total_domains': total_domains,
                'active_domains': active_domains,
                'pending_domains': pending_domains,
                'failed_domains': failed_domains,
                'expired_domains': expired_domains,
                'primary_domains': primary_domains,
                'ssl_expiring_in_30_days': ssl_expiring_soon,
            },
            'domains': domain_list,
        }


class TenantBackupExtractor:
    """Extracts tenant data backups, backup sizes, execution durations, and retention expiry statuses."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        try:
            backups = TenantBackup.objects.all()
            if self.tenant_id:
                backups = backups.filter(tenant_id=self.tenant_id)

            total_backups = backups.count()
            completed_backups = backups.filter(status='completed').count()
            failed_backups = backups.filter(status='failed').count()
            pending_backups = backups.filter(status='pending').count()
            running_backups = backups.filter(status='running').count()

            success_rate = round((completed_backups / total_backups * 100), 2) if total_backups > 0 else 0.0
            total_size_mb = backups.filter(status='completed').aggregate(total=models.Sum('file_size_mb'))['total'] or 0.0

            expired_backups = backups.filter(expires_at__isnull=False, expires_at__lte=timezone.now()).count()

            backup_list = []
            for b in backups.order_by('-created_at')[:100]:
                backup_list.append({
                    'id': str(b.id),
                    'tenant_name': b.tenant.name if b.tenant else 'Unknown',
                    'backup_type': b.backup_type,
                    'status': b.status,
                    'file_size_mb': b.file_size_mb,
                    'started_at': b.started_at.isoformat() if b.started_at else None,
                    'completed_at': b.completed_at.isoformat() if b.completed_at else None,
                    'expires_at': b.expires_at.isoformat() if b.expires_at else None,
                    'duration_seconds': b.duration_seconds,
                })

            return {
                'summary': {
                    'total_backups': total_backups,
                    'completed_backups': completed_backups,
                    'failed_backups': failed_backups,
                    'pending_backups': pending_backups,
                    'running_backups': running_backups,
                    'success_rate': success_rate,
                    'total_size_mb': round(total_size_mb, 2),
                    'expired_backups': expired_backups,
                },
                'backups': backup_list,
            }
        except Exception as e:
            logger.warning(f"TenantBackup table query failed (table may not exist yet): {e}")
            return {
                'summary': {
                    'total_backups': 0,
                    'completed_backups': 0,
                    'failed_backups': 0,
                    'pending_backups': 0,
                    'running_backups': 0,
                    'success_rate': 0.0,
                    'total_size_mb': 0.0,
                    'expired_backups': 0,
                },
                'backups': [],
            }


class TenantUnifiedExtractor:
    """Master Unified Extractor extracting complete real-data metrics across all apps.tenant sub-domains."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}
        self.lifecycle_extractor = TenantLifecycleExtractor(tenant_id, filters)
        self.quota_extractor = TenantQuotaExtractor(tenant_id, filters)
        self.schema_extractor = TenantSchemaExtractor(tenant_id, filters)
        self.domain_extractor = TenantDomainExtractor(tenant_id, filters)
        self.backup_extractor = TenantBackupExtractor(tenant_id, filters)

    def extract(self) -> Dict[str, Any]:
        lifecycle_data = self.lifecycle_extractor.extract()
        quota_data = self.quota_extractor.extract()
        schema_data = self.schema_extractor.extract()
        domain_data = self.domain_extractor.extract()
        backup_data = self.backup_extractor.extract()

        return {
            'source': 'tenant',
            'extracted_at': timezone.now().isoformat(),
            'lifecycle': lifecycle_data,
            'quota': quota_data,
            'schema': schema_data,
            'domain': domain_data,
            'backup': backup_data,
            'summary': {
                'total_organizations': lifecycle_data['summary']['total_organizations'],
                'active_organizations': lifecycle_data['summary']['active_organizations'],
                'onboarding_rate': lifecycle_data['summary']['onboarding_rate'],
                'exceeded_quota_resources': quota_data['summary']['exceeded_count'],
                'total_schema_size_mb': schema_data['summary']['total_size_mb'],
                'ssl_expiring_soon': domain_data['summary']['ssl_expiring_in_30_days'],
                'backup_success_rate': backup_data['summary']['success_rate'],
            }
        }
