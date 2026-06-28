from django.db import models
from django.utils import timezone
from apps.accounts.models import TimestampModel, SoftDeleteModel
from apps.accounts.models import TenantAwareModel as TenantAwareMixin

class ReviewQuerySet(models.QuerySet):
    def active(self):
        return self.filter(deleted_at__isnull=True)
    def for_tenant(self, tenant_id):
        return self.filter(tenant_id=tenant_id)
    def in_cycle(self, cycle_id):
        return self.filter(cycle_id=cycle_id)
    def pending(self):
        return self.filter(status='pending')
    def submitted(self):
        return self.filter(status='submitted')
    def completed(self):
        return self.filter(status='completed')
    def after_date(self, date):
        return self.filter(created_at__gte=date)
    def before_date(self, date):
        return self.filter(created_at__lte=date)

class ReviewBaseModel(TimestampModel, SoftDeleteModel, TenantAwareMixin):
    objects = ReviewQuerySet.as_manager()
    class Meta:
        abstract = True
        ordering = ['-created_at']

class ReviewStatusMixin(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        SUBMITTED = 'submitted', 'Submitted'
        UNDER_REVIEW = 'under_review', 'Under Review'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'
        ARCHIVED = 'archived', 'Archived'
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT, db_index=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='%(class)s_reviewed')
    rejection_reason = models.TextField(blank=True)
    class Meta:
        abstract = True
    def submit(self, user=None):
        self.status = self.Status.SUBMITTED
        self.submitted_at = timezone.now()
        if user:
            self.reviewed_by = user
    def approve(self, user=None):
        self.status = self.Status.APPROVED
        self.reviewed_at = timezone.now()
        if user:
            self.reviewed_by = user
    def reject(self, reason, user=None):
        self.status = self.Status.REJECTED
        self.rejection_reason = reason
        self.reviewed_at = timezone.now()
        if user:
            self.reviewed_by = user
    def mark_complete(self):
        self.status = self.Status.COMPLETED
    def is_editable(self):
        return self.status in [self.Status.DRAFT, self.Status.REJECTED]
    def is_pending_review(self):
        return self.status == self.Status.SUBMITTED

class ScoreMixin(models.Model):
    raw_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    normalized_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    traffic_light = models.CharField(max_length=10, blank=True)
    class Meta:
        abstract = True
    def save(self, *args, **kwargs):
        if self.raw_score is not None:
            max_score = 5 if self.raw_score <= 5 else 100
            self.normalized_score = (self.raw_score / max_score) * 100
            self.traffic_light = 'green' if self.normalized_score >= 80 else 'yellow' if self.normalized_score >= 60 else 'red'
        super().save(*args, **kwargs)
    def get_rating_label(self, rating_scale=None):
        if not self.raw_score:
            return "Not Rated"
        if rating_scale:
            return rating_scale.get_label_for_value(self.raw_score)
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