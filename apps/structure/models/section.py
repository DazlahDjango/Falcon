from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.structure.abstract_models.organizational_node import OrganizationalNode
from apps.structure.enums.org_level import OrgLevel
from apps.structure.managers.section import SectionManager

class Section(OrganizationalNode):
    LEVEL = OrgLevel.SECTION
    objects = SectionManager()

    class Meta:
        db_table = 'structure_section'
        verbose_name = _('section')
        verbose_name_plural = _('sections')
        constraints = [
            models.UniqueConstraint(fields=['tenant_id', 'code'], condition=models.Q(is_deleted=False), name='unique_tenant_section_code'),
            models.UniqueConstraint(fields=['tenant_id', 'path'], condition=models.Q(is_deleted=False), name='unique_tenant_section_path'),
        ]
        indexes = [
            models.Index(fields=['tenant_id', 'is_active']),
            models.Index(fields=['tenant_id', 'code']),
            models.Index(fields=['path']),
            
        ]

    section_lead_id = models.UUIDField(_('section lead user ID'), null=True, blank=True, help_text=_("User ID of the section lead"))
    department = models.ForeignKey('structure.Department', on_delete=models.PROTECT, null=True, blank=True, related_name='sections', verbose_name=_('parent department'))

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.level = self.LEVEL

    def save(self, *args, **kwargs):
        self.level = self.LEVEL
        super().save(*args, **kwargs)

    def get_children_count(self):
        return self.units.filter(is_deleted=False, is_active=True).count()
