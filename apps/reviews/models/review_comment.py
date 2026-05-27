# apps/reviews/models/review_comment.py
"""
Review Comment Model - Generic comments for any review model
Uses GenericForeignKey to attach comments to any model
MODELS ONLY - No business logic
"""

from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.core.exceptions import ValidationError

from .base import ReviewBaseModel


class ReviewComment(ReviewBaseModel):
    """
    Generic comment that can be attached to ANY review model.
    
    Can comment on:
    - SelfAssessment
    - SupervisorReview
    - FinalRating
    - PIP
    - PIPAction
    - CalibrationRating
    - etc.
    """
    
    class CommentType(models.TextChoices):
        GENERAL = 'general', 'General Comment'
        QUESTION = 'question', 'Question'
        CLARIFICATION = 'clarification', 'Request for Clarification'
        FEEDBACK = 'feedback', 'Feedback'
        APPROVAL = 'approval', 'Approval Note'
        DISPUTE = 'dispute', 'Dispute'
        RESOLUTION = 'resolution', 'Resolution'
    
    class Visibility(models.TextChoices):
        PUBLIC = 'public', 'Visible to All'
        MANAGER_ONLY = 'manager', 'Manager Only'
        HR_ONLY = 'hr', 'HR Only'
        PRIVATE = 'private', 'Private (Only Author)'
    
    # Generic Foreign Key to any review model
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        limit_choices_to={
            'app_label': 'reviews',
            'model__in': [
                'selfassessment',
                'supervisorreview',
                'finalrating',
                'pip',
                'pipaction',
                'pipreview',
                'calibrationrating',
                'feedbackrequest',
            ]
        }
    )
    object_id = models.CharField(max_length=36)  # UUID length
    parent_object = GenericForeignKey('content_type', 'object_id')
    
    # Comment content
    comment_type = models.CharField(
        max_length=20,
        choices=CommentType.choices,
        default=CommentType.GENERAL
    )
    
    comment = models.TextField()
    integrity_checksum = models.CharField(max_length=64, blank=True, db_index=True)
    
    # Author
    author = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='review_comments'
    )
    
    # Visibility
    visibility = models.CharField(
        max_length=20,
        choices=Visibility.choices,
        default=Visibility.PUBLIC
    )
    
    # For thread replies
    parent_comment = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies'
    )
    
    # Edit tracking
    edited_at = models.DateTimeField(null=True, blank=True)
    edit_history = models.JSONField(default=list, blank=True)
    
    # Resolved status (for action items)
    is_resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_comments'
    )
    
    class Meta:
        db_table = 'reviews_comments'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['author', 'created_at']),
            models.Index(fields=['comment_type']),
            models.Index(fields=['is_resolved']),
        ]
    
    def __str__(self):
        return f"Comment by {self.author.email}: {self.comment[:50]}"
    
    def clean(self):
        """Basic validation"""
        super().clean()
        
        if not self.comment or len(self.comment.strip()) == 0:
            raise ValidationError({'comment': 'Comment cannot be empty'})
        
        if self.parent_comment and self.parent_comment.pk == self.pk:
            raise ValidationError("Comment cannot be parent of itself")