from rest_framework import serializers
from django.utils import timezone
from apps.reviews.models import CalibrationSession, CalibrationRating, CalibrationComment
from .base_serializers import BaseTenantSerializer, BaseStatusSerializer

class CalibrationCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    author_email = serializers.EmailField(source='author.email', read_only=True)
    class Meta:
        model = CalibrationComment
        fields = ['id', 'calibration_session', 'author', 'author_name', 'author_email', 'comment', 'created_at']
        read_only_fields = ['id', 'created_at']

class CalibrationRatingSerializer(serializers.ModelSerializer):
    adjusted_by_name = serializers.CharField(source='adjusted_by.get_full_name', read_only=True)
    employee_name = serializers.CharField(source='final_rating.employee.get_full_name', read_only=True)
    adjustment_amount = serializers.SerializerMethodField()
    def get_adjustment_amount(self, obj):
        if obj.after_score is not None and obj.before_score is not None:
            return float(obj.after_score) - float(obj.before_score)
        return None
    class Meta:
        model = CalibrationRating
        fields = [
            'id', 'calibration_session', 'final_rating', 'employee_name',
            'adjusted_by', 'adjusted_by_name', 'before_score', 'after_score',
            'adjustment_amount', 'adjustment_reason', 'supporting_evidence', 'adjusted_at'
        ]
        read_only_fields = ['id', 'adjusted_at']

class CalibrationRatingCreateSerializer(CalibrationRatingSerializer):
    class Meta(CalibrationRatingSerializer.Meta):
        read_only_fields = ['id', 'adjusted_at', 'adjusted_by', 'calibration_session']

class CalibrationSessionSerializer(BaseTenantSerializer, BaseStatusSerializer):
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
        return obj.status == 'under_review'
    class Meta:
        model = CalibrationSession
        fields = [
            'id', 'review_cycle', 'review_cycle_name', 'name', 'description',
            'session_type', 'session_type_display', 'scheduled_date',
            'actual_start_time', 'actual_end_time', 'facilitator', 'facilitator_name',
            'participants', 'participants_count', 'departments_included', 'departments_count',
            'agenda', 'notes', 'decisions', 'status', 'status_display',
            'outcome', 'outcome_display', 'follow_up_required', 'follow_up_date',
            'is_upcoming', 'is_in_progress', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'participants': {'required': False},
            'departments_included': {'required': False}
        }

class CalibrationSessionListSerializer(CalibrationSessionSerializer):
    class Meta(CalibrationSessionSerializer.Meta):
        fields = ['id', 'name', 'review_cycle_name', 'session_type_display', 'scheduled_date', 'status', 'status_display', 'facilitator_name', 'participants_count', 'is_upcoming']

class CalibrationSessionDetailSerializer(CalibrationSessionSerializer):
    rating_adjustments = CalibrationRatingSerializer(many=True, read_only=True)
    comments = CalibrationCommentSerializer(many=True, read_only=True)
    class Meta(CalibrationSessionSerializer.Meta):
        fields = CalibrationSessionSerializer.Meta.fields + ['rating_adjustments', 'comments']

class CalibrationSessionCreateSerializer(CalibrationSessionSerializer):
    class Meta(CalibrationSessionSerializer.Meta):
        read_only_fields = ['id', 'created_at', 'updated_at', 'status', 'outcome']

class CalibrationSessionStartSerializer(serializers.Serializer):
    start = serializers.BooleanField(required=True)
    def validate(self, data):
        if not data.get('start'):
            raise serializers.ValidationError("Must confirm to start session")
        return data

class CalibrationSessionCompleteSerializer(serializers.Serializer):
    decisions = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    def validate(self, data):
        if not data.get('decisions') and not data.get('notes'):
            raise serializers.ValidationError("Please provide decisions or notes")
        return data