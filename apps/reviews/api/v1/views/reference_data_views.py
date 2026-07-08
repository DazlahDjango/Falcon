from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.accounts.api.v1.permissions import IsTenantMember
from apps.accounts.models import User
from apps.structure.models import OrganizationalUnit, Division, Department, Section, Unit, Position
from apps.reviews.services.sync import ReviewsResourceSyncService

class ReviewsReferenceDataView(APIView):
    permission_classes = [IsAuthenticated, IsTenantMember]
    
    def get(self, request):
        include = request.query_params.get(
            'include', 'users,organizational_units,metrics',
        ).split(',')
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
                    'role': getattr(u, 'role', ''),
                }
                for u in users
            ]
        
        if 'organizational_units' in include:
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
        
        if 'divisions' in include:
            divisions = Division.objects.filter(
                tenant_id=tenant_id, is_deleted=False, is_active=True,
            ).order_by('name')[:500]
            payload['divisions'] = [
                {
                    'id': str(d.id),
                    'name': d.name,
                    'code': d.code,
                }
                for d in divisions
            ]
        
        if 'departments' in include:
            departments = Department.objects.filter(
                tenant_id=tenant_id, is_deleted=False, is_active=True,
            ).order_by('name')[:500]
            payload['departments'] = [
                {
                    'id': str(d.id),
                    'name': d.name,
                    'code': d.code,
                    'division_id': str(d.parent_id) if d.parent_id else None,
                }
                for d in departments
            ]
        
        if 'sections' in include:
            sections = Section.objects.filter(
                tenant_id=tenant_id, is_deleted=False, is_active=True,
            ).order_by('name')[:500]
            payload['sections'] = [
                {
                    'id': str(s.id),
                    'name': s.name,
                    'code': s.code,
                    'department_id': str(s.parent_id) if s.parent_id else None,
                }
                for s in sections
            ]
        
        if 'units' in include:
            units = Unit.objects.filter(
                tenant_id=tenant_id, is_deleted=False, is_active=True,
            ).order_by('name')[:500]
            payload['units'] = [
                {
                    'id': str(u.id),
                    'name': u.name,
                    'code': u.code,
                    'section_id': str(u.parent_id) if u.parent_id else None,
                }
                for u in units
            ]
        
        if 'positions' in include:
            positions = Position.objects.filter(
                tenant_id=tenant_id, is_deleted=False, is_active=True,
            ).order_by('title')[:500]
            payload['positions'] = [
                {
                    'id': str(p.id),
                    'title': p.title,
                    'job_code': p.job_code,
                    'grade': p.grade,
                    'level': p.level,
                }
                for p in positions
            ]
        
        if 'metrics' in include:
            payload['metrics'] = ReviewsResourceSyncService.build_dashboard_metrics(
                tenant_id, broadcast=False,
            )
        
        return Response(payload)