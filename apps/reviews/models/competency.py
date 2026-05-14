# apps/reviews/models/competency.py
"""
Competency Model - Library of skills and behaviors evaluated in reviews
MODELS ONLY - No business logic
"""

from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator

from .base import ReviewBaseModel


class CompetencyCategory(ReviewBaseModel):
    """
    Category for grouping competencies (e.g., "Leadership", "Technical Skills")
    """
    
    tenant_id = models.ForeignKey(
        'tenant.Client',
        on_delete=models.CASCADE,
        related_name='competency_categories'
    )
    
    name = models.CharField(
        max_length=100,
        help_text="Category name (e.g., 'Leadership', 'Technical Skills')"
    )
    
    description = models.TextField(
        blank=True,
        help_text="Optional description of this category"
    )
    
    order = models.IntegerField(
        default=0,
        help_text="Display order (lower numbers appear first)"
    )
    
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'reviews_competency_categories'
        ordering = ['order', 'name']
        unique_together = [['tenant_id', 'name']]
        indexes = [
            models.Index(fields=['tenant_id', 'is_active']),
        ]
    
    def __str__(self):
        return self.name


class Competency(ReviewBaseModel):
    """
    A competency is a skill, behavior, or attribute evaluated in reviews.
    
    Examples:
    - Leadership: Ability to guide and motivate teams
    - Communication: Clarity in verbal and written communication
    - Problem Solving: Analytical approach to obstacles
    - Customer Focus: Understanding and meeting client needs
    """
    
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
    
    # Tenant isolation
    tenant_id = models.ForeignKey(
        'tenant.Client',
        on_delete=models.CASCADE,
        related_name='competencies'
    )
    
    # Basic Information
    name = models.CharField(
        max_length=100,
        help_text="Name of the competency (e.g., 'Leadership', 'Communication')"
    )
    
    description = models.TextField(
        help_text="Detailed description of what this competency means"
    )
    
    # Categorization
    category = models.ForeignKey(
        CompetencyCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='competencies',
        help_text="Category this competency belongs to"
    )
    
    competency_type = models.CharField(
        max_length=20,
        choices=CompetencyType.choices,
        default=CompetencyType.SOFT_SKILL,
        help_text="Type/category of competency"
    )
    
    # Weighting
    default_weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=10.00,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Default weight percentage for this competency (0-100)"
    )
    
    # Rating Scale (optional - uses cycle default if not specified)
    rating_scale = models.ForeignKey(
        'reviews.RatingScale',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='competencies',
        help_text="Specific rating scale for this competency"
    )
    
    # Status
    is_active = models.BooleanField(
        default=True,
        help_text="Is this competency available for use in reviews?"
    )
    
    is_required = models.BooleanField(
        default=False,
        help_text="Is this competency required for all review cycles?"
    )
    
    # Display
    display_order = models.IntegerField(
        default=0,
        help_text="Order when displaying in forms (lower numbers first)"
    )
    
    # Behavior indicators (for training/coaching)
    excellent_behavior = models.TextField(
        blank=True,
        help_text="What does exceptional performance look like?"
    )
    
    needs_improvement_behavior = models.TextField(
        blank=True,
        help_text="What does poor performance look like?"
    )
    
    class Meta:
        db_table = 'reviews_competencies'
        ordering = ['display_order', 'name']
        unique_together = [['tenant_id', 'name']]
        indexes = [
            models.Index(fields=['tenant_id', 'is_active']),
            models.Index(fields=['competency_type']),
            models.Index(fields=['category']),
        ]
    
    def __str__(self):
        return self.name
    
    def clean(self):
        """Basic validation - NO business logic"""
        super().clean()
        
        if self.default_weight < 0 or self.default_weight > 100:
            raise ValidationError({
                'default_weight': 'Weight must be between 0 and 100'
            })
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)