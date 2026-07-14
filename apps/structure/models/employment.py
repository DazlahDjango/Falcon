from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from django.db import transaction
from .base import BaseStructureModel
from .position import Position
from apps.structure.managers.employment import EmploymentManager

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
    fte_allocation = models.DecimalField(_('FTE allocation'), max_digits=4, decimal_places=2, default=1.0, help_text=_("Full-time equivalent allocation for this position (e.g., 1.0, 0.5)"))
    is_primary = models.BooleanField(_('is primary'), default=True, help_text=_("Is this the primary employment record for the user?"))
    effective_from = models.DateField(_('effective from'), db_index=True)
    effective_to = models.DateField(_('effective to'), null=True, blank=True)
    is_current = models.BooleanField(_('current'), default=True, db_index=True)
    employment_type = models.CharField(_('employment type'), max_length=20, choices=EMPLOYMENT_TYPE_CHOICES, default='permanent')
    is_manager = models.BooleanField(_('is manager'), default=False, db_index=True, help_text=_("Can this person approve requests?"))
    is_executive = models.BooleanField(_('is executive'), default=False, db_index=True)
    is_board_member = models.BooleanField(_('is board member'), default=False)
    is_team_lead = models.BooleanField(_('is team lead'), default=False, db_index=True)
    change_reason = models.CharField(_('change reason'), max_length=255, blank=True)
    approved_by_id = models.UUIDField(_('approved by user ID'), null=True, blank=True)
    is_active = models.BooleanField(_('active'), default=True, db_index=True)

    objects = EmploymentManager()

    class Meta:
        db_table = 'structure_employment'
        verbose_name = _('employment')
        verbose_name_plural = _('employments')
        constraints = [
            models.CheckConstraint(check=models.Q(effective_from__lte=models.F('effective_to')), name='employment_dates_valid', condition=models.Q(effective_to__isnull=False)),
            models.CheckConstraint(check=models.Q(fte_allocation__gt=0, fte_allocation__lte=1.0), name='employment_fte_valid'),
        ]
        indexes = [
            models.Index(fields=['user_id', 'is_current']),
            models.Index(fields=['position', 'is_current']),
            models.Index(fields=['user_id', 'is_primary', 'is_current']),
            models.Index(fields=['effective_from', 'effective_to']),
            models.Index(fields=['tenant_id', 'user_id', 'is_active']),
        ]

    def __str__(self):
        return f"User {self.user_id} → {self.position.job_code}"

    def clean(self):
        if self.effective_from and self.effective_to and self.effective_from > self.effective_to:
            raise ValidationError({'effective_from': _("Effective from cannot be after effective to.")})
        if self.position and self.position.tenant_id != self.tenant_id:
            raise ValidationError({'position': _("Position must belong to same tenant.")})

    def save(self, *args, **kwargs):
        with transaction.atomic():
            if self.is_current and self.effective_to:
                self.effective_to = None
            if self.is_primary:
                Employment.objects.filter(user_id=self.user_id, is_primary=True, is_current=True).exclude(id=self.id).select_for_update().update(is_primary=False)
            if self.position and self.position.is_single_incumbent:
                Employment.objects.filter(position=self.position, is_current=True).exclude(id=self.id).select_for_update().update(is_current=False, effective_to=self.effective_from)
            self.full_clean()
            super().save(*args, **kwargs)

    @property
    def manager_user_id(self):
        if self.position and self.position.reports_to:
            manager_employment = Employment.objects.filter(position=self.position.reports_to, is_current=True, is_deleted=False).first()
            if manager_employment:
                return manager_employment.user_id
        return None

    @property
    def interim_manager_user_id(self):
        from apps.structure.models.interim_assignment import InterimAssignment
        interim = InterimAssignment.objects.current_by_employee(self.id).first()
        if interim:
            return interim.interim_manager.user_id
        return None

    @property
    def effective_manager_user_id(self):
        interim = self.interim_manager_user_id
        return interim if interim else self.manager_user_id