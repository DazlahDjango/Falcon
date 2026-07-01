from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.structure.abstract_models.organizational_node import OrganizationalNode
from apps.structure.managers.organizational_unit import OrganizationalUnitManager

class OrganizationalUnit(OrganizationalNode):
    objects = OrganizationalUnitManager()

    class Meta:
        abstract = False
        db_table = 'structure_organizational_unit'
        verbose_name = _('organizational unit')
        verbose_name_plural = _('organizational units')
        constraints = [
            models.UniqueConstraint(fields=['tenant_id', 'code'], condition=models.Q(is_deleted=False), name='unique_tenant_org_unit_code'),
            models.UniqueConstraint(fields=['tenant_id', 'path'], condition=models.Q(is_deleted=False), name='unique_tenant_org_unit_path'),
        ]
        indexes = [
            models.Index(fields=['tenant_id', 'level', 'is_active']),
            models.Index(fields=['tenant_id', 'code']),
            models.Index(fields=['path']),
            models.Index(fields=['tenant_id', 'parent', 'is_active']),
            models.Index(fields=['cost_center_id']),
        ]

    def __str__(self):
        return f"{self.get_level_display()}: {self.code} - {self.name}"