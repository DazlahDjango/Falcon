from rest_framework import serializers
from apps.reviews.models import Coefficient
from .base_serializers import BaseTenantSerializer

class CoefficientSerializer(BaseTenantSerializer):
    coefficient_type_display = serializers.CharField(source='get_coefficient_type_display', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    position_title = serializers.CharField(source='position.title', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    class Meta:
        model = Coefficient
        fields = [
            'id', 'coefficient_type', 'coefficient_type_display',
            'department', 'department_name', 'position', 'position_title',
            'user', 'user_name', 'value', 'reason',
            'valid_from', 'valid_to', 'is_active',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class CoefficientListSerializer(CoefficientSerializer):
    class Meta(CoefficientSerializer.Meta):
        fields = ['id', 'coefficient_type_display', 'value', 'valid_from', 'valid_to', 'is_active']

class CoefficientApplySerializer(serializers.Serializer):
    score = serializers.DecimalField(max_digits=5, decimal_places=2)
    coefficient_value = serializers.DecimalField(max_digits=5, decimal_places=4, default=1.0)
    def validate_coefficient_value(self, value):
        if value < 0.5 or value > 1.5:
            raise serializers.ValidationError("Coefficient must be between 0.5 and 1.5")
        return value