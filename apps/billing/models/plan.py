from django.db import models
from django.utils.translation import gettext_lazy as _
from .base import BaseBillingModel
from ..managers import PlanManager

class SubscriptionPlan(BaseBillingModel):
    objects = PlanManager()
    PLAN_TRIAL = 'trial'
    PLAN_BASIC = 'basic'
    PLAN_PROFESSIONAL = 'professional'
    PLAN_ENTERPRISE = 'enterprise'
    
    PLAN_CHOICES = [
        (PLAN_TRIAL, 'Trial'),
        (PLAN_BASIC, 'Basic'),
        (PLAN_PROFESSIONAL, 'Professional'),
        (PLAN_ENTERPRISE, 'Enterprise'),
    ]
    INTERVAL_MONTHLY = 'monthly'
    INTERVAL_YEARLY = 'yearly'
    INTERVAL_CHOICES = [
        (INTERVAL_MONTHLY, 'Monthly'),
        (INTERVAL_YEARLY, 'Yearly'),
    ]
    name = models.CharField(_('plan name'), max_length=100, db_index=True)
    slug = models.SlugField(_('slug'), unique=True, db_index=True, help_text="URL-friendly identifier (basic, professional, enterprise)")
    plan_type = models.CharField(_('plan type'), max_length=20, choices=PLAN_CHOICES, unique=True, db_index=True)
    billing_interval = models.CharField(_('billing interval'), max_length=10, choices=INTERVAL_CHOICES, default=INTERVAL_MONTHLY)
    price = models.PositiveIntegerField(_('price'), help_text="Price in smallest currency unit (e.g., KES cents)")
    yearly_price = models.PositiveIntegerField(_('yearly price'), null=True, blank=True, help_text="Discounted yearly price")
    currency = models.CharField(_('currency'), max_length=3, default='KES')
    paystack_plan_code = models.CharField(_('PayStack plan code'), max_length=100, blank=True, help_text="Plan code from PayStack for recurring payments")
    paystack_plan_id = models.CharField(_('PayStack plan ID'), max_length=100, blank=True)
    max_users = models.IntegerField(_('max users'), default=10, help_text="Maximum number of users allowed (-1 for unlimited)")
    max_kpis = models.IntegerField(_('max KPIs'), default=50, help_text="Maximum number of KPIs allowed (-1 for unlimited)")
    max_departments = models.IntegerField(_('max departments'), default=10, help_text="Maximum number of departments (-1 for unlimited)")
    max_storage_mb = models.IntegerField(_('max storage MB'), default=100, help_text="Maximum storage in MB (-1 for unlimited)")
    custom_branding = models.BooleanField(_('custom branding'), default=False)
    api_access = models.BooleanField(_('API access'), default=False)
    sso_enabled = models.BooleanField(_('SSO enabled'), default=False)
    advanced_analytics = models.BooleanField(_('advanced analytics'), default=False)
    audit_logs = models.BooleanField(_('audit logs'), default=True)
    custom_reports = models.BooleanField(_('custom reports'), default=False)
    priority_support = models.BooleanField(_('priority support'), default=False)
    description = models.TextField(_('description'), blank=True)
    features_list = models.JSONField(_('features list'), default=list, blank=True, help_text="List of feature descriptions for UI display")
    is_active = models.BooleanField(_('is active'), default=True)
    display_order = models.IntegerField(_('display order'), default=0, help_text="Order to display plans in UI")
    class Meta:
        db_table = 'billing_subscription_plan'
        verbose_name = _('subscription plan')
        verbose_name_plural = _('subscription plans')
        ordering = ['display_order', 'price']
        indexes = [
            models.Index(fields=['plan_type', 'is_active']),
            models.Index(fields=['slug']),
            models.Index(fields=['price']),
        ]

    def __str__(self):
        return f"{self.get_plan_type_display()} - {self.get_billing_interval_display()} ({self.currency} {self.price})"

    @property
    def price_display(self):
        """Display price with currency."""
        return f"{self.currency} {self.price / 100:.2f}"

    @property
    def yearly_price_display(self):
        """Display yearly price if available."""
        if self.yearly_price:
            return f"{self.currency} {self.yearly_price / 100:.2f}"
        return None

    @property
    def is_unlimited_users(self):
        return self.max_users == -1

    @property
    def is_unlimited_kpis(self):
        return self.max_kpis == -1

    @property
    def is_trial(self):
        return self.plan_type == self.PLAN_TRIAL

    @property
    def feature_dict(self):
        """Return features as dictionary for easy access."""
        return {
            'max_users': self.max_users,
            'max_kpis': self.max_kpis,
            'max_departments': self.max_departments,
            'max_storage_mb': self.max_storage_mb,
            'custom_branding': self.custom_branding,
            'api_access': self.api_access,
            'sso_enabled': self.sso_enabled,
            'advanced_analytics': self.advanced_analytics,
            'audit_logs': self.audit_logs,
            'custom_reports': self.custom_reports,
            'priority_support': self.priority_support,
        }

    def get_yearly_price_value(self):
        """Get yearly price or calculate from monthly."""
        if self.yearly_price:
            return self.yearly_price
        return self.price * 10  # 2 months free for yearly

    def save(self, *args, **kwargs):
        """Auto-create PayStack plan if needed."""
        if not self.slug:
            self.slug = self.plan_type
        super().save(*args, **kwargs)

    @classmethod
    def get_default_plans(cls):
        """Get or create default plans from your proposal."""
        plans_data = [
            {
                'plan_type': cls.PLAN_BASIC,
                'name': 'Basic',
                'slug': 'basic',
                'price': 500000,  # 5000 KES (in cents)
                'max_users': 50,
                'max_kpis': 100,
                'custom_branding': False,
                'api_access': False,
                'sso_enabled': False,
                'advanced_analytics': False,
                'display_order': 1,
            },
            {
                'plan_type': cls.PLAN_PROFESSIONAL,
                'name': 'Professional',
                'slug': 'professional',
                'price': 250000,  # 25000 KES
                'max_users': 500,
                'max_kpis': 1000,
                'custom_branding': True,
                'api_access': True,
                'sso_enabled': False,
                'advanced_analytics': True,
                'display_order': 2,
            },
            {
                'plan_type': cls.PLAN_ENTERPRISE,
                'name': 'Enterprise',
                'slug': 'enterprise',
                'price': 1000000,  # 100000 KES
                'max_users': -1,
                'max_kpis': -1,
                'custom_branding': True,
                'api_access': True,
                'sso_enabled': True,
                'advanced_analytics': True,
                'display_order': 3,
            },
            {
                'plan_type': cls.PLAN_TRIAL,
                'name': 'Trial',
                'slug': 'trial',
                'price': 0,
                'max_users': 10,
                'max_kpis': 50,
                'custom_branding': False,
                'api_access': False,
                'sso_enabled': False,
                'advanced_analytics': False,
                'display_order': 0,
            },
        ]
        
        plans = []
        for plan_data in plans_data:
            plan, created = cls.objects.get_or_create(
                plan_type=plan_data['plan_type'],
                defaults=plan_data
            )
            plans.append(plan)
        return plans