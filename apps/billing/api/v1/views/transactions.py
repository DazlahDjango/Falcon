from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from ....models import Transaction
from ....services.paystack.verification import PaymentVerifier
from ....services.audit.logger import audit_logger
from ..serializers import (
    TransactionSerializer,
    TransactionListSerializer,
    TransactionDetailSerializer,
    TransactionVerifySerializer,
)
from ..permissions import CanViewTransactions, CanInitiateRefund
from ..throttles import BillingReportThrottle
from ..filters import TransactionFilter


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Transaction ViewSet for payment transactions.
    
    Actions:
    - list: List tenant transactions
    - retrieve: Get transaction details
    - verify: Verify transaction status
    - refund: Initiate refund (admin only)
    """
    
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated, CanViewTransactions]
    filterset_class = TransactionFilter
    
    def get_queryset(self):
        """Filter transactions by tenant."""
        tenant_id = self.request.tenant_id
        
        queryset = Transaction.objects.for_tenant(tenant_id)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by transaction type
        transaction_type = self.request.query_params.get('transaction_type')
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)
        
        # Date range filters
        start_date = self.request.query_params.get('start_date')
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        
        end_date = self.request.query_params.get('end_date')
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)
        
        return queryset.order_by('-created_at')
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'list':
            return TransactionListSerializer
        elif self.action == 'retrieve':
            return TransactionDetailSerializer
        elif self.action == 'verify':
            return TransactionVerifySerializer
        return TransactionSerializer
    
    @method_decorator(cache_page(300))  # Cache for 5 minutes
    def retrieve(self, request, *args, **kwargs):
        """Get transaction with caching."""
        return super().retrieve(request, *args, **kwargs)
    
    @action(detail=False, methods=['post'])
    def verify(self, request):
        """Verify a transaction status."""
        serializer = TransactionVerifySerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        reference = serializer.validated_data['reference']
        
        # Verify with PayStack
        verifier = PaymentVerifier()
        transaction = verifier.verify_and_update_transaction(reference)
        
        if not transaction:
            return Response(
                {'error': 'Transaction not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Log audit
        audit_logger.log(
            user=request.user,
            tenant_id=request.tenant_id,
            action='view',
            resource_type='transaction',
            resource_id=transaction.id,
            metadata={'verification': 'manual'},
            request=request
        )
        
        return Response({
            'verified': transaction.status == 'success',
            'status': transaction.status,
            'reference': transaction.reference,
            'amount': transaction.amount_display,
            'transaction': TransactionDetailSerializer(transaction, context={'request': request}).data
        })
    
    @action(detail=True, methods=['post'])
    def refund(self, request, pk=None):
        """Initiate a refund for a transaction."""
        # Only super admin can initiate refunds
        if request.user.role != 'super_admin' and not request.user.is_superuser:
            return Response(
                {'error': 'Only super admin can initiate refunds'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        transaction = self.get_object()
        
        # Check if refund is possible
        if transaction.status != 'success':
            return Response(
                {'error': 'Only successful transactions can be refunded'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        amount = request.data.get('amount', transaction.total_amount)
        reason = request.data.get('reason', 'Customer requested refund')
        
        # Process refund
        from ....services.paystack.client import PayStackClient
        
        client = PayStackClient()
        
        try:
            refund_response = client.create_refund(
                transaction_reference=transaction.reference,
                amount=amount
            )
            
            # Update transaction status
            transaction.status = 'refunded'
            transaction.save(update_fields=['status'])
            
            # Create refund transaction record
            from ....models import Transaction
            Transaction.objects.create(
                tenant_id=transaction.tenant_id,
                reference=f"REF-{transaction.reference}",
                transaction_type='refund',
                amount=amount,
                total_amount=amount,
                currency=transaction.currency,
                status='success',
                metadata={
                    'original_transaction': str(transaction.id),
                    'refund_reason': reason,
                    'paystack_refund': refund_response
                }
            )
            
            # Log audit
            audit_logger.log(
                user=request.user,
                tenant_id=request.tenant_id,
                action='refund',
                resource_type='transaction',
                resource_id=transaction.id,
                after={'status': 'refunded', 'refund_amount': amount},
                metadata={'reason': reason},
                request=request
            )
            
            return Response({
                'status': 'refunded',
                'reference': transaction.reference,
                'refund_amount': amount,
                'currency': transaction.currency,
                'message': 'Refund processed successfully'
            })
            
        except Exception as e:
            return Response(
                {'error': f'Refund failed: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )