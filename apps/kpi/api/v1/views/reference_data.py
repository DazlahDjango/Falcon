from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.accounts.api.v1.permissions import IsTenantMember
from apps.accounts.models import User
from apps.structure.models import Department


class KpiReferenceDataView(APIView):
    permission_classes = [IsAuthenticated, IsTenantMember]

    def get(self, request):
        include = request.query_params.get('include', 'users,departments').split(',')
        tenant_id = request.user.tenant_id
        payload = {}

        if 'users' in include:
            users = User.objects.filter(
                tenant_id=tenant_id, is_active=True
            ).exclude(is_deleted=True).order_by('first_name', 'last_name')[:500]

            payload['users'] = [
                {
                    'id': str(u.id),
                    'email': u.email,
                    'first_name': u.first_name,
                    'last_name': u.last_name,
                    'full_name': u.get_full_name(),
                    'role': getattr(u, 'role', 'employee'),
                }
                for u in users
            ]

        if 'departments' in include:
            departments = Department.objects.filter(
                tenant_id=tenant_id, is_active=True
            ).exclude(is_deleted=True).only('id', 'name', 'code', 'parent').order_by('name')[:500]

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