from decimal import Decimal
from typing import Dict, Any, Optional
from django.conf import settings
from django.db import models
from ...constants import DEFAULT_TAX_RATE, DEFAULT_CURRENCY

class TaxCalculator:
    def __init__(self):
        self.default_tax_rate = getattr(settings, 'BILLING_TAX_RATE', DEFAULT_TAX_RATE)
        self.tax_exempt_countries = getattr(settings, 'TAX_EXEMPT_COUNTRIES', [])
        self.tax_rates_by_country = getattr(settings, 'TAX_RATES_BY_COUNTRY', {
            'KE': 0.16,  # Kenya - 16% VAT
            'NG': 0.075, # Nigeria - 7.5% VAT
            'GH': 0.125, # Ghana - 12.5% VAT
            'ZA': 0.15,  # South Africa - 15% VAT
            'CI': 0.18,  # Côte d'Ivoire - 18% TVA
        })

    def calculate_tax(self, amount: int, country_code: Optional[str] = None, is_tax_exempt: bool = False) -> int:
        if is_tax_exempt:
            return 0
        tax_rate = self._get_tax_rate_for_country(country_code)
        tax_amount = int(amount * Decimal(str(tax_rate)))
        return tax_amount

    def calculate_total_with_tax(self, amount: int, country_code: Optional[str] = None, is_tax_exempt: bool = False) -> Dict[str, int]:
        tax_amount = self.calculate_tax(amount, country_code, is_tax_exempt)
        total_amount = amount + tax_amount
        return {'subtotal': amount, 'tax_amount': tax_amount, 'total_amount': total_amount, 'tax_rate': self._get_tax_rate_for_country(country_code) if not is_tax_exempt else 0}

    def _get_tax_rate_for_country(self, country_code: Optional[str] = None) -> float:
        if not country_code:
            return self.default_tax_rate
        if country_code in self.tax_exempt_countries:
            return 0.0
        return self.tax_rates_by_country.get(country_code.upper(), self.default_tax_rate)

    def calculate_tax_for_invoice(self, subtotal: int, line_items: list, country_code: Optional[str] = None) -> Dict[str, Any]:
        taxable_subtotal = 0
        exempt_subtotal = 0
        for item in line_items:
            if item.get('is_tax_exempt', False):
                exempt_subtotal += item.get('total', 0)
            else:
                taxable_subtotal += item.get('total', 0)
        tax_amount = self.calculate_tax(taxable_subtotal, country_code)
        return {'taxable_subtotal': taxable_subtotal, 'exempt_subtotal': exempt_subtotal, 'tax_amount': tax_amount, 'total_amount': taxable_subtotal + exempt_subtotal + tax_amount}

    def get_tax_summary(self, tenant_id: str, year: int) -> Dict[str, Any]:
        from ...models import Transaction
        transactions = Transaction.objects.get_by_tenant(tenant_id).filter(status=Transaction.STATUS_SUCCESS, payment_date__year=year)
        total_tax = transactions.aggregate(total=models.Sum('tax_amount'))['total'] or 0
        monthly_breakdown = transactions.annotate(month=models.ExtractMonth('payment_date')).values('month').annotate(tax=models.Sum('tax_amount')).order_by('month')
        return {'tenant_id': tenant_id, 'year': year, 'total_tax_collected': total_tax, 'monthly_breakdown': list(monthly_breakdown), 'currency': getattr(settings, 'BILLING_CURRENCY', DEFAULT_CURRENCY)}