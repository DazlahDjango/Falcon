# apps/dashboard/api/v1/views/champion.py

from rest_framework.views import APIView
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from apps.accounts.api.v1.permissions import IsDashboardChampion, IsTenantMember, IsAuthenticated
from apps.dashboard.services.champion_service import ChampionService
from apps.dashboard.api.v1.serializers import ChampionDashboardDataSerializer, UpdateConfigSerializer


class ChampionDashboardView(APIView):
    """
    Dashboard Champion API.
    """
    permission_classes = [IsAuthenticated, IsDashboardChampion, IsTenantMember]
    
    @swagger_auto_schema(
        responses={200: ChampionDashboardDataSerializer()},
        operation_description="Get editable dashboard configuration"
    )
    def get(self, request):
        target_user_id = request.query_params.get('user_id')
        period = request.query_params.get('period', 'current')
        
        service = ChampionService(request.user, request.tenant_id)
        data = service.get_editable_dashboard(
            target_user_id=target_user_id,
            period=period
        )
        
        serializer = ChampionDashboardDataSerializer(data)
        return Response(serializer.data)
    
    @swagger_auto_schema(
        request_body=UpdateConfigSerializer,
        responses={200: 'Update response'}
    )
    def put(self, request):
        serializer = UpdateConfigSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        target_user_id = serializer.validated_data.get('user_id') or request.user.id
        config = serializer.validated_data['config']
        
        service = ChampionService(request.user, request.tenant_id)
        result = service.update_dashboard_config(
            target_user_id=target_user_id,
            config=config
        )
        
        if result.get('success'):
            return Response(result)
        return Response(result, status=400)