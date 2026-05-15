"""
Billing App Utilities
Helper functions for billing operations.
"""

import uuid
import hashlib
import hmac
from decimal import Decimal
from datetime import datetime, timedelta
from django.utils import timezone
from django.conf import settings
from .constants import DEFAULT_CURRENCY, DEFAULT_TAX_RATE, INVOICE_PREFIX


def generate_invoice_number(tenant_id=None):
    """
    Generate a unique invoice number.
    Format: FALCON-YYYYMM-XXXXXX
    """
    now = timezone.now()
    year_month = now.strftime('%Y%m')
    
    # Get the last invoice number for this period
    from .models import Invoice
    
    last_invoice = Invoice.objects.filter(
        invoice_number__startswith=f"{INVOICE_PREFIX}-{year_month}"
    ).order_by('-invoice_number').first()
    
    if last_invoice:
        # Extract the sequence number
        parts = last_invoice.invoice_number.split('-')
        if len(parts) == 3:
            last_seq = int(parts[2])
            new_seq = last_seq + 1
        else:
            new_seq = 1
    else:
        new_seq = 1
    
    return f"{INVOICE_PREFIX}-{year_month}-{new_seq:06d}"


def generate_transaction_reference(prefix='TXN'):
    """
    Generate a unique transaction reference.
    Format: TXN-{timestamp}-{uuid4}
    """
    timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
    unique_id = str(uuid.uuid4()).replace('-', '')[:12].upper()
    return f"{prefix}-{timestamp}-{unique_id}"


def generate_subscription_code():
    """
    Generate a unique subscription code.
    Format: SUB-{uuid4}
    """
    return f"SUB-{str(uuid.uuid4()).replace('-', '')[:16].upper()}"


def generate_idempotency_key(event_id, event_type):
    """
    Generate an idempotency key for webhook deduplication.
    """
    raw_key = f"{event_type}:{event_id}"
    return hashlib.sha256(raw_key.encode()).hexdigest()


def calculate_tax(amount, tax_rate=None):
    """
    Calculate tax amount for a given amount.
    Returns tax amount (in smallest currency unit).
    """
    if tax_rate is None:
        tax_rate = getattr(settings, 'BILLING_TAX_RATE', DEFAULT_TAX_RATE)
    
    tax_amount = int(amount * Decimal(str(tax_rate)))
    return tax_amount


def calculate_total_amount(amount, tax_amount=None, tax_rate=None):
    """
    Calculate total amount including tax.
    """
    if tax_amount is None:
        tax_amount = calculate_tax(amount, tax_rate)
    
    return amount + tax_amount


def format_currency(amount, currency=None):
    """
    Format amount for display.
    """
    if currency is None:
        currency = getattr(settings, 'BILLING_CURRENCY', DEFAULT_CURRENCY)
    
    # Convert from cents to main currency unit
    formatted_amount = amount / 100
    
    return f"{currency} {formatted_amount:,.2f}"


def cents_to_decimal(cents):
    """
    Convert cents to decimal representation.
    """
    return Decimal(cents) / 100


def decimal_to_cents(decimal_amount):
    """
    Convert decimal amount to cents.
    """
    return int(decimal_amount * 100)


def calculate_prorated_amount(original_amount, days_used, total_days):
    """
    Calculate prorated amount for partial period.
    Used for upgrades/downgrades mid-cycle.
    """
    if total_days <= 0:
        return 0
    
    prorated = int(original_amount * days_used / total_days)
    return prorated


def calculate_refund_amount(transaction_amount, days_used, total_days):
    """
    Calculate refund amount for unused period.
    """
    if total_days <= 0:
        return 0
    
    unused_ratio = (total_days - days_used) / total_days
    refund_amount = int(transaction_amount * unused_ratio)
    
    return max(0, refund_amount)


def get_days_remaining_in_period(end_date):
    """
    Get number of days remaining in current billing period.
    """
    now = timezone.now()
    if now >= end_date:
        return 0
    
    delta = end_date - now
    return max(1, delta.days)


def is_within_trial_period(start_date, trial_days=14):
    """
    Check if date is within trial period.
    """
    trial_end = start_date + timedelta(days=trial_days)
    return timezone.now() < trial_end


def should_send_reminder(last_reminder_date, interval_days=7):
    """
    Check if reminder should be sent based on last reminder.
    """
    if not last_reminder_date:
        return True
    
    next_reminder = last_reminder_date + timedelta(days=interval_days)
    return timezone.now() >= next_reminder


def mask_card_number(card_number):
    """
    Mask card number for display (showing only last 4 digits).
    """
    if not card_number or len(card_number) < 4:
        return "****"
    
    return f"****{card_number[-4:]}"


def get_brand_from_card_number(card_number):
    """
    Detect card brand from first digits.
    """
    if not card_number:
        return "Unknown"
    
    first_digit = card_number[0]
    
    if first_digit == '4':
        return "Visa"
    elif first_digit == '5':
        return "Mastercard"
    elif first_digit == '3':
        return "American Express"
    elif first_digit == '6':
        return "Discover"
    else:
        return "Other"


def serialize_for_audit(obj, fields_to_exclude=None):
    """
    Serialize model instance for audit logging.
    Excludes sensitive fields.
    """
    if fields_to_exclude is None:
        fields_to_exclude = ['paystack_secret', 'mfa_secret', 'password']
    
    if not obj:
        return {}
    
    data = {}
    for field in obj._meta.fields:
        field_name = field.name
        if field_name in fields_to_exclude:
            continue
        
        value = getattr(obj, field_name)
        
        # Handle datetime objects
        if hasattr(value, 'isoformat'):
            value = value.isoformat()
        # Handle UUID objects
        elif hasattr(value, 'hex'):
            value = str(value)
        
        data[field_name] = value
    
    return data


def get_tenant_billing_summary(tenant_id):
    """
    Get comprehensive billing summary for a tenant.
    """
    from .models import Subscription, Transaction, Invoice
    
    current_sub = Subscription.objects.get_current_for_tenant(tenant_id)
    subscription = Subscription.objects.get_by_tenant(tenant_id)
    
    # Get recent transactions
    recent_transactions = Transaction.objects.get_by_tenant(tenant_id)[:10]
    
    # Get invoices
    invoices = Invoice.objects.get_by_tenant(tenant_id)
    unpaid_invoices = invoices.filter(status__in=['pending', 'overdue'])
    
    # Calculate totals
    total_spent = Transaction.objects.get_tenant_transaction_summary(tenant_id)['total_spent']
    
    return {
        'tenant_id': tenant_id,
        'current_subscription': current_sub,
        'subscription_history': subscription,
        'recent_transactions': recent_transactions,
        'invoices': {
            'total': invoices.count(),
            'paid': invoices.filter(status='paid').count(),
            'pending': invoices.filter(status='pending').count(),
            'overdue': invoices.filter(status='overdue').count(),
            'total_outstanding': sum(inv.total_amount for inv in unpaid_invoices),
        },
        'total_spent': total_spent,
        'has_active_subscription': current_sub is not None and current_sub.is_active,
        'is_on_trial': current_sub.is_on_trial if current_sub else False,
        'trial_days_remaining': current_sub.trial_days_remaining if current_sub else 0,
    }


def calculate_feature_access(tenant_id):
    """
    Calculate which features a tenant has access to based on subscription.
    """
    from .models import Subscription, SubscriptionPlan
    
    current_sub = Subscription.objects.get_current_for_tenant(tenant_id)
    
    if not current_sub or not current_sub.is_active:
        # Free tier (trial) features
        trial_plan = SubscriptionPlan.objects.trial_plan()
        if trial_plan:
            return trial_plan.feature_dict
        return {}
    
    # Return features from current plan
    return current_sub.plan.feature_dict


def verify_webhook_signature(request):
    """
    Verify PayStack webhook signature.
    CRITICAL for security.
    """
    signature = request.headers.get('x-paystack-signature')
    if not signature:
        return False, "Missing signature header"
    
    secret = getattr(settings, 'PAYSTACK_WEBHOOK_SECRET', None)
    if not secret:
        return False, "Webhook secret not configured"
    
    # Get raw body
    raw_body = request.body
    
    # Verify signature
    computed = hmac.new(
        secret.encode('utf-8'),
        raw_body,
        hashlib.sha512
    ).hexdigest()
    
    is_valid = hmac.compare_digest(computed, signature)
    
    if not is_valid:
        return False, "Invalid signature"
    
    return True, "Signature verified"