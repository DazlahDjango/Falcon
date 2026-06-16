from rest_framework import serializers
from django.utils import timezone
from apps.reviews.models import PromotionRecommendation
from .base_serializers import BaseTenantSerializer

class PromotionRecommendationSerializer(BaseTenantSerializer):
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)
    employee_email = serializers.EmailField(source='employee.email', read_only=True)
    review_cycle_name = serializers.CharField(source='review_cycle.name', read_only=True)
    recommended_by_name = serializers.CharField(source='recommended_by.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    days_pending = serializers.SerializerMethodField()
    def get_days_pending(self, obj):
        if obj.status == 'pending' and obj.recommended_date:
            return (timezone.now().date() - obj.recommended_date).days
        return None
    class Meta:
        model = PromotionRecommendation
        fields = [
            'id', 'employee', 'employee_name', 'employee_email',
            'review_cycle', 'review_cycle_name', 'final_rating',
            'recommended_by', 'recommended_by_name',
            'current_role', 'current_level', 'recommended_role', 'recommended_level',
            'priority', 'priority_display', 'justification', 'supporting_evidence',
            'recommended_date', 'target_promotion_date', 'actual_promotion_date',
            'current_salary', 'proposed_salary', 'salary_increase_percentage',
            'status', 'status_display', 'status_notes', 'rejection_reason',
            'approved_by', 'approved_by_name', 'approved_at', 'hr_notes',
            'days_pending', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'recommended_date', 'approved_at']

class PromotionRecommendationListSerializer(PromotionRecommendationSerializer):
    class Meta(PromotionRecommendationSerializer.Meta):
        fields = ['id', 'employee_name', 'recommended_role', 'priority_display', 'status_display', 'recommended_date']

class PromotionApproveSerializer(serializers.Serializer):
    approve = serializers.BooleanField(required=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    target_date = serializers.DateField(required=False)
    def validate(self, data):
        if not data.get('approve'):
            raise serializers.ValidationError("Must approve to proceed")
        return data

class PromotionRejectSerializer(serializers.Serializer):
    reason = serializers.CharField(required=True)
    def validate_reason(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Rejection reason must be at least 10 characters")
        return value