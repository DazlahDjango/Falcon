from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ....models import PaymentMethod
from ....services.audit.logger import audit_logger
from ..serializers import (
    PaymentMethodSerializer,
    PaymentMethodListSerializer,
    PaymentMethodCreateSerializer,
    PaymentMethodDeleteSerializer,
)
from ..permissions import CanManagePaymentMethods, IsSameTenant
from ..throttles import PaymentMethodThrottle


class PaymentMethodViewSet(viewsets.ModelViewSet):
    """
    Payment Method ViewSet for saved payment methods.
    
    Actions:
    - list: List tenant payment methods
    - retrieve: Get payment method details
    - create: Add new payment method
    - destroy: Remove payment method
    - set_default: Set as default payment method
    """
    
    permission_classes = [IsAuthenticated, CanManagePaymentMethods]
    throttle_classes = []
    
    def get_throttles(self):
        """Set throttles based on action."""
        if self.action in ['create', 'destroy', 'set_default']:
            from ..throttles import PaymentMethodThrottle
            return [PaymentMethodThrottle()]
        from ..throttles import TieredBillingThrottle
        return [TieredBillingThrottle()]
    
    def get_queryset(self):
        """Filter payment methods by tenant."""
        tenant_id = self.request.tenant_id
        
        queryset = PaymentMethod.objects.for_tenant(tenant_id)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by type
        payment_type = self.request.query_params.get('payment_type')
        if payment_type:
            queryset = queryset.filter(payment_type=payment_type)
        
        # Active only
        active_only = self.request.query_params.get('active_only', 'true').lower() == 'true'
        if active_only:
            queryset = queryset.filter(status__in=['active', 'default'])
        
        return queryset.order_by('-is_default', '-created_at')
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'list':
            return PaymentMethodListSerializer
        elif self.action == 'create':
            return PaymentMethodCreateSerializer
        elif self.action == 'destroy':
            return PaymentMethodDeleteSerializer
        return PaymentMethodSerializer
    
    def create(self, request, *args, **kwargs):
        """Add a new payment method."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        tenant_id = request.tenant_id
        data = serializer.validated_data
        
        # Create payment method from PayStack authorization
        payment_method = PaymentMethod.objects.create(
            tenant_id=tenant_id,
            authorization_code=data['authorization_code'],
            email=data['email'],
            status='active'
        )
        
        # If this is the first payment method, make it default
        if PaymentMethod.objects.for_tenant(tenant_id).active().count() == 1:
            payment_method.set_as_default()
        
        # Log audit
        audit_logger.log(
            user=request.user,
            tenant_id=tenant_id,
            action='create',
            resource_type='payment_method',
            resource_id=payment_method.id,
            metadata={'payment_type': payment_method.payment_type},
            request=request
        )
        
        return Response(
            PaymentMethodSerializer(payment_method, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        """Set this payment method as default."""
        payment_method = self.get_object()
        
        # Check tenant access
        if str(payment_method.tenant_id) != str(request.tenant_id):
            return Response(
                {'error': 'You do not have access to this payment method'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        payment_method.set_as_default()
        
        # Log audit
        audit_logger.log(
            user=request.user,
            tenant_id=request.tenant_id,
            action='update',
            resource_type='payment_method',
            resource_id=payment_method.id,
            after={'is_default': True},
            request=request
        )
        
        return Response({
            'status': 'default_set',
            'payment_method_id': str(payment_method.id),
            'message': 'Default payment method updated'
        })
    
    def destroy(self, request, *args, **kwargs):
        """Delete a payment method."""
        payment_method = self.get_object()
        
        serializer = PaymentMethodDeleteSerializer(
            data=request.data,
            context={
                'payment_method': payment_method,
                'tenant_id': request.tenant_id
            }
        )
        serializer.is_valid(raise_exception=True)
        
        # Log audit before deletion
        audit_logger.log(
            user=request.user,
            tenant_id=request.tenant_id,
            action='delete',
            resource_type='payment_method',
            resource_id=payment_method.id,
            before={'card_last4': payment_method.card_last4, 'is_default': payment_method.is_default},
            request=request
        )
        
        # Remove or mark as deleted
        payment_method.remove()
        
        # If this was default and there are other methods, set new default
        if payment_method.is_default:
            other_method = PaymentMethod.objects.for_tenant(request.tenant_id).active().first()
            if other_method:
                other_method.set_as_default()
        
        return Response(
            {'status': 'deleted', 'message': 'Payment method removed'},
            status=status.HTTP_200_OK
        )