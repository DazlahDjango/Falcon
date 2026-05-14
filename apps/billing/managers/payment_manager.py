# billing/managers/payment_manager.py
from django.db import models
from django.utils import timezone
from datetime import timedelta
from .base import BaseBillingManager


class PaymentManager(BaseBillingManager):
    """
    Manager for Payment model with specialized query methods.
    """
    
    def succeeded(self):
        """Get successful payments."""
        return self.get_queryset().filter(
            status='succeeded',
            is_deleted=False
        )
    
    def failed(self):
        """Get failed payments."""
        return self.get_queryset().filter(
            status='failed',
            is_deleted=False
        )
    
    def pending(self):
        """Get pending payments."""
        return self.get_queryset().filter(
            status='pending',
            is_deleted=False
        )
    
    def refunded(self):
        """Get refunded payments."""
        return self.get_queryset().filter(
            status__in=['refunded', 'partially_refunded'],
            is_deleted=False
        )
    
    def by_tenant(self, tenant_id):
        """Get payments for a specific tenant."""
        return self.get_queryset().filter(tenant_id=tenant_id, is_deleted=False)
    
    def by_subscription(self, subscription_id):
        """Get payments for a specific subscription."""
        return self.get_queryset().filter(
            subscription_id=subscription_id,
            is_deleted=False
        ).order_by('-payment_date')
    
    def by_invoice(self, invoice_id):
        """Get payments for a specific invoice."""
        return self.get_queryset().filter(
            invoice_id=invoice_id,
            is_deleted=False
        )
    
    def by_stripe_payment_intent(self, stripe_payment_intent_id):
        """Get payment by Stripe payment intent ID."""
        return self.get_queryset().filter(
            stripe_payment_intent_id=stripe_payment_intent_id,
            is_deleted=False
        ).first()
    
    def for_period(self, start_date, end_date):
        """Get payments for a specific time period."""
        return self.get_queryset().filter(
            payment_date__gte=start_date,
            payment_date__lte=end_date,
            status='succeeded',
            is_deleted=False
        )
    
    def this_month(self):
        """Get payments for current month."""
        now = timezone.now()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        return self.get_queryset().filter(
            payment_date__gte=start_of_month,
            status='succeeded',
            is_deleted=False
        )
    
    def today(self):
        """Get payments for today."""
        now = timezone.now()
        start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
        return self.get_queryset().filter(
            payment_date__gte=start_of_day,
            status='succeeded',
            is_deleted=False
        )
    
    def failed_recently(self, hours=24):
        """Get payments that failed in the last N hours."""
        cutoff = timezone.now() - timedelta(hours=hours)
        return self.get_queryset().filter(
            status='failed',
            created_at__gte=cutoff,
            is_deleted=False
        )
    
    def get_total_revenue(self, start_date=None, end_date=None):
        """Calculate total successful payment revenue."""
        queryset = self.get_queryset().filter(
            status='succeeded',
            is_deleted=False
        )
        if start_date:
            queryset = queryset.filter(payment_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(payment_date__lte=end_date)
        
        from django.db.models import Sum
        total = queryset.aggregate(total=Sum('amount'))['total']
        return total or 0
    
    def get_total_revenue_by_currency(self, currency='KES', start_date=None, end_date=None):
        """Calculate total revenue filtered by currency."""
        queryset = self.get_queryset().filter(
            status='succeeded',
            currency=currency,
            is_deleted=False
        )
        if start_date:
            queryset = queryset.filter(payment_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(payment_date__lte=end_date)
        
        from django.db.models import Sum
        total = queryset.aggregate(total=Sum('amount'))['total']
        return total or 0
    
    def count_by_status(self):
        """Count payments grouped by status."""
        from django.db.models import Count
        return self.get_queryset().values('status').annotate(
            count=Count('id')
        ).order_by('status')