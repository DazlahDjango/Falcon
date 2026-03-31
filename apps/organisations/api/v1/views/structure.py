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
    PositionSerializer,
    TeamSerializer,
    HierarchySerializer,
)
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