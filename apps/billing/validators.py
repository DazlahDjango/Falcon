import re
from decimal import Decimal
from django.core.validators import ValidationError
from django.utils.translation import gettext_lazy as _
from apps.billing.constants import BillingInterval, PlanType, SubscriptionStatus


def validate_currency(value: str) -> None:
    if not value or len(value) != 3:
        raise ValidationError(_("Currency must be a 3-letter ISO code."))
    if not value.isalpha() or not value.isupper():
        raise ValidationError(_("Currency must be uppercase letters."))
    supported = ['KES', 'USD', 'EUR', 'GBP', 'UGX', 'TZS']
    if value not in supported:
        raise ValidationError(_(f"Currency {value} is not supported. Supported: {', '.join(supported)}"))

def validate_amount(value: Decimal) -> None:
    if value <= 0:
        raise ValidationError(_("Amount must be greater than zero."))
    if value > Decimal('9999999.99'):
        raise ValidationError(_("Amount exceeds maximum allowed."))
    if value.as_tuple().exponent < -2:
        raise ValidationError(_("Amount cannot have more than 2 decimal places."))

def validate_positive_integer(value: int) -> None:
    if value <= 0:
        raise ValidationError(_("Value must be a positive integer."))

def validate_slug(value: str) -> None:
    if not value:
        raise ValidationError(_("Slug cannot be empty."))
    if not re.match(r'^[a-z0-9-]+$', value):
        raise ValidationError(_("Slug can only contain lowercase letters, numbers, and hyphens."))

def validate_plan_type(value: str) -> None:
    valid_types = [pt[0] for pt in PlanType.CHOICES]
    if value not in valid_types:
        raise ValidationError(_(f"Invalid plan type. Must be one of: {', '.join(valid_types)}"))

def validate_billing_interval(value: str) -> None:
    valid_intervals = [bi[0] for bi in BillingInterval.CHOICES]
    if value not in valid_intervals:
        raise ValidationError(_(f"Invalid billing interval. Must be one of: {', '.join(valid_intervals)}"))

def validate_subscription_status(value: str) -> None:
    valid_statuses = [ss[0] for ss in SubscriptionStatus.CHOICES]
    if value not in valid_statuses:
        raise ValidationError(_(f"Invalid subscription status. Must be one of: {', '.join(valid_statuses)}"))

def validate_percentage(value: Decimal) -> None:
    if value < 0 or value > 100:
        raise ValidationError(_("Percentage must be between 0 and 100."))

def validate_trial_days(value: int) -> None:
    if value < 0:
        raise ValidationError(_("Trial days cannot be negative."))
    if value > 365:
        raise ValidationError(_("Trial days cannot exceed 365."))

def validate_stripe_id(value: str, prefix: str) -> None:
    if not value:
        return
    if not value.startswith(prefix):
        raise ValidationError(_(f"Invalid Stripe ID format. Must start with '{prefix}'."))
    if len(value) < 5:
        raise ValidationError(_("Stripe ID is too short."))

def validate_card_number(value: str) -> None:
    cleaned = re.sub(r'[\s-]', '', value)
    if not cleaned.isdigit():
        raise ValidationError(_("Card number must contain only digits."))
    if len(cleaned) not in [13, 14, 15, 16, 19]:
        raise ValidationError(_("Invalid card number length."))

def validate_expiry_date(month: int, year: int) -> None:
    from datetime import datetime
    if month < 1 or month > 12:
        raise ValidationError(_("Invalid expiry month."))
    now = datetime.now()
    current_year = now.year % 100
    current_month = now.month
    if year < current_year or (year == current_year and month < current_month):
        raise ValidationError(_("Card has expired."))

def validate_cvv(value: str, card_type: str = 'default') -> None:
    if not value.isdigit():
        raise ValidationError(_("CVV must contain only digits."))
    if card_type.lower() == 'amex':
        if len(value) != 4:
            raise ValidationError(_("American Express CVV must be 4 digits."))
    else:
        if len(value) not in [3, 4]:
            raise ValidationError(_("CVV must be 3 or 4 digits."))

def validate_invoice_number(value: str) -> None:
    if not value:
        raise ValidationError(_("Invoice number cannot be empty."))
    if len(value) > 50:
        raise ValidationError(_("Invoice number too long (max 50 characters)."))
    if not re.match(r'^[A-Z0-9-_]+$', value):
        raise ValidationError(_("Invoice number can only contain uppercase letters, numbers, hyphens, and underscores."))