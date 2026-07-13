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
            
        ]

    unit_lead_id = models.UUIDField(_('unit lead user ID'), null=True, blank=True, help_text=_("User ID of the unit lead"))
    section = models.ForeignKey('structure.Section', on_delete=models.PROTECT, null=True, blank=True, related_name='units', verbose_name=_('parent section'))

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.level = self.LEVEL

    def clean(self):
        # Override to allow Section, Department, or Root (None) as parent
        if self.parent and self.parent.id == self.id:
            from django.core.exceptions import ValidationError
            raise ValidationError({'parent': _("Node cannot be its own parent.")})
        if self.parent and self.parent.tenant_id != self.tenant_id:
            from django.core.exceptions import ValidationError
            raise ValidationError({'parent': _("Parent must belong to same tenant.")})
        
        if self.parent and self.parent.level not in [OrgLevel.SECTION, OrgLevel.DEPARTMENT]:
            from django.core.exceptions import ValidationError
            raise ValidationError({'parent': _("Parent level must be Section or Department.")})
            
        if self.level not in [choice[0] for choice in OrgLevel.choices]:
            from django.core.exceptions import ValidationError
            raise ValidationError({'level': _("Invalid organization level.")})

    def save(self, *args, **kwargs):
        self.level = self.LEVEL
        super().save(*args, **kwargs)

    def get_children_count(self):
        return 0
