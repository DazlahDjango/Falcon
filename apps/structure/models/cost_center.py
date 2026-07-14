from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from .base import BaseStructureModel
from apps.structure.managers.base import BaseStructureManager

class CostCenter(BaseStructureModel):
    CATEGORY_CHOICES = [
        ('operational', 'Operational'),
        ('capital', 'Capital'),
        ('project', 'Project'),
        ('departmental', 'Departmental'),
        ('shared', 'Shared Service'),
    ]
    name = models.CharField(_('name'), max_length=255, db_index=True)
    code = models.CharField(_('code'), max_length=50, db_index=True)
    description = models.TextField(_('description'), blank=True)
    category = models.CharField(_('category'), max_length=20, choices=CATEGORY_CHOICES, default='operational')
    currency = models.CharField(_('currency'), max_length=3, default='USD')
    budget_amount = models.DecimalField(_('budget amount'), max_digits=15, decimal_places=2, null=True, blank=True)
    fiscal_year = models.PositiveSmallIntegerField(_('fiscal year'), db_index=True)
    allocation_percentage = models.DecimalField(_('allocation percentage'), max_digits=5, decimal_places=2, default=100.00, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    manager = models.ForeignKey('structure.Employment', on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_cost_centers', verbose_name=_('manager'))
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='child_cost_centers', verbose_name=_('parent cost center'))
    
    valid_from = models.DateField(_('valid from'), null=True, blank=True)
    valid_to = models.DateField(_('valid to'), null=True, blank=True)
    custom_attributes = models.JSONField(_('custom attributes'), default=dict, blank=True)
    
    is_active = models.BooleanField(_('active'), default=True, db_index=True)
    is_shared = models.BooleanField(_('shared service'), default=False, help_text=_("Cost center shared across multiple units"))
    requires_budget_approval = models.BooleanField(_('requires budget approval'), default=True)
    authorized_approver_ids = models.JSONField(_('authorized approver user IDs'), default=list, blank=True)

    objects = BaseStructureManager()

    class Meta:
        db_table = 'structure_cost_center'
        verbose_name = _('cost center')
        verbose_name_plural = _('cost centers')
        constraints = [
            models.UniqueConstraint(fields=['tenant_id', 'code'], condition=models.Q(is_deleted=False), name='unique_tenant_cost_center_code')
        ]
        indexes = [
            models.Index(fields=['tenant_id', 'code']),
            models.Index(fields=['tenant_id', 'fiscal_year', 'is_active']),
            models.Index(fields=['category']),
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