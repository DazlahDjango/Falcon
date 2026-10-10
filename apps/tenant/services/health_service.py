import logging
from django.db import connection
from django.utils import timezone
from apps.tenant.models import Organization, OrganizationSchema
from apps.tenant.exceptions import HealthCheckError

logger = logging.getLogger(__name__)


class HealthCheckService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def check_database(self):
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            return {'status': 'healthy', 'database': 'connected'}
        except Exception as e:
            return {'status': 'unhealthy', 'database': 'error', 'error': str(e)}

    def check_schemas(self):
        try:
            schemas = OrganizationSchema.objects.filter(is_ready=True)
            return {'status': 'healthy', 'schemas': schemas.count()}
        except Exception as e:
            return {'status': 'unhealthy', 'error': str(e)}

    def check_organizations(self):
        try:
            orgs = Organization.objects.active_organizations()
            return {'status': 'healthy', 'organizations': orgs.count()}
        except Exception as e:
            return {'status': 'unhealthy', 'error': str(e)}

    def check_organization(self, organization_id):
        from apps.tenant.services.connection_service import ConnectionService
        from apps.tenant.constants import OrganizationStatus
        start = timezone.now()
        org = None
        try:
            if isinstance(organization_id, Organization):
                org = organization_id
            else:
                org = Organization.objects.filter(id=organization_id).first()
                if not org:
                    org = Organization.objects.filter(slug=organization_id).first()
            if not org:
                return {
                    'organization_id': str(organization_id),
                    'organization_name': 'Unknown',
                    'schema_name': None,
                    'status': 'unhealthy',
                    'is_healthy': False,
                    'response_time_ms': 0,
                    'error_message': f"Organization '{organization_id}' not found."
                }

            if not org.is_onboarded or org.status != OrganizationStatus.ACTIVE:
                return {
                    'organization_id': str(org.id),
                    'organization_name': org.name,
                    'schema_name': org.schema_name,
                    'status': 'skipped',
                    'is_healthy': True,
                    'response_time_ms': 0,
                    'error_message': f"Pending onboarding (status: {org.status})"
                }

            service = ConnectionService()
            conn = service.get_connection(org.id)
            with conn.cursor() as cursor:
                cursor.execute("SELECT current_schema(), 1")
                schema, res = cursor.fetchone()

            elapsed_ms = round((timezone.now() - start).total_seconds() * 1000, 2)
            return {
                'organization_id': str(org.id),
                'organization_name': org.name,
                'schema_name': schema or org.schema_name,
                'status': 'healthy',
                'is_healthy': True,
                'response_time_ms': elapsed_ms,
                'error_message': None
            }
        except Exception as e:
            elapsed_ms = round((timezone.now() - start).total_seconds() * 1000, 2)
            return {
                'organization_id': str(getattr(org, 'id', organization_id)),
                'organization_name': getattr(org, 'name', 'Unknown'),
                'schema_name': getattr(org, 'schema_name', None),
                'status': 'unhealthy',
                'is_healthy': False,
                'response_time_ms': elapsed_ms,
                'error_message': str(e)
            }

    def check_all_organizations(self):
        orgs = Organization.objects.filter(is_active=True, is_deleted=False).order_by('name')
        results = []
        healthy = 0
        unhealthy = 0
        skipped = 0

        for org in orgs:
            res = self.check_organization(org)
            if res.get('status') == 'skipped':
                skipped += 1
            elif res.get('is_healthy'):
                healthy += 1
            else:
                unhealthy += 1
            results.append(res)

        return {
            'total': orgs.count(),
            'healthy': healthy,
            'unhealthy': unhealthy,
            'skipped': skipped,
            'organizations': results
        }

    def full_health_check(self):
        start = timezone.now()
        db_check = self.check_database()
        schema_check = self.check_schemas()
        org_check = self.check_organizations()
        elapsed_ms = int((timezone.now() - start).total_seconds() * 1000)
        overall_status = 'healthy' if (
            db_check.get('status') == 'healthy' and
            schema_check.get('status') == 'healthy' and
            org_check.get('status') == 'healthy'
        ) else 'unhealthy'

        return {
            'status': overall_status,
            'app_name': 'tenant',
            'response_time_ms': elapsed_ms,
            'timestamp': timezone.now().isoformat(),
            'database': db_check,
            'schemas': schema_check,
            'organizations': org_check
        }