from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from .hierarchical_mixin import HierarchicalMixin
from apps.structure.models.base import BaseStructureModel
from apps.structure.enums.org_level import OrgLevel

class OrganizationalNode(BaseStructureModel, HierarchicalMixin):
    name = models.CharField(_('name'), max_length=255, db_index=True)
    code = models.CharField(_('code'), max_length=50, db_index=True)
    description = models.TextField(_('description'), blank=True)
    is_active = models.BooleanField(_('active'), default=True, db_index=True)
    cost_center = models.ForeignKey('structure.CostCenter', on_delete=models.SET_NULL, null=True, blank=True, related_name='%(class)s_nodes', verbose_name=_('cost center'))
    manager = models.ForeignKey('structure.Position', on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_%(class)s_nodes', verbose_name=_('manager'))
    budget_code = models.CharField(_('budget code'), max_length=50, blank=True)
    headcount_limit = models.PositiveIntegerField(_('headcount limit'), null=True, blank=True)
    level = models.CharField(_('organization level'), max_length=20, choices=OrgLevel.choices, db_index=True)

    class Meta:
        abstract = True
        indexes = [
            models.Index(fields=['tenant_id', 'level', 'is_active']),
            models.Index(fields=['tenant_id', 'code']),
            models.Index(fields=['path']),
            models.Index(fields=['tenant_id', 'parent', 'is_active']),
            models.Index(fields=['cost_center']),
        ]

    def __str__(self):
        return f"{self.code} - {self.name}"

    def clean(self):
        if self.parent and self.parent.id == self.id:
            raise ValidationError({'parent': _("Node cannot be its own parent.")})
        if self.parent and self.parent.tenant_id != self.tenant_id:
            raise ValidationError({'parent': _("Parent must belong to same tenant.")})
        if self.parent and self.parent.level != self._get_parent_level():
            raise ValidationError({'parent': _("Parent level must be {0}").format(self._get_parent_level_display())})
        if self.level not in [choice[0] for choice in OrgLevel.choices]:
            raise ValidationError({'level': _("Invalid organization level.")})

    def save(self, *args, **kwargs):
        self.full_clean()
        if not self.path:
            if self.parent:
                self.path = f"{self.parent.path}/{self.code}" if self.parent.path else self.code
                self.depth = self.parent.depth + 1
            else:
                self.path = self.code
                self.depth = 0
        super().save(*args, **kwargs)

    def _get_parent_level(self):
        level_map = {
            OrgLevel.DIVISION: None,
            OrgLevel.DEPARTMENT: OrgLevel.DIVISION,
            OrgLevel.SECTION: OrgLevel.DEPARTMENT,
            OrgLevel.UNIT: OrgLevel.SECTION,
        }
        return level_map.get(self.level)

    def _get_parent_level_display(self):
        level = self._get_parent_level()
        return dict(OrgLevel.choices).get(level, '') if level else ''

    @property
    def full_path(self):
        return self.get_full_path()

    def get_children_with_level(self):
        return self.children.filter(is_deleted=False, is_active=True).select_related('parent')

    def get_subtree(self):
        return self.__class__.objects.filter(tenant_id=self.tenant_id, path__startswith=self.path, is_deleted=False)
