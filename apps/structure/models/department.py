from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from .base import BaseStructureModel
from apps.structure.managers.department import DepartmentManager
from apps.structure.enums.org_level import OrgLevel

class Department(BaseStructureModel):
    SENSITIVITY_CHOICES = [
        ('public', 'Public'),
        ('internal', 'Internal'),
        ('confidential', 'Confidential'),
        ('restricted', 'Restricted'),
    ]
    name = models.CharField(_('name'), max_length=255, db_index=True)
    code = models.CharField(_('code'), max_length=50, db_index=True)
    description = models.TextField(_('description'), blank=True)
    parent = models.ForeignKey('self', on_delete=models.PROTECT, null=True, blank=True, related_name='children', verbose_name=_('parent department'))
    path = models.CharField(_('materialized path'), max_length=255, db_index=True, blank=True)
    depth = models.PositiveSmallIntegerField(_('depth'), default=0)
    
    budget_code = models.CharField(_('budget code'), max_length=50, blank=True)
    headcount_limit = models.PositiveIntegerField(_('headcount limit'), null=True, blank=True)
    is_active = models.BooleanField(_('active'), default=True, db_index=True)
    sensitivity_level = models.CharField(_('sensitivity level'), max_length=20, choices=SENSITIVITY_CHOICES, default='internal')
    manager_id = models.UUIDField(_('manager user ID'), null=True, blank=True, help_text=_("User ID of the department manager"))
    division = models.ForeignKey('structure.Division', on_delete=models.PROTECT, null=True, blank=True, related_name='departments', verbose_name=_('parent division'))

    objects = DepartmentManager()

    class Meta:
        db_table = 'structure_department'
        verbose_name = _('department')
        verbose_name_plural = _('departments')
        constraints = [
            models.UniqueConstraint(fields=['tenant_id', 'code'], condition=models.Q(is_deleted=False), name='unique_tenant_department_code')
        ]
        indexes = [
            models.Index(fields=['path']),
            models.Index(fields=['tenant_id', 'parent', 'is_active']),
            models.Index(fields=['tenant_id', 'code']),
            
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
        if self.pk:
            old = Department.objects.filter(pk=self.pk).first()
            if old and (old.code != self.code or old.parent_id != self.parent_id):
                self.path = self._compute_path()
                self.depth = self._compute_depth()
        elif not self.path:
            if self.parent:
                self.path = f"{self.parent.path}/{self.code}" if self.parent.path else self.code
                self.depth = self.parent.depth + 1
            else:
                self.path = self.code
                self.depth = 0
        super().save(*args, **kwargs)

    def _compute_path(self):
        if self.parent:
            return f"{self.parent.path}/{self.code}" if self.parent.path else self.code
        return self.code

    def _compute_depth(self):
        if self.parent:
            return self.parent.depth + 1
        return 0

    @property
    def full_path(self):
        if self.parent:
            return f"{self.parent.full_path} / {self.name}"
        return self.name

    def get_full_path(self, separator=' / '):
        ancestors = self.get_ancestors()
        path_parts = [a.name for a in reversed(ancestors)] + [self.name]
        return separator.join(path_parts)

    @property
    def level(self):
        return OrgLevel.DEPARTMENT

    @property
    def get_level_display(self):
        return dict(OrgLevel.choices).get(self.level, '')

    def get_descendants(self, include_self=False):
        descendants = list(self.children.filter(is_deleted=False, is_active=True))
        for child in self.children.all():
            descendants.extend(child.get_descendants())
        if include_self:
            descendants.insert(0, self)
        return descendants

    def get_ancestors(self):
        ancestors = []
        current = self
        while current.parent:
            ancestors.append(current.parent)
            current = current.parent
        return ancestors

    def get_children_count(self):
        sub_depts = self.children.filter(is_deleted=False, is_active=True).count()
        sections = self.sections.filter(is_deleted=False, is_active=True).count()
        return sub_depts + sections
