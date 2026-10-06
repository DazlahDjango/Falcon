from rest_framework import serializers
from django.utils import timezone
from apps.reviews.models import FeedbackRequest, FeedbackResponse, FeedbackSummary
from .base_serializers import BaseTenantSerializer

class FeedbackRequestSerializer(BaseTenantSerializer):
    subject_name = serializers.SerializerMethodField(read_only=True)
    subject_email = serializers.SerializerMethodField(read_only=True)
    reviewer_name = serializers.SerializerMethodField(read_only=True)
    reviewer_email = serializers.SerializerMethodField(read_only=True)
    requested_by_name = serializers.SerializerMethodField(read_only=True)
    review_cycle_name = serializers.CharField(source='review_cycle.name', read_only=True)
    reviewer_type_display = serializers.CharField(source='get_reviewer_type_display', read_only=True)
    is_overdue = serializers.SerializerMethodField()
    has_response = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()

    def get_subject_name(self, obj):
        return obj.subject.get_full_name() if obj.subject else None

    def get_subject_email(self, obj):
        return obj.subject.email if obj.subject else None

    def get_reviewer_name(self, obj):
        request = self.context.get('request')
        is_subject = request and request.user and str(request.user.id) == str(obj.subject_id)
        # If the viewer is the subject and feedback is anonymous, strictly mask the identity
        if obj.is_anonymous and is_subject:
            return f"Anonymous {obj.get_reviewer_type_display()}" if obj.reviewer_type else "Anonymous Reviewer"
        return obj.reviewer.get_full_name() if obj.reviewer else None

    def get_reviewer_email(self, obj):
        request = self.context.get('request')
        is_subject = request and request.user and str(request.user.id) == str(obj.subject_id)
        # If the viewer is the subject and feedback is anonymous, mask the email
        if obj.is_anonymous and is_subject:
            return "anonymous@feedback.internal"
        return obj.reviewer.email if obj.reviewer else None

    def get_requested_by_name(self, obj):
        return obj.requested_by.get_full_name() if obj.requested_by else None

    def get_is_overdue(self, obj):
        if obj.status == 'submitted' or not obj.due_date:
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
        read_only_fields = ['id', 'created_at', 'updated_at', 'requested_at', 'requested_by', 'completed_at']

class FeedbackRequestCreateSerializer(FeedbackRequestSerializer):
    class Meta(FeedbackRequestSerializer.Meta):
        read_only_fields = ['id', 'created_at', 'updated_at', 'status', 'requested_at', 'requested_by', 'completed_at']

class FeedbackResponseSerializer(BaseTenantSerializer):
    reviewer_name = serializers.SerializerMethodField(read_only=True)
    reviewer_type = serializers.SerializerMethodField(read_only=True)
    reviewer_type_display = serializers.SerializerMethodField(read_only=True)
    subject_name = serializers.SerializerMethodField(read_only=True)
    is_anonymous_response = serializers.BooleanField(source='is_anonymous', read_only=True)

    def get_reviewer_name(self, obj):
        request = self.context.get('request')
        is_subject = request and request.user and obj.feedback_request and str(request.user.id) == str(obj.feedback_request.subject_id)
        # If the viewer is the subject, always mask the reviewer when anonymous
        if obj.is_anonymous and is_subject:
            return f"Anonymous {obj.feedback_request.get_reviewer_type_display()}" if obj.feedback_request and obj.feedback_request.reviewer_type else "Anonymous Reviewer"
        if obj.is_anonymous and request and not (request.user.role in ['super_admin', 'client_admin']):
            if obj.feedback_request and str(request.user.id) == str(obj.feedback_request.reviewer_id):
                return obj.feedback_request.reviewer.get_full_name()
            return f"Anonymous {obj.feedback_request.get_reviewer_type_display()}" if obj.feedback_request and obj.feedback_request.reviewer_type else "Anonymous"
        return obj.feedback_request.reviewer.get_full_name() if obj.feedback_request and obj.feedback_request.reviewer else None

    def get_reviewer_type(self, obj):
        return obj.feedback_request.reviewer_type if obj.feedback_request else None

    def get_reviewer_type_display(self, obj):
        return obj.feedback_request.get_reviewer_type_display() if obj.feedback_request else None

    def get_subject_name(self, obj):
        return obj.feedback_request.subject.get_full_name() if obj.feedback_request and obj.feedback_request.subject else None

    class Meta:
        model = FeedbackResponse
        fields = [
            'id', 'feedback_request', 'overall_rating', 'strengths', 'areas_for_improvement',
            'specific_examples', 'suggestions', 'additional_comments', 'ratings',
            'reviewer_name', 'reviewer_type', 'reviewer_type_display', 'subject_name',
            'is_anonymous_response', 'integrity_checksum', 'submitted_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'submitted_at', 'integrity_checksum']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        text_fields = [
            'strengths', 'areas_for_improvement', 'specific_examples',
            'suggestions', 'additional_comments'
        ]
        from apps.reviews.services.security.field_encryption import ReviewFieldEncryptionService
        for f in text_fields:
            if ret.get(f):
                ret[f] = ReviewFieldEncryptionService.decrypt(ret[f])
        return ret

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
    subject_name = serializers.SerializerMethodField(read_only=True)
    subject_email = serializers.SerializerMethodField(read_only=True)
    review_cycle_name = serializers.CharField(source='review_cycle.name', read_only=True)
    shared_by_name = serializers.SerializerMethodField(read_only=True)

    def get_subject_name(self, obj):
        return obj.subject.get_full_name() if obj.subject else None

    def get_subject_email(self, obj):
        return obj.subject.email if obj.subject else None

    def get_shared_by_name(self, obj):
        return obj.shared_by.get_full_name() if obj.shared_by else None

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

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        from apps.reviews.services.security.field_encryption import ReviewFieldEncryptionService

        def _decrypt_item(val):
            if isinstance(val, str):
                return ReviewFieldEncryptionService.decrypt(val)
            elif isinstance(val, list):
                return [_decrypt_item(x) for x in val]
            elif isinstance(val, dict):
                return {k: _decrypt_item(v) for k, v in val.items()}
            return val

        if ret.get('common_strengths'):
            ret['common_strengths'] = _decrypt_item(ret['common_strengths'])
        if ret.get('common_improvements'):
            ret['common_improvements'] = _decrypt_item(ret['common_improvements'])
        if ret.get('anonymized_responses'):
            ret['anonymized_responses'] = _decrypt_item(ret['anonymized_responses'])
        return ret

class FeedbackSummaryShareSerializer(serializers.Serializer):
    share = serializers.BooleanField(required=True)
    def validate(self, data):
        if not data.get('share'):
            raise serializers.ValidationError("Must confirm to share")
        return data

class FeedbackAutoAssignSerializer(serializers.Serializer):
    STRATEGY_CHOICES = [
        ('intra_department', 'Intra-Department (All members in department review each other)'),
        ('all_departments', 'All Departments (Intra-department for every department in organization)'),
        ('cross_department', 'Cross-Department (Department A reviews Department B)'),
        ('organization_wide', 'Organization-Wide (All-to-all or sampled peer review)'),
        ('reporting_line', 'Reporting Line (Upward, Downward, and Team Peer reviews)'),
    ]

    cycle_id = serializers.IntegerField(required=True)
    strategy = serializers.ChoiceField(choices=STRATEGY_CHOICES, default='intra_department')
    department = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    source_department = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    target_department = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    bidirectional = serializers.BooleanField(default=True)
    manager_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    sample_size = serializers.IntegerField(required=False, allow_null=True, min_value=1)
    due_date = serializers.DateField(required=False, allow_null=True)
    is_anonymous = serializers.BooleanField(default=True)
    is_required = serializers.BooleanField(default=False)
    dry_run = serializers.BooleanField(default=False)

    def validate(self, data):
        strategy = data.get('strategy')
        if strategy == 'intra_department' and not data.get('department'):
            raise serializers.ValidationError({"department": "Department is required for intra-department strategy."})
        if strategy == 'cross_department' and (not data.get('source_department') or not data.get('target_department')):
            raise serializers.ValidationError({"cross_department": "Both source_department and target_department are required."})
        return data