# apps/reviews/api/v1/serializers/competency_serializers.py
"""
Serializers for Competency and CompetencyRating models
"""

from rest_framework import serializers
from apps.reviews.models import Competency, CompetencyCategory, CompetencyRating
from .base_serializers import BaseTenantSerializer


class CompetencyCategorySerializer(BaseTenantSerializer):
    """
    Serializer for CompetencyCategory model.
    """
    
    class Meta:
        model = CompetencyCategory
        fields = [
            'id', 'name', 'description', 'tenant', 'tenant_name',
            'order', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CompetencySerializer(BaseTenantSerializer):
    """
    Serializer for Competency model.
    """
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    rating_scale_name = serializers.CharField(source='rating_scale.name', read_only=True)
    
    class Meta:
        model = Competency
        fields = [
            'id', 'name', 'description', 'tenant', 'tenant_name',
            'category', 'category_name', 'competency_type',
            'default_weight', 'rating_scale', 'rating_scale_name',
            'is_active', 'is_required', 'display_order',
            'excellent_behavior', 'needs_improvement_behavior',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CompetencyListSerializer(CompetencySerializer):
    """
    Simplified serializer for list views.
    """
    
    class Meta(CompetencySerializer.Meta):
        fields = [
            'id', 'name', 'category_name', 'competency_type',
            'default_weight', 'is_active', 'is_required'
        ]


class CompetencyRatingSerializer(BaseTenantSerializer):
    """
    Serializer for CompetencyRating model.
    """
    
    competency_name = serializers.CharField(source='competency.name', read_only=True)
    competency_type = serializers.CharField(source='competency.competency_type', read_only=True)
    
    class Meta:
        model = CompetencyRating
        fields = [
            'id', 'competency', 'competency_name', 'competency_type',
            'raw_score', 'normalized_score', 'traffic_light',
            'comment', 'evidence', 'is_primary',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'normalized_score', 'traffic_light', 'created_at', 'updated_at']


class CompetencyRatingBulkSerializer(serializers.Serializer):
    """
    Serializer for bulk competency rating operations.
    """
    
    ratings = CompetencyRatingSerializer(many=True)
    
    def validate(self, data):
        if not data.get('ratings'):
            raise serializers.ValidationError("At least one rating is required")
        return data