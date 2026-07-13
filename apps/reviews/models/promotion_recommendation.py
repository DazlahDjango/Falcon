# apps/reviews/models/promotion_recommendation.py
"""
Promotion Recommendation Model - Track promotion recommendations over time
MODELS ONLY - No business logic
"""

from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator

from .base import ReviewBaseModel


class PromotionRecommendation(ReviewBaseModel):
    """
    Track promotion recommendations from review cycles.
    Maintains history of when employees were recommended for promotion.
    """
    
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending Review'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'
        ON_HOLD = 'on_hold', 'On Hold'
        COMPLETED = 'completed', 'Promotion Completed'
    
    class Priority(models.TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'
        URGENT = 'urgent', 'Urgent'
    
    # Relationships
    tenant = models.ForeignKey(
        'tenant.Organization',
        on_delete=models.CASCADE,
        related_name='promotion_recommendations'
    )
    
    employee = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='promotion_recommendations'
    )
    
    review_cycle = models.ForeignKey(
        'reviews.ReviewCycle',
        on_delete=models.CASCADE,
        related_name='promotion_recommendations'
    )
    
    final_rating = models.ForeignKey(
        'reviews.FinalRating',
        on_delete=models.CASCADE,
        related_name='promotion_recommendations'
    )
    
    recommended_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='promotions_recommended'
    )
    
    # Recommendation details
    current_role = models.CharField(max_length=100)
    current_level = models.CharField(max_length=50, blank=True)
    
    recommended_role = models.CharField(max_length=100)
    recommended_level = models.CharField(max_length=50, blank=True)
    
    priority = models.CharField(
        max_length=10,
        choices=Priority.choices,
        default=Priority.MEDIUM
    )
    
    justification = models.TextField(
        help_text="Why this promotion is recommended"
    )
    
    supporting_evidence = models.TextField(blank=True)
    
    # Timeline
    recommended_date = models.DateField(auto_now_add=True)
    target_promotion_date = models.DateField(null=True, blank=True)
    actual_promotion_date = models.DateField(null=True, blank=True)
    
    # Compensation (optional)
    current_salary = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    proposed_salary = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    salary_increase_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    
    # Status tracking
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    
    status_notes = models.TextField(blank=True)
    
    # Approval
    approved_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_promotions'
    )
    
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    # HR notes
    hr_notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'reviews_promotion_recommendations'
        ordering = ['-recommended_date']
        indexes = [
            models.Index(fields=['tenant', 'status']),
            models.Index(fields=['employee', 'review_cycle']),
            models.Index(fields=['priority', 'status']),
            models.Index(fields=['recommended_date']),
            models.Index(fields=['target_promotion_date']),
        ]
    
    def __str__(self):
        return f"Promotion: {self.employee.email} → {self.recommended_role}"
    
    def clean(self):
        """Basic validation"""
        super().clean()
        
        if self.target_promotion_date and self.target_promotion_date < self.recommended_date:
            raise ValidationError({
                'target_promotion_date': 'Target date must be after recommendation date'
            })
        
        if self.actual_promotion_date and self.actual_promotion_date < self.recommended_date:
            raise ValidationError({
                'actual_promotion_date': 'Actual date must be after recommendation date'
            })
        
        if self.status == PromotionRecommendation.Status.APPROVED and not self.approved_by:
            raise ValidationError({
                'approved_by': 'Approved by is required when status is Approved'
            })
        
        if self.status == PromotionRecommendation.Status.REJECTED and not self.rejection_reason:
            raise ValidationError({
                'rejection_reason': 'Rejection reason is required when status is Rejected'
            })