from rest_framework import serializers
from apps.reviews.models import ReviewTemplate
from .base_serializers import BaseTenantSerializer

class ReviewTemplateSerializer(BaseTenantSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    class Meta:
        model = ReviewTemplate
        fields = [
            'id', 'name', 'description', 'tenant', 'tenant_name',
            'included_sections', 'custom_sections', 'required_sections',
            'section_order', 'applies_to_self_assessment',
            'applies_to_supervisor_review', 'applies_to_360_feedback',
            'max_strength_chars', 'max_improvement_chars', 'max_goals_chars',
            'is_active', 'is_default', 'created_by', 'created_by_name', 'version',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'version', 'tenant']

class ReviewTemplateListSerializer(ReviewTemplateSerializer):
    class Meta(ReviewTemplateSerializer.Meta):
        fields = ['id', 'name', 'is_default', 'is_active', 'version', 'tenant_name']