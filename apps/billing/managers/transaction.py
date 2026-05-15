from django.db import models
from django.utils import timezone
from datetime import timedelta
from .base import BaseBillingManager, TenantAwareManager

class TransactionManager(TenantAwareManager):
    """
    Custom manager for Transaction model.
    Provides transaction-specific queryset methods.
    """
    
    def __init__(self, tenant_id=None, *args, **kwargs):
        super().__init__(tenant_id, *args, **kwargs)
    
    def successful(self):
        """Return successful transactions."""
        return self.get_queryset().filter(status='success')
    
    def pending(self):
        """Return pending transactions."""
        return self.get_queryset().filter(status='pending')
    
    def failed(self):
        """Return failed transactions."""
        return self.get_queryset().filter(status='failed')
    
    def refunded(self):
        """Return refunded transactions."""
        return self.get_queryset().filter(status='refunded')
    
    def disputed(self):
        """Return disputed transactions."""
        return self.get_queryset().filter(status='disputed')
    
    def by_type(self, transaction_type):
        """Filter by transaction type."""
        return self.get_queryset().filter(transaction_type=transaction_type)
    
    def subscription_transactions(self):
        """Return subscription-related transactions."""
        return self.get_queryset().filter(
            transaction_type__in=['subscription', 'renewal', 'upgrade']
        )
    
    def one_time_transactions(self):
        """Return one-time payment transactions."""
        return self.get_queryset().filter(transaction_type='one_time')
    
    def refund_transactions(self):
        """Return refund transactions."""
        return self.get_queryset().filter(transaction_type='refund')
    
    def get_by_reference(self, reference):
        """Get transaction by reference."""
        return self.get_queryset().filter(reference=reference).first()
    
    def get_by_paystack_reference(self, paystack_reference):
        """Get transaction by PayStack reference."""
        return self.get_queryset().filter(paystack_reference=paystack_reference).first()
    
    def get_by_subscription(self, subscription_id):
        """Get all transactions for a subscription."""
        return self.get_queryset().filter(subscription_id=subscription_id).order_by('-created_at')
    
    def get_by_tenant(self, tenant_id):
        """Get all transactions for a tenant."""
        return self.get_queryset().filter(tenant_id=tenant_id).order_by('-created_at')
    
    def get_recent_transactions(self, days=30):
        """Get transactions from last N days."""
        cutoff_date = timezone.now() - timedelta(days=days)
        return self.get_queryset().filter(created_at__gte=cutoff_date)
    
    def get_successful_in_date_range(self, start_date, end_date):
        """Get successful transactions in date range."""
        return self.get_queryset().filter(
            status='success',
            payment_date__gte=start_date,
            payment_date__lte=end_date
        )
    
    def get_total_revenue(self, start_date=None, end_date=None):
        """Calculate total revenue from successful transactions."""
        queryset = self.get_queryset().filter(status='success')
        
        if start_date:
            queryset = queryset.filter(payment_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(payment_date__lte=end_date)
        
        total = queryset.aggregate(total=models.Sum('total_amount'))['total'] or 0
        return total
    
    def get_total_tax_collected(self, start_date=None, end_date=None):
        """Calculate total tax collected."""
        queryset = self.get_queryset().filter(status='success')
        
        if start_date:
            queryset = queryset.filter(payment_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(payment_date__lte=end_date)
        
        total = queryset.aggregate(total=models.Sum('tax_amount'))['total'] or 0
        return total
    
    def get_daily_revenue(self, days=30):
        """Get daily revenue breakdown for last N days."""
        cutoff_date = timezone.now() - timedelta(days=days)
        
        from django.db.models.functions import TruncDate
        
        return self.get_queryset().filter(
            status='success',
            payment_date__gte=cutoff_date
        ).annotate(
            date=TruncDate('payment_date')
        ).values('date').annotate(
            total=models.Sum('total_amount'),
            count=models.Count('id')
        ).order_by('-date')
    
    def get_transaction_success_rate(self):
        """Calculate transaction success rate."""
        total = self.get_queryset().count()
        if total == 0:
            return 0.0
        
        successful = self.get_queryset().filter(status='success').count()
        return (successful / total) * 100
    
    def get_pending_transactions_older_than(self, minutes=30):
        """Get pending transactions older than specified minutes."""
        cutoff_time = timezone.now() - timedelta(minutes=minutes)
        return self.get_queryset().filter(
            status='pending',
            created_at__lt=cutoff_time
        )
    
    def get_tenant_transaction_summary(self, tenant_id):
        """Get transaction summary for a tenant."""
        tenant_transactions = self.get_queryset().filter(tenant_id=tenant_id)
        
        return {
            'total_transactions': tenant_transactions.count(),
            'successful': tenant_transactions.filter(status='success').count(),
            'failed': tenant_transactions.filter(status='failed').count(),
            'pending': tenant_transactions.filter(status='pending').count(),
            'refunded': tenant_transactions.filter(status='refunded').count(),
            'total_spent': tenant_transactions.filter(status='success').aggregate(
                total=models.Sum('total_amount')
            )['total'] or 0,
            'last_transaction': tenant_transactions.filter(status='success').order_by('-payment_date').first(),
        }
    
    def get_monthly_revenue_report(self, year):
        """Get monthly revenue breakdown for a specific year."""
        return self.get_queryset().filter(
            status='success',
            payment_date__year=year
        ).annotate(
            month=models.ExtractMonth('payment_date')
        ).values('month').annotate(
            total=models.Sum('total_amount'),
            count=models.Count('id')
        ).order_by('month')