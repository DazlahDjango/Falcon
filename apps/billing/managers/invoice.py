from django.db import models
from django.utils import timezone
from datetime import timedelta
from .base import BaseBillingManager, TenantAwareManager

class InvoiceManager(TenantAwareManager):
    def draft(self):
        """Return draft invoices."""
        return self.get_queryset().filter(status='draft')
    
    def pending(self):
        """Return pending invoices."""
        return self.get_queryset().filter(status='pending')
    
    def paid(self):
        """Return paid invoices."""
        return self.get_queryset().filter(status='paid')
    
    def overdue(self):
        """Return overdue invoices."""
        return self.get_queryset().filter(status='overdue')
    
    def cancelled(self):
        """Return cancelled invoices."""
        return self.get_queryset().filter(status='cancelled')
    
    def refunded(self):
        """Return refunded invoices."""
        return self.get_queryset().filter(status='refunded')
    
    def unpaid(self):
        """Return unpaid invoices (pending or overdue)."""
        return self.get_queryset().filter(status__in=['pending', 'overdue'])
    
    def get_by_invoice_number(self, invoice_number):
        """Get invoice by invoice number."""
        return self.get_queryset().filter(invoice_number=invoice_number).first()
    
    def get_by_paystack_invoice_id(self, paystack_invoice_id):
        """Get invoice by PayStack invoice ID."""
        return self.get_queryset().filter(paystack_invoice_id=paystack_invoice_id).first()
    
    def get_by_subscription(self, subscription_id):
        """Get all invoices for a subscription."""
        return self.get_queryset().filter(subscription_id=subscription_id).order_by('-invoice_date')
    
    def get_by_tenant(self, tenant_id):
        """Get all invoices for a tenant."""
        return self.get_queryset().filter(tenant_id=tenant_id).order_by('-invoice_date')
    
    def get_overdue_invoices(self):
        """Get invoices that are past due date."""
        return self.get_queryset().filter(
            status='pending',
            due_date__lt=timezone.now()
        )
    
    def get_invoices_due_soon(self, days_threshold=7):
        """Get invoices due within threshold days."""
        threshold_date = timezone.now() + timedelta(days=days_threshold)
        return self.get_queryset().filter(
            status='pending',
            due_date__lte=threshold_date,
            due_date__gte=timezone.now()
        )
    
    def get_unpaid_invoices_for_tenant(self, tenant_id):
        """Get all unpaid invoices for a tenant."""
        return self.get_queryset().filter(
            tenant_id=tenant_id,
            status__in=['pending', 'overdue']
        ).order_by('due_date')
    
    def get_total_outstanding(self, tenant_id=None):
        """Calculate total outstanding amount."""
        queryset = self.get_queryset().filter(status__in=['pending', 'overdue'])
        
        if tenant_id:
            queryset = queryset.filter(tenant_id=tenant_id)
        
        total = queryset.aggregate(total=models.Sum('total_amount'))['total'] or 0
        return total
    
    def get_total_paid_amount(self, start_date=None, end_date=None):
        """Calculate total paid amount."""
        queryset = self.get_queryset().filter(status='paid')
        
        if start_date:
            queryset = queryset.filter(paid_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(paid_at__lte=end_date)
        
        total = queryset.aggregate(total=models.Sum('total_amount'))['total'] or 0
        return total
    
    def get_invoices_by_date_range(self, start_date, end_date, tenant_id=None):
        """Get invoices within date range."""
        queryset = self.get_queryset().filter(
            invoice_date__gte=start_date,
            invoice_date__lte=end_date
        )
        
        if tenant_id:
            queryset = queryset.filter(tenant_id=tenant_id)
        
        return queryset.order_by('-invoice_date')
    
    def get_tenant_invoice_summary(self, tenant_id):
        """Get invoice summary for a tenant."""
        tenant_invoices = self.get_queryset().filter(tenant_id=tenant_id)
        
        return {
            'total_invoices': tenant_invoices.count(),
            'paid': tenant_invoices.filter(status='paid').count(),
            'pending': tenant_invoices.filter(status='pending').count(),
            'overdue': tenant_invoices.filter(status='overdue').count(),
            'cancelled': tenant_invoices.filter(status='cancelled').count(),
            'refunded': tenant_invoices.filter(status='refunded').count(),
            'total_paid_amount': tenant_invoices.filter(status='paid').aggregate(
                total=models.Sum('total_amount')
            )['total'] or 0,
            'total_outstanding': tenant_invoices.filter(
                status__in=['pending', 'overdue']
            ).aggregate(total=models.Sum('total_amount'))['total'] or 0,
            'last_invoice': tenant_invoices.order_by('-invoice_date').first(),
        }
    
    def get_next_invoice_number(self):
        """Generate next invoice number."""
        last_invoice = self.get_queryset().order_by('-invoice_number').first()
        if last_invoice:
            try:
                last_number = int(last_invoice.invoice_number.split('-')[-1])
                return last_number + 1
            except (ValueError, IndexError):
                pass
        return 1
    
    def get_invoices_needing_pdf_generation(self):
        """Get invoices that need PDF generation."""
        return self.get_queryset().filter(
            status__in=['pending', 'paid'],
            pdf_url=''
        )