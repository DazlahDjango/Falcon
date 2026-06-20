import uuid
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

class BillingSystemSettings(models.Model):
    SINGLETON_KEY = 'global'
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    singleton_key = models.CharField(max_length=32, unique=True, default=SINGLETON_KEY, editable=False)
    settings = models.JSONField(default=dict)
    version = models.PositiveIntegerField(default=1)
    tax_rates = models.JSONField(_('tax rates'), default=dict)
    grace_period_days = models.PositiveSmallIntegerField(_('grace period days'), default=7)
    suspension_days = models.PositiveSmallIntegerField(_('suspension days'), default=30)
    payment_retry_attempts = models.PositiveSmallIntegerField(_('payment retry attempts'), default=3)
    soft_limit_percentage = models.PositiveSmallIntegerField(_('soft limit percentage'), default=100)
    hard_limit_percentage = models.PositiveSmallIntegerField(_('hard limit percentage'), default=110)
    webhook_retry_max_attempts = models.PositiveSmallIntegerField(_('webhook retry max attempts'), default=3)
    webhook_retry_base_delay_minutes = models.PositiveSmallIntegerField(_('webhook retry base delay minutes'), default=5)
    invoice_prefix = models.CharField(_('invoice prefix'), max_length=20, default='FALCON-')
    invoice_due_days = models.PositiveSmallIntegerField(_('invoice due days'), default=7)
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='billing_system_settings_updates')

    class Meta:
        db_table = 'billing_system_settings'
        verbose_name = _('Billing System Settings')
        verbose_name_plural = _('Billing System Settings')

    def __str__(self):
        return f'BillingSystemSettings(v{self.version})'

    def save(self, *args, **kwargs):
        if not self.pk and self.__class__.objects.exists():
            raise ValueError("Only one instance of BillingSystemSettings allowed")
        super().save(*args, **kwargs)

    @classmethod
    def get_settings(cls):
        obj, created = cls.objects.get_or_create(singleton_key=cls.SINGLETON_KEY)
        if created:
            obj.tax_rates = {
                'KE': 0.16,  # Kenya - 16% VAT
                'NG': 0.075, # Nigeria - 7.5% VAT
                'GH': 0.125, # Ghana - 12.5% VAT
                'ZA': 0.15,  # South Africa - 15% VAT
                'CI': 0.18,  # Côte d'Ivoire - 18% TVA
            }
            obj.save()
        return obj

    def get_tax_rate(self, country_code):
        return self.tax_rates.get(country_code.upper(), 0.16)