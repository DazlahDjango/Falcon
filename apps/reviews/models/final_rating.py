# apps/reviews/models/final_rating.py
"""
Final Rating Model - Calibrated, approved final rating for employee
MODELS ONLY - No business logic, no computed properties, no helper methods
"""

from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator

from .base import ReviewBaseModel
from .rating_scale import RatingScale


class FinalRating(ReviewBaseModel):
    """
    Final calibrated rating for an employee after a review cycle.
    MODELS ONLY - Contains only data fields and basic validation.
    """
    
    class FinalStatus(models.TextChoices):
        PENDING = 'pending', 'Pending Calibration'
        CALIBRATED = 'calibrated', 'Calibrated'
        APPROVED = 'approved', 'Approved'
        LOCKED = 'locked', 'Locked (Final)'
        APPEALED = 'appealed', 'Appealed'
        REVISED = 'revised', 'Revised'
    
    class ActionOutcome(models.TextChoices):
        PROMOTE = 'promote', 'Promote'
        BONUS = 'bonus', 'Bonus Awarded'
        PIP = 'pip', 'Place on PIP'
        DEMOTE = 'demote', 'Demote'
        TERMINATE = 'terminate', 'Terminate'
        NO_ACTION = 'no_action', 'No Action'
    
    # ========== Relationships ==========
    review_cycle = models.ForeignKey('ReviewCycle', on_delete=models.CASCADE, related_name='final_ratings')
    employee = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='final_ratings')
    supervisor_review = models.OneToOneField('SupervisorReview', on_delete=models.SET_NULL, null=True, blank=True)
    calibration_session = models.ForeignKey('CalibrationSession', on_delete=models.SET_NULL, null=True, blank=True)
    rating_scale = models.ForeignKey(RatingScale, on_delete=models.PROTECT, related_name='final_ratings')
    
    # ========== Component Scores ==========
    kpi_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    competency_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    mission_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    task_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    feedback_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # ========== Calculated Scores ==========
    raw_total_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    coefficient_applied = models.DecimalField(max_digits=5, decimal_places=4, null=True, blank=True, default=1.0000)
    adjusted_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    calibration_adjustment = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    calibration_adjustment_reason = models.TextField(blank=True)
    final_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    final_rating_label = models.CharField(max_length=100, blank=True)
    final_rating_color = models.CharField(max_length=20, blank=True)
    
    # ========== Recommendations ==========
    promotion_recommended = models.BooleanField(default=False)
    promotion_target_role = models.CharField(max_length=100, blank=True)
    promotion_timeline = models.CharField(max_length=100, blank=True)
    bonus_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    bonus_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    pip_recommended = models.BooleanField(default=False)
    pip_reason = models.TextField(blank=True)
    action_outcome = models.CharField(max_length=20, choices=ActionOutcome.choices, default=ActionOutcome.NO_ACTION)
    
    # ========== Status ==========
    status = models.CharField(max_length=20, choices=FinalStatus.choices, default=FinalStatus.PENDING)
    
    # ========== Approval ==========
    approved_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    
    # ========== Audit ==========
    notes = models.TextField(blank=True)
    previous_version = models.OneToOneField('self', on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        db_table = 'reviews_final_ratings'
        ordering = ['-created_at']
        unique_together = [['review_cycle', 'employee']]
        indexes = [
            models.Index(fields=['review_cycle', 'status']),
            models.Index(fields=['employee', 'review_cycle']),
            models.Index(fields=['final_score']),
        ]
    
    def __str__(self):
        return f"{self.employee.email}: {self.final_rating_label or 'Not Rated'} ({self.review_cycle.name})"
    
    def clean(self):
        """Basic validation only"""
        super().clean()
        
        if self.calibration_adjustment and (self.calibration_adjustment < -20 or self.calibration_adjustment > 20):
            raise ValidationError({'calibration_adjustment': 'Must be between -20 and +20'})
        
        if self.calibration_adjustment and self.calibration_adjustment != 0 and not self.calibration_adjustment_reason:
            raise ValidationError({'calibration_adjustment_reason': 'Reason required for calibration adjustment'})
        
        if self.promotion_recommended and not self.promotion_target_role:
            raise ValidationError({'promotion_target_role': 'Target role required when promotion recommended'})
        
        if self.pip_recommended and not self.pip_reason:
            raise ValidationError({'pip_reason': 'Reason required when PIP recommended'})