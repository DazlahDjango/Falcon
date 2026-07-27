from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .base import BaseBillingModel

class PaymentMethod(BaseBillingModel):
    TYPE_CARD = 'card'
    TYPE_BANK = 'bank'
    TYPE_USSD = 'ussd'
    TYPE_QR = 'qr'
    TYPE_MOBILE_MONEY = 'mobile_money'
    TYPE_CHOICES = [
        (TYPE_CARD, 'Card'),
        (TYPE_BANK, 'Bank Account'),
        (TYPE_USSD, 'USSD'),
        (TYPE_QR, 'QR Code'),
        (TYPE_MOBILE_MONEY, 'Mobile Money'),
    ]
    STATUS_ACTIVE = 'active'
    STATUS_EXPIRED = 'expired'
    STATUS_REMOVED = 'removed'
    STATUS_DEFAULT = 'default'
    STATUS_CHOICES = [
        (STATUS_ACTIVE, 'Active'),
        (STATUS_EXPIRED, 'Expired'),
        (STATUS_REMOVED, 'Removed'),
        (STATUS_DEFAULT, 'Default'),
    ]
    tenant_id = models.UUIDField(_('tenant ID'), null=True, blank=True, db_index=True)
    authorization_code = models.CharField(_('authorization code'), max_length=100, unique=True, db_index=True, help_text="PayStack authorization code")
    customer_code = models.CharField(_('customer code'), max_length=100, blank=True, db_index=True)
    email = models.EmailField(_('email'))
    payment_type = models.CharField(_('payment type'), max_length=20, choices=TYPE_CHOICES, default=TYPE_CARD)
    card_last4 = models.CharField(_('card last 4'), max_length=4, blank=True)
    card_brand = models.CharField(_('card brand'), max_length=20, blank=True)
    card_expiry_month = models.CharField(_('expiry month'), max_length=2, blank=True)
    card_expiry_year = models.CharField(_('expiry year'), max_length=4, blank=True)
    bank_name = models.CharField(_('bank name'), max_length=100, blank=True)
    account_name = models.CharField(_('account name'), max_length=200, blank=True)
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default=STATUS_ACTIVE, db_index=True)
    is_default = models.BooleanField(_('is default'), default=False)
    reusable = models.BooleanField(_('reusable'), default=True)
    domain = models.CharField(_('domain'), max_length=200, blank=True)
    channel = models.CharField(_('channel'), max_length=50, blank=True)
    metadata = models.JSONField(_('metadata'), default=dict, blank=True)
    class Meta:
        db_table = 'billing_payment_method'
        verbose_name = _('payment method')
        verbose_name_plural = _('payment methods')
        ordering = ['-is_default', '-created_at']
        indexes = [
            models.Index(fields=['tenant_id', 'status']),
            models.Index(fields=['authorization_code']),
            models.Index(fields=['customer_code']),
            models.Index(fields=['tenant_id', 'is_default']),
        ]

    def __str__(self):
        if self.payment_type == self.TYPE_CARD:
            return f"Card ending in {self.card_last4} ({self.card_brand})"
        return f"{self.payment_type}: {self.account_name or 'N/A'}"

    @property
    def is_active(self):
        return self.status in [self.STATUS_ACTIVE, self.STATUS_DEFAULT]

    @property
    def is_expired(self):
        if not self.card_expiry_year or not self.card_expiry_month:
            return False
        try:
            expiry_date = timezone.datetime(
                int(self.card_expiry_year), 
                int(self.card_expiry_month), 
                1
            )
            return expiry_date < timezone.now().date()
        except:
            return False

    def set_as_default(self):
        PaymentMethod.objects.filter(
            tenant_id=self.tenant_id, 
            is_default=True
        ).exclude(id=self.id).update(is_default=False)
        
        self.is_default = True
        self.status = self.STATUS_DEFAULT
        self.save(update_fields=['is_default', 'status', 'updated_at'])

    def remove(self):
        self.status = self.STATUS_REMOVED
        self.is_default = False
        self.save(update_fields=['status', 'is_default', 'updated_at'])