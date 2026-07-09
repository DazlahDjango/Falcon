from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from .base import BaseStructureModel
from apps.structure.managers.position import PositionManager

class Position(BaseStructureModel):
    title = models.CharField(_('title'), max_length=255, db_index=True)
    job_code = models.CharField(_('job code'), max_length=50, db_index=True)
    grade = models.CharField(_('grade level'), max_length=20, blank=True, db_index=True)
    level = models.PositiveSmallIntegerField(_('hierarchy level'), default=99, validators=[MinValueValidator(1), MaxValueValidator(20)])
    reports_to = models.ForeignKey('self', on_delete=models.PROTECT, null=True, blank=True, related_name='direct_reports', verbose_name=_('reports to position'))
    
    # Organizational Placement
    division = models.ForeignKey('structure.Division', on_delete=models.PROTECT, null=True, blank=True, related_name='positions', verbose_name=_('division'))
    department = models.ForeignKey('structure.Department', on_delete=models.PROTECT, null=True, blank=True, related_name='positions', verbose_name=_('department'))
    section = models.ForeignKey('structure.Section', on_delete=models.PROTECT, null=True, blank=True, related_name='positions', verbose_name=_('section'))
    unit = models.ForeignKey('structure.Unit', on_delete=models.PROTECT, null=True, blank=True, related_name='positions', verbose_name=_('unit'))
    
    # Financial Placement
    cost_center = models.ForeignKey('structure.CostCenter', on_delete=models.SET_NULL, null=True, blank=True, related_name='positions', verbose_name=_('cost center'))
    fte = models.DecimalField(_('FTE'), max_digits=4, decimal_places=2, default=1.00)
    
    min_tenure_months = models.PositiveSmallIntegerField(_('minimum tenure months'), default=0)
    required_competencies = models.JSONField(_('required competencies'), default=list, blank=True)
    is_single_incumbent = models.BooleanField(_('single incumbent only'), default=False, help_text=_("Only one person can hold this position"))
    current_incumbents_count = models.PositiveIntegerField(_('current incumbents'), default=0)
    max_incumbents = models.PositiveSmallIntegerField(_('maximum incumbents'), null=True, blank=True)
    requires_supervisor_approval = models.BooleanField(_('requires supervisor approval'), default=True)
    is_active = models.BooleanField(_('active'), default=True, db_index=True)

    objects = PositionManager()

    class Meta:
        db_table = 'structure_position'
        verbose_name = _('position')
        verbose_name_plural = _('positions')
        constraints = [
            models.UniqueConstraint(fields=['tenant_id', 'job_code'], condition=models.Q(is_deleted=False), name='unique_tenant_position_job_code')
        ]
        indexes = [
            models.Index(fields=['tenant_id', 'level']),
            models.Index(fields=['tenant_id', 'grade']),
            models.Index(fields=['job_code']),
            models.Index(fields=['reports_to']),
            models.Index(fields=['tenant_id', 'is_active']),
        ]

    def __str__(self):
        return f"{self.job_code} - {self.title}"

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.reports_to and self.reports_to.id == self.id:
            raise ValidationError({'reports_to': _("Position cannot report to itself.")})
        if self.is_single_incumbent and self.current_incumbents_count > 1:
            raise ValidationError({'is_single_incumbent': _("Cannot have multiple incumbents for single-incumbent position.")})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    @property
    def is_vacant(self):
        return self.current_incumbents_count == 0

    @property
    def is_over_occupied(self):
        if self.max_incumbents:
            return self.current_incumbents_count > self.max_incumbents
        return False