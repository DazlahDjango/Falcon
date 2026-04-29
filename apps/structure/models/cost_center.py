from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from .base import BaseStructureModel


class CostCenter(BaseStructureModel):
    CATEGORY_CHOICES = [
        ('operational', 'Operational'),
        ('capital', 'Capital'),
        ('project', 'Project'),
        ('departmental', 'Departmental'),
        ('shared', 'Shared Service'),
    ]
    name = models.CharField(_('name'), max_length=255, db_index=True)
    code = models.CharField(_('code'), max_length=50, unique=True, db_index=True)
    description = models.TextField(_('description'), blank=True)
    parent = models.ForeignKey('self', on_delete=models.PROTECT, null=True, blank=True, related_name='children', verbose_name=_('parent cost center'))
    category = models.CharField(_('category'), max_length=20, choices=CATEGORY_CHOICES, default='operational')
    budget_amount = models.DecimalField(_('budget amount'), max_digits=15, decimal_places=2, null=True, blank=True)
    fiscal_year = models.PositiveSmallIntegerField(_('fiscal year'), db_index=True)
    allocation_percentage = models.DecimalField(_('allocation percentage'), max_digits=5, decimal_places=2, default=100.00, validators=[MinValueValidator(0), MaxValueValidator(100)])
    is_active = models.BooleanField(_('active'), default=True, db_index=True)
    is_shared = models.BooleanField(_('shared service'), default=False, help_text=_("Cost center shared across multiple departments"))
    requires_budget_approval = models.BooleanField(_('requires budget approval'), default=True)
    authorized_approver_ids = models.JSONField(_('authorized approver user IDs'), default=list, blank=True)
    
    class Meta:
        db_table = 'structure_cost_center'
        verbose_name = _('cost center')
        verbose_name_plural = _('cost centers')
        indexes = [
            models.Index(fields=['tenant_id', 'code']),
            models.Index(fields=['tenant_id', 'fiscal_year', 'is_active']),
            models.Index(fields=['category']),
            models.Index(fields=['parent']),
        ]
    
    def __str__(self):
        return f"{self.code} - {self.name}"
    @property
    def used_budget(self):
        return 0
    @property
    def remaining_budget(self):
        if self.budget_amount:
            return self.budget_amount - self.used_budget
        return None