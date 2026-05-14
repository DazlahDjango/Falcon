# apps/reviews/api/v1/serializers/calibration_serializers.py
"""
Serializers for calibration models
"""

from rest_framework import serializers
from django.utils import timezone

from apps.reviews.models import CalibrationSession, CalibrationRating, CalibrationComment
from .base_serializers import BaseTenantSerializer, BaseStatusSerializer
from .final_rating_serializers import FinalRatingSerializer


class CalibrationCommentSerializer(BaseTenantSerializer):
    """
    Serializer for CalibrationComment model.
    """

    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    author_email = serializers.EmailField(source='author.email', read_only=True)

    class Meta:
        model = CalibrationComment
        fields = [
            'id', 'calibration_session', 'author', 'author_name', 'author_email',
            'comment', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class CalibrationRatingSerializer(BaseTenantSerializer):
    """
    Serializer for CalibrationRating model.
    """

    adjusted_by_name = serializers.CharField(source='adjusted_by.get_full_name', read_only=True)
    employee_name = serializers.CharField(source='final_rating.employee.get_full_name', read_only=True)
    adjustment_amount = serializers.FloatField(read_only=True)

    class Meta:
        model = CalibrationRating
        fields = [
            'id', 'calibration_session', 'final_rating',
            'employee_name', 'adjusted_by', 'adjusted_by_name',
            'before_score', 'after_score', 'adjustment_amount',
            'adjustment_reason', 'supporting_evidence',
            'adjusted_at'
        ]
        read_only_fields = ['id', 'adjusted_at', 'adjustment_amount']


class CalibrationRatingCreateSerializer(CalibrationRatingSerializer):
    """
    Serializer for creating calibration rating adjustments.
    """

    class Meta(CalibrationRatingSerializer.Meta):
        read_only_fields = ['id', 'adjusted_at', 'adjustment_amount', 'adjusted_by']


class CalibrationSessionSerializer(BaseTenantSerializer, BaseStatusSerializer):
    """
    Main serializer for CalibrationSession model.
    """

    session_type_display = serializers.CharField(source='get_session_type_display', read_only=True)
    outcome_display = serializers.CharField(source='get_outcome_display', read_only=True)
    facilitator_name = serializers.CharField(source='facilitator.get_full_name', read_only=True)
    review_cycle_name = serializers.CharField(source='review_cycle.name', read_only=True)
    participants_count = serializers.SerializerMethodField()
    departments_count = serializers.SerializerMethodField()
    is_upcoming = serializers.SerializerMethodField()
    is_in_progress = serializers.SerializerMethodField()

    def get_participants_count(self, obj):
        return obj.participants.count()

    def get_departments_count(self, obj):
        return obj.departments_included.count()

    def get_is_upcoming(self, obj):
        return obj.scheduled_date > timezone.now()

    def get_is_in_progress(self, obj):
        return obj.status == 'in_progress'

    class Meta:
        model = CalibrationSession
        fields = [
            'id', 'review_cycle', 'review_cycle_name',
            'name', 'description', 'session_type', 'session_type_display',
            'scheduled_date', 'actual_start_time', 'actual_end_time',
            'facilitator', 'facilitator_name',
            'participants', 'participants_count',
            'departments_included', 'departments_count',
            'agenda', 'notes', 'decisions',
            'status', 'status_display', 'outcome', 'outcome_display',
            'follow_up_required', 'follow_up_date',
            'is_upcoming', 'is_in_progress',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CalibrationSessionListSerializer(CalibrationSessionSerializer):
    """
    Simplified serializer for list views.
    """

    class Meta(CalibrationSessionSerializer.Meta):
        fields = [
            'id', 'name', 'review_cycle_name', 'session_type_display',
            'scheduled_date', 'status', 'status_display',
            'facilitator_name', 'participants_count', 'is_upcoming'
        ]


class CalibrationSessionDetailSerializer(CalibrationSessionSerializer):
    """
    Detailed serializer with ratings and comments.
    """

    rating_adjustments = CalibrationRatingSerializer(many=True, read_only=True)
    comments = CalibrationCommentSerializer(many=True, read_only=True)

    class Meta(CalibrationSessionSerializer.Meta):
        fields = CalibrationSessionSerializer.Meta.fields + [
            'rating_adjustments', 'comments'
        ]


class CalibrationSessionCreateSerializer(CalibrationSessionSerializer):
    """
    Serializer for creating calibration sessions.
    """

    class Meta(CalibrationSessionSerializer.Meta):
        read_only_fields = ['id', 'created_at', 'updated_at', 'status', 'outcome']


class CalibrationSessionStartSerializer(serializers.Serializer):
    """
    Serializer for starting a calibration session.
    """

    start = serializers.BooleanField(required=True)

    def validate(self, data):
        if not data.get('start'):
            raise serializers.ValidationError("Must confirm to start session")
        return data


class CalibrationSessionCompleteSerializer(serializers.Serializer):
    """
    Serializer for completing a calibration session.
    """

    decisions = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        # Ensure at least one of decisions or notes is provided
        if not data.get('decisions') and not data.get('notes'):
            raise serializers.ValidationError("Please provide decisions or notes")
        return data