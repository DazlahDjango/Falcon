# apps/dashboard/api/v1/views/read_only.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_yasg.utils import swagger_auto_schema

from apps.dashboard.services.read_only_service import ReadOnlyService
from apps.dashboard.api.v1.serializers import ReadOnlyDashboardDataSerializer


class ReadOnlyDashboardView(APIView):
    """
    Read-Only Dashboard API.
    """
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        responses={200: ReadOnlyDashboardDataSerializer()},
        operation_description="Get read-only dashboard data"
    )
    def get(self, request):
        period = request.query_params.get('period', 'current')
        view_type = request.query_params.get('view_type', 'executive')
        
        service = ReadOnlyService(request.user, request.tenant_id)
        data = service.get_dashboard_data(
            period=period,
            view_type=view_type
        )
        
        serializer = ReadOnlyDashboardDataSerializer(data)
        return Response(serializer.data)