from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import RegexValidator, MinLengthValidator
from .base import BillingBaseModel
from apps.tenant.models import BaseModel
from .subscription import Subscription
from .invoice import Invoice

class PaymentMethod(BillingBaseModel):
    TYPE_CARD = 'card'
    TYPE_BANK_ACCOUNT = 'bank_account'
    TYPE_MOBILE_MONEY = 'mobile_money'
    TYPE_US_BANK = 'us_bank_account'
    TYPE_LINK = 'link'
    TYPE_CHOICES = [
        (TYPE_CARD, 'Card'),
        (TYPE_BANK_ACCOUNT, 'Bank Account'),
        (TYPE_MOBILE_MONEY, 'Mobile Money'),
        (TYPE_US_BANK, 'US Bank Account'),
        (TYPE_LINK, 'Link'),
    ]
    BRAND_VISA = 'visa'
    BRAND_MASTERCARD = 'mastercard'
    BRAND_AMEX = 'amex'
    BRAND_DISCOVER = 'discover'
    BRAND_DINERS = 'diners'
    BRAND_JCB = 'jcb'
    BRAND_UNIONPAY = 'unionpay'
    BRAND_UNKNOWN = 'unknown'
    BRAND_CHOICES = [
        (BRAND_VISA, 'Visa'),
        (BRAND_MASTERCARD, 'Mastercard'),
        (BRAND_AMEX, 'American Express'),
        (BRAND_DISCOVER, 'Discover'),
        (BRAND_DINERS, 'Diners Club'),
        (BRAND_JCB, 'JCB'),
        (BRAND_UNIONPAY, 'UnionPay'),
        (BRAND_UNKNOWN, 'Unknown'),
    ]
    tenant = models.ForeignKey('tenant.Client', on_delete=models.CASCADE, related_name='payment_methods', verbose_name=_('tenant'))
    subscription = models.ForeignKey('billing.Subscription', on_delete=models.SET_NULL, null=True, blank=True, related_name='payment_methods', verbose_name=_('subscription'))
    stripe_payment_method_id = models.CharField(_('Stripe payment method ID'), max_length=100, unique=True, db_index=True)
    stripe_customer_id = models.CharField(_('Stripe customer ID'), max_length=100, db_index=True)
    method_type = models.CharField(_('type'), max_length=20, choices=TYPE_CHOICES)
    last4 = models.CharField(_('last 4 digits'),max_length=4,blank=True,validators=[RegexValidator(r'^\d{4}$', 'Must be 4 digits')])
    brand = models.CharField(_('brand'), max_length=20, choices=BRAND_CHOICES, blank=True)
    exp_month = models.PositiveSmallIntegerField(_('expiry month'), null=True, blank=True)
    exp_year = models.PositiveSmallIntegerField(_('expiry year'), null=True, blank=True)
    bank_name = models.CharField(_('bank name'), max_length=200, blank=True)
    account_last4 = models.CharField(_('account last4'), max_length=4, blank=True)
    phone_number = models.CharField(_('phone number'), max_length=20, blank=True)
    provider = models.CharField(_('provider'), max_length=50, blank=True)
    billing_email = models.EmailField(_('billing email'), blank=True)
    billing_name = models.CharField(_('billing name'), max_length=255, blank=True)
    billing_address = models.JSONField(_('billing address'), default=dict, blank=True)
    is_default = models.BooleanField(_('default'), default=False)
    is_active = models.BooleanField(_('active'), default=True)
    is_expired = models.BooleanField(_('expired'), default=False)
    is_verified = models.BooleanField(_('verified'), default=False)
    verified_at = models.DateTimeField(_('verified at'), null=True, blank=True)
    metadata = models.JSONField(_('metadata'), default=dict, blank=True)
    
    class Meta:
        db_table = 'billing_payment_method'
        verbose_name = _('payment method')
        verbose_name_plural = _('payment methods')
        ordering = ['-is_default', '-created_at']
        indexes = [
            models.Index(fields=['tenant', 'is_active', 'is_default']),
            models.Index(fields=['stripe_payment_method_id']),
            models.Index(fields=['stripe_customer_id']),
            models.Index(fields=['method_type']),
            models.Index(fields=['is_expired']),
        ]
    
    def __str__(self):
        if self.method_type == self.TYPE_CARD and self.brand and self.last4:
            return f"{self.get_brand_display()} •••• {self.last4}"
        elif self.method_type == self.TYPE_MOBILE_MONEY and self.phone_number:
            return f"{self.provider or 'Mobile Money'} •••• {self.phone_number[-4:]}"
        return f"{self.get_method_type_display()} - {self.billing_name or self.billing_email}"
    
    @property
    def is_expiring_soon(self) -> bool:
        from django.utils import timezone
        if not self.exp_month or not self.exp_year:
            return False
        now = timezone.now()
        current_year = now.year
        current_month = now.month
        if self.exp_year < current_year:
            return True
        if self.exp_year == current_year:
            if self.exp_month <= current_month:
                return True
            if self.exp_month - current_month <= 3:
                return True
        return False
    
    @property
    def display_name(self) -> str:
        if self.method_type == self.TYPE_CARD:
            return f"{self.get_brand_display()} ending in {self.last4}"
        elif self.method_type == self.TYPE_MOBILE_MONEY:
            return f"{self.provider or 'Mobile Money'} •••• {self.phone_number[-4:]}"
        return self.get_method_type_display()
    
    def mark_as_default(self):
        PaymentMethod.objects.filter(
            tenant=self.tenant,
            is_default=True
        ).update(is_default=False)
        self.is_default = True
        self.save(update_fields=['is_default'])
    
    def mark_as_expired(self):
        self.is_expired = True
        self.is_active = False
        self.save(update_fields=['is_expired', 'is_active'])

class Payment(BaseModel):
    STATUS_SUCCEEDED = 'succeeded'
    STATUS_PENDING = 'pending'
    STATUS_FAILED = 'failed'
    STATUS_REFUNDED = 'refunded'
    STATUS_PARTIALLY_REFUNDED = 'partially_refunded'
    STATUS_CHOICES = [
        (STATUS_SUCCEEDED, 'Succeeded'),
        (STATUS_PENDING, 'Pending'),
        (STATUS_FAILED, 'Failed'),
        (STATUS_REFUNDED, 'Refunded'),
        (STATUS_PARTIALLY_REFUNDED, 'Partially Refunded'),
    ]
    tenant = models.ForeignKey('tenant.Client', on_delete=models.CASCADE, related_name='payments')
    subscription = models.ForeignKey(Subscription, on_delete=models.SET_NULL, null=True, related_name='payments')
    invoice = models.ForeignKey(Invoice, on_delete=models.SET_NULL, null=True, related_name='payments')
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.SET_NULL, null=True, related_name='payments')
    stripe_payment_intent_id = models.CharField(_('Stripe payment intent ID'), max_length=100, unique=True, db_index=True)
    stripe_charge_id = models.CharField(_('Stripe charge ID'), max_length=100, blank=True)
    amount = models.DecimalField(_('amount'), max_digits=10, decimal_places=2)
    currency = models.CharField(_('currency'), max_length=3, default='KES')
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING, db_index=True)
    payment_date = models.DateTimeField(_('payment date'), db_index=True)
    failure_reason = models.CharField(_('failure reason'), max_length=500, blank=True)
    refunded_amount = models.DecimalField(_('refunded amount'), max_digits=10, decimal_places=2, default=0)
    refunded_at = models.DateTimeField(_('refunded at'), null=True, blank=True)
    receipt_url = models.URLField(_('receipt URL'), max_length=500, blank=True)
    metadata = models.JSONField(_('metadata'), default=dict, blank=True)
    class Meta:
        db_table = 'billing_payment'
        verbose_name = _('payment')
        verbose_name_plural = _('payments')
        ordering = ['-payment_date']
        indexes = [
            models.Index(fields=['tenant', 'status']),
            models.Index(fields=['stripe_payment_intent_id']),
            models.Index(fields=['payment_date']),
            models.Index(fields=['subscription', 'status']),
        ]
    def __str__(self):
        return f"Payment {self.amount} {self.currency} - {self.status}"