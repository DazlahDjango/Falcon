from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from .base import BaseKPIModel
from .framework import KPIFramework, KPICategory, Sector


class KPI(BaseKPIModel):
    KPI_TYPES = [
        ('COUNT', 'Count / Number'),
        ('PERCENTAGE', 'Percentage (%)'),
        ('FINANCIAL', 'Financial Amount'),
        ('MILESTONE', 'Yes / No Milestone'),
        ('TIME', 'Time / Turnaround'),
        ('IMPACT', 'Impact Score'),
    ]
    CALCULATION_LOGIC = [
        ('HIGHER_IS_BETTER', 'Higher is Better'),
        ('LOWER_IS_BETTER', 'Lower is Better'),
    ]
    MEASURE_TYPE = [
        ('CUMULATIVE', 'Cumulative (YTD)'),
        ('NON_CUMULATIVE', 'Non-Cumulative (Period Only)'),
    ]
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=100, db_index=True)
    description = models.TextField(blank=True)
    framework = models.ForeignKey(KPIFramework, on_delete=models.PROTECT, related_name='kpis')
    category = models.ForeignKey(KPICategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='kpis')
    sector = models.ForeignKey(Sector, on_delete=models.PROTECT)
    kpi_type = models.CharField(max_length=20, choices=KPI_TYPES)
    calculation_logic = models.CharField(max_length=20, choices=CALCULATION_LOGIC, default='HIGHER_IS_BETTER')
    measure_type = models.CharField(max_length=20, choices=MEASURE_TYPE, default='CUMULATIVE')
    unit = models.CharField(max_length=50, blank=True, help_text='e.g., KES, people, days etc')
    decimal_places = models.PositiveSmallIntegerField(default=0)
    target_min = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    target_max = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    formula = models.JSONField(default=dict, blank=True)
    owner = models.ForeignKey('accounts.User', on_delete=models.PROTECT, related_name='owner_kpis')
    department = models.ForeignKey('organisations.Department', on_delete=models.SET_NULL, null=True, blank=True, related_name='department_kpis')
    is_active = models.BooleanField(default=True)
    activation_date = models.DateField(null=True, blank=True)
    deactivation_date = models.DateField(null=True, blank=True)
    strategic_objective = models.CharField(max_length=255, blank=True, help_text="Linked strategic objective")
    metadata = models.JSONField(default=dict, blank=True)
    class Meta:
        db_table = 'kpi_definitions'
        ordering = ['name']
        unique_together = [['tenant_id', 'framework', 'code']]
        indexes = [
            models.Index(fields=['tenant_id', 'owner', 'is_active']),
            models.Index(fields=['tenant_id', 'sector', 'kpi_type']),
        ]

    def __str__(self):
        return self.name
    
    def clean(self):
        if self.target_min is not None and self.target_max is not None:
            if self.target_min > self.target_max:
                raise ValidationError("Target minimum cannot be greater than target maximum")
            
    def deactivate(self, user=None):
        self.is_active = False
        self.deactivation_date = timezone.now().date()
        self.updated_by = user
        self.save()

    def activate(self, user=None):
        self.is_active = True
        self.activation_date = timezone.now().date()
        self.updated_at = user
        self.save()

class KPIHistory(BaseKPIModel):
    ACTION_CHOICES = [
        ('CREATE', 'Created'),
        ('UPDATE', 'Updated'),
        ('ACTIVATE', 'Activated'),
        ('DEACTIVATE', 'Deactivated'),
        ('ARCHIVE', 'Archived'),
    ]
    kpi = models.ForeignKey(KPI, on_delete=models.CASCADE, related_name='history')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    snapshot = models.JSONField(help_text="Complete KPI snapshot at time of change")
    changes = models.JSONField(default=dict, blank=True)
    reason = models.TextField(blank=True)
    performed_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)
    performed_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'kpi_history'
        ordering = ['-performed_at']
        indexes = [
            models.Index(fields=['kpi', '-performed_at']),
            models.Index(fields=['performed_by', 'action']),
        ]
    def __str__(self):
        return f"{self.kpi.name} - {self.action} at {self.performed_at}"

class KPIWeight(BaseKPIModel):
    kpi = models.ForeignKey(KPI, on_delete=models.CASCADE, related_name='weights')
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='kpi_weights')
    weight = models.DecimalField(max_digits=5, decimal_places=2, help_text="Weight percentage (0-100)")
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    reason = models.TextField(blank=True)
    approved_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, related_name='approved_weights')
    
    class Meta:
        db_table = 'kpi_weights'
        unique_together = [['tenant_id', 'kpi', 'user', 'effective_from']]
        indexes = [
            models.Index(fields=['user', 'is_active', 'effective_from']),
        ]
    def __str__(self):
        return f"{self.kpi.name} @ {self.weight}% for {self.user.email}"
    
    def clean(self):
        if self.weight < 0 or self.weight > 100:
            raise ValidationError("Weight must be between 0 and 100")
        
class StrategicLinkage(BaseKPIModel):
    LINKAGE_TYPE = [
        ('PRIMARY', 'Primary Driver'),
        ('SECONDARY', 'Secondary Driver'),
        ('INDICATOR', 'Leading Indicator'),
        ('LAGGING', 'Lagging Indicator'),
    ]
    kpi = models.ForeignKey(KPI, on_delete=models.CASCADE, related_name='strategic_links')
    strategic_objective = models.CharField(max_length=255)
    objective_code = models.CharField(max_length=50, blank=True)
    linkage_type = models.CharField(max_length=20, choices=LINKAGE_TYPE, default='PRIMARY')
    weight = models.DecimalField(max_digits=5, decimal_places=2, default=1.0, help_text="Contribution weight")
    description = models.TextField(blank=True)
    class Meta:
        db_table = 'kpi_strategic_linkages'
        unique_together = [['tenant_id', 'kpi', 'strategic_objective']]

    def __str__(self):
        return f"{self.kpi.name} - {self.strategic_objective}"
    
class KPIDependency(BaseKPIModel):
    DEPENDENCY_TYPE = [
        ('DRIVER', 'Driver (affects)'),
        ('OUTCOME', 'Outcome (affected by)'),
        ('CORRELATED', 'Correlated'),
        ('CONSTRAINT', 'Constraint'),
    ]
    source_kpi = models.ForeignKey('KPI', on_delete=models.CASCADE, related_name='dependencies_as_source')
    target_kpi = models.ForeignKey('KPI', on_delete=models.CASCADE, related_name='dependencies_as_target')
    dependency_type = models.CharField(max_length=20, choices=DEPENDENCY_TYPE)
    impact_factor = models.DecimalField(max_digits=5, decimal_places=2, default=1.0, help_text="How much source affects target")
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    class Meta:
        db_table = 'kpi_dependencies'
        unique_together = [['tenant_id', 'source_kpi', 'target_kpi']]
    
    def __str__(self):
        return f"{self.source_kpi.name} → {self.target_kpi.name} ({self.dependency_type})"