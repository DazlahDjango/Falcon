# apps/reviews/api/v1/serializers/rating_scale_serializers.py
"""
Serializers for RatingScale model
"""

from rest_framework import serializers
from apps.reviews.models import RatingScale
from .base_serializers import BaseTenantSerializer


class RatingScaleSerializer(BaseTenantSerializer):
    """
    Main serializer for RatingScale model.
    """
    
    class Meta:
        model = RatingScale
        fields = [
            'id', 'name', 'description', 'tenant', 'tenant_name',
            'levels', 'min_value', 'max_value', 'allow_decimal',
            'reverse_scoring', 'is_active', 'is_default',
            'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at', 'tenant']


class RatingScaleListSerializer(RatingScaleSerializer):
    """
    Simplified serializer for list views.
    """
    
    class Meta(RatingScaleSerializer.Meta):
        fields = [
            'id', 'name', 'is_default', 'is_active',
            'min_value', 'max_value', 'tenant_name'
        ]


class RatingScaleDetailSerializer(RatingScaleSerializer):
    """
    Detailed serializer for single object views.
    """
    
    level_count = serializers.SerializerMethodField()
    usage_count = serializers.SerializerMethodField()
    
    def get_level_count(self, obj):
        return len(obj.levels) if obj.levels else 0
    
    def get_usage_count(self, obj):
        return obj.review_cycles.count()
    
    class Meta(RatingScaleSerializer.Meta):
        fields = RatingScaleSerializer.Meta.fields + ['level_count', 'usage_count']


class RatingScaleCreateUpdateSerializer(RatingScaleSerializer):
    """
    Serializer for create/update operations.
    """
    
    class Meta(RatingScaleSerializer.Meta):
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at', 'is_default', 'tenant']


class ConvertScoreSerializer(serializers.Serializer):
    """
    Serializer for score conversion.
    """
    rating_scale_id = serializers.UUIDField()
    score = serializers.DecimalField(max_digits=5, decimal_places=2)
    from_type = serializers.ChoiceField(choices=['raw', 'percentage'])
    to_type = serializers.ChoiceField(choices=['raw', 'percentage', 'label'])
    
    def validate(self, data):
        if data['from_type'] == data['to_type']:
            raise serializers.ValidationError("from_type and to_type must be different")
        return data