from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db import connection
from django.utils import timezone
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from apps.accounts.models import User, Role, Permission, AuditLog
from apps.tenant.models import Client
from apps.accounts.api.v1.serializers import (
    UserSerializer, UserCreationSerializer, UserUpdateSerializer, RoleSerializer, RoleCreateSerializer, RoleUpdateSerializer, RoleListSerializer,
    PermissionSerializer, PermissionListSerializer, TenantSerializer, TenantCreateSerializer, TenantUpdateSerializer
)
from apps.accounts.api.v1.filters import UserFilter
from apps.accounts.api.v1.permissions import IsSuperAdmin
from apps.accounts.constants import UserRoles
from apps.accounts.managers import RoleManager, PermissionManager
from apps.accounts.constants import PREDEFINED_PERMISSIONS_DATA
from apps.accounts.services import TenantRegistrationService, AuditService, JWTServices, PasswordService
from apps.accounts.tasks import send_password_reset_email
from .base import BaseModelViewset

class AdminUserViewSet(BaseModelViewset):
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    queryset = User.objects.all()
    filterset_class = UserFilter
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering_fields = ['email', 'created_at', 'last_login']
    ordering = ['-created_at']
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreationSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer
    
    @action(detail=True, methods=['post'], url_path='impersonate')
    def impersonate(self, request, pk=None):
        target_user = self.get_object()
        jwt_service = JWTServices()
        tokens = jwt_service.create_token(target_user)
        audit_service = AuditService()
        audit_service.log(
            user=request.user,
            action='admin.impersonate',
            action_type='security',
            request=request,
            severity='warning',
            metadata={'impersonated_user': target_user.email}
        )
        return Response({
            'message': f"Impersonating {target_user.email}",
            'tokens': tokens
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='force-password-reset')
    def force_password_reset(self, request, pk=None):
        target_user = self.get_object()
        password_service = PasswordService()
        token = password_service._generate_reset_token(target_user)
        send_password_reset_email.delay(str(target_user.id), token)
        return Response({
            'message': f'Password reset email sent to {target_user.email}'
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        verified_users = User.objects.filter(is_verified=True).count()
        mfa_enabled_users = User.objects.filter(mfa_enabled=True).count()
        users_by_role = {}
        for role_code, _label in UserRoles.CHOICES:
            users_by_role[role_code] = User.objects.filter(role=role_code).count()
        return Response({
            'total_users': total_users,
            'active_users': active_users,
            'verified_users': verified_users,
            'mfa_enabled_users': mfa_enabled_users,
            'users_by_role': users_by_role
        }, status=status.HTTP_200_OK)
    
class AdminRoleViewSet(BaseModelViewset):
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    queryset = Role.objects.all()
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'order', 'created_at']
    ordering = ['order', 'name']
    def get_serializer_class(self):
        if self.action == 'create':
            return RoleCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return RoleUpdateSerializer
        return RoleSerializer
    
    @action(detail=False, methods=['post'], url_path='init-system-roles')
    def init_system_roles(self, request):
        role_manager = RoleManager()
        roles = role_manager.create_system_roles()
        serializer = RoleListSerializer(roles, many=True, context={'request': request})
        return Response({
            'message': 'System roles initialized',
            'roles': serializer.data
        }, status=status.HTTP_200_OK)
    
class AdminPermissionViewSet(BaseModelViewset):
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    queryset = Permission.objects.all()
    search_fields = ['name', 'codename']
    ordering_fields = ['name', 'category', 'level']
    ordering = ['category', 'name']
    def get_serializer_class(self):
        if self.action == 'create':
            return PermissionSerializer
        return PermissionSerializer
    
    @action(detail=False, methods=['post'], url_path='init-permissions')
    def init_permissions(self, request):
        content_type = ContentType.objects.get_for_model(User)
        permission_manager = PermissionManager()
        permissions = permission_manager.bulk_create_predefined(
            content_type=content_type,
            permissions_data=PREDEFINED_PERMISSIONS_DATA
        )
        serializer = PermissionListSerializer(permissions, many=True, context={'request': request})
        return Response({
            'message': 'Permissions initialized',
            'count': len(permissions),
            'permissions': serializer.data
        }, status=status.HTTP_200_OK)
    
class AdminTenantViewSet(BaseModelViewset):
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    queryset = Client.objects.all()
    search_fields = ['name', 'slug', 'domain']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TenantCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return TenantUpdateSerializer
        return TenantSerializer
    
    @action(detail=True, methods=['post'], url_path='suspend')
    def suspend(self, request, pk=None):
        tenant = self.get_object()
        tenant.is_active = False
        tenant.save(update_fields=['is_active'])
        return Response({'message': f'Tenant {tenant.name} suspended'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='activate')
    def activate(self, request, pk=None):
        tenant = self.get_object()
        tenant.is_active = True
        tenant.save(update_fields=['is_active'])
        return Response({'message': f'Tenant {tenant.name} activated'}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], url_path='create-with-admin')
    def create_with_admin(self, request):
        serializer = TenantCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tenant_registration = TenantRegistrationService()
        # Extract admin data
        admin_data = {
            'admin_email': request.data.get('admin_email'),
            'admin_username': request.data.get('admin_username'),
            'admin_password': request.data.get('admin_password'),
            'admin_first_name': request.data.get('admin_first_name', ''),
            'admin_last_name': request.data.get('admin_last_name', '')
        }
        if not admin_data['admin_email'] or not admin_data['admin_username'] or not admin_data['admin_password']:
            return Response(
                {'error': 'Admin email, username, and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        result, error = tenant_registration.register_tenant(
            company_name=serializer.validated_data['name'],
            admin_email=admin_data['admin_email'],
            admin_username=admin_data['admin_username'],
            admin_password=admin_data['admin_password'],
            admin_first_name=admin_data['admin_first_name'],
            admin_last_name=admin_data['admin_last_name'],
            subscription_plan=serializer.validated_data.get('subscription_plan', 'trial'),
            request=request
        )
        if error:
            return Response({'error': error}, status=status.HTTP_400_BAD_REQUEST)
        return Response(result, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        total_tenants = Client.objects.count()
        active_tenants = Client.objects.filter(is_active=True).count()
        # Tenants by plan
        plans = ['trial', 'basic', 'professional', 'enterprise']
        tenants_by_plan = {}
        for plan in plans:
            tenants_by_plan[plan] = Client.objects.filter(subscription_plan=plan).count()
        return Response({
            'total_tenants': total_tenants,
            'active_tenants': active_tenants,
            'tenants_by_plan': tenants_by_plan
        }, status=status.HTTP_200_OK)
    
class AdminSystemView(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    def list(self, request):
        db_connection = connection
        db_status = 'connected' if db_connection.is_usable() else 'disconnected'
        cache_status = 'connected'
        try:
            from django.core.cache import cache
            cache.set('health_check', 'ok', 10)
            cache.get('health_check')
        except Exception:
            cache_status = 'disconnected'
        total_users = User.objects.count()
        total_tenants = Client.objects.count()
        total_audit_logs = AuditLog.objects.count()
        yesterday = timezone.now() - timezone.timedelta(hours=24)
        recent_logins = AuditLog.objects.filter(
            action='user.login',
            timestamp__gte=yesterday
        ).count()
        return Response({
            'system': {
                'name': 'Falcon PMS Accounts',
                'version': '1.0.0',
                'environment': getattr(settings, 'DJANGO_ENV', 'production'),
                'time': timezone.now().isoformat()
            },
            'database': {
                'status': db_status,
                'engine': connection.vendor
            },
            'cache': {
                'status': cache_status
            },
            'statistics': {
                'total_users': total_users,
                'total_tenants': total_tenants,
                'total_audit_logs': total_audit_logs,
                'recent_logins_24h': recent_logins
            }
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], url_path='clear-cache')
    def clear_cache(self, request):
        try:
            from django.core.cache import cache
            cache.clear()
            return Response({'message': 'Cache cleared successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)