from django.db import models
from .base import BaseBillingManager

class PlanManager(BaseBillingManager):
    def active(self):
        """Return only active plans."""
        return self.get_queryset().filter(is_active=True)
    
    def by_plan_type(self, plan_type):
        """Filter by plan type (basic, professional, enterprise, trial)."""
        return self.get_queryset().filter(plan_type=plan_type)
    
    def monthly_plans(self):
        """Return monthly billing interval plans."""
        return self.get_queryset().filter(billing_interval='monthly', is_active=True)
    
    def yearly_plans(self):
        """Return yearly billing interval plans."""
        return self.get_queryset().filter(billing_interval='yearly', is_active=True)
    
    def paid_plans(self):
        """Return all paid plans (excludes trial)."""
        return self.get_queryset().exclude(plan_type='trial').filter(is_active=True)
    
    def trial_plan(self):
        """Get the trial plan."""
        return self.get_queryset().filter(plan_type='trial', is_active=True).first()
    
    def basic_plan(self):
        """Get the basic plan."""
        return self.get_queryset().filter(plan_type='basic', is_active=True).first()
    
    def professional_plan(self):
        """Get the professional plan."""
        return self.get_queryset().filter(plan_type='professional', is_active=True).first()
    
    def enterprise_plan(self):
        """Get the enterprise plan."""
        return self.get_queryset().filter(plan_type='enterprise', is_active=True).first()
    
    def get_plan_for_upgrade(self, current_plan_type):
        upgrade_order = {
            'trial': 'basic',
            'basic': 'professional',
            'professional': 'enterprise',
            'enterprise': None
        }
        
        next_plan = upgrade_order.get(current_plan_type)
        if next_plan:
            return self.get_queryset().filter(plan_type=next_plan, is_active=True).first()
        return None
    
    def get_plan_for_downgrade(self, current_plan_type):
        downgrade_order = {
            'enterprise': 'professional',
            'professional': 'basic',
            'basic': 'trial',
            'trial': None
        }
        
        prev_plan = downgrade_order.get(current_plan_type)
        if prev_plan:
            return self.get_queryset().filter(plan_type=prev_plan, is_active=True).first()
        return None
    
    def get_plans_for_display(self):
        """Get plans ordered for UI display (excludes trial)."""
        return self.get_queryset().filter(is_active=True).exclude(plan_type='trial').order_by('display_order', 'price')
    
    def get_plan_by_slug(self, slug):
        """Get plan by slug."""
        return self.get_queryset().filter(slug=slug, is_active=True).first()
    
    def get_plan_by_paystack_code(self, paystack_plan_code):
        """Get plan by PayStack plan code."""
        return self.get_queryset().filter(paystack_plan_code=paystack_plan_code).first()
    
    def get_plans_with_feature(self, feature_name):
        """Get plans that have a specific feature enabled."""
        return self.get_queryset().filter(is_active=True, **{feature_name: True})