# apps/tenant/api/v1/views/tenant_admin.py
"""
Tenant admin views for managing tenants.
Provides CRUD operations and special actions for tenant management.
"""

from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction

from apps.tenant.models import Client, TenantResource
from apps.tenant.constants import TenantStatus, SubscriptionPlan, ResourceType
from apps.tenant.api.v1.serializers import (
    TenantSerializer,
    TenantCreateSerializer,
    TenantUpdateSerializer,
    TenantDetailSerializer,
    TenantListSerializer,
)
from apps.tenant.api.v1.permissions import IsSuperAdmin, IsTenantAdmin, IsTenantUser
from apps.tenant.api.v1.throttles import TenantApiThrottle, AdminOperationThrottle
from apps.tenant.tasks import provision_tenant, suspend_tenant
from apps.tenant.services.monitoring.quota_enforcer import QuotaEnforcer


class TenantViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Tenant (Client) CRUD operations.

    Provides:
        - List all tenants (super admin only)
        - Create new tenant (super admin only)
        - Retrieve tenant details
        - Update tenant (tenant admin or super admin)
        - Delete tenant (super admin only)
        - Suspend/activate tenant
        - Get tenant usage statistics
    """

    queryset = Client.objects.filter(is_deleted=False)
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    throttle_classes = [TenantApiThrottle]

    def get_serializer_class(self):
        if self.action == 'create':
            return TenantCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return TenantUpdateSerializer
        elif self.action == 'retrieve':
            return TenantDetailSerializer
        elif self.action == 'list':
            return TenantListSerializer
        return TenantSerializer

    def get_permissions(self):
        """
        Set custom permissions based on action.
        """
        if self.action in ['update', 'partial_update', 'retrieve']:
            self.permission_classes = [IsAuthenticated, IsTenantAdmin]
        elif self.action == 'list':
            self.permission_classes = [IsAuthenticated, IsSuperAdmin]
        elif self.action == 'destroy':
            self.permission_classes = [IsAuthenticated, IsSuperAdmin]
        else:
            self.permission_classes = [IsAuthenticated, IsSuperAdmin]

        return super().get_permissions()

    def get_queryset(self):
        """
        Filter queryset based on query parameters.
        """
        queryset = super().get_queryset()

        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Filter by subscription plan
        plan = self.request.query_params.get('subscription_plan')
        if plan:
            queryset = queryset.filter(subscription_plan=plan)

        # Filter by is_active
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            is_active_bool = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active_bool)

        # Search by name or slug
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                models.Q(name__icontains=search) |
                models.Q(slug__icontains=search) |
                models.Q(contact_email__icontains=search)
            )

        # Order by
        ordering = self.request.query_params.get('ordering', '-created_at')
        queryset = queryset.order_by(ordering)

        return queryset

    def perform_create(self, serializer):
        """
        Create a new tenant and trigger provisioning.
        """
        with transaction.atomic():
            tenant = serializer.save()

            # Create default resource limits
            self._create_default_resources(tenant)

            # Trigger async provisioning
            provision_tenant_task.delay(str(tenant.id))

    def _create_default_resources(self, tenant):
        """
        Create default resource limits for new tenant.
        """
        default_limits = {
            ResourceType.USERS: tenant.max_users if hasattr(tenant, 'max_users') else 100,
            ResourceType.STORAGE_MB: tenant.max_storage_mb if hasattr(tenant, 'max_storage_mb') else 10240,
            ResourceType.API_CALLS_PER_DAY: 10000,
            ResourceType.KPIS: 500,
            ResourceType.DEPARTMENTS: 50,
            ResourceType.CONCURRENT_SESSIONS: 5,
        }

        for resource_type, limit in default_limits.items():
            TenantResource.objects.create(
                tenant=tenant,
                resource_type=resource_type,
                limit_value=limit,
                current_value=0,
                warning_threshold=80
            )

    @action(detail=True, methods=['post'], url_path='suspend')
    def suspend(self, request, pk=None):
        """
        Suspend a tenant.

        Suspended tenants cannot access the system.
        """
        tenant = self.get_object()

        if tenant.status == TenantStatus.SUSPENDED:
            return Response(
                {'error': 'Tenant is already suspended'},
                status=status.HTTP_400_BAD_REQUEST
            )

        tenant.status = TenantStatus.SUSPENDED
        tenant.save(update_fields=['status'])

        # Trigger async suspend tasks
        suspend_tenant_task.delay(str(tenant.id))

        return Response({
            'status': 'success',
            'message': f'Tenant {tenant.name} has been suspended',
            'tenant_id': str(tenant.id)
        })

    @action(detail=True, methods=['post'], url_path='activate')
    def activate(self, request, pk=None):
        """
        Activate a suspended tenant.
        """
        tenant = self.get_object()

        if tenant.status == TenantStatus.ACTIVE:
            return Response(
                {'error': 'Tenant is already active'},
                status=status.HTTP_400_BAD_REQUEST
            )

        tenant.status = TenantStatus.ACTIVE
        tenant.save(update_fields=['status'])

        return Response({
            'status': 'success',
            'message': f'Tenant {tenant.name} has been activated',
            'tenant_id': str(tenant.id)
        })

    @action(detail=True, methods=['get'], url_path='usage')
    def usage(self, request, pk=None):
        """
        Get detailed tenant usage statistics.
        """
        tenant = self.get_object()

        enforcer = QuotaEnforcer(str(tenant.id))
        usage_data = enforcer.check_all_quotas()

        return Response({
            'tenant_id': str(tenant.id),
            'tenant_name': tenant.name,
            'subscription_plan': tenant.subscription_plan,
            'subscription_expires_at': tenant.subscription_expires_at,
            'status': tenant.status,
            'usage': usage_data,
            'is_trial': tenant.subscription_plan == SubscriptionPlan.TRIAL,
            'days_until_expiry': self._get_days_until_expiry(tenant)
        })

    def _get_days_until_expiry(self, tenant):
        """Calculate days until subscription expires."""
        if tenant.subscription_expires_at:
            delta = tenant.subscription_expires_at - timezone.now()
            return max(0, delta.days)
        return None

    @action(detail=True, methods=['get'], url_path='resources')
    def resources(self, request, pk=None):
        """
        Get tenant resource limits and current usage.
        """
        tenant = self.get_object()

        resources = TenantResource.objects.filter(
            tenant=tenant, is_deleted=False)

        resource_data = []
        for r in resources:
            resource_data.append({
                'type': r.resource_type,
                'type_display': r.get_resource_type_display(),
                'limit': r.limit_value,
                'current': r.current_value,
                'percentage': round((r.current_value / r.limit_value) * 100, 1) if r.limit_value > 0 else 0,
                'warning_threshold': r.warning_threshold,
                'is_exceeded': r.current_value >= r.limit_value,
                'is_warning': r.current_value >= (r.limit_value * r.warning_threshold / 100)
            })

        return Response({
            'tenant_id': str(tenant.id),
            'tenant_name': tenant.name,
            'resources': resource_data
        })

    @action(detail=True, methods=['post'], url_path='update-limits')
    def update_limits(self, request, pk=None):
        """
        Update tenant resource limits (super admin only).
        """
        tenant = self.get_object()
        new_limits = request.data.get('limits', {})

        updated = []
        for resource_type, limit_value in new_limits.items():
            if resource_type in [rt for rt in ResourceType.values]:
                resource, created = TenantResource.objects.get_or_create(
                    tenant=tenant,
                    resource_type=resource_type,
                    defaults={'limit_value': limit_value, 'current_value': 0}
                )
                if not created:
                    resource.limit_value = limit_value
                    resource.save()
                updated.append(resource_type)

        return Response({
            'status': 'success',
            'message': f'Updated limits for: {", ".join(updated)}',
            'tenant_id': str(tenant.id)
        })


class TenantSuspendView(generics.GenericAPIView):
    """View to suspend a tenant."""
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    throttle_classes = [AdminOperationThrottle]

    def post(self, request, pk):
        tenant = get_object_or_404(Client, id=pk, is_deleted=False)

        if tenant.status == TenantStatus.SUSPENDED:
            return Response(
                {'error': 'Tenant is already suspended'},
                status=status.HTTP_400_BAD_REQUEST
            )

        tenant.status = TenantStatus.SUSPENDED
        tenant.save(update_fields=['status'])

        suspend_tenant_task.delay(str(tenant.id))

        return Response({
            'message': f'Tenant {tenant.name} suspended',
            'tenant_id': str(tenant.id)
        })


class TenantActivateView(generics.GenericAPIView):
    """View to activate a tenant."""
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    throttle_classes = [AdminOperationThrottle]

    def post(self, request, pk):
        tenant = get_object_or_404(Client, id=pk, is_deleted=False)

        if tenant.status == TenantStatus.ACTIVE:
            return Response(
                {'error': 'Tenant is already active'},
                status=status.HTTP_400_BAD_REQUEST
            )

        tenant.status = TenantStatus.ACTIVE
        tenant.save(update_fields=['status'])

        return Response({
            'message': f'Tenant {tenant.name} activated',
            'tenant_id': str(tenant.id)
        })


class TenantProvisioningStatusView(generics.GenericAPIView):
    """View to check tenant provisioning status."""
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request, pk):
        tenant = get_object_or_404(Client, id=pk, is_deleted=False)

        return Response({
            'tenant_id': str(tenant.id),
            'tenant_name': tenant.name,
            'status': tenant.status,
            'is_provisioned': tenant.status == TenantStatus.ACTIVE and tenant.provisioned_at is not None,
            'provisioned_at': tenant.provisioned_at,
            'created_at': tenant.created_at,
        })


class TenantUsageView(generics.GenericAPIView):
    """View to get tenant usage summary."""
    permission_classes = [IsAuthenticated, IsTenantAdmin]

    def get(self, request, pk):
        tenant = get_object_or_404(Client, id=pk, is_deleted=False)

        enforcer = QuotaEnforcer(str(tenant.id))
        usage = enforcer.check_all_quotas()

        return Response({
            'tenant_id': str(tenant.id),
            'tenant_name': tenant.name,
            'subscription_plan': tenant.subscription_plan,
            'usage': usage,
            'warnings': enforcer.get_warnings()
        })


class TenantResourcesView(generics.GenericAPIView):
    """View to get tenant resources."""
    permission_classes = [IsAuthenticated]

    def get(self, request, tenant_id):
        tenant = get_object_or_404(Client, id=tenant_id, is_deleted=False)

        # Check permission
        if not request.user.is_superuser:
            user_tenant_id = getattr(request.user, 'tenant_id', None)
            if str(user_tenant_id) != str(tenant_id):
                return Response(
                    {'error': 'Access denied'},
                    status=status.HTTP_403_FORBIDDEN
                )

        resources = TenantResource.objects.filter(
            tenant=tenant, is_deleted=False)

        return Response({
            'tenant_id': str(tenant.id),
            'tenant_name': tenant.name,
            'resources': {
                r.resource_type: {
                    'limit': r.limit_value,
                    'current': r.current_value,
                    'warning_threshold': r.warning_threshold,
                    'percentage': round((r.current_value / r.limit_value) * 100, 1) if r.limit_value > 0 else 0,
                }
                for r in resources
            }
        })
