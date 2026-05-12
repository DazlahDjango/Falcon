# billing/managers/invoice_manager.py
from django.db import models
from django.utils import timezone
from datetime import timedelta
from .base import BaseBillingManager


class InvoiceManager(BaseBillingManager):
    def paid(self):
        """Get paid invoices."""
        return self.get_queryset().filter(
            status='paid',
            is_deleted=False
        )
    
    def unpaid(self):
        """Get unpaid or partially paid invoices."""
        return self.get_queryset().filter(
            status__in=['draft', 'open'],
            is_deleted=False
        )
    
    def overdue(self):
        """Get overdue invoices."""
        return self.get_queryset().filter(
            due_date__lt=timezone.now(),
            status__in=['open', 'draft'],
            is_deleted=False
        )
    
    def by_tenant(self, tenant_id):
        """Get invoices for a specific tenant."""
        return self.get_queryset().filter(tenant_id=tenant_id, is_deleted=False)
    
    def by_subscription(self, subscription_id):
        """Get invoices for a specific subscription."""
        return self.get_queryset().filter(
            subscription_id=subscription_id,
            is_deleted=False
        ).order_by('-invoice_date')
    
    def by_stripe_invoice(self, stripe_invoice_id):
        """Get invoice by Stripe invoice ID."""
        return self.get_queryset().filter(
            stripe_invoice_id=stripe_invoice_id,
            is_deleted=False
        ).first()
    
    def for_period(self, start_date, end_date):
        """Get invoices for a specific time period."""
        return self.get_queryset().filter(
            invoice_date__gte=start_date,
            invoice_date__lte=end_date,
            is_deleted=False
        )
    
    def this_month(self):
        """Get invoices for current month."""
        now = timezone.now()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        return self.get_queryset().filter(
            invoice_date__gte=start_of_month,
            is_deleted=False
        )
    
    def last_month(self):
        """Get invoices for previous month."""
        now = timezone.now()
        first_of_this_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_of_last_month = first_of_this_month - timedelta(days=1)
        first_of_last_month = last_of_last_month.replace(day=1)
        return self.get_queryset().filter(
            invoice_date__gte=first_of_last_month,
            invoice_date__lte=last_of_last_month,
            is_deleted=False
        )
    
    def needs_pdf_generation(self):
        """Get invoices missing PDF URLs."""
        return self.get_queryset().filter(
            invoice_pdf_url__isnull=True,
            status='paid',
            is_deleted=False
        )
    
    def get_total_paid_for_tenant(self, tenant_id, start_date=None, end_date=None):
        """Calculate total paid amount for a tenant."""
        queryset = self.get_queryset().filter(
            tenant_id=tenant_id,
            status='paid',
            is_deleted=False
        )
        if start_date:
            queryset = queryset.filter(payment_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(payment_date__lte=end_date)
        
        from django.db.models import Sum
        total = queryset.aggregate(total=Sum('amount_paid'))['total']
        return total or 0
    
    def get_outstanding_balance(self, tenant_id):
        """Get total outstanding balance for a tenant."""
        queryset = self.get_queryset().filter(
            tenant_id=tenant_id,
            status__in=['draft', 'open'],
            is_deleted=False
        )
        from django.db.models import Sum
        total = queryset.aggregate(total=Sum('amount_remaining'))['total']
        return total or 0