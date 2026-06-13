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
    """
    Role ViewSet for managing roles and permissions.
    
    Actions:
    - list: Get all roles (admin/super_admin only)
    - retrieve: Get role details
    - create: Create new role (super_admin only)
    - update: Update role (super_admin only)
    - delete: Delete role (super_admin only, system roles protected)
    - system_roles: Get all system roles
    - assignable_roles: Get roles that can be assigned by current user
    - role_permissions: Get permissions for a role
    - assign_permissions: Assign permissions to a role
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
            # Allow both Client Admin and Super Admin to view roles
            self.permission_classes = [IsAuthenticated, IsClientAdmin]
        else:
            self.permission_classes = [IsAuthenticated]
        
        return super().get_permissions()
    
    def get_queryset(self):
        """Filter queryset by tenant"""
        qs = super().get_queryset()
        
        # Super admins see all roles
        if self.request.user.is_superuser:
            return qs
        
        # Client admins see roles in their tenant plus system roles
        if self.request.user.role == 'client_admin':
            return qs.filter(
                models.Q(tenant_id=self.request.user.tenant_id) |
                models.Q(is_system=True)
            )
        
        # Regular users see only assignable roles
        return qs.filter(is_assignable=True, is_deleted=False)
    
    def destroy(self, request, *args, **kwargs):
        """Delete a role - system roles cannot be deleted"""
        instance = self.get_object()
        
        if instance.is_system:
            return Response(
                {'error': 'Cannot delete a system role'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'], url_path='system')
    def system_roles(self, request):
        """Get all system roles"""
        roles = self.get_queryset().filter(is_system=True)
        serializer = RoleListSerializer(roles, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='assignable')
    def assignable_roles(self, request):
        """
        Get roles that can be assigned by the current user.
        Uses RBAC service to determine assignable roles based on user's role.
        """
        rbac_service = RBACService()
        
        # For super_admin and client_admin, get all assignable roles
        if request.user.is_superuser or request.user.role == 'client_admin':
            roles = self.get_queryset().filter(is_assignable=True, is_deleted=False)
        else:
            # For other users, only roles they can assign
            roles = rbac_service.get_assignable_roles(request.user)
        
        serializer = RoleListSerializer(roles, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'], url_path='permissions')
    def role_permissions(self, request, pk=None):
        """Get all permissions for a role"""
        role = self.get_object()
        permissions = role.get_all_permissions()
        
        # Format permissions for response
        formatted_permissions = []
        for perm in permissions:
            if isinstance(perm, dict):
                formatted_permissions.append(perm)
            else:
                formatted_permissions.append({
                    'codename': perm,
                    'name': perm.replace('_', ' ').title()
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
    
    @action(detail=True, methods=['post'], url_path='permissions')
    def assign_permissions(self, request, pk=None):
        """
        Assign permissions to a role.
        Expects: {'permission_ids': ['uuid1', 'uuid2', ...]}
        """
        role = self.get_object()
        
        # Check if role is system role
        if role.is_system:
            return Response(
                {'error': 'Cannot modify permissions of a system role'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        permission_ids = request.data.get('permission_ids', [])
        
        if permission_ids:
            # Validate permissions exist
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
        
        # Log the action
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