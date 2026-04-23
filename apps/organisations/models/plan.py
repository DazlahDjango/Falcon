"""
Plan model for subscription plans
"""

from django.db import models
from .base import BaseTenantModel
from apps.organisations.managers import PlanManager
from apps.organisations.constants import PlanCode


class Plan(BaseTenantModel):
    """
    Defines available subscription plans and their enabled features.
    """
    objects = PlanManager()
    
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, choices=PlanCode.choices, unique=True, db_index=True)
    description = models.TextField(blank=True)
    
    # Pricing
    price_monthly = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    price_yearly = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Limitations
    max_users = models.PositiveIntegerField(default=10)
    max_departments = models.PositiveIntegerField(default=5)
    max_storage_gb = models.PositiveIntegerField(default=5)
    max_api_calls_monthly = models.PositiveIntegerField(default=10000)
    max_custom_domains = models.PositiveIntegerField(default=1)
    
    # Feature toggles
    features = models.JSONField(
        default=dict,
        help_text="Key-value pair of features: {'sso': true, 'ai_insights': false}"
    )
    
    # Display
    display_order = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_public = models.BooleanField(default=True)
    is_popular = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Plan"
        verbose_name_plural = "Plans"
        ordering = ['display_order', 'price_monthly']

    def __str__(self):
        return self.name
    
    def get_yearly_discount_percentage(self):
        """Calculate discount percentage for yearly plan"""
        if self.price_monthly > 0:
            monthly_total = self.price_monthly * 12
            if monthly_total > 0:
                discount = (monthly_total - self.price_yearly) / monthly_total * 100
                return round(discount)
        return 0
