from django.db import models
from decimal import Decimal
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from .base import BillingBaseModel
import uuid

class Plan(BillingBaseModel):
    """Billing plans with pricing and Stripe integration."""
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
    stripe_price_id_yearly = models.CharField(_('Stripe price ID (Yearly)'), max_length=100, blank=True)
    price_monthly = models.DecimalField(_('monthly price'), max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(Decimal('0.00'))])
    price_yearly = models.DecimalField(_('yearly price'), max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(Decimal('0.00'))])
    currency = models.CharField(_('currency'), max_length=3, default='KES')
    trial_days = models.PositiveSmallIntegerField(_('trial days'), default=14)
    is_active = models.BooleanField(_('active'), default=True, db_index=True)
    is_recommended = models.BooleanField(_('recommended'), default=False)
    display_order = models.PositiveSmallIntegerField(_('display order'), default=0)
    metadata = models.JSONField(_('metadata'), default=dict, blank=True)
    
    class Meta:
        db_table = 'billing_plan'
        verbose_name = _('plan')
        verbose_name_plural = _('plans')
        ordering = ['display_order', 'plan_type']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['plan_type', 'is_active']),
            models.Index(fields=['is_active', 'display_order']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_plan_type_display()})"
    
    @property
    def annual_discount_percent(self) -> float:
        """Calculate discount percentage if annual < monthly * 12."""
        if self.price_monthly > 0:
            annual_vs_monthly = (self.price_monthly * 12 - self.price_yearly) / (self.price_monthly * 12) * 100
            return max(0, annual_vs_monthly)
        return 0

class PlanFeature(BillingBaseModel):
    """Plan features with unlimited or numeric values."""
    plan = models.ForeignKey('billing.Plan', on_delete=models.CASCADE, related_name='features', verbose_name=_('plan'))
    name = models.CharField(_('feature name'), max_length=200, db_index=True)
    value = models.CharField(_('feature value'), max_length=100, blank=True)
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


class Price(BillingBaseModel):
    INTERVAL_MONTH = 'month'
    INTERVAL_YEAR = 'year'
    INTERVAL_ONE_TIME = 'one_time'
    INTERVAL_CHOICES = [
        (INTERVAL_MONTH, 'Monthly'),
        (INTERVAL_YEAR, 'Yearly'),
        (INTERVAL_ONE_TIME, 'One Time'),
    ]
    TYPE_RECURRING = 'recurring'
    TYPE_ONE_TIME = 'one_time'
    TYPE_CHOICES = [
        (TYPE_RECURRING, 'Recurring'),
        (TYPE_ONE_TIME, 'One Time'),
    ]
    stripe_price_id = models.CharField(_('Stripe price ID'), max_length=100, unique=True, db_index=True)
    stripe_product_id = models.CharField(_('Stripe product ID'), max_length=100, db_index=True)
    plan = models.ForeignKey('billing.Plan', on_delete=models.SET_NULL, null=True, blank=True, related_name='prices')
    amount = models.DecimalField(_('amount'), max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))])
    currency = models.CharField(_('currency'), max_length=3, default='KES')
    interval = models.CharField(_('interval'), max_length=10, choices=INTERVAL_CHOICES, default=INTERVAL_MONTH)
    interval_count = models.PositiveSmallIntegerField(_('interval count'), default=1)
    price_type = models.CharField(_('price type'), max_length=10, choices=TYPE_CHOICES, default=TYPE_RECURRING)
    is_active = models.BooleanField(_('active'), default=True)
    is_recurring = models.BooleanField(_('recurring'), default=True)
    nickname = models.CharField(_('nickname'), max_length=200, blank=True)
    last_synced_at = models.DateTimeField(_('last synced at'), null=True, blank=True)
    metadata = models.JSONField(_('metadata'), default=dict, blank=True)
    
    class Meta:
        db_table = 'billing_price'
        verbose_name = _('price')
        verbose_name_plural = _('prices')
        indexes = [
            models.Index(fields=['stripe_price_id']),
            models.Index(fields=['stripe_product_id', 'is_active']),
            models.Index(fields=['plan', 'interval', 'is_active']),
            models.Index(fields=['currency']),
        ]
    
    def __str__(self):
        return f"{self.amount} {self.currency}/{self.interval}"
    
    @property
    def amount_in_cents(self) -> int:
        return int(self.amount * 100)
    
    @property
    def formatted_amount(self) -> str:
        from apps.billing.utils.formatters import format_currency
        return format_currency(self.amount, self.currency)
    
    def mark_synced(self):
        self.last_synced_at = timezone.now()
        self.save(update_fields=['last_synced_at'])
    
    def deactivate(self):
        self.is_active = False
        self.save(update_fields=['is_active'])