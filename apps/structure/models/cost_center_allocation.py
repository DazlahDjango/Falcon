from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from .base import BaseStructureModel
from apps.structure.managers.base import BaseStructureManager
from .cost_center import CostCenter

class CostCenterAllocation(BaseStructureModel):
    cost_center = models.ForeignKey(CostCenter, on_delete=models.CASCADE, related_name='allocations', verbose_name=_('cost center'))
    
    # Generic relation to allow allocation to Division, Department, Section, or Unit
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, limit_choices_to={'app_label': 'structure'})
    object_id = models.UUIDField(_('object ID'))
    allocated_to = GenericForeignKey('content_type', 'object_id')
    
    allocation_percentage = models.DecimalField(_('allocation percentage'), max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    objects = BaseStructureManager()

    class Meta:
        db_table = 'structure_cost_center_allocation'
        verbose_name = _('cost center allocation')
        verbose_name_plural = _('cost center allocations')
        constraints = [
            models.UniqueConstraint(fields=['tenant_id', 'cost_center', 'content_type', 'object_id'], condition=models.Q(is_deleted=False), name='unique_tenant_cost_center_allocation')
        ]
        indexes = [
            models.Index(fields=['tenant_id', 'cost_center']),
            models.Index(fields=['content_type', 'object_id']),
        ]

    def __str__(self):
        return f"{self.cost_center.code} -> {self.allocated_to} ({self.allocation_percentage}%)"
