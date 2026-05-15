from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.utils import timezone
from ....models import Subscription
from ....services.subscription.lifecycle import SubscriptionLifecycleService
from ....services.subscription.renewal import RenewalService
from ....services.subscription.upgrade_downgrade import PlanChangeService
from ....services.audit.logger import audit_logger
from ..serializers import (
    SubscriptionSerializer,
    SubscriptionListSerializer,
    SubscriptionDetailSerializer,
    SubscriptionCreateSerializer,
    SubscriptionUpdateSerializer,
    SubscriptionCancelSerializer,
    SubscriptionRenewSerializer,
)
from ..permissions import CanManageSubscriptions, CanViewBilling, IsSameTenant
from ..throttles import SubscriptionChangeThrottle, BillingReportThrottle
from ..filters import SubscriptionFilter


class SubscriptionViewSet(viewsets.ModelViewSet):
    """
    Subscription ViewSet for tenant subscriptions.
    
    Actions:
    - list: List tenant subscriptions
    - retrieve: Get subscription details
    - create: Create new subscription
    - update: Update subscription settings
    - cancel: Cancel subscription
    - renew: Manually renew subscription
    - upgrade: Upgrade to higher plan
    - downgrade: Downgrade to lower plan
    - change_plan: Change plan (auto-detects upgrade/downgrade)
    """
    
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated, CanViewBilling]
    filterset_class = SubscriptionFilter
    throttle_classes = [SubscriptionChangeThrottle]
    
    def get_queryset(self):
        """Filter subscriptions by tenant."""
        tenant_id = self.request.tenant_id
        
        queryset = Subscription.objects.for_tenant(tenant_id)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by plan type
        plan_type = self.request.query_params.get('plan_type')
        if plan_type:
            queryset = queryset.filter(plan__plan_type=plan_type)
        
        # Active only
        active_only = self.request.query_params.get('active_only', 'false').lower() == 'true'
        if active_only:
            queryset = queryset.active()
        
        return queryset.order_by('-created_at')
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'list':
            return SubscriptionListSerializer
        elif self.action == 'retrieve':
            return SubscriptionDetailSerializer
        elif self.action == 'create':
            return SubscriptionCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return SubscriptionUpdateSerializer
        elif self.action == 'cancel':
            return SubscriptionCancelSerializer
        elif self.action == 'renew':
            return SubscriptionRenewSerializer
        return SubscriptionSerializer
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in ['create', 'cancel', 'renew', 'upgrade', 'downgrade', 'change_plan']:
            permission_classes = [IsAuthenticated, CanManageSubscriptions]
        else:
            permission_classes = [IsAuthenticated, CanViewBilling]
        return [permission() for permission in permission_classes]
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """Create a new subscription."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        tenant_id = request.tenant_id
        data = serializer.validated_data
        
        # Get plan
        from ....models import SubscriptionPlan
        plan = SubscriptionPlan.objects.get_by_id(data['plan_id'])
        
        # Create subscription
        lifecycle_service = SubscriptionLifecycleService()
        subscription = lifecycle_service.create_subscription(
            tenant_id=tenant_id,
            plan=plan,
            trial_days=data.get('trial_days', 14)
        )
        
        # Update auto_renew setting
        subscription.auto_renew = data.get('auto_renew', True)
        subscription.save(update_fields=['auto_renew'])
        
        # Initialize checkout if payment method not provided
        if not data.get('payment_method_id'):
            from ..serializers.checkout import CheckoutInitializeSerializer
            from .checkout import CheckoutViewSet
            
            checkout_serializer = CheckoutInitializeSerializer(data={
                'plan_id': str(plan.id),
                'billing_interval': data.get('billing_interval', 'monthly')
            })
            checkout_serializer.is_valid(raise_exception=True)
            
            checkout_view = CheckoutViewSet()
            checkout_view.request = request
            checkout_response = checkout_view.initialize_checkout(request)
            
            response_data = SubscriptionDetailSerializer(subscription, context={'request': request}).data
            response_data['checkout'] = checkout_response.data
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        
        return Response(
            SubscriptionDetailSerializer(subscription, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )
    
    @transaction.atomic
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a subscription."""
        subscription = self.get_object()
        
        serializer = SubscriptionCancelSerializer(
            data=request.data,
            context={'subscription': subscription}
        )
        serializer.is_valid(raise_exception=True)
        
        lifecycle_service = SubscriptionLifecycleService()
        subscription = lifecycle_service.cancel_subscription(
            subscription=subscription,
            at_period_end=serializer.validated_data.get('at_period_end', True)
        )
        
        # Store cancellation reason
        if serializer.validated_data.get('reason'):
            metadata = subscription.metadata or {}
            metadata['cancellation_reason'] = serializer.validated_data['reason']
            subscription.metadata = metadata
            subscription.save(update_fields=['metadata'])
        
        return Response({
            'status': 'cancelled',
            'subscription_code': subscription.subscription_code,
            'message': 'Subscription cancelled successfully',
            'effective_date': subscription.current_period_end if subscription.cancel_at_period_end else timezone.now()
        })
    
    @transaction.atomic
    @action(detail=True, methods=['post'])
    def renew(self, request, pk=None):
        """Manually renew a subscription."""
        subscription = self.get_object()
        
        serializer = SubscriptionRenewSerializer(
            data=request.data,
            context={'subscription': subscription}
        )
        serializer.is_valid(raise_exception=True)
        
        renewal_service = RenewalService()
        success = renewal_service.process_auto_renewal(subscription)
        
        if success:
            return Response({
                'status': 'renewed',
                'subscription_code': subscription.subscription_code,
                'new_period_end': subscription.current_period_end,
                'message': 'Subscription renewed successfully'
            })
        else:
            return Response(
                {'error': 'Renewal failed. Please update payment method.'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @transaction.atomic
    @action(detail=True, methods=['post'])
    def upgrade(self, request, pk=None):
        """Upgrade to a higher plan."""
        subscription = self.get_object()
        new_plan_id = request.data.get('plan_id')
        immediate = request.data.get('immediate', True)
        
        if not new_plan_id:
            return Response(
                {'error': 'plan_id required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from ....models import SubscriptionPlan
        try:
            new_plan = SubscriptionPlan.objects.get_by_id(new_plan_id)
        except SubscriptionPlan.DoesNotExist:
            return Response(
                {'error': 'Plan not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        plan_change_service = PlanChangeService()
        
        try:
            subscription = plan_change_service.upgrade_plan(
                subscription=subscription,
                new_plan=new_plan,
                immediate=immediate
            )
            
            return Response({
                'status': 'upgraded' if immediate else 'scheduled',
                'subscription_code': subscription.subscription_code,
                'old_plan': subscription.plan.name,
                'new_plan': new_plan.name,
                'effective_date': timezone.now() if immediate else subscription.current_period_end
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @transaction.atomic
    @action(detail=True, methods=['post'])
    def downgrade(self, request, pk=None):
        """Downgrade to a lower plan."""
        subscription = self.get_object()
        new_plan_id = request.data.get('plan_id')
        immediate = request.data.get('immediate', False)
        
        if not new_plan_id:
            return Response(
                {'error': 'plan_id required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from ....models import SubscriptionPlan
        try:
            new_plan = SubscriptionPlan.objects.get_by_id(new_plan_id)
        except SubscriptionPlan.DoesNotExist:
            return Response(
                {'error': 'Plan not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        plan_change_service = PlanChangeService()
        
        try:
            subscription = plan_change_service.downgrade_plan(
                subscription=subscription,
                new_plan=new_plan,
                immediate=immediate
            )
            
            return Response({
                'status': 'downgraded' if immediate else 'scheduled',
                'subscription_code': subscription.subscription_code,
                'old_plan': subscription.plan.name,
                'new_plan': new_plan.name,
                'effective_date': timezone.now() if immediate else subscription.current_period_end
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def invoices(self, request, pk=None):
        """Get all invoices for this subscription."""
        subscription = self.get_object()
        invoices = subscription.invoices.all().order_by('-invoice_date')
        
        from ..serializers.invoice import InvoiceListSerializer
        serializer = InvoiceListSerializer(invoices, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def transactions(self, request, pk=None):
        """Get all transactions for this subscription."""
        subscription = self.get_object()
        transactions = subscription.transactions.all().order_by('-created_at')
        
        from ..serializers.transaction import TransactionListSerializer
        serializer = TransactionListSerializer(transactions, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current active subscription for the tenant."""
        tenant_id = request.tenant_id
        subscription = Subscription.objects.get_current_for_tenant(tenant_id)
        
        if not subscription:
            return Response(
                {'has_subscription': False},
                status=status.HTTP_200_OK
            )
        
        serializer = SubscriptionDetailSerializer(subscription, context={'request': request})
        return Response(serializer.data)