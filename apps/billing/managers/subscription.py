from django.db import models
from django.utils import timezone
from datetime import timedelta
from .base import BaseBillingManager, TenantAwareManager

class SubscriptionManager(TenantAwareManager):
    def active(self):
        return self.get_queryset().filter(status__in=['active', 'trialing'])
    
    def active_only(self):
        return self.get_queryset().filter(status='active')
    
    def trialing(self):
        return self.get_queryset().filter(status='trialing')
    
    def past_due(self):
        return self.get_queryset().filter(status='past_due')
    
    def cancelled(self):
        return self.get_queryset().filter(status='cancelled')
    
    def expired(self):
        return self.get_queryset().filter(status='expired')
    
    def pending_cancellation(self):
        return self.get_queryset().filter(status='pending_cancellation')
    
    def expiring_soon(self, days_threshold=7):
        threshold_date = timezone.now() + timedelta(days=days_threshold)
        return self.get_queryset().filter(status='active', current_period_end__lte=threshold_date, current_period_end__gte=timezone.now())
    
    def expired_subscriptions(self):
        return self.get_queryset().filter(status='active', current_period_end__lt=timezone.now())
    
    def trial_ending_soon(self, days_threshold=3):
        threshold_date = timezone.now() + timedelta(days=days_threshold)
        return self.get_queryset().filter(status='trialing', trial_end_date__lte=threshold_date, trial_end_date__gte=timezone.now())
    
    def expired_trials(self):
        return self.get_queryset().filter(status='trialing', trial_end_date__lt=timezone.now())
    
    def renewable(self):
        return self.get_queryset().filter(status='active', auto_renew=True, cancel_at_period_end=False)
    
    def by_plan(self, plan_id):
        return self.get_queryset().filter(plan_id=plan_id)
    
    def by_plan_type(self, plan_type):
        return self.get_queryset().filter(plan__plan_type=plan_type)
    
    def get_by_subscription_code(self, subscription_code):
        return self.get_queryset().filter(subscription_code=subscription_code).first()
    
    def get_by_paystack_subscription_code(self, paystack_subscription_code):
        return self.get_queryset().filter(paystack_subscription_code=paystack_subscription_code).first()
    
    def get_by_tenant(self, tenant_id):
        return self.get_queryset().filter(tenant_id=tenant_id).order_by('-created_at')
    
    def get_current_for_tenant(self, tenant_id):
        return self.get_queryset().filter(tenant_id=tenant_id, status__in=['active', 'trialing']).order_by('-created_at').first()
    
    def get_active_subscription_count(self):
        return self.get_queryset().filter(status='active').count()
    
    def get_total_monthly_recurring_revenue(self):
        active_subs = self.get_queryset().filter(status='active', billing_interval='monthly')
        total = active_subs.aggregate(total=models.Sum('amount'))['total'] or 0
        return total
    
    def get_total_yearly_recurring_revenue(self):
        active_subs = self.get_queryset().filter(status='active', billing_interval='yearly')
        total = active_subs.aggregate(total=models.Sum('amount'))['total'] or 0
        return total
    
    def get_total_mrr(self):
        monthly = self.get_total_monthly_recurring_revenue()
        yearly = self.get_total_yearly_recurring_revenue()
        return monthly + (yearly / 12)
    
    def subscriptions_due_for_renewal(self):
        today = timezone.now().date()
        return self.get_queryset().filter(status='active', auto_renew=True, current_period_end__date=today)
    
    def recently_created(self, days=30):
        cutoff_date = timezone.now() - timedelta(days=days)
        return self.get_queryset().filter(created_at__gte=cutoff_date)
    
    def get_tenant_subscription_history(self, tenant_id):
        return self.get_queryset().filter(tenant_id=tenant_id).order_by('-created_at').select_related('plan')