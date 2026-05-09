# apps/tenant/api/v1/views/tenant_admin.py
"""
Tenant admin views for managing tenants.
Provides CRUD operations and special actions for tenant management.
"""

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.db import models  # ✅ Added for Q objects in search
from django.db import transaction
from django.utils import timezone

from apps.tenant.models import Client, TenantResource
from apps.tenant.constants import SubscriptionPlan, ResourceType
from apps.tenant.api.v1.serializers import (
    TenantSerializer,
    TenantCreateSerializer,
    TenantUpdateSerializer,
    TenantDetailSerializer,
    TenantListSerializer,
)
from apps.tenant.api.v1.permissions import IsSuperAdmin, IsTenantAdmin
from apps.tenant.api.v1.throttles import TenantApiThrottle
from apps.tenant.tasks import provision_tenant, suspend_tenant
from apps.tenant.services.monitoring.quota_enforcer import QuotaEnforcer


class TenantViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Tenant (Client) management.
    
    Provides complete tenant lifecycle management including:
        - CRUD operations
        - Activation/Suspension
        - Resource limit management
        - Usage monitoring
    """

    queryset = Client.objects.filter(is_deleted=False)
    permission_classes = [IsAuthenticated]
    throttle_classes = [TenantApiThrottle]

    # ========== Serializer Management ==========
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        action_serializers = {
            'create': TenantCreateSerializer,
            'update': TenantUpdateSerializer,
            'partial_update': TenantUpdateSerializer,
            'retrieve': TenantDetailSerializer,
            'list': TenantListSerializer,
        }
        return action_serializers.get(self.action, TenantSerializer)

    # ========== Permission Management ==========
    def get_permissions(self):
        """Set custom permissions based on action."""
        # Super admin only actions
        if self.action in ['create', 'destroy', 'list', 'update_limits']:
            self.permission_classes = [IsAuthenticated, IsSuperAdmin]
        # Tenant admin or super admin for these
        elif self.action in ['update', 'partial_update', 'retrieve']:
            self.permission_classes = [IsAuthenticated, IsTenantAdmin]
        else:
            self.permission_classes = [IsAuthenticated]
        
        return super().get_permissions()

    # ========== CRUD Overrides ==========
    def get_queryset(self):
        """
        Filter and order queryset based on query parameters.
        """
        queryset = super().get_queryset()
        qs_filter = {}

        # Filter by subscription plan
        plan = self.request.query_params.get('subscription_plan')
        if plan:
            qs_filter['subscription_plan'] = plan

        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            qs_filter['is_active'] = is_active.lower() == 'true'

        # Filter by verified status
        is_verified = self.request.query_params.get('is_verified')
        if is_verified is not None:
            qs_filter['is_verified'] = is_verified.lower() == 'true'

        queryset = queryset.filter(**qs_filter)

        # Search across multiple fields
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                models.Q(name__icontains=search) |
                models.Q(slug__icontains=search) |
                models.Q(contact_email__icontains=search) |
                models.Q(domain__icontains=search)
            )

        # Ordering (default: newest first)
        ordering = self.request.query_params.get('ordering', '-created_at')
        return queryset.order_by(ordering)

    def perform_create(self, serializer):
        """Create tenant with default resources and trigger async provisioning."""
        with transaction.atomic():
            tenant = serializer.save()
            self._create_default_resources(tenant)
            provision_tenant.delay(str(tenant.id))

    def _create_default_resources(self, tenant):
        """Create default resource limits for new tenant."""
        # Get features from tenant or use defaults
        features = tenant.features or {}
        
        default_limits = {
            ResourceType.USERS: features.get('max_users', 100),
            ResourceType.STORAGE_MB: features.get('max_storage_mb', 10240),
            ResourceType.API_CALLS_PER_DAY: 10000,
            ResourceType.KPIS: features.get('max_kpis', 500),
            ResourceType.DEPARTMENTS: 50,
            ResourceType.CONCURRENT_SESSIONS: 5,
        }

        for resource_type, limit in default_limits.items():
            TenantResource.objects.get_or_create(
                tenant=tenant,
                resource_type=resource_type,
                defaults={
                    'limit_value': limit,
                    'current_value': 0,
                    'warning_threshold': 80
                }
            )

    # ========== Tenant Lifecycle Actions ==========
    @action(detail=True, methods=['post'], url_path='activate')
    def activate(self, request, pk=None):
        """
        Activate a tenant.
        
        POST /api/v1/tenant/tenants/{id}/activate/
        """
        tenant = self.get_object()

        if tenant.is_active:
            return Response(
                {'error': 'Tenant is already active'},
                status=status.HTTP_400_BAD_REQUEST
            )

        tenant.is_active = True
        tenant.save(update_fields=['is_active', 'updated_at'])

        return Response({
            'success': True,
            'message': f'Tenant {tenant.name} has been activated',
            'tenant_id': str(tenant.id),
            'is_active': tenant.is_active
        })

    @action(detail=True, methods=['post'], url_path='suspend')
    def suspend(self, request, pk=None):
        """
        Suspend a tenant.
        
        POST /api/v1/tenant/tenants/{id}/suspend/
        """
        tenant = self.get_object()

        if not tenant.is_active:
            return Response(
                {'error': 'Tenant is already suspended'},
                status=status.HTTP_400_BAD_REQUEST
            )

        tenant.is_active = False
        tenant.save(update_fields=['is_active', 'updated_at'])

        # Trigger async cleanup tasks
        suspend_tenant.delay(str(tenant.id))

        return Response({
            'success': True,
            'message': f'Tenant {tenant.name} has been suspended',
            'tenant_id': str(tenant.id),
            'is_active': tenant.is_active
        })

    @action(detail=True, methods=['get'], url_path='provisioning-status')
    def provisioning_status(self, request, pk=None):
        """
        Check tenant provisioning status.
        
        GET /api/v1/tenant/tenants/{id}/provisioning-status/
        """
        tenant = self.get_object()

        return Response({
            'tenant_id': str(tenant.id),
            'tenant_name': tenant.name,
            'is_active': tenant.is_active,
            'is_verified': tenant.is_verified,
            'is_provisioned': tenant.is_active and tenant.provisioned_at is not None,
            'provisioned_at': tenant.provisioned_at,
            'created_at': tenant.created_at,
            'updated_at': tenant.updated_at,
        })

    @action(detail=True, methods=['get'], url_path='usage-summary')
    def usage_summary(self, request, pk=None):
        """
        Get tenant usage summary (high-level).
        
        GET /api/v1/tenant/tenants/{id}/usage-summary/
        """
        tenant = self.get_object()
        enforcer = QuotaEnforcer(str(tenant.id))
        
        usage_data = enforcer.check_all_quotas()
        
        return Response({
            'tenant_id': str(tenant.id),
            'tenant_name': tenant.name,
            'subscription_plan': tenant.subscription_plan,
            'subscription_expires_at': tenant.subscription_expires_at,
            'is_active': tenant.is_active,
            'is_verified': tenant.is_verified,
            'is_trial': tenant.subscription_plan == SubscriptionPlan.TRIAL,
            'days_until_expiry': self._get_days_until_expiry(tenant),
            'usage': usage_data,
            'warnings': enforcer.get_warnings()
        })

    @action(detail=True, methods=['get'], url_path='usage')
    def detailed_usage(self, request, pk=None):
        """
        Get detailed tenant usage (for reports).
        
        GET /api/v1/tenant/tenants/{id}/usage/
        Query params: start_date, end_date, resource_type
        """
        tenant = self.get_object()
        enforcer = QuotaEnforcer(str(tenant.id))
        
        # Get date range from query params
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        resource_type = request.query_params.get('resource_type')
        
        usage_data = enforcer.check_all_quotas()
        
        # Filter by resource type if specified
        if resource_type:
            usage_data = {resource_type: usage_data.get(resource_type)}
        
        return Response({
            'tenant_id': str(tenant.id),
            'tenant_name': tenant.name,
            'period': {'start_date': start_date, 'end_date': end_date},
            'usage': usage_data
        })

    @action(detail=True, methods=['get'], url_path='resources')
    def resources(self, request, pk=None):
        """
        Get tenant resource limits and current usage.
        
        GET /api/v1/tenant/tenants/{id}/resources/
        """
        tenant = self.get_object()
        
        resources = TenantResource.objects.filter(tenant=tenant, is_deleted=False)
        
        resource_data = []
        for r in resources:
            percentage = round((r.current_value / r.limit_value) * 100, 1) if r.limit_value > 0 else 0
            resource_data.append({
                'type': r.resource_type,
                'type_display': r.get_resource_type_display(),
                'limit': r.limit_value,
                'current': r.current_value,
                'percentage': percentage,
                'warning_threshold': r.warning_threshold,
                'is_exceeded': r.current_value >= r.limit_value,
                'is_warning': percentage >= r.warning_threshold,
                'remaining': max(0, r.limit_value - r.current_value)
            })

        return Response({
            'tenant_id': str(tenant.id),
            'tenant_name': tenant.name,
            'resources': resource_data,
            'summary': {
                'total_resources': len(resource_data),
                'resources_exceeded': sum(1 for r in resource_data if r['is_exceeded']),
                'resources_warning': sum(1 for r in resource_data if r['is_warning'] and not r['is_exceeded'])
            }
        })

    @action(detail=True, methods=['post'], url_path='update-limits')
    def update_limits(self, request, pk=None):
        """
        Update tenant resource limits.
        
        POST /api/v1/tenant/tenants/{id}/update-limits/
        Body: {"limits": {"users": 500, "storage_mb": 20480}}
        """
        tenant = self.get_object()
        new_limits = request.data.get('limits', {})
        
        if not new_limits:
            return Response(
                {'error': 'No limits provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        updated = []
        for resource_type, limit_value in new_limits.items():
            # Convert string resource types to enum values if needed
            resource_key = resource_type.upper() if isinstance(resource_type, str) else resource_type
            
            if resource_key in [rt.name for rt in ResourceType]:
                resource, created = TenantResource.objects.get_or_create(
                    tenant=tenant,
                    resource_type=resource_key,
                    defaults={
                        'limit_value': limit_value,
                        'current_value': 0,
                        'warning_threshold': 80
                    }
                )
                if not created:
                    resource.limit_value = limit_value
                    resource.save(update_fields=['limit_value', 'updated_at'])
                updated.append(resource_type)

        return Response({
            'success': True,
            'message': f'Updated limits for: {", ".join(updated)}',
            'updated_limits': new_limits,
            'tenant_id': str(tenant.id)
        })

    # ========== Helper Methods ==========
    def _get_days_until_expiry(self, tenant):
        """Calculate days until subscription expires."""
        if tenant.subscription_expires_at:
            delta = tenant.subscription_expires_at - timezone.now()
            return max(0, delta.days)
        return None