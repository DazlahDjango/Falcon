"""Live cross-app counts for tenant quota dashboards."""

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.api.v1.permissions import IsSuperAdmin
from apps.accounts.constants import UserRoles
from apps.tenant.services.monitoring.resource_sync import ResourceSyncService


class TenantReferenceDataView(APIView):
    """
    GET /api/v1/tenant/reference-data/?tenant_id=<uuid>&include=users,departments,kpis,sessions
    Super admin may query any tenant; client admin only own tenant.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        tenant_id = request.query_params.get('tenant_id') or str(request.user.tenant_id)
        if str(tenant_id) != str(request.user.tenant_id):
            if not (
                request.user.is_superuser
                or request.user.role == UserRoles.SUPER_ADMIN
            ):
                return Response({'detail': 'Forbidden'}, status=403)

        include = request.query_params.get(
            'include', 'users,departments,kpis,sessions',
        ).split(',')
        live = ResourceSyncService.count_live_usage(tenant_id)
        payload = {'tenant_id': str(tenant_id), 'generated_at': None}

        mapping = {
            'users': 'users',
            'departments': 'departments',
            'kpis': 'kpis',
            'sessions': 'concurrent_sessions',
        }
        for key in include:
            rt = mapping.get(key.strip())
            if rt and rt in live:
                payload[key.strip()] = live[rt]

        from django.utils import timezone
        payload['generated_at'] = timezone.now().isoformat()
        return Response(payload)

