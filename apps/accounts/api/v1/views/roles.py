from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from apps.accounts.models import Role
from apps.accounts.services import RBACService
from apps.accounts.managers import RoleManager
from apps.accounts.api.v1.serializers import (
    RoleSerializer, RoleCreateSerializer, RoleUpdateSerializer,
    RoleListSerializer, RoleDetailSerializer
)
from apps.accounts.api.v1.permissions import IsSuperAdmin, IsClientAdmin
from .base import BaseModelViewset

class RoleViewSet(BaseModelViewset):
    queryset = Role.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['role_type', 'is_system', 'is_assignable']
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'order', 'created_at']
    ordering = ['order', 'name']
    def get_serializer_class(self):
        if self.action == 'create':
            return RoleCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return RoleUpdateSerializer
        elif self.action == 'list':
            return RoleListSerializer
        elif self.action == 'retrieve':
            return RoleDetailSerializer
        return RoleSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAuthenticated, IsSuperAdmin]
        else:
            self.permission_classes = [IsAuthenticated, IsClientAdmin]
        return super().get_permissions()
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.is_system:
            return Response({'error': 'Cannot delete a system role'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'], url_path='system')
    def system_roles(self, request):
        roles = self.get_queryset().filter(is_system=True)
        serializer = RoleListSerializer(roles, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='assignable')
    def assignable_roles(self, request):
        rbac_service = RBACService()
        role_manager = RoleManager()
        roles = role_manager.get_roles_for_user(request.user)
        serializer = RoleListSerializer(roles, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'], url_path='permissions')
    def role_permissions(self, request, pk=None):
        role = self.get_object()
        permissions = role.get_all_permissions()
        return Response({
            'role': role.name,
            'permission_count': len(permissions),
            'permissions': list(permissions)
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='permissions')
    def assign_permissions(self, request, pk=None):
        role = self.get_object()
        permission_ids = request.data.get('permission_ids', [])
        if permission_ids:
            role.permissions.set(permission_ids)
        else:
            role.permissions.clear()
        return Response({'message': 'Permissions updated successfully'}, status=status.HTTP_200_OK)