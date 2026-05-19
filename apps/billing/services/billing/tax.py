from decimal import Decimal
from typing import Dict, Any, Optional
from django.conf import settings
from django.db import models
from ...constants import DEFAULT_TAX_RATE, DEFAULT_CURRENCY

class TaxCalculator:
    """
    Calculates taxes for billing operations.
    Supports:
    - VAT (Value Added Tax)
    - Tax exemptions
    - Multiple tax rates
    - Tax jurisdiction handling
    """
    
    def __init__(self):
        self.default_tax_rate = getattr(settings, 'BILLING_TAX_RATE', DEFAULT_TAX_RATE)
        self.tax_exempt_countries = getattr(settings, 'TAX_EXEMPT_COUNTRIES', [])
        self.tax_rates_by_country = getattr(settings, 'TAX_RATES_BY_COUNTRY', {
            'KE': 0.16,  # Kenya - 16% VAT
            'UG': 0.18,  # Uganda - 18% VAT
            'TZ': 0.18,  # Tanzania - 18% VAT
            'NG': 0.075, # Nigeria - 7.5% VAT
        })
    
    def calculate_tax(self, amount: int, country_code: Optional[str] = None,
                      is_tax_exempt: bool = False) -> int:
        """
        Calculate tax amount for a given amount.
        
        Args:
            amount: Amount in smallest currency unit (cents)
            country_code: ISO country code (e.g., 'KE', 'UG')
            is_tax_exempt: Whether the transaction is tax exempt
        
        Returns:
            Tax amount in smallest currency unit (cents)
        """
        if is_tax_exempt:
            return 0
        
        # Get tax rate for country
        tax_rate = self._get_tax_rate_for_country(country_code)
        
        # Calculate tax
        tax_amount = int(amount * Decimal(str(tax_rate)))
        
        return tax_amount
    
    def calculate_total_with_tax(self, amount: int, country_code: Optional[str] = None,
                                  is_tax_exempt: bool = False) -> Dict[str, int]:
        """
        Calculate total amount including tax.
        
        Returns:
            Dictionary with subtotal, tax, and total
        """
        tax_amount = self.calculate_tax(amount, country_code, is_tax_exempt)
        total_amount = amount + tax_amount
        
        return {
            'subtotal': amount,
            'tax_amount': tax_amount,
            'total_amount': total_amount,
            'tax_rate': self._get_tax_rate_for_country(country_code) if not is_tax_exempt else 0
        }
    
    def _get_tax_rate_for_country(self, country_code: Optional[str] = None) -> float:
        """
        Get tax rate for a country.
        """
        if not country_code:
            return self.default_tax_rate
        
        # Check if country is tax exempt
        if country_code in self.tax_exempt_countries:
            return 0.0
        
        # Get country-specific tax rate
        return self.tax_rates_by_country.get(country_code, self.default_tax_rate)
    
    def calculate_tax_for_invoice(self, subtotal: int, line_items: list,
                                  country_code: Optional[str] = None) -> Dict[str, Any]:
        """
        Calculate tax for invoice with multiple line items.
        Some line items may be tax exempt.
        """
        taxable_subtotal = 0
        exempt_subtotal = 0
        
        for item in line_items:
            if item.get('is_tax_exempt', False):
                exempt_subtotal += item.get('total', 0)
            else:
                taxable_subtotal += item.get('total', 0)
        
        tax_amount = self.calculate_tax(taxable_subtotal, country_code)
        
        return {
            'taxable_subtotal': taxable_subtotal,
            'exempt_subtotal': exempt_subtotal,
            'tax_amount': tax_amount,
            'total_amount': taxable_subtotal + exempt_subtotal + tax_amount
        }
    
    def get_tax_summary(self, tenant_id: str, year: int) -> Dict[str, Any]:
        """
        Get tax summary for a tenant for a given year.
        """
        from ...models import Transaction
        
        transactions = Transaction.objects.get_by_tenant(tenant_id).filter(
            status=Transaction.STATUS_SUCCESS,
            payment_date__year=year
        )
        
        total_tax = transactions.aggregate(total=models.Sum('tax_amount'))['total'] or 0
        
        monthly_breakdown = transactions.annotate(
            month=models.ExtractMonth('payment_date')
        ).values('month').annotate(
            tax=models.Sum('tax_amount')
        ).order_by('month')
        
        return {
            'tenant_id': tenant_id,
            'year': year,
            'total_tax_collected': total_tax,
            'monthly_breakdown': list(monthly_breakdown),
            'currency': getattr(settings, 'BILLING_CURRENCY', DEFAULT_CURRENCY)
        }