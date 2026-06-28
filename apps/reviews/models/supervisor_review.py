from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator
from .base import ReviewBaseModel, ReviewStatusMixin

class SupervisorReview(ReviewBaseModel, ReviewStatusMixin):
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
    review_cycle = models.ForeignKey('reviews.ReviewCycle', on_delete=models.CASCADE, related_name='supervisor_reviews')
    employee = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='supervisor_reviews_as_employee')
    supervisor = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='supervisor_reviews_as_manager')
    self_assessment = models.OneToOneField('reviews.SelfAssessment', on_delete=models.SET_NULL, null=True, blank=True, related_name='supervisor_review')
    overall_comment = models.TextField(blank=True)
    performance_summary = models.TextField(blank=True)
    strengths_observed = models.TextField(blank=True)
    development_areas = models.TextField(blank=True)
    achievements_recognized = models.TextField(blank=True)
    career_progression_notes = models.TextField(blank=True)
    training_recommendations = models.TextField(blank=True)
    goals_for_next_period = models.TextField(blank=True)
    recommendation = models.CharField(max_length=20, choices=Recommendation.choices, default=Recommendation.RETAIN)
    promotion_readiness = models.BooleanField(default=False)
    promotion_target_role = models.CharField(max_length=100, blank=True)
    promotion_timeline = models.CharField(max_length=50, blank=True)
    bonus_recommendation = models.CharField(max_length=20, choices=BonusRecommendation.choices, default=BonusRecommendation.STANDARD)
    bonus_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(200)])
    override_kpi_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    override_reason = models.TextField(blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    class Meta:
        db_table = 'reviews_supervisor_reviews'
        ordering = ['-created_at']
        unique_together = [['review_cycle', 'employee']]
        indexes = [models.Index(fields=['review_cycle', 'status']), models.Index(fields=['employee', 'review_cycle']), models.Index(fields=['supervisor', 'review_cycle']), models.Index(fields=['recommendation']), models.Index(fields=['promotion_readiness'])]
    def __str__(self):
        return f"Supervisor Review: {self.employee.email} by {self.supervisor.email} - {self.review_cycle.name}"
    def clean(self):
        super().clean()
        if self.employee_id and self.supervisor_id and self.employee_id == self.supervisor_id:
            raise ValidationError("Employee and supervisor cannot be the same person")
        if self.employee and self.review_cycle and self.employee.tenant_id != self.review_cycle.tenant_id:
            raise ValidationError("Employee must belong to the same tenant as the review cycle")
        if self.supervisor and self.review_cycle and self.supervisor.tenant_id != self.review_cycle.tenant_id:
            raise ValidationError("Supervisor must belong to the same tenant as the review cycle")
        if self.override_kpi_score and not self.override_reason:
            raise ValidationError({'override_reason': 'Reason is required when overriding KPI score'})
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    @property
    def is_submitted(self):
        return self.status == self.Status.SUBMITTED
    @property
    def is_draft(self):
        return self.status == self.Status.DRAFT
    @property
    def is_approved(self):
        return self.status == self.Status.APPROVED
    @property
    def has_self_assessment(self):
        return self.self_assessment is not None
    @property
    def is_self_assessment_submitted(self):
        return self.self_assessment and self.self_assessment.is_submitted
    @property
    def uses_kpi_override(self):
        return self.override_kpi_score is not None
    @property
    def effective_kpi_score(self):
        if self.override_kpi_score is not None:
            return float(self.override_kpi_score)
        return None
    @property
    def competency_ratings_count(self):
        return self.competency_ratings.count()
    @property
    def average_competency_rating(self):
        ratings = self.competency_ratings.filter(raw_score__isnull=False).values_list('raw_score', flat=True)
        if not ratings:
            return None
        return sum(ratings) / len(ratings)
    @property
    def promotion_readiness_display(self):
        if self.promotion_readiness:
            if self.promotion_target_role:
                return f"Ready for {self.promotion_target_role}"
            return "Ready for promotion"
        return "Not ready for promotion"
    @property
    def recommendation_display(self):
        return self.get_recommendation_display()
    @property
    def bonus_recommendation_display(self):
        return self.get_bonus_recommendation_display()