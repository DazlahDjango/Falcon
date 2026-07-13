# apps/tenant/services/stats_service.py
from django.db.models import Count, Q
from apps.tenant.models import Organization, OrganizationDomain, OrganizationResource
from apps.accounts.models import User


class OrganizationStatsService:
    def get_super_admin_stats(self):
        try:
            recent_orgs = self._get_recent_organizations(10)
            return {
                'organizations': {
                    'total': Organization.objects.active_organizations().count(),
                    'pending': Organization.objects.pending_onboarding().count(),
                    'active': Organization.objects.filter(status='ACTIVE', is_active=True).count(),
                    'suspended': Organization.objects.filter(status='SUSPENDED').count(),
                    'archived': Organization.objects.filter(status='ARCHIVED').count(),
                },
                'domains': {
                    'total': OrganizationDomain.objects.count(),
                    'active': OrganizationDomain.objects.active_domains().count(),
                    'pending': OrganizationDomain.objects.pending_verification().count(),
                    'failed': OrganizationDomain.objects.failed_domains().count(),
                    'expiring_soon': OrganizationDomain.objects.expiring_ssl(30).count(),
                },
                'resources': {
                    'total': OrganizationResource.objects.count(),
                    'exceeded': OrganizationResource.objects.exceeded_limits().count(),
                    'warning': OrganizationResource.objects.warning_level().count(),
                },
                'recent_organizations': [
                    {
                        'id': str(org.id),
                        'name': org.name,
                        'slug': org.slug,
                        'status': org.status,
                        'is_active': org.is_active,
                        'is_onboarded': org.is_onboarded,
                        'created_at': org.created_at.isoformat() if org.created_at else None,
                    }
                    for org in recent_orgs
                ],
                'system_health': {
                    'database': 'healthy',
                    'cache': 'healthy',
                    'celery': 'healthy',
                },
                'total_users': User.objects.filter(is_active=True).count(),
            }
        except Exception as e:
            return {
                'organizations': {'total': 0, 'pending': 0, 'active': 0, 'suspended': 0, 'archived': 0},
                'domains': {'total': 0, 'active': 0, 'pending': 0, 'failed': 0, 'expiring_soon': 0},
                'resources': {'total': 0, 'exceeded': 0, 'warning': 0},
                'recent_organizations': [],
                'system_health': {'database': 'healthy', 'cache': 'healthy', 'celery': 'healthy'},
                'total_users': 0,
            }

    def _get_recent_organizations(self, limit=10):
        try:
            return Organization.objects.active_organizations().order_by('-created_at')[:limit]
        except Exception:
            return []

    def get_client_admin_stats(self, organization_id):
        try:
            org = Organization.objects.get(id=organization_id)
            return {
                'organization': {
                    'id': str(org.id),
                    'name': org.name,
                    'slug': org.slug,
                    'status': org.status,
                    'is_active': org.is_active,
                    'is_onboarded': org.is_onboarded,
                },
                'total_users': User.objects.filter(tenant_id=organization_id, is_active=True).count(),
                'total_domains': OrganizationDomain.objects.by_organization(organization_id).count(),
                'domains_status': {
                    'active': OrganizationDomain.objects.by_organization(organization_id).filter(status='ACTIVE').count(),
                    'pending': OrganizationDomain.objects.by_organization(organization_id).filter(status='PENDING').count(),
                    'failed': OrganizationDomain.objects.by_organization(organization_id).filter(status='FAILED').count(),
                },
                'resource_usage': self._get_resource_usage(organization_id),
                'recent_activity': [],
            }
        except Organization.DoesNotExist:
            return {
                'organization': None,
                'total_users': 0,
                'total_domains': 0,
                'domains_status': {'active': 0, 'pending': 0, 'failed': 0},
                'resource_usage': [],
                'recent_activity': [],
            }

    def _get_resource_usage(self, organization_id):
        try:
            resources = OrganizationResource.objects.by_organization(organization_id)
            return [{
                'type': r.resource_type,
                'type_display': r.get_resource_type_display(),
                'current': r.current_value,
                'limit': r.limit_value,
                'percentage': r.percentage_used(),
                'is_exceeded': r.is_exceeded(),
                'is_warning': r.is_warning_level(),
            } for r in resources]
        except Exception:
            return []

    def get_org_stats(self, organization_id):
        return self.get_client_admin_stats(organization_id)