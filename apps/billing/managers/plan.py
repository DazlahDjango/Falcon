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
    
    def get_plan_with_dynamic_features(self, plan_id):
        """Get plan with all dynamic features pre-fetched."""
        return self.get_queryset().filter(id=plan_id).prefetch_related('dynamic_features').first()
    
    def get_feature_value(self, plan_id, feature_key, default=None):
        """Get a specific feature value from a plan's dynamic features."""
        plan = self.get_plan_with_dynamic_features(plan_id)
        if plan:
            for feature in plan.dynamic_features.all():
                if feature.feature_key == feature_key:
                    return feature.typed_value
        return default
    
    def get_all_plans_with_features(self):
        """Get all active plans with their features (for super admin UI)."""
        return self.get_queryset().filter(is_active=True).prefetch_related(
            'dynamic_features',
            'tenant_overrides'  # For enterprise view
        ).order_by('display_order', 'price')
    
    def create_or_update_plan_from_super_admin(self, plan_data, created_by=None):
        """
        Create or update plan from super admin input.
        Syncs to Paystack automatically.
        """
        from django.utils import timezone
        
        plan, created = self.get_queryset().update_or_create(
            plan_type=plan_data.get('plan_type'),
            defaults={
                'name': plan_data.get('name'),
                'slug': plan_data.get('slug'),
                'price': plan_data.get('price'),
                'yearly_price': plan_data.get('yearly_price'),
                'max_users': plan_data.get('max_users', 10),
                'max_kpis': plan_data.get('max_kpis', 50),
                'max_departments': plan_data.get('max_departments', 10),
                'max_storage_mb': plan_data.get('max_storage_mb', 100),
                'custom_branding': plan_data.get('custom_branding', False),
                'api_access': plan_data.get('api_access', False),
                'sso_enabled': plan_data.get('sso_enabled', False),
                'advanced_analytics': plan_data.get('advanced_analytics', False),
                'priority_support': plan_data.get('priority_support', False),
                'description': plan_data.get('description', ''),
                'features_list': plan_data.get('features_list', []),
                'is_active': plan_data.get('is_active', True),
                'display_order': plan_data.get('display_order', 0),
                'updated_by': created_by,
            }
        )
        
        # Handle dynamic features
        if 'dynamic_features' in plan_data:
            # Clear existing and recreate (simplest approach)
            plan.dynamic_features.all().delete()
            for feature_data in plan_data['dynamic_features']:
                SubscriptionPlanFeature.objects.create(
                    plan=plan,
                    **feature_data
                )
        
        return plan, created
