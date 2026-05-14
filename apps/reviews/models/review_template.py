# apps/reviews/models/review_template.py
"""
Review Template Model - Customizable review forms per tenant
Allows tenants to configure which sections appear in review forms
MODELS ONLY - No business logic
"""

from django.db import models
from django.core.exceptions import ValidationError

from .base import ReviewBaseModel


class ReviewTemplate(ReviewBaseModel):
    """
    Template for review forms. Tenants can customize which sections to include.
    
    Example sections: strengths, weaknesses, goals, training, etc.
    """
    
    class SectionType(models.TextChoices):
        STRENGTHS = 'strengths', 'Strengths'
        WEAKNESSES = 'weaknesses', 'Areas for Improvement'
        GOALS = 'goals', 'Goals & Objectives'
        TRAINING = 'training', 'Training & Development'
        CAREER = 'career', 'Career Aspirations'
        ACHIEVEMENTS = 'achievements', 'Key Achievements'
        CHALLENGES = 'challenges', 'Challenges Faced'
        FEEDBACK = 'feedback', 'Additional Feedback'
        CUSTOM = 'custom', 'Custom Section'
    
    tenant = models.ForeignKey(
        'tenant.Client',
        on_delete=models.CASCADE,
        related_name='review_templates'
    )
    
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    # Which section types are included
    included_sections = models.JSONField(
        default=list,
        help_text="List of section types to include in this template"
    )
    
    # Custom sections (tenant-defined)
    custom_sections = models.JSONField(
        default=list,
        blank=True,
        help_text="Custom sections defined by tenant: [{'name': 'Client Feedback', 'help_text': '...'}]"
    )
    
    # Required sections (must be filled)
    required_sections = models.JSONField(
        default=list,
        blank=True,
        help_text="Sections that are required to be filled"
    )
    
    # Order of sections
    section_order = models.JSONField(
        default=list,
        blank=True,
        help_text="Order in which sections appear in the form"
    )
    
    # Which review types use this template
    applies_to_self_assessment = models.BooleanField(default=True)
    applies_to_supervisor_review = models.BooleanField(default=True)
    applies_to_360_feedback = models.BooleanField(default=False)
    
    # Character limits
    max_strength_chars = models.IntegerField(default=500)
    max_improvement_chars = models.IntegerField(default=500)
    max_goals_chars = models.IntegerField(default=500)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    
    # Audit
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_templates'
    )
    
    # Version tracking
    version = models.IntegerField(default=1)
    
    class Meta:
        db_table = 'reviews_templates'
        ordering = ['-is_default', 'name']
        indexes = [
            models.Index(fields=['tenant', 'is_active']),
            models.Index(fields=['tenant', 'is_default']),
        ]
        unique_together = [['tenant', 'name']]
    
    def __str__(self):
        return f"{self.name} (v{self.version})"
    
    def clean(self):
        """Basic validation - NO business logic"""
        super().clean()
        
        # Validate JSON structures
        if not isinstance(self.included_sections, list):
            raise ValidationError({'included_sections': 'Must be a list'})
        
        if self.custom_sections and not isinstance(self.custom_sections, list):
            raise ValidationError({'custom_sections': 'Must be a list'})
        
        # Check for duplicate default per tenant
        if self.is_default:
            existing = ReviewTemplate.objects.filter(
                tenant=self.tenant,
                is_default=True
            ).exclude(pk=self.pk)
            if existing.exists():
                raise ValidationError({
                    'is_default': f"Tenant already has default template: {existing.first().name}"
                })
    
    def save(self, *args, **kwargs):
        """Auto-assign default if first template for tenant"""
        if not ReviewTemplate.objects.filter(tenant=self.tenant).exists():
            self.is_default = True
        super().save(*args, **kwargs)