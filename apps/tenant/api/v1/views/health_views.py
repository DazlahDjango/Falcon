from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from apps.tenant.api.v1.permissions import IsSuperAdmin
from apps.tenant.services import HealthCheckService, ConnectionService


class HealthCheckView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request):
        service = HealthCheckService()
        result = service.full_health_check()
        return Response(result)


class OrganizationsHealthView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request):
        from apps.tenant.models import Organization
        service = ConnectionService()
        orgs = Organization.objects.filter(is_active=True, is_deleted=False)
        results = []
        healthy = 0
        for org in orgs:
            try:
                conn = service.get_connection(str(org.id))
                with conn.cursor() as cursor:
                    cursor.execute("SELECT 1")
                    cursor.fetchone()
                healthy += 1
                results.append({
                    'organization_id': str(org.id),
                    'organization_name': org.name,
                    'status': 'healthy'
                })
            except Exception as e:
                results.append({
                    'organization_id': str(org.id),
                    'organization_name': org.name,
                    'status': 'unhealthy',
                    'error': str(e)
                })
        return Response({
            'total': orgs.count(),
            'healthy': healthy,
            'unhealthy': orgs.count() - healthy,
            'organizations': results
        })