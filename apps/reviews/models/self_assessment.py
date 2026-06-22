from django.db import models
from django.core.exceptions import ValidationError
from .base import ReviewBaseModel, ReviewStatusMixin

class SelfAssessment(ReviewBaseModel, ReviewStatusMixin):
    review_cycle = models.ForeignKey('reviews.ReviewCycle', on_delete=models.CASCADE, related_name='self_assessments')
    employee = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='self_assessments')
    overall_comment = models.TextField(blank=True)
    strengths = models.TextField(blank=True)
    areas_for_improvement = models.TextField(blank=True)
    career_aspirations = models.TextField(blank=True)
    challenges_faced = models.TextField(blank=True)
    achievements = models.TextField(blank=True)
    training_completed = models.TextField(blank=True)
    training_requested = models.TextField(blank=True)
    integrity_checksum = models.CharField(max_length=64, blank=True, db_index=True)
    goals_achieved = models.TextField(blank=True)
    goals_for_next_period = models.TextField(blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    class Meta:
        db_table = 'reviews_self_assessments'
        ordering = ['-created_at']
        unique_together = [['review_cycle', 'employee']]
        indexes = [models.Index(fields=['review_cycle', 'status']), models.Index(fields=['employee', 'review_cycle']), models.Index(fields=['status', 'submitted_at'])]
    def __str__(self):
        return f"Self Assessment: {self.employee.email} - {self.review_cycle.name}"
    def clean(self):
        super().clean()
        if self.employee.tenant_id != self.review_cycle.tenant_id:
            raise ValidationError("Employee must belong to the same tenant as the review cycle")
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
    def manager(self):
        return self.employee.manager if hasattr(self.employee, 'manager') else None
    @property
    def competency_ratings_count(self):
        return self.competency_ratings.count()
    @property
    def average_rating(self):
        ratings = self.competency_ratings.filter(raw_score__isnull=False).values_list('raw_score', flat=True)
        if not ratings:
            return None
        return sum(ratings) / len(ratings)