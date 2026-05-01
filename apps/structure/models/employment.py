from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from .base import BaseStructureModel
from .department import Department
from .team import Team
from .position import Position

class Employment(BaseStructureModel):
    EMPLOYMENT_TYPE_CHOICES = [
        ('permanent', 'Permanent'),
        ('contract', 'Contract'),
        ('probation', 'Probation'),
        ('intern', 'Intern'),
        ('consultant', 'Consultant'),
        ('temporary', 'Temporary'),
    ]
    user_id = models.UUIDField(_('user ID'), db_index=True, help_text=_("Reference to accounts.User"))
    position = models.ForeignKey(Position, on_delete=models.PROTECT, related_name='employments', verbose_name=_('position'))
    department = models.ForeignKey(Department, on_delete=models.PROTECT, related_name='employments', verbose_name=_('department'))
    team = models.ForeignKey(Team, on_delete=models.PROTECT, null=True, blank=True, related_name='employments', verbose_name=_('team'))
    effective_from = models.DateField(_('effective from'), db_index=True)
    effective_to = models.DateField(_('effective to'), null=True, blank=True)
    is_current = models.BooleanField(_('current'), default=True, db_index=True)
    employment_type = models.CharField(_('employment type'), max_length=20, choices=EMPLOYMENT_TYPE_CHOICES, default='permanent')
    is_manager = models.BooleanField(_('is manager'), default=False, db_index=True, help_text=_("Can this person approve timesheets/reviews?"))
    is_executive = models.BooleanField(_('is executive'), default=False, db_index=True)
    is_board_member = models.BooleanField(_('is board member'), default=False)
    dotted_line_manager = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='dotted_line_reports', verbose_name=_('dotted line manager'))
    change_reason = models.CharField(_('change reason'), max_length=255, blank=True)
    approved_by_id = models.UUIDField(_('approved by user ID'), null=True, blank=True)
    is_active = models.BooleanField(_('active'), default=True, db_index=True)
    
    class Meta:
        db_table = 'structure_employment'
        verbose_name = _('employment')
        verbose_name_plural = _('employments')
        constraints = [
            models.UniqueConstraint(fields=['user_id', 'is_current'], condition=models.Q(is_current=True), name='unique_current_employment_per_user'),
            models.CheckConstraint(check=models.Q(effective_from__lte=models.F('effective_to')), name='employment_dates_valid', condition=models.Q(effective_to__isnull=False)),
        ]
        indexes = [
            models.Index(fields=['user_id', 'is_current']),
            models.Index(fields=['department', 'is_current']),
            models.Index(fields=['position', 'is_current']),
            models.Index(fields=['effective_from', 'effective_to']),
            models.Index(fields=['tenant_id', 'user_id', 'is_active']),
        ]
    def __str__(self):
        return f"User {self.user_id} → {self.position.job_code}"
    def clean(self):
        if self.effective_from and self.effective_to and self.effective_from > self.effective_to:
            raise ValidationError({'effective_from': _("Effective from date cannot be after effective to date.")})
        if self.dotted_line_manager and self.dotted_line_manager.user_id == self.user_id:
            raise ValidationError({'dotted_line_manager': _("User cannot be their own dotted line manager.")})
        if self.position and self.position.tenant_id != self.tenant_id:
            raise ValidationError({'position': _("Position must belong to same tenant.")})
    def save(self, *args, **kwargs):
        if self.is_current and self.effective_to:
            self.effective_to = None
        if self.is_current:
            Employment.objects.filter(user_id=self.user_id, is_current=True).exclude(id=self.id).update(is_current=False, effective_to=self.effective_from)
        if self.position and self.position.is_single_incumbent:
            Employment.objects.filter(position=self.position, is_current=True).exclude(id=self.id).update(is_current=False, effective_to=self.effective_from)
        super().save(*args, **kwargs)
    @property
    def manager_user_id(self):
        if self.position and self.position.reports_to:
            manager_employment = Employment.objects.filter(position=self.position.reports_to, is_current=True, tenant_id=self.tenant_id).first()
            if manager_employment:
                return manager_employment.user_id
        return None