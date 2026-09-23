from django.db import models
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
from apps.accounts.constants import PREDEFINED_PERMISSIONS_DATA
from .base import BaseModelViewset


class RoleViewSet(BaseModelViewset):
    """
    Role ViewSet for managing roles and permissions.
    """
    
    queryset = Role.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['role_type', 'is_system', 'is_assignable']
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'order', 'created_at']
    ordering = ['order', 'name']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        action_serializers = {
            'create': RoleCreateSerializer,
            'update': RoleUpdateSerializer,
            'partial_update': RoleUpdateSerializer,
            'list': RoleListSerializer,
            'retrieve': RoleDetailSerializer,
        }
        return action_serializers.get(self.action, RoleSerializer)
    
    def get_permissions(self):
        """
        Set permissions based on action.
        - Write actions: Super Admin only
        - Read actions: Client Admin or Super Admin
        """
        write_actions = ['create', 'update', 'partial_update', 'destroy', 
                         'assign_permissions']
        read_actions = ['list', 'retrieve', 'system_roles', 'assignable_roles', 
                        'role_permissions']
        
        if self.action in write_actions:
            self.permission_classes = [IsAuthenticated, IsSuperAdmin]
        elif self.action in read_actions:
            self.permission_classes = [IsAuthenticated, IsClientAdmin]
        else:
            self.permission_classes = [IsAuthenticated]
        
        return super().get_permissions()
    
    def get_queryset(self):
        """Filter queryset by tenant and include system roles"""
        qs = Role.objects.all()
        
        if self.request.user.is_superuser or getattr(self.request.user, 'role', None) == 'super_admin':
            return qs
        
        if getattr(self.request.user, 'role', None) == 'client_admin':
            return qs.filter(
                models.Q(tenant_id=self.request.user.tenant_id) |
                models.Q(tenant_id__isnull=True) |
                models.Q(is_system=True) |
                models.Q(role_type='system')
            )
        
        return qs.filter(
            models.Q(tenant_id=self.request.user.tenant_id) |
            models.Q(tenant_id__isnull=True) |
            models.Q(is_system=True) |
            models.Q(role_type='system'),
            is_assignable=True,
            is_deleted=False
        )
    
    def destroy(self, request, *args, **kwargs):
        """Delete a role - system roles cannot be deleted"""
        instance = self.get_object()
        
        if instance.is_system or instance.role_type == 'system':
            return Response(
                {'error': 'Cannot delete a system role'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'], url_path='system')
    def system_roles(self, request):
        """Get all system roles"""
        roles = Role.objects.filter(models.Q(is_system=True) | models.Q(role_type='system'), is_deleted=False)
        serializer = RoleListSerializer(roles, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='assignable')
    def assignable_roles(self, request):
        """
        Get roles that can be assigned by the current user.
        Uses RBAC service to determine assignable roles based on user's role.
        """
        rbac_service = RBACService()
        
        if request.user.is_superuser or request.user.role in ['super_admin', 'client_admin']:
            roles = self.get_queryset().filter(is_assignable=True, is_deleted=False)
        else:
            roles = rbac_service.get_assignable_roles(request.user)
        
        serializer = RoleListSerializer(roles, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get', 'post'], url_path='permissions')
    def permissions(self, request, pk=None):
        """Get or assign permissions for a role."""
        role = self.get_object()
        
        if request.method == 'GET':
            rbac_service = RBACService()
            perm_codenames = rbac_service.get_role_default_permissions(role.code)
            
            # Build map from PREDEFINED_PERMISSIONS_DATA for rich metadata
            meta_map = {p['codename']: p for p in PREDEFINED_PERMISSIONS_DATA}
            
            formatted_permissions = []
            for codename in perm_codenames:
                if codename in meta_map:
                    formatted_permissions.append(meta_map[codename])
                else:
                    formatted_permissions.append({
                        'codename': codename,
                        'name': codename.replace('_', ' ').title(),
                        'category': 'general',
                        'level': 'tenant'
                    })
            
            return Response({
                'role': {
                    'id': str(role.id),
                    'name': role.name,
                    'code': role.code
                },
                'permission_count': len(formatted_permissions),
                'permissions': formatted_permissions
            }, status=status.HTTP_200_OK)
        
        elif request.method == 'POST':
            # Check if role is system role
            if role.is_system or role.role_type == 'system':
                return Response(
                    {'error': 'Cannot modify permissions of a system role'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            permission_ids = request.data.get('permission_ids', [])
            
            if permission_ids:
                from apps.accounts.models import Permission
                permissions = Permission.objects.filter(id__in=permission_ids, is_deleted=False)
                
                if len(permissions) != len(permission_ids):
                    return Response(
                        {'error': 'Some permissions not found'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                role.permissions.set(permissions)
                message = f'Assigned {len(permissions)} permissions to role {role.name}'
            else:
                role.permissions.clear()
                message = f'Cleared all permissions from role {role.name}'
            
            from apps.accounts.services import AuditService
            AuditService().log(
                user=request.user,
                action='role.permissions_updated',
                action_type='update',
                request=request,
                severity='info',
                metadata={
                    'role_id': str(role.id),
                    'role_name': role.name,
                    'permission_count': len(permission_ids)
                }
            )
            
            return Response({
                'message': message,
                'permission_count': len(permission_ids)
            }, status=status.HTTP_200_OK)