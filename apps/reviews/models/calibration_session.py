"""
Calibration Session Model
Managers meet to ensure fair and consistent ratings across departments
MODELS ONLY - No business logic, no calculated fields
"""

from django.db import models
from django.core.exceptions import ValidationError

from .base import ReviewBaseModel, ReviewStatusMixin


class CalibrationSession(ReviewBaseModel, ReviewStatusMixin):
    """
    A calibration session where managers review and adjust ratings.
    MODELS ONLY - Contains only data fields and basic validation.
    """
    
    class SessionType(models.TextChoices):
        INITIAL = 'initial', 'Initial Calibration'
        MID_CYCLE = 'mid_cycle', 'Mid-Cycle Review'
        FINAL = 'final', 'Final Calibration'
        AD_HOC = 'adhoc', 'Ad-Hoc Session'
    
    class Outcome(models.TextChoices):
        PENDING = 'pending', 'Pending'
        COMPLETED = 'completed', 'Completed'
        PARTIAL = 'partial', 'Partially Completed'
        CANCELLED = 'cancelled', 'Cancelled'
    
    # ========== Basic Information ==========
    review_cycle = models.ForeignKey('reviews.ReviewCycle', on_delete=models.CASCADE, related_name='calibration_sessions')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    session_type = models.CharField(max_length=20, choices=SessionType.choices, default=SessionType.FINAL)
    
    # ========== Date and Time ==========
    scheduled_date = models.DateTimeField()
    actual_start_time = models.DateTimeField(null=True, blank=True)
    actual_end_time = models.DateTimeField(null=True, blank=True)
    agreed_by = models.ManyToManyField('accounts.User', related_name='calibration_sessions_agreed', blank=True)
    
    # ========== Participants ==========
    facilitator = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, related_name='facilitated_sessions')
    participants = models.ManyToManyField('accounts.User', related_name='calibration_sessions')
    
    # ========== Departments ==========
    departments_included = models.ManyToManyField('structure.Department', related_name='calibration_sessions', blank=True)
    
    # ========== Session Details ==========
    agenda = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    decisions = models.TextField(blank=True)
    
    # ========== Outcome ==========
    outcome = models.CharField(max_length=20, choices=Outcome.choices, default=Outcome.PENDING)
    
    # ========== Follow-up ==========
    follow_up_required = models.BooleanField(default=False)
    follow_up_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'reviews_calibration_sessions'
        ordering = ['-scheduled_date']
        indexes = [models.Index(fields=['review_cycle', 'status']), models.Index(fields=['session_type']), models.Index(fields=['scheduled_date'])]
    
    def __str__(self):
        return f"{self.name} - {self.review_cycle.name}"
    
    def clean(self):
        super().clean()
        if self.actual_end_time and self.actual_start_time:
            if self.actual_end_time <= self.actual_start_time:
                raise ValidationError({'actual_end_time': 'End time must be after start time'})


class CalibrationAgendaItem(models.Model):
    """
    Individual agenda items for a calibration session.
    """
    
    class ItemStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'
        SKIPPED = 'skipped', 'Skipped'
    
    calibration_session = models.ForeignKey(CalibrationSession, on_delete=models.CASCADE, related_name='agenda_items')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    duration_minutes = models.IntegerField(default=30)
    order = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=ItemStatus.choices, default=ItemStatus.PENDING)
    agreed_by = models.ManyToManyField('accounts.User', related_name='calibration_agenda_items_agreed', blank=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'reviews_calibration_agenda_items'
        ordering = ['order']
    
    def __str__(self):
        return self.title


class CalibrationRating(models.Model):
    """
    Individual rating adjustments made during calibration.
    Stores BEFORE and AFTER values - NO calculations.
    """
    
    calibration_session = models.ForeignKey(CalibrationSession, on_delete=models.CASCADE, related_name='rating_adjustments')
    final_rating = models.ForeignKey('reviews.FinalRating', on_delete=models.CASCADE, related_name='calibration_adjustments')
    adjusted_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, related_name='calibration_adjustments_made')
    
    # Rating Values (Before/After) - Stored as entered, no calculation
    before_score = models.DecimalField(max_digits=5, decimal_places=2)
    before_rating_label = models.CharField(max_length=100, blank=True)
    after_score = models.DecimalField(max_digits=5, decimal_places=2)
    after_rating_label = models.CharField(max_length=100, blank=True)
    
    # Reason (required for audit)
    adjustment_reason = models.TextField()
    supporting_evidence = models.TextField(blank=True)
    
    # Who agreed (many-to-many for consensus tracking)
    agreed_by = models.ManyToManyField('accounts.User', related_name='calibration_ratings_agreed', blank=True)
    
    # Timestamp
    adjusted_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'reviews_calibration_ratings'
        ordering = ['-adjusted_at']
        indexes = [models.Index(fields=['calibration_session']), models.Index(fields=['final_rating'])]
    
    def __str__(self):
        return f"Rating adj for {self.final_rating.employee.email}"
    
    def clean(self):
        super().clean()
        if self.before_score is not None and self.after_score is not None:
            pass


class CalibrationComment(models.Model):
    """
    Comments and discussion notes from calibration session.
    """
    
    calibration_session = models.ForeignKey(CalibrationSession, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, related_name='calibration_comments')
    calibration_rating = models.ForeignKey(CalibrationRating, on_delete=models.CASCADE, null=True, blank=True, related_name='comments')
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    parent_comment = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    
    class Meta:
        db_table = 'reviews_calibration_comments'
        ordering = ['created_at']
        indexes = [models.Index(fields=['calibration_session', 'created_at'])]
    
    def __str__(self):
        author = self.author.email if self.author else "Anonymous"
        return f"{author}: {self.comment[:50]}"