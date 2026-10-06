from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from apps.accounts.constants import UserRoles
from apps.reviews.services.dashboard import StaffDashboardService, SupervisorDashboardService, ExecutiveDashboardService, AdminDashboardService
from apps.accounts.api.v1.permissions import IsTenantMember

import logging
from rest_framework import status
from apps.reviews.models import ReviewCycle
from apps.reviews.api.v1.serializers import StaffDashboardSerializer

logger = logging.getLogger(__name__)


class StaffDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsTenantMember]
    throttle_classes = []

    def get(self, request):
        try:
            review_cycle = None
            cycle_id = request.query_params.get('cycle_id')
            if cycle_id:
                review_cycle = ReviewCycle.objects.filter(
                    id=cycle_id,
                    tenant_id=request.user.tenant_id
                ).first()
                if not review_cycle:
                    return Response(
                        {'error': 'Review cycle not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )

            dashboard_data = StaffDashboardService.get_dashboard(request.user, review_cycle=review_cycle)
            serializer = StaffDashboardSerializer(dashboard_data)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"StaffDashboardView error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to load staff dashboard', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SupervisorDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsTenantMember]
    throttle_classes = []
    def get(self, request):
        if request.user.role not in [UserRoles.SUPERVISOR, UserRoles.EXECUTIVE, UserRoles.CLIENT_ADMIN, UserRoles.SUPER_ADMIN, UserRoles.HR_ADMIN]:
            return Response({'error': 'Permission denied. Supervisor role required.'}, status=403)
        dashboard = SupervisorDashboardService.get_dashboard(request.user)
        return Response(dashboard)

class ExecutiveDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsTenantMember]
    throttle_classes = []
    def get(self, request):
        if request.user.role not in [UserRoles.EXECUTIVE, UserRoles.CLIENT_ADMIN, UserRoles.SUPER_ADMIN, UserRoles.HR_ADMIN]:
            return Response({'error': 'Permission denied. Executive role required.'}, status=403)
        department_id = request.query_params.get('department_id')
        dashboard = ExecutiveDashboardService.get_dashboard(request.user.tenant_id, department_id)
        return Response(dashboard)

class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsTenantMember]
    throttle_classes = []
    def get(self, request):
        if request.user.role not in [UserRoles.HR_ADMIN, UserRoles.CLIENT_ADMIN, UserRoles.SUPER_ADMIN]:
            return Response({'error': 'Permission denied. Admin role required.'}, status=403)
        dashboard = AdminDashboardService.get_dashboard(request.user.tenant_id)
        return Response(dashboard)