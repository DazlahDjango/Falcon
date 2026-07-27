from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from apps.accounts.constants import UserRoles
from apps.reviews.services.dashboard import StaffDashboardService, SupervisorDashboardService, ExecutiveDashboardService, AdminDashboardService
from apps.accounts.api.v1.permissions import IsTenantMember

class StaffDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsTenantMember]
    throttle_classes = []
    def get(self, request):
        dashboard = StaffDashboardService.get_dashboard(request.user)
        return Response(dashboard)

class SupervisorDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsTenantMember]
    throttle_classes = []
    def get(self, request):
        if request.user.role not in [UserRoles.SUPERVISOR, UserRoles.EXECUTIVE, UserRoles.CLIENT_ADMIN, UserRoles.SUPER_ADMIN]:
            return Response({'error': 'Permission denied. Supervisor role required.'}, status=403)
        dashboard = SupervisorDashboardService.get_dashboard(request.user)
        return Response(dashboard)

class ExecutiveDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsTenantMember]
    throttle_classes = []
    def get(self, request):
        if request.user.role not in [UserRoles.EXECUTIVE, UserRoles.CLIENT_ADMIN, UserRoles.SUPER_ADMIN]:
            return Response({'error': 'Permission denied. Executive role required.'}, status=403)
        department_id = request.query_params.get('department_id')
        dashboard = ExecutiveDashboardService.get_dashboard(request.user.tenant_id, department_id)
        return Response(dashboard)

class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsTenantMember]
    throttle_classes = []
    def get(self, request):
        if request.user.role not in [UserRoles.CLIENT_ADMIN, UserRoles.SUPER_ADMIN]:
            return Response({'error': 'Permission denied. Admin role required.'}, status=403)
        dashboard = AdminDashboardService.get_dashboard(request.user.tenant_id)
        return Response(dashboard)