# apps/reviews/models/feedback.py
"""
360-Degree Feedback Model
Peer, subordinate, and cross-department feedback
MODELS ONLY - No business logic
"""

from django.db import models
from django.core.exceptions import ValidationError

from .base import ReviewBaseModel, ReviewStatusMixin


class FeedbackRequest(ReviewBaseModel, ReviewStatusMixin):
    """
    Request for feedback about an employee.
    Sent to specific reviewers for a review cycle.
    """
    
    class ReviewerType(models.TextChoices):
        MANAGER = 'manager', 'Direct Manager'
        PEER = 'peer', 'Peer (Same Level)'
        SUBORDINATE = 'subordinate', 'Subordinate'
        CROSS_DEPT = 'cross_dept', 'Cross-Department'
        EXTERNAL = 'external', 'External (Client/Partner)'
        SELF = 'self', 'Self Assessment'
    
    # Relationships
    review_cycle = models.ForeignKey(
        'reviews.ReviewCycle',
        on_delete=models.CASCADE,
        related_name='feedback_requests'
    )
    
    subject = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='feedback_as_subject',
        help_text="Employee being reviewed"
    )
    
    reviewer = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='feedback_as_reviewer',
        help_text="Person giving feedback"
    )
    
    requested_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='feedback_requests_made',
        help_text="Who requested this feedback (usually HR or manager)"
    )
    
    # Request Details
    reviewer_type = models.CharField(
        max_length=20,
        choices=ReviewerType.choices,
        help_text="Relationship of reviewer to subject"
    )
    
    is_anonymous = models.BooleanField(
        default=True,
        help_text="Will reviewer's identity be hidden from subject?"
    )
    
    is_required = models.BooleanField(
        default=False,
        help_text="Is this feedback required for the review cycle?"
    )
    
    # Dates
    requested_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateField()
    reminder_sent_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'reviews_feedback_requests'
        ordering = ['-created_at']
        unique_together = [['review_cycle', 'subject', 'reviewer']]
        indexes = [
            models.Index(fields=['review_cycle', 'status']),
            models.Index(fields=['subject', 'review_cycle']),
            models.Index(fields=['reviewer', 'status']),
            models.Index(fields=['due_date']),
        ]
    
    def __str__(self):
        return f"Feedback for {self.subject.email} from {self.reviewer.email}"
    
    def clean(self):
        super().clean()
        
        if self.subject == self.reviewer:
            raise ValidationError("Cannot request feedback from self")
        
        if self.subject.tenant_id != self.reviewer.tenant_id:
            raise ValidationError("Subject and reviewer must be in same tenant")


class FeedbackResponse(ReviewBaseModel):
    """
    Actual feedback response from a reviewer.
    Can be anonymous or attributed.
    """
    
    # Relationships
    feedback_request = models.OneToOneField(
        FeedbackRequest,
        on_delete=models.CASCADE,
        related_name='response'
    )
    
    # Ratings (optional - some feedback is just narrative)
    overall_rating = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        null=True,
        blank=True,
        help_text="Overall rating (1-5)"
    )
    
    # Narrative Feedback
    strengths = models.TextField(
        blank=True,
        help_text="What does the subject do well?"
    )
    
    areas_for_improvement = models.TextField(
        blank=True,
        help_text="What could the subject improve?"
    )
    
    specific_examples = models.TextField(
        blank=True,
        help_text="Specific examples of behavior"
    )
    
    suggestions = models.TextField(
        blank=True,
        help_text="Suggestions for growth/development"
    )
    
    # Additional Comments
    additional_comments = models.TextField(
        blank=True,
        help_text="Any other feedback"
    )
    
    # For structured feedback (optional)
    ratings = models.JSONField(
        default=dict,
        blank=True,
        help_text="Structured ratings per competency: {'leadership': 4, 'communication': 5}"
    )
    
    integrity_checksum = models.CharField(max_length=64, blank=True, db_index=True)

    # Tracking
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_anonymous = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'reviews_feedback_responses'
        ordering = ['-submitted_at']
        indexes = [
            models.Index(fields=['feedback_request']),
            models.Index(fields=['submitted_at']),
        ]
    
    def __str__(self):
        return f"Response for {self.feedback_request.subject.email}"
    
    def clean(self):
        super().clean()
        
        # Ensure anonymity matches request
        if self.feedback_request:
            if self.is_anonymous != self.feedback_request.is_anonymous:
                raise ValidationError({
                    'is_anonymous': f"Response anonymity must match request (request is {self.feedback_request.is_anonymous})"
                })


class FeedbackSummary(ReviewBaseModel):
    """
    Aggregated, anonymized summary of all feedback for an employee.
    Generated once all feedback is collected.
    """
    
    # Relationships
    review_cycle = models.ForeignKey(
        'reviews.ReviewCycle',
        on_delete=models.CASCADE,
        related_name='feedback_summaries'
    )
    
    subject = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='feedback_summaries'
    )
    
    # Summary Statistics
    total_responses = models.IntegerField(default=0)
    
    # Average ratings by reviewer type
    avg_manager_rating = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    avg_peer_rating = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    avg_subordinate_rating = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    avg_cross_dept_rating = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    overall_avg_rating = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    
    # Aggregated narrative (anonymized)
    common_strengths = models.JSONField(default=list, help_text="List of frequently mentioned strengths")
    common_improvements = models.JSONField(default=list, help_text="List of frequently mentioned improvements")
    
    # Full anonymized responses (for reference)
    anonymized_responses = models.JSONField(
        default=list,
        help_text="List of anonymized responses for review"
    )
    
    # Status
    is_shared_with_subject = models.BooleanField(default=False)
    shared_at = models.DateTimeField(null=True, blank=True)
    shared_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        db_table = 'reviews_feedback_summaries'
        ordering = ['-created_at']
        unique_together = [['review_cycle', 'subject']]
        indexes = [
            models.Index(fields=['review_cycle', 'subject']),
            models.Index(fields=['overall_avg_rating']),
        ]
    
    def __str__(self):
        return f"Feedback Summary for {self.subject.email} - {self.review_cycle.name}"