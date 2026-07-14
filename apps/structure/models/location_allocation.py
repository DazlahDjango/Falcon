from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from .base import BaseStructureModel
from apps.structure.managers.base import BaseStructureManager

class LocationAllocation(BaseStructureModel):
    location = models.ForeignKey('structure.Location', on_delete=models.CASCADE, related_name='allocations', verbose_name=_('location'))
    
    # Generic relation to target any organizational unit (Division, Department, Section, Unit)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, limit_choices_to={'app_label': 'structure'})
    object_id = models.UUIDField(_('object ID'))
    allocated_to = GenericForeignKey('content_type', 'object_id')
    
    # Still keep percentage in case they want to track how much of a building a department uses, but default to 100
    allocation_percentage = models.DecimalField(_('allocation percentage'), max_digits=5, decimal_places=2, default=100.00)
    
    objects = BaseStructureManager()

    class Meta:
        db_table = 'structure_location_allocation'
        verbose_name = _('location allocation')
        verbose_name_plural = _('location allocations')
        constraints = [
            models.UniqueConstraint(
                fields=['tenant_id', 'location', 'content_type', 'object_id'],
                condition=models.Q(is_deleted=False),
                name='unique_tenant_location_allocation'
            )
        ]
        indexes = [
            models.Index(fields=['tenant_id', 'location']),
            models.Index(fields=['content_type', 'object_id']),
        ]

    def __str__(self):
        return f"{self.location.name} -> {self.allocated_to} ({self.allocation_percentage}%)"
