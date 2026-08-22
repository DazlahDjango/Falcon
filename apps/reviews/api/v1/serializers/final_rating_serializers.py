from rest_framework import serializers
from django.utils import timezone
from apps.reviews.models import FinalRating
from .base_serializers import BaseTenantSerializer

class FinalRatingSerializer(BaseTenantSerializer):
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)
    employee_email = serializers.EmailField(source='employee.email', read_only=True)
    review_cycle_name = serializers.CharField(source='review_cycle.name', read_only=True)
    rating_scale_name = serializers.CharField(source='rating_scale.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    action_outcome_display = serializers.CharField(source='get_action_outcome_display', read_only=True)
    class Meta:
        model = FinalRating
        fields = [
            'id', 'review_cycle', 'review_cycle_name', 'employee', 'employee_name',
            'employee_email', 'supervisor_review', 'calibration_session', 'rating_scale',
            'rating_scale_name', 'kpi_score', 'competency_score', 'mission_score',
            'task_score', 'raw_total_score', 'coefficient_applied', 'adjusted_score',
            'calibration_adjustment', 'calibration_adjustment_reason', 'final_score',
            'final_rating_label', 'final_rating_color', 'promotion_recommended',
            'promotion_target_role', 'promotion_timeline', 'bonus_amount', 'bonus_percentage',
            'pip_recommended', 'pip_reason', 'action_outcome', 'action_outcome_display',
            'status', 'status_display', 'approved_by', 'approved_at', 'notes',
            'previous_version', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'approved_at']

class FinalRatingListSerializer(FinalRatingSerializer):
    class Meta(FinalRatingSerializer.Meta):
        fields = ['id', 'employee_name', 'employee_email', 'review_cycle_name', 'final_score', 'final_rating_label', 'final_rating_color', 'status', 'status_display', 'promotion_recommended', 'pip_recommended']

class FinalRatingDetailSerializer(FinalRatingSerializer):
    score_breakdown = serializers.SerializerMethodField()
    def get_score_breakdown(self, obj):
        return {
            'kpi': float(obj.kpi_score) if obj.kpi_score else None,
            'competency': float(obj.competency_score) if obj.competency_score else None,
            'mission': float(obj.mission_score) if obj.mission_score else None,
            'task': float(obj.task_score) if obj.task_score else None,
            'raw_total': float(obj.raw_total_score) if obj.raw_total_score else None,
            'coefficient': float(obj.coefficient_applied) if obj.coefficient_applied else 1.0,
            'adjusted': float(obj.adjusted_score) if obj.adjusted_score else None,
            'calibration_adjustment': float(obj.calibration_adjustment) if obj.calibration_adjustment else 0,
            'final': float(obj.final_score) if obj.final_score else None
        }
    class Meta(FinalRatingSerializer.Meta):
        fields = FinalRatingSerializer.Meta.fields + ['score_breakdown']

class FinalRatingApproveSerializer(serializers.Serializer):
    approve = serializers.BooleanField(required=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    def validate(self, data):
        if not data.get('approve'):
            raise serializers.ValidationError("Must approve to proceed")
        return data

class FinalRatingLockSerializer(serializers.Serializer):
    lock = serializers.BooleanField(required=True)
    def validate(self, data):
        if not data.get('lock'):
            raise serializers.ValidationError("Must confirm to lock")
        return data

class FinalRatingCalibrateSerializer(serializers.Serializer):
    adjusted_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    reason = serializers.CharField(required=True)
    def validate_adjusted_score(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Score must be between 0 and 100")
        return value

class FinalRatingExportSerializer(serializers.Serializer):
    cycle_id = serializers.UUIDField(required=True)
    format = serializers.ChoiceField(choices=['csv', 'excel', 'pdf'], default='csv')
    include_details = serializers.BooleanField(default=False)
    def validate_cycle_id(self, value):
        from apps.reviews.models import ReviewCycle
        if not ReviewCycle.objects.filter(id=value).exists():
            raise serializers.ValidationError("Review cycle not found")
        return value

class RatingDistributionSerializer(serializers.Serializer):
    rating_label = serializers.CharField()
    count = serializers.IntegerField()
    percentage = serializers.FloatField()
    color = serializers.CharField()