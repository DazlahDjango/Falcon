import re
from decimal import Decimal
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from .constants import Currency, DEFAULT_CURRENCY

def validate_amount(value):
    if value <= 0:
        raise ValidationError(
            _('Amount must be greater than zero.'),
            code='invalid_amount'
        )
    
    # Maximum amount: 100,000,000 (1 million KES in cents)
    if value > 10000000000:
        raise ValidationError(
            _('Amount exceeds maximum allowed value.'),
            code='amount_too_large'
        )
    
    return value


def validate_currency(value):
    """Validate currency code is supported."""
    if value not in [c.value for c in Currency]:
        raise ValidationError(
            _(f'Unsupported currency: {value}. Supported: {", ".join([c.value for c in Currency])}'),
            code='invalid_currency'
        )
    return value


def validate_tax_rate(value):
    """Validate tax rate is between 0 and 1."""
    if value < 0 or value > 1:
        raise ValidationError(
            _('Tax rate must be between 0 and 1.'),
            code='invalid_tax_rate'
        )
    return value


def validate_paystack_reference(value):
    """Validate PayStack reference format."""
    if not value:
        return value
    
    # PayStack references are typically alphanumeric with hyphens/underscores
    pattern = r'^[A-Za-z0-9_-]+$'
    if not re.match(pattern, value):
        raise ValidationError(
            _('Invalid PayStack reference format.'),
            code='invalid_reference'
        )
    
    # Max length from PayStack docs
    if len(value) > 100:
        raise ValidationError(
            _('PayStack reference too long.'),
            code='reference_too_long'
        )
    
    return value


def validate_subscription_code(value):
    """Validate subscription code format."""
    if not value:
        return value
    
    # Subscription codes from PayStack are like 'SUB_xxxxxx'
    pattern = r'^[A-Za-z0-9_]+$'
    if not re.match(pattern, value):
        raise ValidationError(
            _('Invalid subscription code format.'),
            code='invalid_subscription_code'
        )
    
    return value


def validate_authorization_code(value):
    """Validate PayStack authorization code format."""
    if not value:
        return value
    
    # Authorization codes from PayStack are like 'AUTH_xxxxxx'
    pattern = r'^[A-Za-z0-9_]+$'
    if not re.match(pattern, value):
        raise ValidationError(
            _('Invalid authorization code format.'),
            code='invalid_auth_code'
        )
    
    return value


def validate_card_last4(value):
    """Validate last 4 digits of card number."""
    if not value:
        return value
    
    if not re.match(r'^\d{4}$', value):
        raise ValidationError(
            _('Card last 4 must be exactly 4 digits.'),
            code='invalid_card_last4'
        )
    
    return value


def validate_card_expiry(month, year):
    """Validate card expiry date."""
    from django.utils import timezone
    
    try:
        month_int = int(month)
        year_int = int(year)
    except (ValueError, TypeError):
        raise ValidationError(
            _('Invalid card expiry format.'),
            code='invalid_expiry'
        )
    
    if month_int < 1 or month_int > 12:
        raise ValidationError(
            _('Card expiry month must be between 1 and 12.'),
            code='invalid_expiry_month'
        )
    
    current_date = timezone.now().date()
    current_year = current_date.year
    current_month = current_date.month
    
    if year_int < current_year or (year_int == current_year and month_int < current_month):
        raise ValidationError(
            _('Card has expired.'),
            code='card_expired'
        )
    
    if year_int > current_year + 20:
        raise ValidationError(
            _('Card expiry year too far in the future.'),
            code='expiry_too_far'
        )
    
    return True


def validate_webhook_signature(signature, secret, payload):
    """
    Validate webhook signature from PayStack.
    This is CRITICAL for security - never skip in production.
    """
    import hmac
    import hashlib
    
    if not signature or not secret:
        return False
    
    try:
        computed_signature = hmac.new(
            secret.encode('utf-8'),
            payload,
            hashlib.sha512
        ).hexdigest()
        
        return hmac.compare_digest(computed_signature, signature)
    except Exception:
        return False


def validate_idempotency_key(key):
    """Validate idempotency key format."""
    if not key:
        raise ValidationError(
            _('Idempotency key is required.'),
            code='idempotency_key_required'
        )
    
    if len(key) > 255:
        raise ValidationError(
            _('Idempotency key too long.'),
            code='idempotency_key_too_long'
        )
    
    # Allow alphanumeric, hyphens, underscores, colons
    pattern = r'^[A-Za-z0-9_:.-]+$'
    if not re.match(pattern, key):
        raise ValidationError(
            _('Invalid idempotency key format.'),
            code='invalid_idempotency_key'
        )
    
    return key


def validate_plan_price(price, interval):
    """Validate plan price based on interval."""
    from .constants import BillingInterval
    
    if price < 0:
        raise ValidationError(
            _('Price cannot be negative.'),
            code='negative_price'
        )
    
    if interval == BillingInterval.MONTHLY and price > 100000000:  # 1,000,000 KES max monthly
        raise ValidationError(
            _('Monthly price exceeds maximum allowed.'),
            code='price_too_high'
        )
    
    if interval == BillingInterval.YEARLY and price > 1000000000:  # 10,000,000 KES max yearly
        raise ValidationError(
            _('Yearly price exceeds maximum allowed.'),
            code='price_too_high'
        )
    
    return price


def validate_invoice_number(number):
    """Validate invoice number format."""
    # Format: FALCON-YYYYMM-XXXXXX
    pattern = r'^FALCON-\d{6}-\d{6}$'
    if not re.match(pattern, number):
        raise ValidationError(
            _('Invalid invoice number format. Use: FALCON-YYYYMM-XXXXXX'),
            code='invalid_invoice_number'
        )
    
    return number


def validate_phone_number(phone):
    """Validate phone number for payment notifications."""
    if not phone:
        return phone
    
    # Kenyan phone numbers: 07XX XXX XXX or +2547XXXXXXXX
    pattern = r'^(07\d{8}|2547\d{8}|\+2547\d{8})$'
    if not re.match(pattern, phone):
        raise ValidationError(
            _('Invalid phone number format. Use Kenyan format (07XXXXXXXXX or +254XXXXXXXXX)'),
            code='invalid_phone'
        )
    
    return phone


def validate_email_for_billing(email):
    """Validate email for billing communications."""
    from django.core.validators import EmailValidator
    
    if not email:
        raise ValidationError(
            _('Email is required for billing.'),
            code='email_required'
        )
    
    try:
        EmailValidator()(email)
    except ValidationError:
        raise ValidationError(
            _('Invalid email format for billing.'),
            code='invalid_billing_email'
        )
    
    return email