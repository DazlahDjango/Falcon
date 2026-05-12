from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from apps.billing.models import Subscription
from apps.billing.api.v1.serializers import (
    SubscriptionSerializer, SubscriptionDetailSerializer,
    SubscriptionCreateSerializer, SubscriptionUpdateSerializer,
    SubscriptionCancelSerializer, SubscriptionReactivateSerializer,
    SubscriptionStatusSerializer, SubscriptionHistorySerializer
)
from apps.billing.api.v1.permission import (
    CanViewBilling, CanManageBilling,
)
from apps.accounts.api.v1.permissions import IsAdminOrSupervisor
from apps.billing.api.v1.views.base import BillingBaseViewSet
from apps.billing.services.subscription_service import SubscriptionService


class SubscriptionViewSet(BillingBaseViewSet):
    queryset = Subscription.objects.filter(is_deleted=False)
    permission_classes = [IsAuthenticated]
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'current', 'status']:
            return [IsAuthenticated(), CanViewBilling()]
        if self.action in ['create', 'update', 'cancel', 'reactivate']:
            return [IsAuthenticated(), CanManageBilling()]
        if self.action == 'history':
            return [IsAuthenticated(), IsAdminOrSupervisor()]
        return super().get_permissions()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SubscriptionCreateSerializer
        if self.action in ['update', 'partial_update']:
            return SubscriptionUpdateSerializer
        if self.action == 'cancel':
            return SubscriptionCancelSerializer
        if self.action == 'reactivate':
            return SubscriptionReactivateSerializer
        if self.action == 'current' or self.action == 'status':
            return SubscriptionStatusSerializer
        if self.action == 'history':
            return SubscriptionHistorySerializer
        if self.action == 'retrieve':
            return SubscriptionDetailSerializer
        return SubscriptionSerializer
    
    def get_queryset(self):
        """Filter subscriptions by tenant and role."""
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.role == 'super_admin':
            return queryset
        
        if hasattr(user, 'tenant_id') and user.tenant_id:
            return queryset.filter(tenant_id=user.tenant_id)
        
        return queryset.none()
    
    # ========================================================================
    # Custom Actions (use @action decorator)
    # ========================================================================
    
    @action(detail=False, methods=['get'], url_path='current', url_name='current')
    def current(self, request):
        """Get current subscription for the authenticated user's tenant."""
        tenant = self.get_tenant()
        
        if not tenant:
            return Response(
                {'error': 'No tenant associated with user'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        service = SubscriptionService()
        status_data = service.get_subscription_status(tenant)
        
        serializer = SubscriptionStatusSerializer(status_data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='status', url_name='status')
    def status(self, request):
        """Get subscription status for current tenant."""
        tenant = self.get_tenant()
        
        if not tenant:
            return Response(
                {'error': 'No tenant associated with user'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        service = SubscriptionService()
        status_data = service.get_subscription_status(tenant)
        
        return Response(status_data)
    
    # NOTE: NO @action decorator for 'create' - use the default POST method
    # The create action is automatically provided by DRF's ModelViewSet
    
    @action(detail=True, methods=['post'], url_path='cancel', url_name='cancel')
    def cancel(self, request, pk=None):
        """Cancel a subscription."""
        subscription = self.get_object()
        serializer = SubscriptionCancelSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        service = SubscriptionService()
        
        try:
            updated = service.cancel_subscription(
                subscription=subscription,
                at_period_end=serializer.validated_data['at_period_end'],
                cancelled_by=request.user,
                reason=serializer.validated_data.get('reason', '')
            )
            return Response(SubscriptionDetailSerializer(updated).data)
        except Exception as e:
            return self.handle_exception(e)
    
    @action(detail=True, methods=['post'], url_path='reactivate', url_name='reactivate')
    def reactivate(self, request, pk=None):
        """Reactivate a cancelled subscription."""
        subscription = self.get_object()
        
        service = SubscriptionService()
        
        try:
            updated = service.reactivate_subscription(
                subscription=subscription,
                reactivated_by=request.user
            )
            return Response(SubscriptionDetailSerializer(updated).data)
        except Exception as e:
            return self.handle_exception(e)
    
    @action(detail=True, methods=['get'], url_path='history', url_name='history')
    def history(self, request, pk=None):
        """Get subscription change history."""
        subscription = self.get_object()
        history = subscription.history.all().order_by('-created_at')[:50]
        serializer = SubscriptionHistorySerializer(history, many=True)
        
        return Response({
            'subscription_id': str(subscription.id),
            'history': serializer.data,
            'count': len(serializer.data)
        })
    
    @action(detail=True, methods=['post'], url_path='sync', url_name='sync')
    def sync(self, request, pk=None):
        """Sync subscription with Stripe."""
        subscription = self.get_object()
        
        if request.user.role != 'super_admin':
            return Response(
                {'error': 'Only super admin can trigger sync'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        service = SubscriptionService()
        
        try:
            updated = service.sync_with_stripe(subscription)
            return Response(SubscriptionDetailSerializer(updated).data)
        except Exception as e:
            return self.handle_exception(e)