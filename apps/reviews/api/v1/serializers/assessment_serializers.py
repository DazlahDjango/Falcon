from rest_framework import serializers
from django.utils import timezone
from apps.reviews.models import SelfAssessment, SupervisorReview
from .base_serializers import BaseTenantSerializer, BaseStatusSerializer
from .competency_serializers import CompetencyRatingSerializer

class SelfAssessmentSerializer(BaseTenantSerializer, BaseStatusSerializer):
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)
    employee_email = serializers.EmailField(source='employee.email', read_only=True)
    review_cycle_name = serializers.CharField(source='review_cycle.name', read_only=True)
    is_late = serializers.SerializerMethodField()
    days_remaining = serializers.SerializerMethodField()
    def get_is_late(self, obj):
        if obj.submitted_at:
            return obj.submitted_at.date() > obj.review_cycle.self_assessment_deadline
        return timezone.now().date() > obj.review_cycle.self_assessment_deadline
    def get_days_remaining(self, obj):
        today = timezone.now().date()
        deadline = obj.review_cycle.self_assessment_deadline
        if today > deadline:
            return 0
        return (deadline - today).days
    class Meta:
        model = SelfAssessment
        fields = [
            'id', 'review_cycle', 'review_cycle_name', 'employee',
            'employee_name', 'employee_email', 'status', 'status_display',
            'submitted_at', 'overall_comment', 'strengths', 'areas_for_improvement',
            'career_aspirations', 'challenges_faced', 'achievements',
            'training_completed', 'training_requested', 'goals_achieved',
            'goals_for_next_period', 'integrity_checksum', 'is_late', 'days_remaining',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'submitted_at', 'integrity_checksum']

class SelfAssessmentSubmitSerializer(serializers.Serializer):
    confirm_submit = serializers.BooleanField(required=True)
    def validate_confirm_submit(self, value):
        if not value:
            raise serializers.ValidationError("Must confirm to submit")
        return value

class SelfAssessmentDetailSerializer(SelfAssessmentSerializer):
    competency_ratings = CompetencyRatingSerializer(source='competency_ratings', many=True, read_only=True)
    class Meta(SelfAssessmentSerializer.Meta):
        fields = SelfAssessmentSerializer.Meta.fields + ['competency_ratings']

class SupervisorReviewSerializer(BaseTenantSerializer, BaseStatusSerializer):
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)
    employee_email = serializers.EmailField(source='employee.email', read_only=True)
    supervisor_name = serializers.CharField(source='supervisor.get_full_name', read_only=True)
    review_cycle_name = serializers.CharField(source='review_cycle.name', read_only=True)
    recommendation_display = serializers.CharField(source='get_recommendation_display', read_only=True)
    bonus_recommendation_display = serializers.CharField(source='get_bonus_recommendation_display', read_only=True)
    has_self_assessment = serializers.BooleanField(read_only=True)
    class Meta:
        model = SupervisorReview
        fields = [
            'id', 'review_cycle', 'review_cycle_name', 'employee', 'employee_name',
            'employee_email', 'supervisor', 'supervisor_name', 'self_assessment',
            'has_self_assessment', 'status', 'status_display', 'submitted_at',
            'reviewed_at', 'overall_comment', 'performance_summary', 'strengths_observed',
            'development_areas', 'achievements_recognized', 'career_progression_notes',
            'training_recommendations', 'goals_for_next_period', 'recommendation',
            'recommendation_display', 'promotion_readiness', 'promotion_target_role',
            'promotion_timeline', 'bonus_recommendation', 'bonus_recommendation_display',
            'bonus_percentage', 'override_kpi_score', 'override_reason', 'integrity_checksum',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'submitted_at', 'reviewed_at', 'integrity_checksum']

class SupervisorReviewSubmitSerializer(serializers.Serializer):
    confirm_submit = serializers.BooleanField(required=True)
    def validate_confirm_submit(self, value):
        if not value:
            raise serializers.ValidationError("Must confirm to submit")
        return value

class SupervisorReviewApproveSerializer(serializers.Serializer):
    approve = serializers.BooleanField(required=True)
    comments = serializers.CharField(required=False, allow_blank=True)
    def validate(self, data):
        if not data.get('approve'):
            raise serializers.ValidationError("Must approve to proceed")
        return data

class SupervisorReviewDetailSerializer(SupervisorReviewSerializer):
    competency_ratings = CompetencyRatingSerializer(source='competency_ratings', many=True, read_only=True)
    self_assessment_data = SelfAssessmentSerializer(source='self_assessment', read_only=True)
    class Meta(SupervisorReviewSerializer.Meta):
        fields = SupervisorReviewSerializer.Meta.fields + ['competency_ratings', 'self_assessment_data']