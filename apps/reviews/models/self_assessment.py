# apps/reviews/models/self_assessment.py
"""
Self Assessment Model - Employee's self-evaluation for a review cycle
MODELS ONLY - No business logic here
"""

from django.db import models
from django.core.exceptions import ValidationError

from .base import ReviewBaseModel, ReviewStatusMixin


class SelfAssessment(ReviewBaseModel, ReviewStatusMixin):
    """
    Employee's self-assessment for a specific review cycle.
    
    Contains:
    - Overall performance commentary
    - Self-identified strengths and weaknesses
    - Career aspirations
    - Ratings on competencies (stored in CompetencyRating model)
    """
    
    # ========== Relationships ==========
    review_cycle = models.ForeignKey(
        'reviews.ReviewCycle',
        on_delete=models.CASCADE,
        related_name='self_assessments',
        help_text="Review cycle this assessment belongs to"
    )
    
    employee = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='self_assessments',
        help_text="Employee completing this self-assessment"
    )
    
    # ========== Narrative Fields ==========
    overall_comment = models.TextField(
        blank=True,
        help_text="Overall summary of performance during this period"
    )
    
    strengths = models.TextField(
        blank=True,
        help_text="What did you do well? What are your key strengths?"
    )
    
    areas_for_improvement = models.TextField(
        blank=True,
        help_text="What could be improved? What skills need development?"
    )
    
    career_aspirations = models.TextField(
        blank=True,
        help_text="What are your career goals? What role do you aspire to?"
    )
    
    challenges_faced = models.TextField(
        blank=True,
        help_text="What obstacles did you encounter? How did you address them?"
    )
    
    achievements = models.TextField(
        blank=True,
        help_text="Key achievements and accomplishments this period"
    )
    
    # ========== Training & Development ==========
    training_completed = models.TextField(
        blank=True,
        help_text="Training courses or certifications completed"
    )
    
    training_requested = models.TextField(
        blank=True,
        help_text="Training or development support requested"
    )
    
    # ========== Goals ==========
    goals_achieved = models.TextField(
        blank=True,
        help_text="Goals achieved during this period"
    )
    
    goals_for_next_period = models.TextField(
        blank=True,
        help_text="Goals for the next review period"
    )
    
    # ========== Meta Fields ==========
    submitted_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the employee submitted this assessment"
    )
    
    # ========== Model Options ==========
    class Meta:
        db_table = 'reviews_self_assessments'
        ordering = ['-created_at']
        unique_together = [
            ['review_cycle', 'employee'],  # One self-assessment per employee per cycle
        ]
        indexes = [
            models.Index(fields=['review_cycle', 'status']),
            models.Index(fields=['employee', 'review_cycle']),
            models.Index(fields=['status', 'submitted_at']),
        ]
    
    def __str__(self):
        return f"Self Assessment: {self.employee.email} - {self.review_cycle.name}"
    
    # ========== Basic Validation Only ==========
    def clean(self):
        """Basic validation - NO business logic"""
        super().clean()
        
        # Ensure employee belongs to the same tenant as the cycle
        if self.employee.tenant_id != self.review_cycle.tenant_id:
            raise ValidationError(
                "Employee must belong to the same tenant as the review cycle"
            )
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
    # ========== Simple Properties (Data Access Only) ==========
    
    @property
    def is_submitted(self):
        """Has this assessment been submitted?"""
        return self.status == self.Status.SUBMITTED
    
    @property
    def is_draft(self):
        """Is this assessment still a draft?"""
        return self.status == self.Status.DRAFT
    
    @property
    def manager(self):
        """Get the employee's direct supervisor"""
        return self.employee.manager if hasattr(self.employee, 'manager') else None
    
    @property
    def competency_ratings_count(self):
        """Count of competency ratings in this assessment"""
        return self.competency_ratings.count()
    
    @property
    def average_rating(self):
        """
        Simple average of all competency ratings.
        Returns None if no ratings.
        """
        ratings = self.competency_ratings.filter(
            rating__isnull=False
        ).values_list('raw_score', flat=True)
        
        if not ratings:
            return None
        
        return sum(ratings) / len(ratings)