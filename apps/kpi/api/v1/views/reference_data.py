"""Tenant-scoped reference data for KPI forms (real users, departments)."""

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.api.v1.permissions import IsTenantMember
from apps.accounts.models import User
from apps.structure.models import Department


class KpiReferenceDataView(APIView):
    """
    Single endpoint for KPI UI dropdowns — avoids fake / wrong API paths.
    GET /api/v1/kpis/reference-data/?include=users,departments
    """

    permission_classes = [IsAuthenticated, IsTenantMember]

    def get(self, request):
        include = request.query_params.get('include', 'users,departments').split(',')
        tenant_id = request.user.tenant_id
        payload = {}

        if 'users' in include:
            users = User.objects.filter(
                tenant_id=tenant_id, is_active=True, is_deleted=False,
            ).order_by('first_name', 'last_name')[:500]
            payload['users'] = [
                {
                    'id': str(u.id),
                    'email': u.email,
                    'first_name': u.first_name,
                    'last_name': u.last_name,
                    'role': u.role,
                }
                for u in users
            ]

        if 'departments' in include:
            departments = Department.objects.filter(
                tenant_id=tenant_id, is_deleted=False, is_active=True,
            ).order_by('name')[:500]
            payload['departments'] = [
                {
                    'id': str(d.id),
                    'name': d.name,
                    'code': getattr(d, 'code', '') or '',
                    'parent_id': str(d.parent_id) if getattr(d, 'parent_id', None) else None,
                }
                for d in departments
            ]

        return Response(payload)
