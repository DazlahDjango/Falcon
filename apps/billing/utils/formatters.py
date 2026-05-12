# billing/utils/formatters.py
"""
Formatting utilities for billing data.
"""
from decimal import Decimal


def format_currency(amount: Decimal, currency: str = 'KES') -> str:
    """Format amount with currency symbol."""
    currency_symbols = {
        'KES': 'KSh',
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'UGX': 'USh',
        'TZS': 'TSh',
    }
    symbol = currency_symbols.get(currency.upper(), currency)
    
    # Format with thousand separators and 2 decimal places
    formatted = f"{amount:,.2f}"
    
    # Remove .00 if it's a whole number
    if formatted.endswith('.00'):
        formatted = formatted[:-3]
    
    return f"{symbol} {formatted}"


def format_invoice_number(prefix: str = 'INV', year: int = None, sequence: int = None) -> str:
    """Generate formatted invoice number."""
    from django.utils import timezone
    
    if year is None:
        year = timezone.now().year
    
    if sequence is None:
        # In production, get from database sequence
        sequence = 1
    
    return f"{prefix}-{year}-{sequence:06d}"


def format_phone_number(phone: str) -> str:
    """Format phone number for display."""
    # Remove any non-digit characters
    digits = ''.join(filter(str.isdigit, phone))
    
    if len(digits) == 10:
        return f"{digits[:3]}-{digits[3:6]}-{digits[6:]}"
    elif len(digits) == 12:
        return f"+{digits[:3]} {digits[3:6]} {digits[6:9]} {digits[9:]}"
    elif len(digits) == 13:
        return f"+{digits[:3]} {digits[3:6]} {digits[6:9]} {digits[9:11]} {digits[11:]}"
    
    return phone