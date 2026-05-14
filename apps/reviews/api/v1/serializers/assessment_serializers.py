# apps/reviews/api/v1/serializers/assessment_serializers.py
"""
Serializers for SelfAssessment and SupervisorReview models
"""

from rest_framework import serializers
from django.utils import timezone

from apps.reviews.models import SelfAssessment, SupervisorReview
from .base_serializers import BaseTenantSerializer, BaseStatusSerializer
from .competency_serializers import CompetencyRatingSerializer


class SelfAssessmentSerializer(BaseTenantSerializer, BaseStatusSerializer):
    """
    Main serializer for SelfAssessment model.
    """
    
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)
    employee_email = serializers.EmailField(source='employee.email', read_only=True)
    review_cycle_name = serializers.CharField(source='review_cycle.name', read_only=True)
    avg_competency_rating = serializers.FloatField(read_only=True)
    is_late = serializers.SerializerMethodField()
    days_remaining = serializers.SerializerMethodField()
    
    def get_is_late(self, obj):
        """Check if assessment was submitted after deadline."""
        if obj.submitted_at:
            deadline = obj.review_cycle.self_assessment_deadline
            return obj.submitted_at.date() > deadline
        return False
    
    def get_days_remaining(self, obj):
        """Calculate days remaining until deadline."""
        today = timezone.now().date()
        deadline = obj.review_cycle.self_assessment_deadline
        if today > deadline:
            return 0
        return (deadline - today).days
    
    class Meta:
        model = SelfAssessment
        fields = [
            'id', 'review_cycle', 'review_cycle_name', 'employee',
            'employee_name', 'employee_email',
            'status', 'status_display', 'submitted_at',
            'overall_comment', 'strengths', 'areas_for_improvement',
            'career_aspirations', 'challenges_faced', 'achievements',
            'training_completed', 'training_requested',
            'goals_achieved', 'goals_for_next_period',
            'avg_competency_rating', 'is_late', 'days_remaining',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'submitted_at']


class SelfAssessmentSubmitSerializer(serializers.Serializer):
    """
    Serializer for submitting self assessment.
    """
    
    confirm_submit = serializers.BooleanField(required=True)
    
    def validate_confirm_submit(self, value):
        if not value:
            raise serializers.ValidationError("Must confirm to submit")
        return value


class SelfAssessmentDetailSerializer(SelfAssessmentSerializer):
    """
    Detailed serializer with competency ratings.
    """
    
    competency_ratings = CompetencyRatingSerializer(
        source='competency_ratings',
        many=True,
        read_only=True
    )
    
    class Meta(SelfAssessmentSerializer.Meta):
        fields = SelfAssessmentSerializer.Meta.fields + ['competency_ratings']


class SupervisorReviewSerializer(BaseTenantSerializer, BaseStatusSerializer):
    """
    Main serializer for SupervisorReview model.
    """
    
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)
    employee_email = serializers.EmailField(source='employee.email', read_only=True)
    supervisor_name = serializers.CharField(source='supervisor.get_full_name', read_only=True)
    review_cycle_name = serializers.CharField(source='review_cycle.name', read_only=True)
    recommendation_display = serializers.CharField(source='get_recommendation_display', read_only=True)
    bonus_recommendation_display = serializers.CharField(source='get_bonus_recommendation_display', read_only=True)
    avg_competency_rating = serializers.FloatField(read_only=True)
    has_self_assessment = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = SupervisorReview
        fields = [
            'id', 'review_cycle', 'review_cycle_name',
            'employee', 'employee_name', 'employee_email',
            'supervisor', 'supervisor_name',
            'self_assessment', 'has_self_assessment',
            'status', 'status_display', 'submitted_at', 'reviewed_at',
            'overall_comment', 'performance_summary',
            'strengths_observed', 'development_areas', 'achievements_recognized',
            'career_progression_notes', 'training_recommendations',
            'goals_for_next_period',
            'recommendation', 'recommendation_display',
            'promotion_readiness', 'promotion_target_role', 'promotion_timeline',
            'bonus_recommendation', 'bonus_recommendation_display', 'bonus_percentage',
            'override_kpi_score', 'override_reason',
            'avg_competency_rating',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'submitted_at', 'reviewed_at']


class SupervisorReviewSubmitSerializer(serializers.Serializer):
    """
    Serializer for submitting supervisor review.
    """
    
    confirm_submit = serializers.BooleanField(required=True)
    
    def validate_confirm_submit(self, value):
        if not value:
            raise serializers.ValidationError("Must confirm to submit")
        return value


class SupervisorReviewApproveSerializer(serializers.Serializer):
    """
    Serializer for approving supervisor review.
    """
    
    approve = serializers.BooleanField(required=True)
    comments = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, data):
        if not data.get('approve'):
            raise serializers.ValidationError("Must approve to proceed")
        return data


class SupervisorReviewDetailSerializer(SupervisorReviewSerializer):
    """
    Detailed serializer with competency ratings and self assessment comparison.
    """
    
    competency_ratings = CompetencyRatingSerializer(
        source='competency_ratings',
        many=True,
        read_only=True
    )
    self_assessment_data = SelfAssessmentSerializer(source='self_assessment', read_only=True)
    
    class Meta(SupervisorReviewSerializer.Meta):
        fields = SupervisorReviewSerializer.Meta.fields + [
            'competency_ratings', 'self_assessment_data'
        ]