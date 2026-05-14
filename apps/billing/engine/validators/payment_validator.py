import logging
import re
from decimal import Decimal
from typing import Tuple, Optional, Dict, Any
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
logger = logging.getLogger(__name__)

class PaymentValidator:
    MIN_PAYMENT_AMOUNT = Decimal('1.00')
    MAX_PAYMENT_AMOUNT = Decimal('9999999.99')
    SUPPORTED_CURRENCIES = ['KES', 'USD', 'EUR', 'GBP', 'UGX', 'TZS']
    CARD_PATTERNS = {
        'visa': r'^4[0-9]{12}(?:[0-9]{3})?$',
        'mastercard': r'^5[1-5][0-9]{14}$|^2(?:2(?:2[1-9]|[3-9][0-9])|[3-6][0-9][0-9]|7(?:[01][0-9]|20))[0-9]{12}$',
        'amex': r'^3[47][0-9]{13}$',
    }
    
    @classmethod
    def validate_payment_amount(cls, amount: Decimal, currency: str = 'KES') -> Tuple[bool, Optional[str]]:
        if amount <= 0:
            return False, "Payment amount must be greater than zero."
        if amount < cls.MIN_PAYMENT_AMOUNT:
            return False, f"Minimum payment amount is {cls.MIN_PAYMENT_AMOUNT} {currency}."
        if amount > cls.MAX_PAYMENT_AMOUNT:
            return False, f"Maximum payment amount is {cls.MAX_PAYMENT_AMOUNT} {currency}."
        return True, None
    
    @classmethod
    def validate_currency(cls, currency: str) -> Tuple[bool, Optional[str]]:
        if currency.upper() not in cls.SUPPORTED_CURRENCIES:
            return False, f"Currency {currency} is not supported. Supported: {', '.join(cls.SUPPORTED_CURRENCIES)}"
        return True, None
    
    @classmethod
    def validate_card_number(cls, card_number: str) -> Tuple[bool, Optional[str], Optional[str]]:
        cleaned = re.sub(r'[\s-]', '', card_number)
        if not cleaned.isdigit():
            return False, "Card number must contain only digits.", None
        if len(cleaned) not in [13, 14, 15, 16, 19]:
            return False, "Invalid card number length.", None
        card_type = None
        for card, pattern in cls.CARD_PATTERNS.items():
            if re.match(pattern, cleaned):
                card_type = card
                break
        if not card_type:
            return False, "Unsupported or invalid card type.", None
        if not cls._luhn_check(cleaned):
            return False, "Invalid card number (checksum failed).", None
        return True, None, card_type
    
    @classmethod
    def validate_expiry_date(cls, month: int, year: int) -> Tuple[bool, Optional[str]]:
        from datetime import datetime
        if month < 1 or month > 12:
            return False, "Invalid expiry month."
        now = datetime.now()
        current_year = now.year % 100  # Last two digits
        current_month = now.month
        if year < current_year or (year == current_year and month < current_month):
            return False, "Card has expired."
        if year > current_year + 10:
            return False, "Expiry year is too far in the future."
        return True, None
    
    @classmethod
    def validate_cvv(cls, cvv: str, card_type: str = 'visa') -> Tuple[bool, Optional[str]]:
        if not cvv.isdigit():
            return False, "CVV must contain only digits."
        if card_type.lower() == 'amex':
            if len(cvv) != 4:
                return False, "American Express CVV must be 4 digits."
        else:
            if len(cvv) not in [3, 4]:
                return False, "CVV must be 3 or 4 digits."
        return True, None
    
    @classmethod
    def validate_email_for_receipt(cls, email: str) -> Tuple[bool, Optional[str]]:
        from django.core.validators import EmailValidator
        from django.core.exceptions import ValidationError
        if not email:
            return True, None 
        try:
            EmailValidator()(email)
            return True, None
        except ValidationError:
            return False, "Invalid email address format."
    
    @classmethod
    def validate_payment_method_integrity(cls, payment_method_id: str) -> Tuple[bool, Optional[str]]:
        if not payment_method_id:
            return False, "Payment method ID is required."
        if not payment_method_id.startswith('pm_'):
            return False, "Invalid payment method ID format."
        if len(payment_method_id) < 10:
            return False, "Payment method ID is too short."
        return True, None
    
    @classmethod
    def validate_webhook_signature(cls, payload: bytes, signature: str, secret: str) -> bool:
        import hmac
        import hashlib
        expected = hmac.new(
            secret.encode('utf-8'),
            payload,
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(expected, signature)
    
    @classmethod
    def _luhn_check(cls, card_number: str) -> bool:
        digits = [int(d) for d in card_number]
        check_digit = digits.pop()
        digits.reverse()
        for i in range(0, len(digits), 2):
            digits[i] *= 2
            if digits[i] > 9:
                digits[i] -= 9
        total = sum(digits)
        computed_check = (total * 9) % 10
        return computed_check == check_digit
    
    @classmethod
    def prevent_double_charge(cls, transaction_id: str, model) -> bool:
        return model.objects.filter(stripe_payment_intent_id=transaction_id).exists()