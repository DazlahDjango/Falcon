# apps/reviews/models/pip.py
"""
Performance Improvement Plan (PIP) Model
MODELS ONLY - No business logic, calculations, or complex properties
"""

from django.db import models
from django.core.exceptions import ValidationError

from .base import ReviewBaseModel, ReviewStatusMixin


class PIP(ReviewBaseModel, ReviewStatusMixin):
    """
    Performance Improvement Plan for underperforming employees.
    MODELS ONLY - Contains only data fields and basic validation.
    """
    
    class Severity(models.TextChoices):
        MINOR = 'minor', 'Minor - Coaching Required'
        MODERATE = 'moderate', 'Moderate - Formal PIP'
        SEVERE = 'severe', 'Severe - Final Warning'
        CRITICAL = 'critical', 'Critical - Possible Termination'
    
    class Outcome(models.TextChoices):
        SUCCESSFUL = 'successful', 'Successful'
        EXTENDED = 'extended', 'Extended'
        FAILED = 'failed', 'Failed'
        TERMINATED = 'terminated', 'Terminated'
        RESIGNED = 'resigned', 'Resigned'
    
    # ========== Relationships ==========
    tenant = models.ForeignKey('tenant.Organization', on_delete=models.CASCADE, related_name='pips')
    employee = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='pips_as_employee')
    owner = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='pips_as_owner')
    review_cycle = models.ForeignKey('ReviewCycle', on_delete=models.SET_NULL, null=True, blank=True)
    final_rating = models.OneToOneField('FinalRating', on_delete=models.SET_NULL, null=True, blank=True)
    
    # ========== Basic Information ==========
    title = models.CharField(max_length=200)
    description = models.TextField()
    severity = models.CharField(max_length=20, choices=Severity.choices, default=Severity.MODERATE)
    
    # ========== Timeline ==========
    start_date = models.DateField()
    end_date = models.DateField()
    extended_to_date = models.DateField(null=True, blank=True)
    extension_reason = models.TextField(blank=True)
    
    # ========== Goals and Expectations ==========
    improvement_areas = models.TextField()
    success_criteria = models.TextField()
    success_metrics = models.JSONField(default=dict, blank=True)
    
    # ========== Consequences ==========
    consequences_if_failed = models.TextField()
    consequences_if_successful = models.TextField(blank=True)
    
    # ========== Sign-off ==========
    employee_acknowledged_at = models.DateTimeField(null=True, blank=True)
    employee_acknowledged_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True)
    employee_comments = models.TextField(blank=True)
    manager_signed_at = models.DateTimeField(null=True, blank=True)
    hr_signed_at = models.DateTimeField(null=True, blank=True)
    
    # ========== Outcome ==========
    outcome = models.CharField(max_length=20, choices=Outcome.choices, null=True, blank=True)
    outcome_notes = models.TextField(blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'reviews_pips'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tenant', 'status']),
            models.Index(fields=['employee', 'status']),
            models.Index(fields=['owner', 'status']),
            models.Index(fields=['start_date', 'end_date']),
        ]
    
    def __str__(self):
        return f"PIP: {self.employee.email} - {self.title}"
    
    def clean(self):
        """Basic validation only"""
        super().clean()
        
        if self.start_date >= self.end_date:
            raise ValidationError({'end_date': 'End date must be after start date'})
        
        if self.extended_to_date and self.extended_to_date <= self.end_date:
            raise ValidationError({'extended_to_date': 'Extension date must be after original end date'})


class PIPAction(models.Model):
    """
    Individual action items within a Performance Improvement Plan.
    """
    
    class ActionStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'
        MISSED = 'missed', 'Missed Deadline'
        WAIVED = 'waived', 'Waived'
    
    class Priority(models.TextChoices):
        HIGH = 'high', 'High'
        MEDIUM = 'medium', 'Medium'
        LOW = 'low', 'Low'
    
    # ========== Relationships ==========
    pip = models.ForeignKey(PIP, on_delete=models.CASCADE, related_name='actions')
    
    # ========== Basic Information ==========
    title = models.CharField(max_length=200)
    description = models.TextField()
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.MEDIUM)
    
    # ========== Timeline ==========
    due_date = models.DateField()
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # ========== Status ==========
    status = models.CharField(max_length=20, choices=ActionStatus.choices, default=ActionStatus.PENDING)
    progress_notes = models.TextField(blank=True)
    
    # ========== Evidence ==========
    requires_evidence = models.BooleanField(default=False)
    evidence = models.FileField(upload_to='pip_evidence/%Y/%m/', blank=True, null=True)
    evidence_verified_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True)
    evidence_verified_at = models.DateTimeField(null=True, blank=True)
    
    # ========== Notes ==========
    manager_notes = models.TextField(blank=True)
    employee_notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'reviews_pip_actions'
        ordering = ['priority', 'due_date']
        indexes = [
            models.Index(fields=['pip', 'status']),
            models.Index(fields=['due_date']),
        ]
    
    def __str__(self):
        return self.title


class PIPReview(models.Model):
    """
    Regular progress reviews for a PIP.
    """
    
    class ReviewRating(models.TextChoices):
        NO_PROGRESS = 'no_progress', 'No Progress'
        MINIMAL_PROGRESS = 'minimal', 'Minimal Progress'
        SATISFACTORY = 'satisfactory', 'Satisfactory'
        GOOD_PROGRESS = 'good', 'Good Progress'
        EXCELLENT = 'excellent', 'Excellent'
    
    # ========== Relationships ==========
    pip = models.ForeignKey(PIP, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='pip_reviews_given')
    employee = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='pip_reviews_received')
    
    # ========== Review Content ==========
    review_date = models.DateField()
    rating = models.CharField(max_length=20, choices=ReviewRating.choices)
    summary = models.TextField()
    accomplishments = models.TextField(blank=True)
    challenges = models.TextField(blank=True)
    action_items = models.TextField(blank=True)
    
    # ========== Attendance ==========
    employee_attended = models.BooleanField(default=True)
    employee_signature = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'reviews_pip_reviews'
        ordering = ['-review_date']
        indexes = [
            models.Index(fields=['pip', 'review_date']),
        ]
    
    def __str__(self):
        return f"PIP Review: {self.review_date}"