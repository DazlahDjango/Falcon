from django.db import models
from django.utils.translation import gettext_lazy as _
from .base import BaseStructureModel
from .department import Department

class Team(BaseStructureModel):
    name = models.CharField(_('name'), max_length=255, db_index=True)
    code = models.CharField(_('code'), max_length=50, db_index=True)
    description = models.TextField(_('description'), blank=True)
    department = models.ForeignKey(Department, on_delete=models.PROTECT, related_name='teams', verbose_name=_('department'))
    parent_team = models.ForeignKey('self', on_delete=models.PROTECT, null=True, blank=True, related_name='sub_teams', verbose_name=_('parent team'))
    team_lead = models.UUIDField(_('team lead user ID'), null=True, blank=True, db_index=True)
    is_active = models.BooleanField(_('active'), default=True, db_index=True)
    max_members = models.PositiveSmallIntegerField(_('maximum members'), null=True, blank=True)
    
    class Meta:
        db_table = 'structure_team'
        verbose_name = _('team')
        verbose_name_plural = _('teams')
        unique_together = [['tenant_id', 'department', 'code']]
        indexes = [
            models.Index(fields=['tenant_id', 'department', 'is_active']),
            models.Index(fields=['tenant_id', 'team_lead']),
            models.Index(fields=['code']),
        ]
    
    def __str__(self):
        return f"{self.department.code}/{self.code} - {self.name}"
    def clean(self):
        if self.parent_team and self.parent_team.department != self.department:
            from django.core.exceptions import ValidationError
            raise ValidationError({'parent_team': _("Parent team must belong to same department.")})
    @property
    def full_name(self):
        """Returns 'Department/Team/Subteam' format"""
        if self.parent_team:
            return f"{self.parent_team.full_name} / {self.name}"
        return f"{self.department.name} / {self.name}"