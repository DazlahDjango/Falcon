from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from drf_yasg.utils import swagger_auto_schema
import logging
from apps.dashboard.services import HierarchyService
from apps.dashboard.api.v1.serializers import (
    TeamMemberSerializer, TeamAggregateSerializer, OrgTreeNodeSerializer,
    ReportingChainSerializer
)
from apps.dashboard.api.v1.throttles import DashboardDrillDownThrottle, BurstDashboardThrottle
from apps.dashboard.exceptions import HierarchyLoopError
logger = logging.getLogger(__name__)

class HierarchyViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    throttle_classes = [BurstDashboardThrottle, DashboardDrillDownThrottle]
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.service = None
    
    def get_service(self):
        if not self.service:
            self.service = HierarchyService(
                self.request.user,
                getattr(self.request.user, 'tenant_id', None)
            )
        return self.service
    
    @swagger_auto_schema(
        operation_description="Get user's team members",
        responses={200: TeamMemberSerializer(many=True)}
    )
    @action(detail=False, methods=['get'], url_path='team')
    def get_team(self, request):
        try:
            service = self.get_service()
            user_id = request.query_params.get('user_id', str(request.user.id))
            team = service.get_user_team(user_id, include_self=False)
            serializer = TeamMemberSerializer(team, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except HierarchyLoopError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error fetching team: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    @swagger_auto_schema(
        operation_description="Get team aggregate performance",
        responses={200: TeamAggregateSerializer()}
    )
    @action(detail=False, methods=['get'], url_path='team-aggregate')
    def get_team_aggregate(self, request):
        try:
            service = self.get_service()
            user_id = request.query_params.get('user_id', str(request.user.id))
            
            aggregate = service.get_team_aggregate(user_id)
            
            serializer = TeamAggregateSerializer(aggregate)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching team aggregate: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @swagger_auto_schema(
        operation_description="Drill down to specific user",
        responses={200: TeamMemberSerializer()}
    )
    @action(detail=True, methods=['get'], url_path='drill-down/(?P<target_user_id>[^/.]+)')
    def drill_down(self, request, target_user_id=None):
        try:
            service = self.get_service()
            
            user_data = service.drill_down_to_user(str(request.user.id), target_user_id)
            
            serializer = TeamMemberSerializer(user_data)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except PermissionDenied as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            logger.error(f"Error drilling down: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @swagger_auto_schema(
        operation_description="Get organization tree",
        responses={200: OrgTreeNodeSerializer()}
    )
    @action(detail=False, methods=['get'], url_path='org-tree')
    def get_org_tree(self, request):
        try:
            service = self.get_service()
            root_user_id = request.query_params.get('root_user_id')
            
            tree = service.get_org_tree(root_user_id)
            
            serializer = OrgTreeNodeSerializer(tree)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching org tree: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @swagger_auto_schema(
        operation_description="Get reporting chain",
        responses={200: ReportingChainSerializer()}
    )
    @action(detail=False, methods=['get'], url_path='reporting-chain')
    def get_reporting_chain(self, request):
        try:
            service = self.get_service()
            user_id = request.query_params.get('user_id', str(request.user.id))
            include_self = request.query_params.get('include_self', 'false').lower() == 'true'
            
            chain = service.get_reporting_chain(user_id, include_self)
            
            return Response({'chain': chain}, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching reporting chain: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)