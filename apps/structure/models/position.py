from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from .base import BaseStructureModel
from .department import Department

class Position(BaseStructureModel):
    RELATIONSHIP_TYPE_CHOICES = [
        ('solid', 'Solid Line (Direct Manager)'),
        ('dotted', 'Dotted Line (Functional Lead)'),
        ('matrix', 'Matrix Manager'),
        ('project', 'Project-Based'),
    ]
    title = models.CharField(_('title'), max_length=255, db_index=True)
    job_code = models.CharField(_('job code'), max_length=50, unique=True, db_index=True)
    grade = models.CharField(_('grade level'), max_length=20, blank=True, db_index=True)
    level = models.PositiveSmallIntegerField(_('hierarchy level'), default=99, validators=[MinValueValidator(1), MaxValueValidator(20)])
    reports_to = models.ForeignKey('self', on_delete=models.PROTECT, null=True, blank=True, related_name='direct_reports', verbose_name=_('reports to position'))
    default_department = models.ForeignKey(Department, on_delete=models.PROTECT, null=True, blank=True, verbose_name=_('default department'))
    default_reporting_type = models.CharField(_('default reporting type'), max_length=20, choices=RELATIONSHIP_TYPE_CHOICES, default='solid')
    min_tenure_months = models.PositiveSmallIntegerField(_('minimum tenure months'), default=0)
    required_competencies = models.JSONField(_('required competencies'), default=list, blank=True)
    is_single_incumbent = models.BooleanField(_('single incumbent only'), default=False, help_text=_("Only one person can hold this position"))
    current_incumbents_count = models.PositiveIntegerField(_('current incumbents'), default=0)
    max_incumbents = models.PositiveSmallIntegerField(_('maximum incumbents'), null=True, blank=True)
    requires_supervisor_approval = models.BooleanField(_('requires supervisor approval'), default=True)
    
    class Meta:
        db_table = 'structure_position'
        verbose_name = _('position')
        verbose_name_plural = _('positions')
        indexes = [
            models.Index(fields=['tenant_id', 'level']),
            models.Index(fields=['tenant_id', 'grade']),
            models.Index(fields=['job_code']),
            models.Index(fields=['reports_to']),
        ]
    def __str__(self):
        return f"{self.job_code} - {self.title}"
    def clean(self):
        from django.core.exceptions import ValidationError
        if self.reports_to and self.reports_to.id == self.id:
            raise ValidationError({'reports_to': _("Position cannot report to itself.")})
        if self.is_single_incumbent and self.current_incumbents_count > 1:
            raise ValidationError({'is_single_incumbent': _("Cannot have multiple incumbents for single-incumbent position.")})
    @property
    def is_vacant(self):
        return self.current_incumbents_count == 0
    @property
    def is_over_occupied(self):
        if self.max_incumbents:
            return self.current_incumbents_count > self.max_incumbents
        return False