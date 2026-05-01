from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from .base import BaseStructureModel
from .employment import Employment


class ReportingLine(BaseStructureModel):
    RELATION_TYPE_CHOICES = [
        ('solid', _('Solid Line (Direct Manager)')),
        ('dotted', _('Dotted Line (Functional Lead)')),
        ('interim', _('Interim/Temporary')),
        ('project', _('Project-Based')),
        ('matrix', _('Matrix Manager')),
    ]
    employee = models.ForeignKey(Employment, on_delete=models.PROTECT, related_name='managers', verbose_name=_('employee'))
    manager = models.ForeignKey(Employment, on_delete=models.PROTECT, related_name='direct_reports', verbose_name=_('manager'))
    relation_type = models.CharField(_('relationship type'), max_length=20, choices=RELATION_TYPE_CHOICES, default='solid', db_index=True)
    effective_from = models.DateField(_('effective from'), db_index=True)
    effective_to = models.DateField(_('effective to'), null=True, blank=True, db_index=True)
    is_active = models.BooleanField(_('active'), default=True, db_index=True)
    reporting_weight = models.DecimalField(_('reporting weight'), max_digits=3, decimal_places=2, default=1.00, help_text=_("Weight for performance evaluation distribution"))
    can_approve_kpi = models.BooleanField(_('can approve KPI'), default=True, help_text=_("Can this manager approve employee's KPI entries?"))
    can_conduct_review = models.BooleanField(_('can conduct review'), default=True, help_text=_("Can this manager conduct performance reviews?"))
    can_approve_leave = models.BooleanField(_('can approve leave'), default=False)
    can_approve_expenses = models.BooleanField(_('can approve expenses'), default=False)
    change_reason = models.CharField(_('change reason'), max_length=255, blank=True)
    approved_by_id = models.UUIDField(_('approved by user ID'), null=True, blank=True)
    class Meta:
        db_table = 'structure_reporting_line'
        verbose_name = _('reporting line')
        verbose_name_plural = _('reporting lines')
        constraints = [
            models.UniqueConstraint(fields=['employee', 'manager', 'relation_type'], condition=models.Q(is_active=True), name='unique_active_reporting_relationship'),
            models.CheckConstraint(check=~models.Q(employee=models.F('manager')), name='no_self_reporting'),
            models.CheckConstraint(check=models.Q(effective_from__lte=models.F('effective_to')), name='reporting_dates_valid', condition=models.Q(effective_to__isnull=False)),
        ]
        indexes = [
            models.Index(fields=['employee', 'is_active']),
            models.Index(fields=['manager', 'is_active']),
            models.Index(fields=['relation_type', 'is_active']),
            models.Index(fields=['tenant_id', 'employee', 'manager']),
            models.Index(fields=['effective_from', 'effective_to']),
        ]
    def __str__(self):
        return f"{self.employee.user_id} → {self.manager.user_id} ({self.get_relation_type_display()})"
    def clean(self):
        if self.employee.user_id == self.manager.user_id:
            raise ValidationError(_("Employee cannot report to themselves."))
        if self.employee.tenant_id != self.manager.tenant_id:
            raise ValidationError(_("Employee and manager must belong to same tenant."))
        if self.effective_from and self.effective_to and self.effective_from > self.effective_to:
            raise ValidationError({'effective_from': _("Effective from cannot be after effective to.")})
    def save(self, *args, **kwargs):
        self.full_clean()
        if self.relation_type == 'solid':
            ReportingLine.objects.filter(employee=self.employee, relation_type='solid', is_active=True).exclude(id=self.id).update(is_active=False, effective_to=self.effective_from)
        super().save(*args, **kwargs)