"""Tenant-scoped live org reference counts for forms and dashboards."""

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.api.v1.permissions import IsTenantMember
from apps.accounts.models import User
from apps.structure.models import OrganizationalUnit, Employment, Position


class StructureReferenceDataView(APIView):
    """
    GET /api/v1/structure/reference-data/?include=users,org_units,counts
    """

    permission_classes = [IsAuthenticated, IsTenantMember]

    def get(self, request):
        include = request.query_params.get('include', 'counts,org_units').split(',')
        tenant_id = request.user.tenant_id
        payload = {'tenant_id': str(tenant_id)}

        if 'counts' in include:
            payload['counts'] = {
                'organizational_units': OrganizationalUnit.objects.filter(
                    tenant_id=tenant_id, is_deleted=False,
                ).count(),
                'divisions': OrganizationalUnit.objects.filter(
                    tenant_id=tenant_id, is_deleted=False, level='division',
                ).count(),
                'departments': OrganizationalUnit.objects.filter(
                    tenant_id=tenant_id, is_deleted=False, level='department',
                ).count(),
                'sections': OrganizationalUnit.objects.filter(
                    tenant_id=tenant_id, is_deleted=False, level='section',
                ).count(),
                'units': OrganizationalUnit.objects.filter(
                    tenant_id=tenant_id, is_deleted=False, level='unit',
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

        if 'org_units' in include:
            units = OrganizationalUnit.objects.filter(
                tenant_id=tenant_id, is_deleted=False, is_active=True,
            ).order_by('level', 'name')[:500]
            payload['organizational_units'] = [
                {
                    'id': str(u.id),
                    'name': u.name,
                    'code': u.code,
                    'level': u.level,
                    'parent_id': str(u.parent_id) if u.parent_id else None,
                    'depth': u.depth,
                    'path': u.path,
                }
                for u in units
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