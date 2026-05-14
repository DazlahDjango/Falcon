# apps/reviews/models/rating_scale.py
"""
Rating Scale Model - Maps scores to rating labels (e.g., 4.5 = "Outstanding")
"""

from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator

from .base import ReviewBaseModel


class RatingScale(ReviewBaseModel):
    """
    Configurable rating scale for performance reviews.
    Each tenant can have multiple scales, one default.
    """
    
    # Basic Info
    name = models.CharField(max_length=100)
    tenant=models.ForeignKey('tenant.Client', on_delete=models.CASCADE, related_name='rating_scales')
    description = models.TextField(blank=True)
    
    # Scale Levels: [{"value": 5, "label": "Outstanding", "color": "green", "min_pct": 90}, ...]
    levels = models.JSONField()
    
    # Range
    min_value = models.DecimalField(max_digits=5, decimal_places=2, default=1.00)
    max_value = models.DecimalField(max_digits=5, decimal_places=2, default=5.00)
    
    # Rules
    allow_decimal = models.BooleanField(default=False)  # Allow 3.7 or only whole numbers?
    reverse_scoring = models.BooleanField(default=False)  # Higher score = worse?
    
    # Status
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    
    # Audit
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_rating_scales'
    )
    
    class Meta:
        db_table = 'reviews_rating_scales'
        ordering = ['-is_default', 'name']
        unique_together = [['tenant', 'name']]
        indexes = [
            models.Index(fields=['tenant', 'is_active']),
            models.Index(fields=['tenant', 'is_default']),
        ]
    
    def __str__(self):
        return self.name
    
    def clean(self):
        """Basic validation"""
        if self.min_value >= self.max_value:
            raise ValidationError('Min value must be less than max value')
        
        if not self.levels or len(self.levels) < 2:
            raise ValidationError('At least 2 rating levels required')
        
        values = []
        for level in self.levels:
            if 'value' not in level or 'label' not in level:
                raise ValidationError('Each level must have value and label')
            
            value = level['value']
            if value in values:
                raise ValidationError(f'Duplicate value: {value}')
            values.append(value)
            
            if value < self.min_value or value > self.max_value:
                raise ValidationError(f'Value {value} outside range')
        
        # Ensure values are in order (1,2,3,4,5) or (5,4,3,2,1)
        if not self.reverse_scoring and values != sorted(values):
            raise ValidationError('Values must be increasing (1,2,3,4,5)')
        if self.reverse_scoring and values != sorted(values, reverse=True):
            raise ValidationError('Values must be decreasing (5,4,3,2,1)')
    
    def save(self, *args, **kwargs):
        if not RatingScale.objects.filter(tenant=self.tenant).exists():
            self.is_default = True
        super().save(*args, **kwargs)
    
    # ========== CRITICAL METHODS (Keep these) ==========
    
    def get_level_by_value(self, value):
        """Get level by raw value (e.g., value=4)"""
        for level in self.levels:
            if level['value'] == value:
                return level
        return None
    
    def get_level_by_percentage(self, percentage):
        """Get level by percentage (e.g., 85% -> 'Exceeds')"""
        for level in sorted(self.levels, key=lambda x: x.get('min_pct', 0), reverse=True):
            if percentage >= level.get('min_pct', 0):
                return level
        return self.levels[-1] if self.levels else None
    
    def get_label(self, value=None, percentage=None):
        """Get label by value OR percentage"""
        if value is not None:
            level = self.get_level_by_value(value)
            return level['label'] if level else None
        if percentage is not None:
            level = self.get_level_by_percentage(percentage)
            return level['label'] if level else None
        return None
    
    def get_color(self, value=None, percentage=None):
        """Get color by value OR percentage"""
        if value is not None:
            level = self.get_level_by_value(value)
            return level.get('color', '#95a5a6') if level else '#95a5a6'
        if percentage is not None:
            level = self.get_level_by_percentage(percentage)
            return level.get('color', '#95a5a6') if level else '#95a5a6'
        return '#95a5a6'
    
    def normalize_score(self, raw_score):
        """Convert 1-5 scale to percentage 0-100"""
        if raw_score is None:
            return None
        raw = float(raw_score)
        min_val = float(self.min_value)
        max_val = float(self.max_value)
        
        if max_val == min_val:
            return 100.0
        
        normalized = ((raw - min_val) / (max_val - min_val)) * 100
        
        if self.reverse_scoring:
            normalized = 100 - normalized
        
        return round(normalized, 2)
    
    def denormalize_score(self, percentage):
        """Convert percentage back to raw score"""
        if percentage is None:
            return None
        
        pct = float(percentage)
        min_val = float(self.min_value)
        max_val = float(self.max_value)
        
        if self.reverse_scoring:
            pct = 100 - pct
        
        raw = min_val + (pct / 100) * (max_val - min_val)
        
        if not self.allow_decimal:
            raw = round(raw)
        
        return round(raw, 2)