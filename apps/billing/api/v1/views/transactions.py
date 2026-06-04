from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Q
from django.utils import timezone
from datetime import timedelta
from ....models import Transaction
from ..serializers import TransactionSerializer, TransactionListSerializer, TransactionDetailSerializer, TransactionVerifySerializer
from ....services import PaymentVerifier, PayStackClient
from ..permissions import IsSuperAdmin, IsClientAdmin, IsAuthenticated

class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Transaction.objects.filter(is_deleted=False)
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['verify', 'refund']:
            self.permission_classes = [IsClientAdmin]
        elif self.action == 'admin_stats':
            self.permission_classes = [IsSuperAdmin]
        else:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return TransactionListSerializer
        if self.action == 'retrieve':
            return TransactionDetailSerializer
        if self.action == 'verify':
            return TransactionVerifySerializer
        return TransactionSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == 'super_admin':
            return super().get_queryset()
        tenant_id = self.request.tenant_id if hasattr(self.request, 'tenant_id') else user.tenant_id
        return super().get_queryset().filter(tenant_id=tenant_id)
    
    @action(detail=False, methods=['post'], url_path='verify')
    def verify_transaction(self, request):
        serializer = TransactionVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reference = serializer.validated_data['reference']
        verifier = PaymentVerifier()
        result = verifier.verify_and_update_transaction(reference)
        if result:
            return Response(TransactionDetailSerializer(result).data)
        return Response({'error': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'], url_path='refund')
    def refund_transaction(self, request, pk=None):
        transaction = self.get_object()
        if transaction.status != 'success':
            return Response({'error': 'Only successful transactions can be refunded'}, status=status.HTTP_400_BAD_REQUEST)
        client = PayStackClient()
        result = client.create_refund(transaction.reference, request.data.get('amount'))
        transaction.status = 'refunded'
        transaction.save()
        return Response({'status': 'refund_initiated', 'refund_data': result})
    
    @action(detail=False, methods=['get'], url_path='summary')
    def transaction_summary(self, request):
        tenant_id = request.tenant_id if hasattr(request, 'tenant_id') else request.user.tenant_id
        thirty_days_ago = timezone.now() - timedelta(days=30)
        queryset = self.get_queryset().filter(created_at__gte=thirty_days_ago)
        total_revenue = queryset.filter(status='success').aggregate(total=Sum('total_amount'))['total'] or 0
        total_tax = queryset.filter(status='success').aggregate(total=Sum('tax_amount'))['total'] or 0
        success_count = queryset.filter(status='success').count()
        failed_count = queryset.filter(status='failed').count()
        return Response({'total_revenue': total_revenue, 'total_revenue_display': f"KES {total_revenue/100:.2f}", 'total_tax': total_tax, 'total_tax_display': f"KES {total_tax/100:.2f}", 'successful_transactions': success_count, 'failed_transactions': failed_count, 'success_rate': (success_count / (success_count + failed_count) * 100) if (success_count + failed_count) > 0 else 0})
    
    @action(detail=False, methods=['get'], url_path='admin/stats')
    def admin_stats(self, request):
        from django.db.models.functions import TruncMonth
        year = request.query_params.get('year', timezone.now().year)
        monthly = Transaction.objects.filter(status='success', payment_date__year=year).annotate(month=TruncMonth('payment_date')).values('month').annotate(total=Sum('total_amount'), count=Sum('id')).order_by('month')
        return Response({'year': year, 'monthly_breakdown': list(monthly)})