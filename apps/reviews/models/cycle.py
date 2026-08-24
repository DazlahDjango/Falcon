from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator
from .base import ReviewBaseModel, ReviewStatusMixin

class ReviewCycle(ReviewBaseModel, ReviewStatusMixin):
    class CycleType(models.TextChoices):
        ANNUAL = 'annual', 'Annual Review'
        MID_YEAR = 'mid_year', 'Mid-Year Review'
        END_YEAR = 'end_year', 'End-Year Review'
        QUARTERLY = 'quarterly', 'Quarterly Review'
        MONTHLY = 'monthly', 'Monthly Review'
        PROBATION = 'probation', 'Probation Review'
        SPECIAL = 'special', 'Special Review'
        PIP = 'pip', 'PIP Review'
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    cycle_type = models.CharField(max_length=20, choices=CycleType.choices, default=CycleType.ANNUAL)
    start_date = models.DateField()
    self_assessment_deadline = models.DateField()
    supervisor_review_deadline = models.DateField()
    calibration_date = models.DateField(null=True, blank=True)
    final_approval_deadline = models.DateField()
    end_date = models.DateField()
    kpi_weight = models.DecimalField(max_digits=5, decimal_places=2, default=70.00)
    competency_weight = models.DecimalField(max_digits=5, decimal_places=2, default=30.00)
    mission_weight = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    task_weight = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    rating_scale = models.ForeignKey('reviews.RatingScale', on_delete=models.PROTECT, related_name='review_cycles')
    competencies = models.ManyToManyField('reviews.Competency', through='CycleCompetency', related_name='review_cycles')
    include_all_departments = models.BooleanField(default=True)
    included_departments = models.ManyToManyField('structure.Department', blank=True)
    included_positions = models.ManyToManyField('structure.Position', blank=True)
    require_self_assessment = models.BooleanField(default=True)
    allow_self_assessment_edit = models.BooleanField(default=True)
    require_360_feedback = models.BooleanField(default=False)
    enable_calibration = models.BooleanField(default=True)
    kpi_start_date = models.DateField(null=True, blank=True)
    kpi_end_date = models.DateField(null=True, blank=True)
    class Meta:
        db_table = 'reviews_cycles'
        ordering = ['-start_date']
        indexes = [models.Index(fields=['tenant_id', 'status']), models.Index(fields=['tenant_id', 'start_date']), models.Index(fields=['tenant_id', 'cycle_type'])]
    def __str__(self):
        return self.name
    def clean(self):
        super().clean()
        if self.start_date >= self.self_assessment_deadline:
            raise ValidationError({'self_assessment_deadline': 'Must be after start date'})
        if self.self_assessment_deadline >= self.supervisor_review_deadline:
            raise ValidationError({'supervisor_review_deadline': 'Must be after self-assessment deadline'})
        if self.supervisor_review_deadline >= self.final_approval_deadline:
            raise ValidationError({'final_approval_deadline': 'Must be after supervisor review deadline'})
        if self.final_approval_deadline >= self.end_date:
            raise ValidationError({'end_date': 'Must be after final approval deadline'})
        total_weight = float(self.kpi_weight) + float(self.competency_weight) + float(self.mission_weight) + float(self.task_weight)
        if total_weight < 95 or total_weight > 105:
            raise ValidationError(f'Total weights sum to {total_weight}%. Must be 100%')
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    def get_participating_employees(self):
        """Get all employees participating in this cycle."""
        from apps.accounts.models import User
        employees = User.objects.filter(tenant_id=self.tenant_id, is_active=True, is_deleted=False)
        # Since User.department is a CharField, we'll skip filtering for now
        # if not self.include_all_departments:
        #     employees = employees.filter(department_id__in=self.included_departments.values_list('id', flat=True))
        # if self.included_positions.exists():
        #     employees = employees.filter(position_id__in=self.included_positions.values_list('id', flat=True))
        return employees

class CycleCompetency(models.Model):
    review_cycle = models.ForeignKey(ReviewCycle, on_delete=models.CASCADE, related_name='cycle_competencies')
    competency = models.ForeignKey('reviews.Competency', on_delete=models.CASCADE, related_name='cycle_assignments')
    weight = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)])
    display_order = models.IntegerField(default=0)
    class Meta:
        db_table = 'reviews_cycle_competencies'
        unique_together = [['review_cycle', 'competency']]
        ordering = ['display_order']
    def __str__(self):
        return f"{self.review_cycle.name} - {self.competency.name} ({self.weight}%)"