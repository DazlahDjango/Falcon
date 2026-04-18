"""
Structure views for organisations API
"""

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.organisations.models import Department, Position, Team, Hierarchy
from apps.organisations.api.v1.serializers.structure import (
    DepartmentSerializer,
    DepartmentTreeSerializer,
    PositionSerializer,
    TeamSerializer,
    HierarchySerializer,
)
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from apps.organisations.api.v1.permissions import IsClientAdmin


class DepartmentViewSet(viewsets.ModelViewSet):
    """ViewSet for Department model"""
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated, IsClientAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['organisation', 'parent', 'manager', 'is_active']
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'created_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Department.objects.all()
        return Department.objects.filter(organisation=user.organisation)

    @action(detail=False, methods=['get'])
    def tree(self, request):
        """Get full department tree for organisation"""
        roots = Department.objects.filter(
            organisation=request.user.organisation,
            parent__isnull=True
        )
        serializer = DepartmentTreeSerializer(roots, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='sub-departments')
    def sub_departments(self, request, pk=None):
        """Get direct sub-departments"""
        department = self.get_object()
        subs = department.sub_departments.all()
        serializer = self.get_serializer(subs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def ancestors(self, request, pk=None):
        """Get flat list of ancestors"""
        department = self.get_object()
        ancestors = department.get_ancestors()
        serializer = self.get_serializer(ancestors, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def descendants(self, request, pk=None):
        """Get flat list of descendants"""
        department = self.get_object()
        descendants = department.get_descendants()
        serializer = self.get_serializer(descendants, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def move(self, request, pk=None):
        """Move department to new parent with cycle detection"""
        department = self.get_object()
        new_parent_id = request.data.get('parent_id')
        
        if new_parent_id:
            if str(new_parent_id) == str(department.id):
                return Response({"error": "Cannot move a department into itself"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Prevent circular reference
            descendant_ids = [str(d.id) for d in department.get_descendants(include_self=True)]
            if str(new_parent_id) in descendant_ids:
                return Response({"error": "Cannot move a department into its own descendant"}, status=status.HTTP_400_BAD_REQUEST)
            
            department.parent_id = new_parent_id
        else:
            department.parent = None
            
        department.save()
        return Response(self.get_serializer(department).data)

    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        """Get all users in this department and descendants"""
        department = self.get_object()
        from apps.accounts.models import User
        descendant_ids = [d.id for d in department.get_descendants(include_self=True)]
        users = User.objects.filter(
            models.Q(department_id__in=descendant_ids) | 
            models.Q(team__department_id__in=descendant_ids)
        ).distinct()
        
        # We'll use a simple serializer for members or the default UserSerializer if available
        # For now, let's return a summary
        data = [{"id": u.id, "email": u.email, "full_name": u.get_full_name()} for u in users]
        return Response(data)

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Get department metrics summary"""
        department = self.get_object()
        return Response({
            "id": department.id,
            "name": department.name,
            "headcount": department.get_member_count(),
            "sub_department_count": department.get_sub_department_count(),
            "team_count": department.teams.count()
        })


class PositionViewSet(viewsets.ModelViewSet):
    """ViewSet for Position model"""
    serializer_class = PositionSerializer
    permission_classes = [IsAuthenticated, IsClientAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['department', 'level', 'is_management']
    search_fields = ['title', 'code']
    ordering_fields = ['level', 'title']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Position.objects.all()
        return Position.objects.filter(department__organisation=user.organisation)


class TeamViewSet(viewsets.ModelViewSet):
    """ViewSet for Team model"""
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated, IsClientAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['department', 'team_lead']
    search_fields = ['name']
    ordering_fields = ['name']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Team.objects.all()
        return Team.objects.filter(department__organisation=user.organisation)

    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        """Get all users in this team"""
        team = self.get_object()
        from apps.accounts.models import User
        users = User.objects.filter(team=team)
        data = [{"id": u.id, "email": u.email, "full_name": u.get_full_name()} for u in users]
        return Response(data)

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Get team metrics summary"""
        team = self.get_object()
        return Response({
            "id": team.id,
            "name": team.name,
            "headcount": team.get_member_count()
        })


class HierarchyViewSet(viewsets.ModelViewSet):
    """ViewSet for Hierarchy model"""
    serializer_class = HierarchySerializer
    permission_classes = [IsAuthenticated, IsClientAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['organisation', 'employee', 'supervisor', 'level']
    search_fields = ['employee__email', 'supervisor__email']
    ordering_fields = ['level']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Hierarchy.objects.all()
        return Hierarchy.objects.filter(organisation=user.organisation)