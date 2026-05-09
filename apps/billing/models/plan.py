from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from .base import BillingBaseModel
from apps.tenant.models import BaseModel
import uuid

class Plan(BaseModel):
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

    BILLING_INTERVAL_MONTHLY = 'month'
    BILLING_INTERVAL_YEARLY = 'year'
    BILLING_INTERVAL_CHOICES = [
        (BILLING_INTERVAL_MONTHLY, 'Monthly'),
        (BILLING_INTERVAL_YEARLY, 'Yearly'),
    ]
    name = models.CharField(_('plan name'), max_length=100, db_index=True)
    slug = models.SlugField(_('slug'), unique=True, db_index=True)
    description = models.TextField(_('description'), blank=True)
    plan_type = models.CharField(_('plan type'), max_length=20, choices=PLAN_CHOICES, db_index=True)
    stripe_product_id = models.CharField(_('Stripe product ID'), max_length=100, blank=True, db_index=True)
    stripe_price_id_monthly = models.CharField(_('Stripe price ID (monthly)'), max_length=100, blank=True)
    stripe_price_id_yearly = models.CharField(_('Stripe price ID(Yearly)'), max_length=100, blank=True)
    price_monthly = models.DecimalField(_('monthly price'), max_digits=10, decimal_places=2, default=0)
    price_yearly = models.DecimalField(_('yearly price'), )

class PlanFeature(BillingBaseModel):
    plan = models.ForeignKey('billing.Plan', on_delete=models.CASCADE, related_name='features', verbose_name=_('plan'))
    name = models.CharField(_('feature name'), max_length=200, db_index=True)
    vaue = models.CharField(_('feature value'), max_length=100, blank=True)
    description = models.TextField(_('description'), blank=True)
    is_highlight = models.BooleanField(_('highlight'), default=False)
    display_order = models.PositiveSmallIntegerField(_('display order'), default=0)
    numeric_value = models.PositiveIntegerField(_('numeric value'), null=True, blank=True)
    is_unlimited = models.BooleanField(_('unlimited'), default=False)
    class Meta:
        db_table = 'billing_plan_feature'
        verbose_name = _('plan feature')
        verbose_name_plural = _('plan features')
        ordering = ['display_order', 'name']
        unique_together = [['plan', 'name']]
        indexes = [
            models.Index(fields=['plan', 'is_highlight']),
            models.Index(fields=['name']),
        ]
    
    def __str__(self):
        if self.is_unlimited:
            return f"{self.name}: Unlimited"
        if self.value:
            return f"{self.name}: {self.value}"
        return self.name
    
    @property
    def display_value(self) -> str:
        if self.is_unlimited:
            return 'Unlimited'
        if self.numeric_value:
            return str(self.numeric_value)
        return self.value or '—'
    
    @property
    def is_boolean(self) -> bool:
        return self.value.lower() in ['yes', 'no', 'true', 'false', 'enabled', 'disabled']
    
    @property
    def boolean_value(self) -> bool:
        if not self.is_boolean:
            return False
        return self.value.lower() in ['yes', 'true', 'enabled']