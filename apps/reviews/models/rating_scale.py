from django.db import models
from django.core.exceptions import ValidationError
from .base import ReviewBaseModel

class RatingScale(ReviewBaseModel):
    name = models.CharField(max_length=100)
    tenant = models.ForeignKey('tenant.Client', on_delete=models.CASCADE, related_name='rating_scales', db_column='tenant_id_id')
    description = models.TextField(blank=True)
    levels = models.JSONField()
    min_value = models.DecimalField(max_digits=5, decimal_places=2, default=1.00)
    max_value = models.DecimalField(max_digits=5, decimal_places=2, default=5.00)
    allow_decimal = models.BooleanField(default=False)
    reverse_scoring = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    created_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, related_name='created_rating_scales')
    class Meta:
        db_table = 'reviews_rating_scales'
        ordering = ['-is_default', 'name']
        unique_together = [['tenant', 'name']]
        indexes = [models.Index(fields=['tenant', 'is_active']), models.Index(fields=['tenant', 'is_default'])]
    def __str__(self):
        return self.name
    def clean(self):
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
        if not self.reverse_scoring and values != sorted(values):
            raise ValidationError('Values must be increasing (1,2,3,4,5)')
        if self.reverse_scoring and values != sorted(values, reverse=True):
            raise ValidationError('Values must be decreasing (5,4,3,2,1)')
    def save(self, *args, **kwargs):
        # Check for existing scales using either tenant (ForeignKey) or tenant_id (UUID)
        existing = False
        if self.tenant:
            existing = RatingScale.objects.filter(tenant=self.tenant).exists()
        elif self.tenant_id:
            existing = RatingScale.objects.filter(tenant_id=self.tenant_id).exists()
        if not existing:
            self.is_default = True
        super().save(*args, **kwargs)
    def get_level_by_value(self, value):
        for level in self.levels:
            if level['value'] == value:
                return level
        return None
    def get_level_by_percentage(self, percentage):
        for level in sorted(self.levels, key=lambda x: x.get('min_pct', 0), reverse=True):
            if percentage >= level.get('min_pct', 0):
                return level
        return self.levels[-1] if self.levels else None
    def get_label(self, value=None, percentage=None):
        if value is not None:
            level = self.get_level_by_value(value)
            return level['label'] if level else None
        if percentage is not None:
            level = self.get_level_by_percentage(percentage)
            return level['label'] if level else None
        return None
    def get_color(self, value=None, percentage=None):
        if value is not None:
            level = self.get_level_by_value(value)
            return level.get('color', '#95a5a6') if level else '#95a5a6'
        if percentage is not None:
            level = self.get_level_by_percentage(percentage)
            return level.get('color', '#95a5a6') if level else '#95a5a6'
        return '#95a5a6'
    def normalize_score(self, raw_score):
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
    def convert_score(self, score, from_type, to_type):
        """Convert score between raw, percentage, and label."""
        if from_type == 'raw' and to_type == 'percentage':
            return self.normalize_score(score)
        elif from_type == 'percentage' and to_type == 'raw':
            return self.denormalize_score(score)
        elif from_type == 'raw' and to_type == 'label':
            return self.get_label(value=score)
        elif from_type == 'percentage' and to_type == 'label':
            return self.get_label(percentage=score)
        return None