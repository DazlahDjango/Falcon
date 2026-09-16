from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.accounts.api.v1.permissions import IsTenantMember
from apps.accounts.models import User
from apps.structure.models import Division, Department, Section, Unit


class KpiReferenceDataView(APIView):
    permission_classes = [IsAuthenticated, IsTenantMember]

    def get(self, request):
        include = request.query_params.get('include', 'users,departments,divisions,sections,units').split(',')
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

        if 'divisions' in include:
            divisions = Division.objects.filter(
                tenant_id=tenant_id, is_active=True
            ).exclude(is_deleted=True).order_by('name')[:500]

            payload['divisions'] = [
                {
                    'id': str(d.id),
                    'name': d.name,
                    'code': getattr(d, 'code', '') or '',
                }
                for d in divisions
            ]

        if 'departments' in include:
            departments = Department.objects.filter(
                tenant_id=tenant_id, is_active=True
            ).exclude(is_deleted=True).only('id', 'name', 'code', 'parent', 'division').order_by('name')[:500]

            payload['departments'] = [
                {
                    'id': str(d.id),
                    'name': d.name,
                    'code': getattr(d, 'code', '') or '',
                    'parent_id': str(d.parent_id) if getattr(d, 'parent_id', None) else None,
                    'division_id': str(d.division_id) if getattr(d, 'division_id', None) else None,
                }
                for d in departments
            ]

        if 'sections' in include:
            sections = Section.objects.filter(
                tenant_id=tenant_id, is_active=True
            ).exclude(is_deleted=True).only('id', 'name', 'code', 'department').order_by('name')[:500]

            payload['sections'] = [
                {
                    'id': str(s.id),
                    'name': s.name,
                    'code': getattr(s, 'code', '') or '',
                    'department_id': str(s.department_id) if getattr(s, 'department_id', None) else None,
                }
                for s in sections
            ]

        if 'units' in include:
            units = Unit.objects.filter(
                tenant_id=tenant_id, is_active=True
            ).exclude(is_deleted=True).only('id', 'name', 'code', 'section').order_by('name')[:500]

            payload['units'] = [
                {
                    'id': str(u.id),
                    'name': u.name,
                    'code': getattr(u, 'code', '') or '',
                    'section_id': str(u.section_id) if getattr(u, 'section_id', None) else None,
                }
                for u in units
            ]

        return Response(payload)