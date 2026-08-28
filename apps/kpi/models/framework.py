from django.db import models
from .base import BaseKPIModel
from ..managers import KPICategoryManager

class KPICategory(BaseKPIModel):
    CATEGORY_TYPES = [
        ('FINANCIAL', 'Financial'),
        ('IMPACT', 'Impact / Outcomes'),
        ('OPERATIONAL', 'Operational'),
        ('CUSTOMER', 'Customer / Stakeholder'),
        ('INTERNAL', 'Internal Process'),
        ('GROWTH', 'Growth & Learning'),
        ('COMPLIANCE', 'Compliance & Risk'),
    ]
    name = models.CharField(max_length=100)
    category_type = models.CharField(max_length=20, choices=CATEGORY_TYPES)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    description = models.TextField(blank=True)
    color = models.CharField(max_length=20, blank=True, help_text="Hex color code for UI")
    icon = models.CharField(max_length=50, blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    objects = KPICategoryManager()

    class Meta:
        db_table = 'kpi_categories'
        ordering = ['display_order', 'name']
        unique_together = [['tenant_id', 'name']]

    def __str__(self):
        return self.name