from django.db import models
from django.utils.translation import gettext_lazy as _
from .base import BaseBillingModel

class BillingAuditLog(BaseBillingModel):
    ACTION_CREATE = 'create'
    ACTION_UPDATE = 'update'
    ACTION_DELETE = 'delete'
    ACTION_VIEW = 'view'
    ACTION_PAYMENT = 'payment'
    ACTION_REFUND = 'refund'
    ACTION_CANCEL = 'cancel'
    ACTION_RENEW = 'renew'
    ACTION_UPGRADE = 'upgrade'
    ACTION_DOWNGRADE = 'downgrade'
    ACTION_WEBHOOK = 'webhook'
    ACTION_LOGIN = 'login'
    ACTION_LOGOUT = 'logout'
    ACTION_CHOICES = [
        (ACTION_CREATE, 'Create'),
        (ACTION_UPDATE, 'Update'),
        (ACTION_DELETE, 'Delete'),
        (ACTION_VIEW, 'View'),
        (ACTION_PAYMENT, 'Payment'),
        (ACTION_REFUND, 'Refund'),
        (ACTION_CANCEL, 'Cancel'),
        (ACTION_RENEW, 'Renew'),
        (ACTION_UPGRADE, 'Upgrade'),
        (ACTION_DOWNGRADE, 'Downgrade'),
        (ACTION_WEBHOOK, 'Webhook'),
        (ACTION_LOGIN, 'Login'),
        (ACTION_LOGOUT, 'Logout'),
    ]
    RESOURCE_PLAN = 'plan'
    RESOURCE_SUBSCRIPTION = 'subscription'
    RESOURCE_TRANSACTION = 'transaction'
    RESOURCE_INVOICE = 'invoice'
    RESOURCE_PAYMENT_METHOD = 'payment_method'
    RESOURCE_WEBHOOK = 'webhook'
    RESOURCE_CUSTOMER = 'customer'
    RESOURCE_CHOICES = [
        (RESOURCE_PLAN, 'Plan'),
        (RESOURCE_SUBSCRIPTION, 'Subscription'),
        (RESOURCE_TRANSACTION, 'Transaction'),
        (RESOURCE_INVOICE, 'Invoice'),
        (RESOURCE_PAYMENT_METHOD, 'Payment Method'),
        (RESOURCE_WEBHOOK, 'Webhook'),
        (RESOURCE_CUSTOMER, 'Customer'),
    ]
    user_id = models.UUIDField(_('user ID'), db_index=True, help_text="User who performed the action")
    user_email = models.EmailField(_('user email'), db_index=True)
    user_role = models.CharField(_('user role'), max_length=50, blank=True)
    user_ip = models.GenericIPAddressField(_('user IP'), null=True, blank=True)
    user_agent = models.CharField(_('user agent'), max_length=500, blank=True)
    tenant_id = models.UUIDField(_('tenant ID'), db_index=True)
    action = models.CharField(_('action'), max_length=20, choices=ACTION_CHOICES, db_index=True)
    resource_type = models.CharField(_('resource type'), max_length=30, choices=RESOURCE_CHOICES, db_index=True)
    resource_id = models.CharField(_('resource ID'), max_length=100, db_index=True, help_text="ID of the affected resource")
    resource_name = models.CharField(_('resource name'), max_length=200, blank=True)
    before = models.JSONField(_('before'), default=dict, blank=True, help_text="State before action")
    after = models.JSONField(_('after'), default=dict, blank=True, help_text="State after action")
    changes = models.JSONField(_('changes'), default=dict, blank=True, help_text="Summary of changes")
    reason = models.TextField(_('reason'), blank=True)
    related_transaction_id = models.CharField(_('related transaction ID'), max_length=100, blank=True, db_index=True)
    related_subscription_id = models.CharField(_('related subscription ID'), max_length=100, blank=True, db_index=True)
    related_invoice_id = models.CharField(_('related invoice ID'), max_length=100, blank=True, db_index=True)
    success = models.BooleanField(_('success'), default=True)
    error_message = models.TextField(_('error message'), blank=True)
    metadata = models.JSONField(_('metadata'), default=dict, blank=True)    
    class Meta:
        db_table = 'billing_audit_log'
        verbose_name = _('billing audit log')
        verbose_name_plural = _('billing audit logs')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tenant_id', 'action']),
            models.Index(fields=['user_id', 'created_at']),
            models.Index(fields=['resource_type', 'resource_id']),
            models.Index(fields=['action', 'created_at']),
            models.Index(fields=['user_email']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.user_email} - {self.action} - {self.resource_type} - {self.created_at}"

    @classmethod
    def log_action(cls, user, tenant_id, action, resource_type, resource_id, before=None, after=None, 
                   success=True, error_message=None, reason=None, metadata=None, request=None):
        from apps.accounts.models import User
        log = cls()
        log.user_id = user.id if user else None
        log.user_email = user.email if user else 'system'
        
        if user:
            log.user_role = user.role if hasattr(user, 'role') else ''
        
        if request:
            log.user_ip = cls._get_client_ip(request)
            log.user_agent = request.META.get('HTTP_USER_AGENT', '')[:500]
        
        log.tenant_id = tenant_id
        log.action = action
        log.resource_type = resource_type
        log.resource_id = str(resource_id)
        log.before = before or {}
        log.after = after or {}
        log.success = success
        log.error_message = error_message or ''
        log.reason = reason or ''
        log.metadata = metadata or {}
        if before and after:
            changes = {}
            all_keys = set(before.keys()) | set(after.keys())
            for key in all_keys:
                if before.get(key) != after.get(key):
                    changes[key] = {
                        'before': before.get(key),
                        'after': after.get(key)
                    }
            log.changes = changes
        
        log.save()
        return log
    
    @staticmethod
    def _get_client_ip(request):
        """Get client IP from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip