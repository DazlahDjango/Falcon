# apps/reviews/models/cycle.py
"""
Review Cycle Model - Defines the period and rules for performance reviews
MODELS ONLY - No business logic here
"""

from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator

from .base import ReviewBaseModel, ReviewStatusMixin
from .rating_scale import RatingScale
from .competency import Competency


class ReviewCycle(ReviewBaseModel, ReviewStatusMixin):
    """
    Defines a performance review period (e.g., "2024 End-Year Review").
    MODELS ONLY - Contains only data fields and basic validation.
    All business logic goes in services/ directory.
    """
    
    class CycleType(models.TextChoices):
        MID_YEAR = 'mid_year', 'Mid-Year Review'
        END_YEAR = 'end_year', 'End-Year Review'
        QUARTERLY = 'quarterly', 'Quarterly Review'
        PROBATION = 'probation', 'Probation Review'
        SPECIAL = 'special', 'Special Review'
        PIP = 'pip', 'PIP Review'
    
    # ========== Basic Information ==========
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    cycle_type = models.CharField(max_length=20, choices=CycleType.choices, default=CycleType.END_YEAR)
    
    # ========== Date Configuration ==========
    start_date = models.DateField()
    self_assessment_deadline = models.DateField()
    supervisor_review_deadline = models.DateField()
    calibration_date = models.DateField(null=True, blank=True)
    final_approval_deadline = models.DateField()
    end_date = models.DateField()
    
    # ========== Score Weight Configuration ==========
    kpi_weight = models.DecimalField(max_digits=5, decimal_places=2, default=70.00)
    competency_weight = models.DecimalField(max_digits=5, decimal_places=2, default=30.00)
    mission_weight = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    task_weight = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    
    # ========== Rating Configuration ==========
    rating_scale = models.ForeignKey(
        RatingScale,
        on_delete=models.PROTECT,
        related_name='review_cycles'
    )
    
    competencies = models.ManyToManyField(
        Competency,
        through='CycleCompetency',
        related_name='review_cycles'
    )
    
    # ========== Scope Configuration ==========
    include_all_departments = models.BooleanField(default=True)
    included_departments = models.ManyToManyField('structure.Department', blank=True)
    included_positions = models.ManyToManyField('structure.Position', blank=True)
    
    # ========== Feature Flags ==========
    require_self_assessment = models.BooleanField(default=True)
    allow_self_assessment_edit = models.BooleanField(default=True)
    require_360_feedback = models.BooleanField(default=False)
    enable_calibration = models.BooleanField(default=True)
    
    # ========== KPI Period Configuration ==========
    kpi_start_date = models.DateField(null=True, blank=True)
    kpi_end_date = models.DateField(null=True, blank=True)
    
    class Meta:
        db_table = 'reviews_cycles'
        ordering = ['-start_date']
        indexes = [
            models.Index(fields=['tenant_id', 'status']),
            models.Index(fields=['tenant_id', 'start_date']),
            models.Index(fields=['tenant_id', 'cycle_type']),
        ]
    
    def __str__(self):
        return self.name
    
    def clean(self):
        """Basic validation only - NO business logic"""
        super().clean()
        
        if self.start_date >= self.self_assessment_deadline:
            raise ValidationError({'self_assessment_deadline': 'Must be after start date'})
        
        if self.self_assessment_deadline >= self.supervisor_review_deadline:
            raise ValidationError({'supervisor_review_deadline': 'Must be after self-assessment deadline'})
        
        if self.supervisor_review_deadline >= self.final_approval_deadline:
            raise ValidationError({'final_approval_deadline': 'Must be after supervisor review deadline'})
        
        if self.final_approval_deadline >= self.end_date:
            raise ValidationError({'end_date': 'Must be after final approval deadline'})
        
        # Validate weights sum to approximately 100%
        total_weight = float(self.kpi_weight) + float(self.competency_weight) + \
                       float(self.mission_weight) + float(self.task_weight)
        
        if total_weight < 95 or total_weight > 105:
            raise ValidationError(f'Total weights sum to {total_weight}%. Must be 100%')
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class CycleCompetency(models.Model):
    """
    Through model for Cycle - Competency relationship.
    Allows custom weight per competency for each cycle.
    """
    
    review_cycle = models.ForeignKey(ReviewCycle, on_delete=models.CASCADE)
    competency = models.ForeignKey(Competency, on_delete=models.CASCADE)
    
    weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    
    display_order = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'reviews_cycle_competencies'
        unique_together = [['review_cycle', 'competency']]
        ordering = ['display_order']
    
    def __str__(self):
        return f"{self.review_cycle.name} - {self.competency.name} ({self.weight}%)"