# apps/dashboard/api/v1/views/manager.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_yasg.utils import swagger_auto_schema

from apps.dashboard.services.manager_service import ManagerService
from apps.dashboard.api.v1.serializers import ManagerDashboardDataSerializer, ApprovalActionSerializer


class ManagerDashboardView(APIView):
    """
    Manager/Supervisor Dashboard API.
    """
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        responses={200: ManagerDashboardDataSerializer()},
        operation_description="Get manager dashboard data"
    )
    def get(self, request):
        period = request.query_params.get('period', 'current')
        include_team = request.query_params.get('include_team', 'true').lower() == 'true'
        drill_down_user_id = request.query_params.get('user_id')
        
        service = ManagerService(request.user, request.tenant_id)
        data = service.get_dashboard_data(
            period=period,
            include_team=include_team,
            drill_down_user_id=drill_down_user_id
        )
        
        serializer = ManagerDashboardDataSerializer(data)
        return Response(serializer.data)
    
    @swagger_auto_schema(
        request_body=ApprovalActionSerializer,
        responses={200: 'Approval response'}
    )
    def post(self, request):
        serializer = ApprovalActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        service = ManagerService(request.user, request.tenant_id)
        result = service.approve_submission(
            submission_id=serializer.validated_data['submission_id'],
            comments=serializer.validated_data.get('comments')
        )
        
        if result.get('success'):
            return Response(result)
        return Response(result, status=400)
    
    @swagger_auto_schema(
        request_body=ApprovalActionSerializer,
        responses={200: 'Rejection response'}
    )
    def put(self, request):
        serializer = ApprovalActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        service = ManagerService(request.user, request.tenant_id)
        result = service.reject_submission(
            submission_id=serializer.validated_data['submission_id'],
            comments=serializer.validated_data.get('comments', '')
        )
        
        if result.get('success'):
            return Response(result)
        return Response(result, status=400)