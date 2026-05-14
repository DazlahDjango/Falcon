
# apps/reviews/models/base.py
from django.db import models
from django.utils import timezone
from apps.accounts.models import TimestampModel, SoftDeleteModel
from apps.accounts.models import TenantAwareModel as TenantAwareMixin


class ReviewQuerySet(models.QuerySet):
    """Custom queryset for review models"""
    
    def active(self):
        """Filter to active (not soft-deleted) records"""
        return self.filter(deleted_at__isnull=True)
    
    def for_tenant(self, tenant_id):
        """Filter by tenant"""
        return self.filter(tenant_id=tenant_id)
    
    def in_cycle(self, cycle_id):
        """Filter by review cycle"""
        return self.filter(cycle_id=cycle_id)
    
    def pending(self):
        """Filter to pending submissions"""
        return self.filter(status='pending')
    
    def submitted(self):
        """Filter to submitted items"""
        return self.filter(status='submitted')
    
    def completed(self):
        """Filter to completed items"""
        return self.filter(status='completed')
    
    def after_date(self, date):
        """Filter items created after date"""
        return self.filter(created_at__gte=date)
    
    def before_date(self, date):
        """Filter items created before date"""
        return self.filter(created_at__lte=date)


class ReviewBaseModel(TimestampModel, SoftDeleteModel, TenantAwareMixin):
    """
    Abstract base model for all review-related models.
    
    Provides:
    - Automatic timestamps (created_at, updated_at)
    - Soft delete (deleted_at)
    - Tenant isolation (tenant_id)
    - Custom queryset with common filters
    """
    
    objects = ReviewQuerySet.as_manager()
    
    class Meta:
        abstract = True
        ordering = ['-created_at']


class ReviewStatusMixin(models.Model):
    """
    Mixin for models that need approval workflow status.
    
    Status flow:
    draft → submitted → under_review → approved → completed
                    ↓
                rejected → draft (for revision)
    """
    
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        SUBMITTED = 'submitted', 'Submitted'
        UNDER_REVIEW = 'under_review', 'Under Review'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'
        ARCHIVED = 'archived', 'Archived'
    
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True,
        help_text="Current status in the review workflow"
    )
    
    submitted_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When this was submitted for review"
    )
    
    reviewed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When a manager/HR reviewed this"
    )
    
    reviewed_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='%(class)s_reviewed',
        help_text="Who performed the last review action"
    )
    
    rejection_reason = models.TextField(
        blank=True,
        help_text="Why this was rejected (if status is rejected)"
    )
    
    class Meta:
        abstract = True
    
    def submit(self, user=None):
        """Submit for approval"""
        self.status = self.Status.SUBMITTED
        self.submitted_at = timezone.now()
        if user:
            self.reviewed_by = user
    
    def approve(self, user=None):
        """Approve this item"""
        self.status = self.Status.APPROVED
        self.reviewed_at = timezone.now()
        if user:
            self.reviewed_by = user
    
    def reject(self, reason, user=None):
        """Reject with reason"""
        self.status = self.Status.REJECTED
        self.rejection_reason = reason
        self.reviewed_at = timezone.now()
        if user:
            self.reviewed_by = user
    
    def mark_complete(self):
        """Mark as completed (final state)"""
        self.status = self.Status.COMPLETED
    
    def is_editable(self):
        """Check if this can still be edited"""
        return self.status in [self.Status.DRAFT, self.Status.REJECTED]
    
    def is_pending_review(self):
        """Check if waiting for someone to review"""
        return self.status == self.Status.SUBMITTED


class ScoreMixin(models.Model):
    """
    Mixin for models that have scores/ratings.
    
    Provides automatic percentage calculation and score normalization.
    """
    
    # Raw score (1-5, 1-10, or 0-100 depending on rating scale)
    raw_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Raw score from the rating scale"
    )
    
    # Normalized percentage (0-100)
    normalized_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Score normalized to percentage (0-100)"
    )
    
    # Traffic light based on normalized_score
    traffic_light = models.CharField(
        max_length=10,
        blank=True,
        help_text="Red (<60%), Yellow (60-79%), Green (>=80%)"
    )
    
    class Meta:
        abstract = True
    
    def save(self, *args, **kwargs):
        """Auto-calculate normalized_score and traffic_light before saving"""
        if self.raw_score is not None:
            # Calculate normalized percentage based on max possible score
            # Assumes max score is 5 if raw_score <=5, otherwise 100
            max_score = 5 if self.raw_score <= 5 else 100
            self.normalized_score = (self.raw_score / max_score) * 100
            
            # Set traffic light
            if self.normalized_score >= 80:
                self.traffic_light = 'green'
            elif self.normalized_score >= 60:
                self.traffic_light = 'yellow'
            else:
                self.traffic_light = 'red'
        
        super().save(*args, **kwargs)
    
    def get_rating_label(self, rating_scale=None):
        """
        Get the human-readable label for this score.
        Uses tenant's rating scale if provided.
        """
        if not self.raw_score:
            return "Not Rated"
        
        if rating_scale:
            return rating_scale.get_label_for_value(self.raw_score)
        
        # Default labels
        if self.raw_score >= 4.5:
            return "Outstanding"
        elif self.raw_score >= 3.5:
            return "Exceeds Expectations"
        elif self.raw_score >= 2.5:
            return "Meets Expectations"
        elif self.raw_score >= 1.5:
            return "Needs Improvement"
        else:
            return "Unsatisfactory"
