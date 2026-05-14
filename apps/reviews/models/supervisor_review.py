# apps/reviews/models/supervisor_review.py
"""
Supervisor Review Model - Manager's evaluation of employee
MODELS ONLY - No business logic here
"""

from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator

from .base import ReviewBaseModel, ReviewStatusMixin


class SupervisorReview(ReviewBaseModel, ReviewStatusMixin):
    """
    Manager's evaluation of an employee for a specific review cycle.
    
    References the employee's self-assessment and adds:
    - Manager's ratings on competencies
    - Overall performance assessment
    - Promotion recommendations
    - Development feedback
    """
    
    class Recommendation(models.TextChoices):
        PROMOTE = 'promote', 'Promote'
        RETAIN = 'retain', 'Retain in Current Role'
        PIP = 'pip', 'Place on Performance Improvement Plan'
        DEMOTE = 'demote', 'Demote'
        TERMINATE = 'terminate', 'Terminate'
        NOT_RECOMMENDED = 'not_recommended', 'Not Recommended'
    
    class BonusRecommendation(models.TextChoices):
        EXCEPTIONAL = 'exceptional', 'Exceptional Bonus'
        STANDARD = 'standard', 'Standard Bonus'
        REDUCED = 'reduced', 'Reduced Bonus'
        NONE = 'none', 'No Bonus'
    
    # ========== Relationships ==========
    review_cycle = models.ForeignKey(
        'ReviewCycle',
        on_delete=models.CASCADE,
        related_name='supervisor_reviews',
        help_text="Review cycle this evaluation belongs to"
    )
    
    employee = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='supervisor_reviews_as_employee',
        help_text="Employee being reviewed"
    )
    
    supervisor = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='supervisor_reviews_as_manager',
        help_text="Manager conducting the review"
    )
    
    # Link to employee's self-assessment
    self_assessment = models.OneToOneField(
        'reviews.SelfAssessment',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='supervisor_review',
        help_text="Reference to employee's self-assessment"
    )
    
    # ========== Overall Assessment ==========
    overall_comment = models.TextField(
        blank=True,
        help_text="Manager's overall assessment of employee's performance"
    )
    
    performance_summary = models.TextField(
        blank=True,
        help_text="Detailed summary of performance during the review period"
    )
    
    # ========== Manager Observations ==========
    strengths_observed = models.TextField(
        blank=True,
        help_text="Key strengths the manager observed"
    )
    
    development_areas = models.TextField(
        blank=True,
        help_text="Areas where improvement is needed"
    )
    
    achievements_recognized = models.TextField(
        blank=True,
        help_text="Notable achievements worth recognizing"
    )
    
    # ========== Future Planning ==========
    career_progression_notes = models.TextField(
        blank=True,
        help_text="Notes on employee's career trajectory"
    )
    
    training_recommendations = models.TextField(
        blank=True,
        help_text="Recommended training or development programs"
    )
    
    goals_for_next_period = models.TextField(
        blank=True,
        help_text="Goals set for the employee for next period"
    )
    
    # ========== Recommendations ==========
    recommendation = models.CharField(
        max_length=20,
        choices=Recommendation.choices,
        default=Recommendation.RETAIN,
        help_text="Manager's recommendation for this employee"
    )
    
    promotion_readiness = models.BooleanField(
        default=False,
        help_text="Is the employee ready for promotion?"
    )
    
    promotion_target_role = models.CharField(
        max_length=100,
        blank=True,
        help_text="Target role for promotion if applicable"
    )
    
    promotion_timeline = models.CharField(
        max_length=50,
        blank=True,
        help_text="Proposed promotion timeline (e.g., 'Next quarter', 'Within 6 months')"
    )
    
    bonus_recommendation = models.CharField(
        max_length=20,
        choices=BonusRecommendation.choices,
        default=BonusRecommendation.STANDARD,
        help_text="Bonus recommendation based on performance"
    )
    
    bonus_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(200)],
        help_text="Proposed bonus percentage of salary (0-200%)"
    )
    
    # ========== Score Override ==========
    # Allow manager to override KPI score if KPI data is wrong/unfair
    override_kpi_score = models.DecimalField(max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Optional override for KPI score (0-100)"
    )
    
    override_reason = models.TextField(
        blank=True,
        help_text="Reason for overriding KPI score (if applicable)"
    )
    
    # ========== Meta Fields ==========
    submitted_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the manager submitted this review"
    )
    
    reviewed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When this review was reviewed by HR/Admin"
    )
    
    class Meta:
        db_table = 'reviews_supervisor_reviews'
        ordering = ['-created_at']
        unique_together = [
            ['review_cycle', 'employee'],  # One supervisor review per employee per cycle
        ]
        indexes = [
            models.Index(fields=['review_cycle', 'status']),
            models.Index(fields=['employee', 'review_cycle']),
            models.Index(fields=['supervisor', 'review_cycle']),
            models.Index(fields=['recommendation']),
            models.Index(fields=['promotion_readiness']),
        ]
    
    def __str__(self):
        return f"Supervisor Review: {self.employee.email} by {self.supervisor.email} - {self.review_cycle.name}"
    
    # ========== Basic Validation Only ==========
    
    def clean(self):
        """Basic validation - NO business logic"""
        super().clean()
        
        # Ensure employee and supervisor are different people
        if self.employee_id and self.supervisor_id and self.employee_id == self.supervisor_id:
            raise ValidationError("Employee and supervisor cannot be the same person")
        
        # Ensure employee belongs to the same tenant as the cycle
        if self.employee and self.review_cycle:
            if self.employee.tenant_id != self.review_cycle.tenant_id:
                raise ValidationError("Employee must belong to the same tenant as the review cycle")
        
        # Ensure supervisor belongs to the same tenant as the cycle
        if self.supervisor and self.review_cycle:
            if self.supervisor.tenant_id != self.review_cycle.tenant_id:
                raise ValidationError("Supervisor must belong to the same tenant as the review cycle")
        
        # Validate bonus percentage range
        if self.bonus_percentage and (self.bonus_percentage < 0 or self.bonus_percentage > 200):
            raise ValidationError({
                'bonus_percentage': 'Bonus percentage must be between 0 and 200'
            })
        
        # If override exists, reason must be provided
        if self.override_kpi_score and not self.override_reason:
            raise ValidationError({
                'override_reason': 'Reason is required when overriding KPI score'
            })
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
    # ========== Simple Properties (Data Access Only) ==========
    
    @property
    def is_submitted(self):
        """Has this review been submitted?"""
        return self.status == self.Status.SUBMITTED
    
    @property
    def is_draft(self):
        """Is this review still a draft?"""
        return self.status == self.Status.DRAFT
    
    @property
    def is_approved(self):
        """Has this review been approved?"""
        return self.status == self.Status.APPROVED
    
    @property
    def has_self_assessment(self):
        """Does the employee have a self-assessment?"""
        return self.self_assessment is not None
    
    @property
    def is_self_assessment_submitted(self):
        """Has the employee submitted their self-assessment?"""
        return self.self_assessment and self.self_assessment.is_submitted
    
    @property
    def uses_kpi_override(self):
        """Is the KPI score being overridden?"""
        return self.override_kpi_score is not None
    
    @property
    def effective_kpi_score(self):
        """
        Get the effective KPI score (either original or overridden).
        Returns None if not available.
        """
        if self.override_kpi_score is not None:
            return float(self.override_kpi_score)
        # Original KPI score would be fetched via service
        return None
    
    @property
    def competency_ratings_count(self):
        """Count of competency ratings in this review"""
        return self.competency_ratings.count()
    
    @property
    def average_competency_rating(self):
        """
        Simple average of all competency ratings.
        Returns None if no ratings.
        """
        ratings = self.competency_ratings.filter(
            raw_score__isnull=False
        ).values_list('raw_score', flat=True)
        
        if not ratings:
            return None
        
        return sum(ratings) / len(ratings)
    
    @property
    def promotion_readiness_display(self):
        """Human-readable promotion readiness"""
        if self.promotion_readiness:
            if self.promotion_target_role:
                return f"Ready for {self.promotion_target_role}"
            return "Ready for promotion"
        return "Not ready for promotion"
    
    @property
    def recommendation_display(self):
        """Get display value for recommendation"""
        return self.get_recommendation_display()
    
    @property
    def bonus_recommendation_display(self):
        """Get display value for bonus recommendation"""
        return self.get_bonus_recommendation_display()