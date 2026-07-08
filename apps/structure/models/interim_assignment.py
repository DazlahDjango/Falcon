from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from apps.structure.models.base import BaseStructureModel
from apps.structure.models.employment import Employment
from apps.structure.enums.reporting_type import ReportingType
from apps.structure.managers.interim_assignment import InterimAssignmentManager

class InterimAssignment(BaseStructureModel):
    employee = models.ForeignKey(Employment, on_delete=models.PROTECT, related_name='interim_assignments', verbose_name=_('employee'))
    interim_manager = models.ForeignKey(Employment, on_delete=models.PROTECT, related_name='interim_managements', verbose_name=_('interim manager'))
    effective_from = models.DateField(_('effective from'), db_index=True)
    effective_to = models.DateField(_('effective to'), db_index=True)
    reporting_type = models.CharField(_('reporting type'), max_length=20, choices=ReportingType.choices, default=ReportingType.INTERIM, db_index=True)
    reason = models.CharField(_('reason'), max_length=255, blank=True)
    is_active = models.BooleanField(_('active'), default=True, db_index=True)
    approved_by_id = models.UUIDField(_('approved by user ID'), null=True, blank=True)
    approved_at = models.DateTimeField(_('approved at'), null=True, blank=True)
    notes = models.TextField(_('notes'), blank=True)

    objects = InterimAssignmentManager()

    class Meta:
        db_table = 'structure_interim_assignment'
        verbose_name = _('interim assignment')
        verbose_name_plural = _('interim assignments')
        constraints = [
            models.CheckConstraint(check=models.Q(effective_from__lte=models.F('effective_to')), name='interim_dates_valid', condition=models.Q(effective_to__isnull=False)),
            models.UniqueConstraint(fields=['employee', 'effective_from', 'effective_to'], name='unique_interim_period_per_employee'),
        ]
        indexes = [
            models.Index(fields=['employee', 'is_active']),
            models.Index(fields=['interim_manager', 'is_active']),
            models.Index(fields=['effective_from', 'effective_to']),
            models.Index(fields=['tenant_id', 'employee', 'is_active']),
            models.Index(fields=['reporting_type']),
        ]

    def __str__(self):
        return f"{self.employee.user_id} → {self.interim_manager.user_id} ({self.effective_from} to {self.effective_to})"

    def clean(self):
        if self.employee.user_id == self.interim_manager.user_id:
            raise ValidationError(_("Employee cannot report to themselves."))
        if self.employee.tenant_id != self.interim_manager.tenant_id:
            raise ValidationError(_("Employee and interim manager must belong to same tenant."))
        if self.effective_from and self.effective_to and self.effective_from > self.effective_to:
            raise ValidationError({'effective_from': _("Effective from cannot be after effective to.")})
        if self.effective_from and self.effective_to and self.effective_from == self.effective_to:
            raise ValidationError({'effective_from': _("Interim assignment must last at least one day.")})
        if self.employee.is_current is False:
            raise ValidationError({'employee': _("Cannot assign interim manager to inactive employment.")})
        if self.interim_manager.is_current is False:
            raise ValidationError({'interim_manager': _("Interim manager must have active employment.")})
        existing = InterimAssignment.objects.filter(employee=self.employee, is_active=True).exclude(id=self.id)
        if existing.exists():
            raise ValidationError(_("Employee already has an active interim assignment."))

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    @property
    def is_current(self):
        from django.utils import timezone
        now = timezone.now().date()
        return self.is_active and self.effective_from <= now <= self.effective_to

    @property
    def days_remaining(self):
        from django.utils import timezone
        if self.is_active and self.effective_to:
            delta = self.effective_to - timezone.now().date()
            return delta.days if delta.days > 0 else 0
        return 0