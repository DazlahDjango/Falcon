# Update models/__init__.py to attach managers
from .base import BaseBillingModel
from .plan import SubscriptionPlan
from .subscription import Subscription
from .transaction import Transaction
from .invoice import Invoice
from .webhook_log import WebhookEventLog
from .payment_method import PaymentMethod
from .audit_log import BillingAuditLog

from ..managers import (
    PlanManager,
    SubscriptionManager,
    TransactionManager,
    InvoiceManager,
    WebhookLogManager,
    PaymentMethodManager,
    AuditLogManager
)

SubscriptionPlan.add_to_class('objects', PlanManager())
Subscription.add_to_class('objects', SubscriptionManager())
Transaction.add_to_class('objects', TransactionManager())
Invoice.add_to_class('objects', InvoiceManager())
WebhookEventLog.add_to_class('objects', WebhookLogManager())
PaymentMethod.add_to_class('objects', PaymentMethodManager())
BillingAuditLog.add_to_class('objects', AuditLogManager())

__all__ = [
    'BaseBillingModel',
    'SubscriptionPlan',
    'Subscription',
    'Transaction',
    'Invoice',
    'WebhookEventLog',
    'PaymentMethod',
    'BillingAuditLog',
]