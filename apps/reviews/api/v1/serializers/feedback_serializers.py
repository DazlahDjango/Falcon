from rest_framework import serializers
from django.utils import timezone
from apps.reviews.models import FeedbackRequest, FeedbackResponse, FeedbackSummary
from .base_serializers import BaseTenantSerializer

class FeedbackRequestSerializer(BaseTenantSerializer):
    subject_name = serializers.CharField(source='subject.get_full_name', read_only=True)
    subject_email = serializers.EmailField(source='subject.email', read_only=True)
    reviewer_name = serializers.CharField(source='reviewer.get_full_name', read_only=True)
    reviewer_email = serializers.EmailField(source='reviewer.email', read_only=True)
    requested_by_name = serializers.CharField(source='requested_by.get_full_name', read_only=True)
    review_cycle_name = serializers.CharField(source='review_cycle.name', read_only=True)
    reviewer_type_display = serializers.CharField(source='get_reviewer_type_display', read_only=True)
    is_overdue = serializers.SerializerMethodField()
    has_response = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    def get_is_overdue(self, obj):
        if obj.status == 'submitted':
            return False
        return obj.due_date < timezone.now().date()
    def get_has_response(self, obj):
        return hasattr(obj, 'response') and obj.response is not None
    def get_status_display(self, obj):
        return 'Pending' if obj.status == 'draft' else 'Completed'
    class Meta:
        model = FeedbackRequest
        fields = [
            'id', 'review_cycle', 'review_cycle_name', 'subject', 'subject_name',
            'subject_email', 'reviewer', 'reviewer_name', 'reviewer_email',
            'requested_by', 'requested_by_name', 'reviewer_type', 'reviewer_type_display',
            'is_anonymous', 'is_required', 'status', 'status_display', 'requested_at',
            'due_date', 'reminder_sent_at', 'completed_at', 'is_overdue', 'has_response',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'requested_at', 'completed_at']

class FeedbackRequestCreateSerializer(FeedbackRequestSerializer):
    class Meta(FeedbackRequestSerializer.Meta):
        read_only_fields = ['id', 'created_at', 'updated_at', 'status', 'requested_at']

class FeedbackResponseSerializer(BaseTenantSerializer):
    reviewer_name = serializers.CharField(source='feedback_request.reviewer.get_full_name', read_only=True)
    reviewer_type = serializers.CharField(source='feedback_request.reviewer_type', read_only=True)
    reviewer_type_display = serializers.CharField(source='feedback_request.get_reviewer_type_display', read_only=True)
    subject_name = serializers.CharField(source='feedback_request.subject.get_full_name', read_only=True)
    is_anonymous_response = serializers.BooleanField(source='is_anonymous', read_only=True)
    class Meta:
        model = FeedbackResponse
        fields = [
            'id', 'feedback_request', 'overall_rating', 'strengths', 'areas_for_improvement',
            'specific_examples', 'suggestions', 'additional_comments', 'ratings',
            'reviewer_name', 'reviewer_type', 'reviewer_type_display', 'subject_name',
            'is_anonymous_response', 'integrity_checksum', 'submitted_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'submitted_at', 'integrity_checksum']

class FeedbackResponseSubmitSerializer(serializers.Serializer):
    overall_rating = serializers.DecimalField(max_digits=3, decimal_places=1, required=False)
    strengths = serializers.CharField(required=False, allow_blank=True)
    areas_for_improvement = serializers.CharField(required=False, allow_blank=True)
    specific_examples = serializers.CharField(required=False, allow_blank=True)
    suggestions = serializers.CharField(required=False, allow_blank=True)
    additional_comments = serializers.CharField(required=False, allow_blank=True)
    ratings = serializers.DictField(required=False)
    def validate_overall_rating(self, value):
        if value is not None and (value < 1 or value > 5):
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value

class FeedbackSummarySerializer(BaseTenantSerializer):
    subject_name = serializers.CharField(source='subject.get_full_name', read_only=True)
    subject_email = serializers.EmailField(source='subject.email', read_only=True)
    review_cycle_name = serializers.CharField(source='review_cycle.name', read_only=True)
    shared_by_name = serializers.CharField(source='shared_by.get_full_name', read_only=True)
    class Meta:
        model = FeedbackSummary
        fields = [
            'id', 'review_cycle', 'review_cycle_name', 'subject', 'subject_name',
            'subject_email', 'total_responses', 'avg_manager_rating', 'avg_peer_rating',
            'avg_subordinate_rating', 'avg_cross_dept_rating', 'overall_avg_rating',
            'common_strengths', 'common_improvements', 'anonymized_responses',
            'is_shared_with_subject', 'shared_at', 'shared_by', 'shared_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'shared_at']

class FeedbackSummaryShareSerializer(serializers.Serializer):
    share = serializers.BooleanField(required=True)
    def validate(self, data):
        if not data.get('share'):
            raise serializers.ValidationError("Must confirm to share")
        return data