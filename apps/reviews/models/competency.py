from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator
from .base import ReviewBaseModel

class CompetencyCategory(ReviewBaseModel):
    tenant = models.ForeignKey('tenant.Organization', on_delete=models.CASCADE, related_name='competency_categories', db_column='tenant_id_id')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    class Meta:
        db_table = 'reviews_competency_categories'
        ordering = ['order', 'name']
        unique_together = [['tenant', 'name']]
        indexes = [models.Index(fields=['tenant', 'is_active'])]
    def __str__(self):
        return self.name

class Competency(ReviewBaseModel):
    class CompetencyType(models.TextChoices):
        LEADERSHIP = 'leadership', 'Leadership'
        MANAGEMENT = 'management', 'Management'
        TECHNICAL = 'technical', 'Technical Skills'
        SOFT_SKILL = 'soft_skill', 'Soft Skills'
        CULTURAL = 'cultural', 'Cultural Fit'
        STRATEGIC = 'strategic', 'Strategic Thinking'
        OPERATIONAL = 'operational', 'Operational Excellence'
        CUSTOMER = 'customer', 'Customer Focus'
        INNOVATION = 'innovation', 'Innovation'
        TEAMWORK = 'teamwork', 'Teamwork & Collaboration'
    tenant = models.ForeignKey('tenant.Organization', on_delete=models.CASCADE, related_name='competencies', db_column='tenant_id_id')
    name = models.CharField(max_length=100)
    description = models.TextField()
    category = models.ForeignKey(CompetencyCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='competencies')
    competency_type = models.CharField(max_length=20, choices=CompetencyType.choices, default=CompetencyType.SOFT_SKILL)
    default_weight = models.DecimalField(max_digits=5, decimal_places=2, default=10.00, validators=[MinValueValidator(0), MaxValueValidator(100)])
    rating_scale = models.ForeignKey('reviews.RatingScale', on_delete=models.SET_NULL, null=True, blank=True, related_name='competencies')
    is_active = models.BooleanField(default=True)
    is_required = models.BooleanField(default=False)
    display_order = models.IntegerField(default=0)
    excellent_behavior = models.TextField(blank=True)
    needs_improvement_behavior = models.TextField(blank=True)
    class Meta:
        db_table = 'reviews_competencies'
        ordering = ['display_order', 'name']
        unique_together = [['tenant', 'name']]
        indexes = [models.Index(fields=['tenant', 'is_active']), models.Index(fields=['competency_type']), models.Index(fields=['category'])]
    def __str__(self):
        return self.name
    def clean(self):
        super().clean()
        if self.default_weight < 0 or self.default_weight > 100:
            raise ValidationError({'default_weight': 'Weight must be between 0 and 100'})
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)