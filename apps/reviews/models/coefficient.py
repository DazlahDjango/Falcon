# apps/reviews/models/coefficient.py
"""
Coefficient Model - Department/role score adjustments
Allows fair comparison across different teams
MODELS ONLY - No business logic
"""

from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator

from .base import ReviewBaseModel


class Coefficient(ReviewBaseModel):
    """
    Coefficient applied to scores for specific departments, positions, or individuals.
    
    Example: R&D roles get 1.05x multiplier because their KPIs are harder to achieve.
    Example: Sales in Q4 gets 0.95x because targets are higher.
    """
    
    class CoefficientType(models.TextChoices):
        DEPARTMENT = 'department', 'Department Level'
        POSITION = 'position', 'Position Level'
        INDIVIDUAL = 'individual', 'Individual Level'
    
    # Tenant isolation
    tenant = models.ForeignKey(
        'tenant.Client',
        on_delete=models.CASCADE,
        related_name='coefficients'
    )
    
    # Type and target
    coefficient_type = models.CharField(
        max_length=20,
        choices=CoefficientType.choices
    )
    
    department = models.ForeignKey(
        'structure.Department',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='coefficients'
    )
    
    position = models.ForeignKey(
        'structure.Position',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='coefficients'
    )
    
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='coefficients'
    )
    
    # The coefficient value
    # 1.00 = no adjustment, >1.00 = boost, <1.00 = reduction
    value = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        default=1.0000,
        validators=[MinValueValidator(0.50), MaxValueValidator(1.50)],
        help_text="Multiplier (1.05 = +5%, 0.95 = -5%)"
    )
    
    # Why this coefficient exists
    reason = models.TextField()
    
    # Validity period
    valid_from = models.DateField()
    valid_to = models.DateField(null=True, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Audit
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_coefficients'
    )
    
    class Meta:
        db_table = 'reviews_coefficients'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tenant', 'is_active']),
            models.Index(fields=['coefficient_type']),
            models.Index(fields=['department', 'valid_from']),
            models.Index(fields=['position', 'valid_from']),
            models.Index(fields=['user', 'valid_from']),
        ]
    
    def __str__(self):
        if self.department:
            return f"{self.department.name}: {self.value}"
        if self.position:
            return f"{self.position.title}: {self.value}"
        if self.user:
            return f"{self.user.email}: {self.value}"
        return f"Coefficient: {self.value}"
    
    def clean(self):
        super().clean()
        
        # Exactly one target must be selected
        targets = [self.department, self.position, self.user]
        selected_count = sum(1 for t in targets if t is not None)
        
        if selected_count == 0:
            raise ValidationError("Must select a department, position, or user")
        
        if selected_count > 1:
            raise ValidationError("Cannot select multiple targets")
        
        # Validate dates
        if self.valid_to and self.valid_to <= self.valid_from:
            raise ValidationError({'valid_to': 'Must be after valid_from'})