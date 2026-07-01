from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.structure.abstract_models.organizational_node import OrganizationalNode
from apps.structure.enums.org_level import OrgLevel
from apps.structure.managers.unit import UnitManager

class Unit(OrganizationalNode):
    LEVEL = OrgLevel.UNIT
    objects = UnitManager()

    class Meta:
        db_table = 'structure_unit'
        verbose_name = _('unit')
        verbose_name_plural = _('units')
        constraints = [
            models.UniqueConstraint(fields=['tenant_id', 'code'], condition=models.Q(is_deleted=False), name='unique_tenant_unit_code'),
            models.UniqueConstraint(fields=['tenant_id', 'path'], condition=models.Q(is_deleted=False), name='unique_tenant_unit_path'),
        ]
        indexes = [
            models.Index(fields=['tenant_id', 'is_active']),
            models.Index(fields=['tenant_id', 'code']),
            models.Index(fields=['path']),
            models.Index(fields=['cost_center_id']),
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.level = self.LEVEL

    def save(self, *args, **kwargs):
        self.level = self.LEVEL
        super().save(*args, **kwargs)