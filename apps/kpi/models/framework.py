from django.db import models
from .base import BaseKPIModel

class Sector(BaseKPIModel):
    SECTOR_TYPES = [
        ('COMMERCIAL', 'Commercial / Corporate'),
        ('NGO', 'NGO / Non-Profit'),
        ('PUBLIC', 'Public Sector / Government'),
        ('CONSULTING', 'Consulting / Professional Services'),
    ]
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True, db_index=True)
    sector_type = models.CharField(max_length=30, choices=SECTOR_TYPES)
    description = models.TextField(blank=False)
    icon = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)
    metadata = models.JSONField(default=dict, blank=True)
    class Meta:
        db_table = 'kpi_sectors'
        ordering = ['name']
        unique_together = [['tenant_id', 'code']]
    
    def __str__(self):
        return f"{self.get_sector_type_display()} - {self.name}"
    
class KPIFramework(BaseKPIModel):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('PUBLISHED', 'Published'),
        ('ARCHIVED', 'Archived'),
    ]
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, db_index=True)
    sector = models.ForeignKey(Sector, on_delete=models.PROTECT, related_name='frameworks')
    description = models.TextField(blank=True)
    version = models.CharField(max_length=20, default='1.0.0')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    is_default = models.BooleanField(default=False)
    effective_from = models.DateField(null=True, blank=True)
    effective_to = models.DateField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    class Meta:
        db_table = 'kpi_frameworks'
        ordering = ['-version', 'name']
        unique_together = [['tenant_id', 'sector', 'code', 'version']]
    def __str__(self):
        return f"{self.sector.code}:{self.name} v{self.version}"
    
    def publish(self):
        self.status = 'PUBLISHED'
        self.save()
    
    def achieve(self):
        self.status = 'ARCHIVED'
        self.save()

class KPICategory(BaseKPIModel):
    CATEGORY_TYPES = [
        ('FINANCIAL', 'Financial'),
        ('IMPACT', 'Impact / Outcomes'),
        ('OPERATIONAL', 'Operational'),
        ('CUSTOMER', 'Customer / Stakeholder'),
        ('INTERNAL', 'Internal Process'),
        ('GROWTH', 'Growth & Learning'),
        ('COMPLIANCE', 'Compliance & Risk'),
    ]
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50, db_index=True)
    category_type = models.CharField(max_length=20, choices=CATEGORY_TYPES)
    framework = models.ForeignKey(KPIFramework, on_delete=models.CASCADE, related_name='categories', blank=True, null=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    description = models.TextField(blank=True)
    color = models.CharField(max_length=20, blank=True, help_text="Hex color code for UI")
    icon = models.CharField(max_length=50, blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    class Meta:
        db_table = 'kpi_categories'
        ordering = ['display_order', 'name']
        unique_together = [['tenant_id', 'framework', 'code']]

    def __str__(self):
        return self.name
    
class KPITemplate(BaseKPIModel):
    DIFFICULTY_CHOICES = [
        ('BEGINNER', 'Beginner'),
        ('INTERMEDIATE', 'Intermediate'),
        ('ADVANCED', 'Advanced'),
    ]
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, db_index=True)
    sector = models.ForeignKey(Sector, on_delete=models.PROTECT, related_name='templates')
    category = models.ForeignKey(KPICategory, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField(blank=True)
    kpi_definition = models.JSONField(help_text="KPI definition template structure")
    target_phasing_pattern = models.JSONField(default=dict, blank=True, help_text="Default monthly distribution pattern")
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='INTERMEDIATE')
    is_published = models.BooleanField(default=False)
    usage_count = models.PositiveIntegerField(default=0)
    metadata = models.JSONField(default=dict, blank=True)
    class Meta:
        db_table = 'kpi_templates'
        ordering = ['sector', 'name']
        unique_together = [['tenant_id', 'sector', 'code']]
    
    def __str__(self):
        return f"[{self.sector.code}] {self.name}"
    
    def increment_usage(self):
        self.usage_count += 1
        self.save(update_fields=['usage_count'])