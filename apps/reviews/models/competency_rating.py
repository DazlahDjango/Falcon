from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.contrib.contenttypes.models import ContentType
from .base import ReviewBaseModel, ScoreMixin

class CompetencyRating(ReviewBaseModel, ScoreMixin):
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, limit_choices_to={'app_label': 'reviews', 'model__in': ['selfassessment', 'supervisorreview']})
    object_id = models.CharField(max_length=36)
    competency = models.ForeignKey('reviews.Competency', on_delete=models.CASCADE, related_name='ratings')
    raw_score = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0)])
    comment = models.TextField(blank=True)
    evidence = models.FileField(upload_to='reviews/evidence/%Y/%m/', blank=True, null=True)
    rating_scale_id = models.CharField(max_length=36, blank=True)
    rating_scale_name = models.CharField(max_length=100, blank=True)
    is_primary = models.BooleanField(default=True)
    class Meta:
        db_table = 'reviews_competency_ratings'
        ordering = ['competency__display_order', 'competency__name']
        indexes = [models.Index(fields=['content_type', 'object_id']), models.Index(fields=['competency', 'raw_score']), models.Index(fields=['is_primary'])]
    def __str__(self):
        return f"{self.competency.name}: {self.raw_score}"
    def clean(self):
        super().clean()
        if self.raw_score < 0 or self.raw_score > 10:
            raise ValidationError({'raw_score': 'Rating must be between 0 and 10'})
        if self.comment and len(self.comment) > 5000:
            raise ValidationError({'comment': 'Comment cannot exceed 5000 characters'})
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    def get_parent_type(self):
        return self.content_type.model if self.content_type else None
    @property
    def is_self_rating(self):
        return self.content_type and self.content_type.model == 'selfassessment'
    @property
    def is_manager_rating(self):
        return self.content_type and self.content_type.model == 'supervisorreview'
    @property
    def rating_summary(self):
        return {'competency': self.competency.name, 'rating': float(self.raw_score), 'normalized': float(self.normalized_score) if self.normalized_score else None, 'traffic_light': self.traffic_light, 'has_comment': bool(self.comment), 'has_evidence': bool(self.evidence)}
    @property
    def rating_display(self):
        if self.raw_score:
            return f"{self.raw_score:.1f}"
        return "Not rated"