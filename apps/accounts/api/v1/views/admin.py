import logging
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
from apps.tenant.models import Organization
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
logger = logging.getLogger(__name__)

class AdminUserViewSet(BaseModelViewset):
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    queryset = User.objects.filter(is_deleted=False)
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

    def perform_create(self, serializer):
        tenant_id = serializer.validated_data.get('tenant_id')
        serializer.save(
            created_by=self.request.user,
            tenant_id=tenant_id
        )
    
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

    @action(detail=False, methods=['post'], url_path='bulk-import')
    def bulk_import(self, request):
        file_obj = request.FILES.get('file')
        tenant_id = request.data.get('tenant_id') or request.query_params.get('tenant_id')
        if not file_obj:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
        if not tenant_id:
            return Response({'error': 'tenant_id is required for superadmin bulk import'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            file_content = file_obj.read().decode('utf-8')
        except Exception as e:
            return Response({'error': f'Failed to decode file: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        
        from apps.accounts.services.registration.bulk import BulkUserImportService
        service = BulkUserImportService()
        success_count, errors, imported_data = service.import_users_from_csv(
            file_content=file_content,
            tenant_id=tenant_id,
            request_user=request.user,
            request=request
        )
        return Response({
            'success_count': success_count,
            'errors': errors,
            'imported_users': imported_data
        }, status=status.HTTP_200_OK if success_count > 0 or not errors else status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='bulk-export')
    def bulk_export(self, request):
        import csv
        from django.http import HttpResponse
        
        tenant_id = request.query_params.get('tenant_id')
        if not tenant_id:
            return Response({'error': 'tenant_id is required for superadmin bulk export'}, status=status.HTTP_400_BAD_REQUEST)
            
        users = User.objects.filter(tenant_id=tenant_id, is_deleted=False)
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="tenant_{tenant_id}_users_export.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['email', 'username', 'first_name', 'last_name', 'role', 'employee_id', 'department', 'title', 'is_active', 'is_verified', 'created_at'])
        
        for u in users:
            writer.writerow([
                u.email, u.username, u.first_name, u.last_name, u.role,
                u.employee_id, u.department, u.title, u.is_active, u.is_verified,
                u.created_at.isoformat() if u.created_at else ''
            ])
            
        return response

    @action(detail=True, methods=['post'], url_path='activate')
    def activate(self, request, pk=None):
        user = self.get_object()
        if user.is_active:
            return Response(
                {'message': 'User is already active'},
                status=status.HTTP_200_OK
            )
        user.is_active = True
        user.save(update_fields=['is_active'])
        AuditService().log(
            user=request.user,
            action='user.activated',
            action_type='update',
            request=request,
            severity='info',
            metadata={'target_user_id': str(user.id), 'target_email': user.email, 'context': 'superadmin'}
        )
        return Response({'message': 'User activated successfully'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='deactivate')
    def deactivate(self, request, pk=None):
        user = self.get_object()
        if not user.is_active:
            return Response(
                {'message': 'User is already deactivated'},
                status=status.HTTP_200_OK
            )
        user.is_active = False
        user.save(update_fields=['is_active'])
        from apps.accounts.services.auth.session import SessionService
        session_service = SessionService()
        terminated = session_service.terminate_all_sessions(user)
        AuditService().log(
            user=request.user,
            action='user.deactivated',
            action_type='update',
            request=request,
            severity='warning',
            metadata={
                'target_user_id': str(user.id),
                'target_email': user.email,
                'sessions_terminated': terminated,
                'context': 'superadmin'
            }
        )
        try:
            from apps.accounts.services.realtime import AccountsEventBroadcaster
            AccountsEventBroadcaster.user_deactivated(
                user_id=str(user.id),
                tenant_id=str(user.tenant_id),
                email=user.email,
                deactivated_by_id=str(request.user.id),
                sessions_terminated=terminated,
            )
        except ImportError:
            pass
        return Response({
            'message': 'User deactivated successfully',
            'sessions_terminated': terminated,
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='unlock')
    def unlock(self, request, pk=None):
        user = self.get_object()
        if not user.is_locked():
            return Response(
                {'message': 'User account is not locked'},
                status=status.HTTP_200_OK
            )
        user.reset_login_attempts()
        AuditService().log(
            user=request.user,
            action='user.unlocked',
            action_type='update',
            request=request,
            severity='info',
            metadata={'target_user_id': str(user.id), 'target_email': user.email, 'context': 'superadmin'}
        )
        return Response({'message': 'User unlocked successfully'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='verify')
    def verify(self, request, pk=None):
        user = self.get_object()
        if user.is_verified:
            return Response(
                {'message': 'User is already verified'},
                status=status.HTTP_200_OK
            )
        user.is_verified = True
        user.save(update_fields=['is_verified'])
        AuditService().log(
            user=request.user,
            action='user.verified',
            action_type='update',
            request=request,
            severity='info',
            metadata={'target_user_id': str(user.id), 'target_email': user.email, 'context': 'superadmin'}
        )
        return Response({'message': 'User verified successfully'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='map-to-organization')
    def map_to_organization(self, request, pk=None):
        """
        Map a user to a specific organization (tenant).
        Updates tenant_id on User, Profile, UserPreference, and UserSession.
        """
        user = self.get_object()
        organization_id = request.data.get('organization_id')
        if not organization_id:
            return Response({'error': 'organization_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            org = Organization.objects.get(id=organization_id, is_deleted=False)
        except (Organization.DoesNotExist, ValueError):
            return Response({'error': 'Invalid or non-existent organization_id'}, status=status.HTTP_404_NOT_FOUND)
            
        old_tenant_id = user.tenant_id
        
        from django.db import transaction
        from apps.accounts.models import Profile, UserPreference, UserSession
        
        with transaction.atomic():
            # Update User
            user.tenant_id = org.id
            user.save(update_fields=['tenant_id'])
            
            # Update Profile
            Profile.objects.filter(user=user).update(tenant_id=org.id)
            
            # Update UserPreference
            UserPreference.objects.filter(user=user).update(tenant_id=org.id)
            
            # Update UserSession
            UserSession.objects.filter(user=user).update(tenant_id=org.id)
            
        AuditService().log(
            user=request.user,
            action='user.mapped_to_organization',
            action_type='update',
            request=request,
            severity='warning',
            metadata={
                'target_user_id': str(user.id),
                'target_email': user.email,
                'old_tenant_id': str(old_tenant_id) if old_tenant_id else None,
                'new_tenant_id': str(org.id),
                'organization_name': org.name,
                'context': 'superadmin'
            }
        )
        
        return Response({
            'message': f"User {user.email} successfully mapped to organization {org.name}",
            'user_id': str(user.id),
            'organization_id': str(org.id)
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
    queryset = Organization.objects.all()
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

    @action(detail=True, methods=['post'], url_path='map-user')
    def map_user(self, request, pk=None):
        """
        Map a specific user to this organization.
        Updates tenant_id on User, Profile, UserPreference, and UserSession.
        """
        org = self.get_object()
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = User.objects.get(id=user_id, is_deleted=False)
        except (User.DoesNotExist, ValueError):
            return Response({'error': 'Invalid or non-existent user_id'}, status=status.HTTP_404_NOT_FOUND)
            
        old_tenant_id = user.tenant_id
        
        from django.db import transaction
        from apps.accounts.models import Profile, UserPreference, UserSession
        
        with transaction.atomic():
            # Update User
            user.tenant_id = org.id
            user.save(update_fields=['tenant_id'])
            
            # Update Profile
            Profile.objects.filter(user=user).update(tenant_id=org.id)
            
            # Update UserPreference
            UserPreference.objects.filter(user=user).update(tenant_id=org.id)
            
            # Update UserSession
            UserSession.objects.filter(user=user).update(tenant_id=org.id)
            
        AuditService().log(
            user=request.user,
            action='organization.user_mapped',
            action_type='update',
            request=request,
            severity='warning',
            metadata={
                'target_user_id': str(user.id),
                'target_email': user.email,
                'old_tenant_id': str(old_tenant_id) if old_tenant_id else None,
                'new_tenant_id': str(org.id),
                'organization_name': org.name,
                'context': 'superadmin'
            }
        )
        
        return Response({
            'message': f"User {user.email} successfully mapped to organization {org.name}",
            'user_id': str(user.id),
            'organization_id': str(org.id)
        }, status=status.HTTP_200_OK)
    
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
        total_tenants = Organization.objects.count()
        active_tenants = Organization.objects.filter(is_active=True).count()
        # Tenants by tier
        tiers = ['free', 'basic', 'pro', 'enterprise']
        tenants_by_tier = {}
        for tier in tiers:
            tenants_by_tier[tier] = Organization.objects.filter(subscription_tier=tier).count()
        return Response({
            'total_tenants': total_tenants,
            'active_tenants': active_tenants,
            'tenants_by_tier': tenants_by_tier
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
        total_tenants = Organization.objects.count()
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

    @action(detail=False, methods=['get'], url_path='health')
    def health(self, request):
        """Get system health status - FIXED without external dependency"""
        try:
            import platform
            import sys
            from django.db import connections
            from django.core.cache import cache
            
            # Check database
            db_status = 'healthy'
            try:
                connections['default'].cursor()
            except Exception as e:
                db_status = f'unhealthy: {str(e)}'
            
            # Check cache
            cache_status = 'healthy'
            try:
                cache.set('health_check', 'ok', 5)
                if cache.get('health_check') != 'ok':
                    cache_status = 'unhealthy'
            except Exception as e:
                cache_status = f'unhealthy: {str(e)}'
            
            return Response({
                'status': 'healthy' if db_status == 'healthy' and cache_status == 'healthy' else 'degraded',
                'timestamp': timezone.now().isoformat(),
                'database': db_status,
                'cache': cache_status,
                'python_version': sys.version,
                'platform': platform.platform(),
                'uptime': 'unknown'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}", exc_info=True)
            return Response({
                'status': 'unhealthy',
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)