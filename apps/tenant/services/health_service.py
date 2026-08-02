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