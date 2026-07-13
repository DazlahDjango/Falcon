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
        return {
            'timestamp': timezone.now().isoformat(),
            'database': self.check_database(),
            'schemas': self.check_schemas(),
            'organizations': self.check_organizations()
        }