from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, List, Tuple
from dataclasses import dataclass

@dataclass
class TaxBreakdown:
    subtotal: Decimal
    tax_rate: Decimal
    tax_amount: Decimal
    total: Decimal
    tax_name: str
    is_tax_exempt: bool = False

class TaxCalculator:
    DECIMAL_PLACES = Decimal('0.01')
    DEFAULT_TAX_RATES = {
        'KE': Decimal('0.16'),  # Kenya VAT 16%
        'UG': Decimal('0.18'),  # Uganda VAT 18%
        'TZ': Decimal('0.18'),  # Tanzania VAT 18%
        'US': Decimal('0.00'),  # Varies by state - handle separately
        'GB': Decimal('0.20'),  # UK VAT 20%
        'EU': Decimal('0.20'),  # Standard EU rate
        'DEFAULT': Decimal('0.00'),
    }
    TAX_EXEMPT_TYPES = ['ngo', 'government', 'non_profit', 'charity']
    @classmethod
    def calculate_tax(cls, amount: Decimal, country_code: str = None, tax_exempt: bool = False, custom_tax_rate: Decimal = None) -> TaxBreakdown:
        if tax_exempt:
            return TaxBreakdown(
                subtotal=amount,
                tax_rate=Decimal('0.00'),
                tax_amount=Decimal('0.00'),
                total=amount,
                tax_name='Tax Exempt',
                is_tax_exempt=True
            )
        if custom_tax_rate is not None:
            tax_rate = custom_tax_rate
        else:
            tax_rate = cls.DEFAULT_TAX_RATES.get(country_code.upper() if country_code else 'DEFAULT',cls.DEFAULT_TAX_RATES['DEFAULT'])
        tax_amount = (amount * tax_rate).quantize(cls.DECIMAL_PLACES, rounding=ROUND_HALF_UP)
        total = (amount + tax_amount).quantize(cls.DECIMAL_PLACES, rounding=ROUND_HALF_UP)
        tax_name = cls._get_tax_name(country_code, tax_rate)
        return TaxBreakdown(
            subtotal=amount,
            tax_rate=tax_rate,
            tax_amount=tax_amount,
            total=total,
            tax_name=tax_name,
            is_tax_exempt=False
        )
    
    @classmethod
    def calculate_invoice_taxes(cls, line_items: List[Dict], country_code: str = None, tax_exempt: bool = False) -> Dict:
        subtotal = Decimal('0.00')
        tax_by_rate = {}
        for item in line_items:
            amount = Decimal(str(item.get('amount', 0)))
            subtotal += amount
            item_tax_exempt = item.get('tax_exempt', tax_exempt)
            item_country = item.get('country_code', country_code)
            custom_rate = item.get('tax_rate')
            if not item_tax_exempt:
                tax_rate = custom_rate or cls.DEFAULT_TAX_RATES.get(
                    item_country.upper() if item_country else 'DEFAULT',
                    cls.DEFAULT_TAX_RATES['DEFAULT']
                )
                if tax_rate > 0:
                    tax_amount = (amount * tax_rate).quantize(cls.DECIMAL_PLACES, rounding=ROUND_HALF_UP)
                    rate_key = str(tax_rate)
                    if rate_key not in tax_by_rate:
                        tax_by_rate[rate_key] = {
                            'rate': tax_rate,
                            'amount': Decimal('0.00'),
                            'name': cls._get_tax_name(item_country, tax_rate)
                        }
                    tax_by_rate[rate_key]['amount'] += tax_amount
        total_tax = sum(t['amount'] for t in tax_by_rate.values())
        grand_total = (subtotal + total_tax).quantize(cls.DECIMAL_PLACES, rounding=ROUND_HALF_UP)
        return {
            'subtotal': subtotal.quantize(cls.DECIMAL_PLACES),
            'tax_by_rate': tax_by_rate,
            'total_tax': total_tax.quantize(cls.DECIMAL_PLACES),
            'grand_total': grand_total
        }
    
    @classmethod
    def is_tax_exempt_entity(cls, tenant) -> bool:
        """Determine if a tenant qualifies for tax exemption."""
        if not tenant:
            return False
        sector = getattr(tenant, 'sector', None) or getattr(tenant, 'sector_type', None)
        if sector and sector.lower() in cls.TAX_EXEMPT_TYPES:
            return True
        settings = getattr(tenant, 'settings', {})
        if settings.get('tax_exempt', False):
            return True
        metadata = getattr(tenant, 'metadata', {})
        if metadata.get('tax_exempt', False):
            return True
        return False
    
    @staticmethod
    def _get_tax_name(country_code: str, tax_rate: Decimal) -> str:
        tax_names = {
            'KE': 'VAT',
            'UG': 'VAT',
            'TZ': 'VAT',
            'GB': 'VAT',
            'EU': 'VAT',
            'US': 'Sales Tax',
            'DEFAULT': 'Tax'
        }
        country = country_code.upper() if country_code else 'DEFAULT'
        name = tax_names.get(country, tax_names['DEFAULT'])
        if tax_rate > 0:
            return f"{name} ({int(tax_rate * 100)}%)"
        return name