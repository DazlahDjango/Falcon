"""Tenant-scoped live org reference counts for forms and dashboards."""

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.api.v1.permissions import IsTenantMember
from apps.accounts.models import User
from apps.structure.models import Department, Team, Employment, Position


class StructureReferenceDataView(APIView):
    """
    GET /api/v1/structure/reference-data/?include=users,departments,counts
    """

    permission_classes = [IsAuthenticated, IsTenantMember]

    def get(self, request):
        include = request.query_params.get('include', 'counts,departments').split(',')
        tenant_id = request.user.tenant_id
        payload = {'tenant_id': str(tenant_id)}

        if 'counts' in include:
            payload['counts'] = {
                'departments': Department.objects.filter(
                    tenant_id=tenant_id, is_deleted=False,
                ).count(),
                'teams': Team.objects.filter(
                    tenant_id=tenant_id, is_deleted=False,
                ).count(),
                'positions': Position.objects.filter(
                    tenant_id=tenant_id, is_deleted=False,
                ).count(),
                'employments': Employment.objects.filter(
                    tenant_id=tenant_id, is_deleted=False, is_current=True,
                ).count(),
                'users': User.objects.filter(
                    tenant_id=tenant_id, is_active=True, is_deleted=False,
                ).count(),
            }

        if 'departments' in include:
            departments = Department.objects.filter(
                tenant_id=tenant_id, is_deleted=False, is_active=True,
            ).order_by('name')[:500]
            payload['departments'] = [
                {
                    'id': str(d.id),
                    'name': d.name,
                    'code': getattr(d, 'code', '') or '',
                    'parent_id': str(d.parent_id) if d.parent_id else None,
                }
                for d in departments
            ]

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
                }
                for u in users
            ]

        from django.utils import timezone
        payload['generated_at'] = timezone.now().isoformat()
        return Response(payload)
