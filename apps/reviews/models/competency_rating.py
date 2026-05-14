# apps/reviews/models/competency_rating.py
"""
Competency Rating Model - Stores ratings for competencies from different sources
MODELS ONLY - No business logic here
"""

from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator

from .base import ReviewBaseModel, ScoreMixin


class CompetencyRating(ReviewBaseModel, ScoreMixin):
    """
    Rating for a specific competency from a specific source.
    
    This model is used for:
    - Self assessments (employee rates themselves)
    - Supervisor reviews (manager rates employee)
    - Future: 360 feedback (peers rate each other)
    
    Using GenericForeignKey to link to different parent models.
    """
    
    # ========== Parent Relationships (Generic Foreign Key) ==========
    # This allows the same rating model to work for:
    # - SelfAssessment
    # - SupervisorReview
    # - Feedback (future)
    
    content_type = models.ForeignKey(
        'contenttypes.ContentType',
        on_delete=models.CASCADE,
        limit_choices_to={
            'app_label': 'reviews',
            'model__in': ['selfassessment', 'supervisorreview']  # Add 'feedback' later
        },
        help_text="Type of parent model (selfassessment or supervisorreview)"
    )
    
    object_id = models.CharField(
        max_length=36,  # UUID length
        help_text="ID of the parent record"
    )
    
    # ========== The Rating Itself ==========
    competency = models.ForeignKey(
        'reviews.Competency',
        on_delete=models.CASCADE,
        related_name='ratings',
        help_text="The competency being rated"
    )
    
    
    # Raw score (depends on rating scale: 1-5, 1-10, etc.)
    raw_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Raw rating value (e.g., 4 on a 1-5 scale)"
    )
    
    # Comment/justification for this rating
    comment = models.TextField(
        blank=True,
        help_text="Explanation or evidence supporting this rating"
    )
    
    # Evidence attachment (optional)
    evidence = models.FileField(
        upload_to='reviews/evidence/%Y/%m/',
        blank=True,
        null=True,
        help_text="Supporting evidence for this rating"
    )
    
    # ========== Rating Scale Used ==========
    # Store which scale was used at time of rating (for historical accuracy)
    rating_scale_id = models.CharField(
        max_length=36,
        blank=True,
        help_text="ID of rating scale used (denormalized for historical accuracy)"
    )
    
    rating_scale_name = models.CharField(
        max_length=100,
        blank=True,
        help_text="Name of rating scale used (denormalized)"
    )
    
    # ========== Status ==========
    is_primary = models.BooleanField(
        default=True,
        help_text="Is this the primary rating? (For calibration overrides)"
    )
    
    class Meta:
        db_table = 'reviews_competency_ratings'
        ordering = ['competency__display_order', 'competency__name']
        indexes = [
            models.Index(fields=['content_type', 'object_id']),  # For GFK lookups
            models.Index(fields=['competency', 'raw_score']),
            models.Index(fields=['is_primary']),
        ]
    
    def __str__(self):
        return f"{self.competency.name}: {self.raw_score} - {self.get_parent_type()}"
    
    # ========== Basic Validation Only ==========
    
    def clean(self):
        """Basic validation - NO business logic"""
        super().clean()
        
        # Validate raw_score is within reasonable range (1-10)
        if self.raw_score < 0 or self.raw_score > 10:
            raise ValidationError({
                'raw_score': 'Rating must be between 0 and 10'
            })
        
        # Validate comment length (optional)
        if self.comment and len(self.comment) > 5000:
            raise ValidationError({
                'comment': 'Comment cannot exceed 5000 characters'
            })
    
    def save(self, *args, **kwargs):
        self.full_clean()
        
        # Auto-calculate normalized_score and traffic_light from ScoreMixin
        super().save(*args, **kwargs)
    
    # ========== Simple Helper Properties ==========
    
    def get_parent_type(self):
        """Get the type of parent (selfassessment or supervisorreview)"""
        if self.content_type:
            return self.content_type.model
        return None
    
    @property
    def is_self_rating(self):
        """Is this from a self assessment?"""
        return self.content_type and self.content_type.model == 'selfassessment'
    
    @property
    def is_manager_rating(self):
        """Is this from a supervisor review?"""
        return self.content_type and self.content_type.model == 'supervisorreview'
    
    @property
    def rating_summary(self):
        """Get a summary of this rating"""
        return {
            'competency': self.competency.name,
            'rating': float(self.raw_score),
            'normalized': float(self.normalized_score) if self.normalized_score else None,
            'traffic_light': self.traffic_light,
            'has_comment': bool(self.comment),
            'has_evidence': bool(self.evidence)
        }
    
    @property
    def rating_display(self):
        """Formatted rating for display"""
        if self.raw_score:
            return f"{self.raw_score:.1f}"
        return "Not rated"