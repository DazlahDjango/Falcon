from rest_framework import status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from uuid import UUID
from ....models import Team
from ..serializers.team import (
    TeamSerializer, TeamTreeSerializer, 
    TeamDetailSerializer, TeamCreateUpdateSerializer
)
from ..filters.team_filter import TeamFilter, TeamHierarchyFilter
from ..throttles.structure_limits import TeamRateThrottle, HierarchyReadThrottle, HierarchyWriteThrottle
from ..permissions.structure_permissions import (
    CanViewTeam, CanEditTeam, CanDeleteTeam
)
from .base import BaseStructureViewSet, BaseStructureReadOnlyViewSet


class TeamViewSet(BaseStructureViewSet):
    queryset = Team.objects.select_related('department', 'parent_team').all()
    filterset_class = TeamFilter
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['code', 'name', 'description']
    ordering_fields = ['code', 'name', 'created_at', 'updated_at']
    ordering = ['code']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return TeamDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return TeamCreateUpdateSerializer
        return TeamSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update']:
            self.permission_classes = [CanEditTeam]
        elif self.action == 'destroy':
            self.permission_classes = [CanDeleteTeam]
        else:
            self.permission_classes = [CanViewTeam]
        return super().get_permissions()
    
    def get_throttles(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.throttle_classes = [TeamRateThrottle, HierarchyWriteThrottle]
        else:
            self.throttle_classes = [HierarchyReadThrottle]
        return super().get_throttles()
    
    @action(detail=True, methods=['get'], url_path='members')
    def get_members(self, request, pk=None):
        team = self.get_object()
        from ....models.employment import Employment
        members = Employment.objects.filter(
            team_id=team.id,
            tenant_id=team.tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).select_related('position', 'user')
        member_data = []
        for member in members:
            member_data.append({
                'user_id': str(member.user_id),
                'position_code': member.position.job_code if member.position else None,
                'position_title': member.position.title if member.position else None,
                'is_manager': member.is_manager,
                'is_team_lead': member.user_id == team.team_lead if team.team_lead else False
            })
        return Response({
            'team_id': str(team.id),
            'team_name': team.name,
            'members': member_data,
            'count': len(member_data),
            'max_members': team.max_members,
            'utilization': round((len(member_data) / team.max_members * 100), 2) if team.max_members else None
        })
    
    @action(detail=True, methods=['post'], url_path='add-member')
    @transaction.atomic
    def add_member(self, request, pk=None):
        team = self.get_object()
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        from ....models.employment import Employment
        employment = Employment.objects.filter(
            user_id=user_id,
            tenant_id=team.tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).first()
        if not employment:
            return Response({'error': 'User employment not found'}, status=status.HTTP_404_NOT_FOUND)
        if team.max_members:
            current_count = Employment.objects.filter(team_id=team.id, is_current=True, is_deleted=False, is_active=True).count()
            if current_count >= team.max_members:
                return Response({'error': f'Team has reached maximum capacity of {team.max_members}'}, status=status.HTTP_400_BAD_REQUEST)
        employment.team = team
        employment.save()
        self._invalidate_cache()
        return Response({'message': f'User {user_id} added to team {team.name}'})
    
    @action(detail=True, methods=['post'], url_path='remove-member')
    @transaction.atomic
    def remove_member(self, request, pk=None):
        team = self.get_object()
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        from ....models.employment import Employment
        employment = Employment.objects.filter(
            user_id=user_id,
            team_id=team.id,
            tenant_id=team.tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).first()
        if not employment:
            return Response({'error': 'User not found in this team'}, status=status.HTTP_404_NOT_FOUND)
        employment.team = None
        employment.save()
        self._invalidate_cache()
        return Response({'message': f'User {user_id} removed from team {team.name}'})
    
    @action(detail=False, methods=['get'], url_path='by-code/(?P<code>[^/.]+)')
    def get_by_code(self, request, code=None):
        tenant_id = request.user.tenant_id
        team = Team.objects.filter(code=code, tenant_id=tenant_id, is_deleted=False).first()
        if not team:
            return Response({'error': 'Team not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = TeamDetailSerializer(team, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='by-department/(?P<department_id>[0-9a-f-]+)')
    def get_by_department(self, request, department_id=None):
        tenant_id = request.user.tenant_id
        teams = Team.objects.filter(
            department_id=department_id,
            tenant_id=tenant_id,
            is_deleted=False
        ).select_related('department', 'parent_team')
        serializer = TeamSerializer(teams, many=True, context={'request': request})
        return Response({
            'department_id': department_id,
            'teams': serializer.data,
            'count': teams.count()
        })
    
    @action(detail=False, methods=['get'], url_path='stats')
    def get_stats(self, request):
        tenant_id = request.user.tenant_id
        total = Team.objects.filter(tenant_id=tenant_id, is_deleted=False).count()
        active = Team.objects.filter(tenant_id=tenant_id, is_deleted=False, is_active=True).count()
        teams_with_leads = Team.objects.filter(tenant_id=tenant_id, team_lead__isnull=False, is_deleted=False).count()
        return Response({
            'total_teams': total,
            'active_teams': active,
            'inactive_teams': total - active,
            'teams_with_team_leads': teams_with_leads
        })

class TeamHierarchyViewSet(BaseStructureReadOnlyViewSet):
    queryset = Team.objects.select_related('department', 'parent_team').all()
    serializer_class = TeamTreeSerializer
    filterset_class = TeamHierarchyFilter
    permission_classes = [CanViewTeam]
    throttle_classes = [HierarchyReadThrottle]
    
    def get_queryset(self):
        return super().get_queryset().filter(parent_team__isnull=True)
    @action(detail=False, methods=['get'], url_path='full/(?P<department_id>[0-9a-f-]+)')
    def get_full_hierarchy(self, request, department_id=None):
        from ....services.hierarchy.tree_builder import TreeBuilder
        tenant_id = request.user.tenant_id
        include_inactive = request.query_params.get('include_inactive', 'false').lower() == 'true'
        tree_builder = TreeBuilder()
        tree = tree_builder.build_team_tree(UUID(department_id), tenant_id, include_inactive)
        return Response({
            'department_id': department_id,
            'teams': tree,
            'include_inactive': include_inactive
        })
    
    @action(detail=False, methods=['get'], url_path='subtree/(?P<team_id>[0-9a-f-]+)')
    def get_subtree(self, request, team_id=None):
        from ....services.hierarchy.subtree_extractor import SubtreeExtractor
        tenant_id = request.user.tenant_id
        subtree = SubtreeExtractor.extract_team_subtree(UUID(team_id), tenant_id)
        if not subtree:
            return Response({'error': 'Team not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = TeamSerializer(subtree, many=True, context={'request': request})
        return Response({
            'root_team_id': team_id,
            'teams': serializer.data,
            'count': len(subtree)
        })