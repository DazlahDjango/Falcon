# apps/dashboard/api/v1/views/staff.py

from rest_framework.views import APIView
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from apps.accounts.api.v1.permissions import IsStaff, IsTenantMember, IsAuthenticated
from apps.dashboard.services.staff_service import StaffService
from apps.dashboard.api.v1.serializers import StaffDashboardDataSerializer, SubmitKPISerializer


class StaffDashboardView(APIView):
    """
    Staff Dashboard API.
    """
    permission_classes = [IsAuthenticated, IsStaff, IsTenantMember]
    
    @swagger_auto_schema(
        responses={200: StaffDashboardDataSerializer()},
        operation_description="Get staff dashboard data"
    )
    def get(self, request):
        period = request.query_params.get('period', 'current')
        
        service = StaffService(request.user, request.tenant_id)
        data = service.get_dashboard_data(period=period)
        
        return Response(data)
    
    @swagger_auto_schema(
        request_body=SubmitKPISerializer,
        responses={200: 'Submission response'}
    )
    def post(self, request):
        serializer = SubmitKPISerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        service = StaffService(request.user, request.tenant_id)
        result = service.submit_kpi_actual(
            kpi_id=serializer.validated_data['kpi_id'],
            value=serializer.validated_data['value'],
            comments=serializer.validated_data.get('comments')
        )
        
        if result.get('success'):
            return Response(result)
        return Response(result, status=400)