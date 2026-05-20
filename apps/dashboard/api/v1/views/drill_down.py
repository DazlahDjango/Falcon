# apps/dashboard/api/v1/views/drill_down.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema

from apps.dashboard.services.manager_service import ManagerService
from apps.dashboard.services.staff_service import StaffService
from apps.dashboard.api.v1.serializers import ManagerDashboardDataSerializer, StaffDashboardDataSerializer


class DrillDownView(APIView):
    """
    Drill-down view for hierarchy navigation.
    """
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        responses={200: 'User dashboard data'},
        operation_description="Drill down to specific user's dashboard"
    )
    def get(self, request, user_id):
        period = request.query_params.get('period', 'current')
        
        from apps.accounts.models import User
        try:
            target_user = User.objects.get(id=user_id, tenant_id=request.tenant_id, is_active=True)
        except User.DoesNotExist:
            return Response({'error': f'User {user_id} not found'}, status=status.HTTP_404_NOT_FOUND)
        
        target_role = getattr(target_user, 'role', 'staff')
        
        if target_role in ['manager', 'supervisor', 'department_head']:
            service = ManagerService(request.user, request.tenant_id)
            data = service.get_dashboard_data(
                period=period,
                include_team=True,
                drill_down_user_id=user_id
            )
            serializer = ManagerDashboardDataSerializer(data)
        else:
            service = StaffService(request.user, request.tenant_id)
            data = service.get_dashboard_data(period=period)
            serializer = StaffDashboardDataSerializer(data)
        
        return Response({
            'target_user': {
                'id': str(target_user.id),
                'name': target_user.get_full_name(),
                'role': target_role,
            },
            'dashboard': serializer.data
        })