from django.db import models
from .base import BaseBillingManager, TenantAwareManager

class PaymentMethodManager(TenantAwareManager):
    def active(self):
        """Return active payment methods."""
        return self.get_queryset().filter(status__in=['active', 'default'])
    
    def default(self):
        """Return default payment methods."""
        return self.get_queryset().filter(is_default=True)
    
    def by_type(self, payment_type):
        """Filter by payment type (card, bank, etc.)."""
        return self.get_queryset().filter(payment_type=payment_type)
    
    def card_methods(self):
        """Return card payment methods."""
        return self.get_queryset().filter(payment_type='card')
    
    def bank_methods(self):
        """Return bank payment methods."""
        return self.get_queryset().filter(payment_type='bank')
    
    def get_by_authorization_code(self, authorization_code):
        """Get payment method by authorization code."""
        return self.get_queryset().filter(authorization_code=authorization_code).first()
    
    def get_by_customer_code(self, customer_code):
        """Get all payment methods for a customer."""
        return self.get_queryset().filter(customer_code=customer_code)
    
    def get_default_for_tenant(self, tenant_id):
        """Get default payment method for a tenant."""
        return self.get_queryset().filter(
            tenant_id=tenant_id,
            is_default=True,
            status__in=['active', 'default']
        ).first()
    
    def get_active_methods_for_tenant(self, tenant_id):
        """Get all active payment methods for a tenant."""
        return self.get_queryset().filter(
            tenant_id=tenant_id,
            status__in=['active', 'default']
        ).order_by('-is_default', '-created_at')
    
    def tenant_has_payment_method(self, tenant_id):
        """Check if tenant has any active payment method."""
        return self.get_queryset().filter(
            tenant_id=tenant_id,
            status__in=['active', 'default']
        ).exists()
    
    def get_expiring_cards(self, months_threshold=2):
        """Get cards expiring within threshold months."""
        from django.utils import timezone
        
        current_year = timezone.now().year
        current_month = timezone.now().month
        
        # Calculate threshold year and month
        threshold_month = current_month + months_threshold
        threshold_year = current_year
        if threshold_month > 12:
            threshold_month -= 12
            threshold_year += 1
        
        return self.get_queryset().filter(
            payment_type='card',
            status__in=['active', 'default']
        ).filter(
            models.Q(card_expiry_year=threshold_year, card_expiry_month__lte=threshold_month) |
            models.Q(card_expiry_year=current_year, card_expiry_month__gte=current_month)
        )
    
    def get_methods_created_recently(self, days=30):
        """Get payment methods created in last N days."""
        from django.utils import timezone
        from datetime import timedelta
        
        cutoff_date = timezone.now() - timedelta(days=days)
        return self.get_queryset().filter(created_at__gte=cutoff_date)
    
    def get_payment_method_summary(self, tenant_id):
        """Get payment method summary for a tenant."""
        tenant_methods = self.get_queryset().filter(tenant_id=tenant_id)
        
        return {
            'total_methods': tenant_methods.filter(status__in=['active', 'default']).count(),
            'card_methods': tenant_methods.filter(payment_type='card', status__in=['active', 'default']).count(),
            'bank_methods': tenant_methods.filter(payment_type='bank', status__in=['active', 'default']).count(),
            'has_default': tenant_methods.filter(is_default=True).exists(),
            'expiring_cards': self.get_expiring_cards().filter(tenant_id=tenant_id).count(),
        }
    
    def set_new_default(self, tenant_id, payment_method_id):
        """
        Set a new default payment method for a tenant.
        Handles the transaction safely.
        """
        from django.db import transaction
        
        with transaction.atomic():
            # Remove default from all other methods
            self.get_queryset().filter(
                tenant_id=tenant_id,
                is_default=True
            ).exclude(id=payment_method_id).update(is_default=False, status='active')
            
            # Set the new default
            payment_method = self.get_queryset().get(id=payment_method_id, tenant_id=tenant_id)
            payment_method.set_as_default()
            
            return payment_method