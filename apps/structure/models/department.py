from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from .base import BaseStructureModel

class Department(BaseStructureModel):
    SENSITIVITY_CHOICES = [
        ('public', 'Public'),
        ('internal', 'Internal'),
        ('confidential', 'Confidential'),
        ('restricted', 'Restricted'),
    ]
    name = models.CharField(_('name'), max_length=255, db_index=True)
    code = models.CharField(_('code'), max_length=50, unique=True, db_index=True)
    description = models.TextField(_('description'), blank=True)
    parent = models.ForeignKey('self', on_delete=models.PROTECT, null=True, blank=True, related_name='children', verbose_name=_('parent department'))
    path = models.CharField(_('materialized path'), max_length=255, db_index=True, blank=True)
    depth = models.PositiveSmallIntegerField(_('depth'), default=0)
    cost_center_id = models.CharField(_('cost center ID'), max_length=50, blank=True, db_index=True)
    budget_code = models.CharField(_('budget code'), max_length=50, blank=True)
    headcount_limit = models.PositiveIntegerField(_('headcount limit'), null=True, blank=True)
    is_active = models.BooleanField(_('active'), default=True, db_index=True)
    sensitivity_level = models.CharField(_('sensitivity level'), max_length=20, choices=SENSITIVITY_CHOICES, default='internal')
    
    class Meta:
        db_table = 'structure_department'
        verbose_name = _('department')
        verbose_name_plural = _('departments')
        unique_together = [['tenant_id', 'code']]
        indexes = [
            models.Index(fields=['path']),
            models.Index(fields=['tenant_id', 'parent', 'is_active']),
            models.Index(fields=['tenant_id', 'code']),
            models.Index(fields=['cost_center_id']),
        ]
    
    def __str__(self):
        return f"{self.code} - {self.name}"
    def clean(self):
        if self.parent and self.parent.id == self.id:
            raise ValidationError({'parent': _("Department cannot be its own parent.")})
        if self.parent and self.parent.tenant_id != self.tenant_id:
            raise ValidationError({'parent': _("Parent department must belong to same tenant.")})
    def save(self, *args, **kwargs):
        self.full_clean()
        if not self.path and self.parent:
            self.path = f"{self.parent.path}/{self.code}" if self.parent.path else self.code
            self.depth = self.parent.depth + 1
        elif not self.path:
            self.path = self.code
            self.depth = 0
        super().save(*args, **kwargs)
    @property
    def full_path(self):
        if self.parent:
            return f"{self.parent.full_path} / {self.name}"
        return self.name
    
    def get_descendants(self, include_self=False):
        descendants = list(self.children.filter(is_deleted=False, is_active=True))
        for child in self.children.all():
            descendants.extend(child.get_descendants())
        if include_self:
            descendants.insert(0, self)
        return descendants