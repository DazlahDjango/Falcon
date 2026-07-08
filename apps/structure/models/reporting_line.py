from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from django.db import transaction
from .base import BaseStructureModel
from .employment import Employment
from apps.structure.managers.reporting_line import ReportingLineManager

class ReportingLine(BaseStructureModel):
    employee = models.ForeignKey(Employment, on_delete=models.PROTECT, related_name='managers', verbose_name=_('employee'))
    manager = models.ForeignKey(Employment, on_delete=models.PROTECT, related_name='direct_reports', verbose_name=_('manager'))
    effective_from = models.DateField(_('effective from'), db_index=True)
    effective_to = models.DateField(_('effective to'), null=True, blank=True, db_index=True)
    is_active = models.BooleanField(_('active'), default=True, db_index=True)
    change_reason = models.CharField(_('change reason'), max_length=255, blank=True)
    approved_by_id = models.UUIDField(_('approved by user ID'), null=True, blank=True)

    objects = ReportingLineManager()

    class Meta:
        db_table = 'structure_reporting_line'
        verbose_name = _('reporting line')
        verbose_name_plural = _('reporting lines')
        constraints = [
            models.UniqueConstraint(fields=['employee'], condition=models.Q(is_active=True), name='unique_active_reporting_per_employee'),
            models.CheckConstraint(check=~models.Q(employee=models.F('manager')), name='no_self_reporting'),
            models.CheckConstraint(check=models.Q(effective_from__lte=models.F('effective_to')), name='reporting_dates_valid', condition=models.Q(effective_to__isnull=False)),
        ]
        indexes = [
            models.Index(fields=['employee', 'is_active']),
            models.Index(fields=['manager', 'is_active']),
            models.Index(fields=['tenant_id', 'employee', 'manager']),
            models.Index(fields=['effective_from', 'effective_to']),
        ]

    def __str__(self):
        return f"{self.employee.user_id} → {self.manager.user_id}"

    def clean(self):
        if self.employee.user_id == self.manager.user_id:
            raise ValidationError(_("Employee cannot report to themselves."))
        if self.employee.tenant_id != self.manager.tenant_id:
            raise ValidationError(_("Employee and manager must belong to same tenant."))
        if self.effective_from and self.effective_to and self.effective_from > self.effective_to:
            raise ValidationError({'effective_from': _("Effective from cannot be after effective to.")})
        if self.employee.is_current is False:
            raise ValidationError({'employee': _("Cannot create reporting line for inactive employment.")})
        if self.manager.is_current is False:
            raise ValidationError({'manager': _("Manager must have active employment.")})

    def save(self, *args, **kwargs):
        with transaction.atomic():
            if self.is_active:
                ReportingLine.objects.filter(employee=self.employee, is_active=True).exclude(id=self.id).select_for_update().update(is_active=False, effective_to=self.effective_from)
            self.full_clean()
            super().save(*args, **kwargs)

    @property
    def is_current(self):
        from django.utils import timezone
        now = timezone.now().date()
        return self.is_active and self.effective_from <= now and (not self.effective_to or self.effective_to >= now)