from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.accounts.api.v1.permissions import IsTenantMember
from apps.accounts.models import User
from apps.structure.models import Department, Team, Position
from apps.reviews.services.sync import ReviewsResourceSyncService

class ReviewsReferenceDataView(APIView):
    permission_classes = [IsAuthenticated, IsTenantMember]
    def get(self, request):
        include = request.query_params.get(
            'include', 'users,departments,teams,metrics',
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
        if 'departments' in include:
            departments = Department.objects.filter(
                tenant_id=tenant_id, is_deleted=False,
            ).order_by('name')[:500]
            payload['departments'] = [
                {
                    'id': str(d.id),
                    'name': d.name,
                    'code': getattr(d, 'code', '') or '',
                }
                for d in departments
            ]
        if 'teams' in include:
            teams = Team.objects.filter(
                tenant_id=tenant_id, is_deleted=False,
            ).order_by('name')[:500]
            payload['teams'] = [
                {'id': str(t.id), 'name': t.name, 'department_id': str(t.department_id)}
                for t in teams
            ]
        if 'positions' in include:
            positions = Position.objects.filter(
                tenant_id=tenant_id, is_deleted=False,
            ).order_by('title')[:500]
            payload['positions'] = [
                {'id': str(p.id), 'title': p.title, 'job_code': p.job_code}
                for p in positions
            ]
        if 'metrics' in include:
            payload['metrics'] = ReviewsResourceSyncService.build_dashboard_metrics(
                tenant_id, broadcast=False,
            )
        return Response(payload)
