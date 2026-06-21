# apps/reviews/api/v1/serializers/pip_serializers.py
"""
Serializers for PIP, PIPAction, and PIPReview models
"""

from rest_framework import serializers
from django.utils import timezone

from apps.reviews.models import PIP, PIPAction, PIPReview
from .base_serializers import BaseTenantSerializer, BaseStatusSerializer


class PIPActionSerializer(BaseTenantSerializer):
    """
    Serializer for PIPAction model.
    """

    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    is_overdue = serializers.SerializerMethodField()
    evidence_url = serializers.SerializerMethodField()

    def get_is_overdue(self, obj):
        """Check if action is overdue."""
        if obj.status in ['completed', 'waived']:
            return False
        return obj.due_date < timezone.now().date()

    def get_evidence_url(self, obj):
        """Get evidence file URL."""
        if obj.evidence:
            return obj.evidence.url
        return None

    class Meta:
        model = PIPAction
        fields = [
            'id', 'pip', 'title', 'description', 'priority', 'priority_display',
            'due_date', 'completed_at', 'status', 'status_display',
            'progress_notes', 'requires_evidence', 'evidence', 'evidence_url',
            'evidence_verified_by', 'evidence_verified_at',
            'manager_notes', 'employee_notes', 'is_overdue',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'completed_at',
                           'evidence_verified_at']


class PIPActionCompleteSerializer(serializers.Serializer):
    """
    Serializer for completing a PIP action.
    """

    evidence = serializers.FileField(required=False)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        action_id = self.context.get('action_id')
        if action_id:
            from apps.reviews.models import PIPAction
            try:
                action = PIPAction.objects.get(id=action_id)
                if action.requires_evidence and not data.get('evidence'):
                    raise serializers.ValidationError("Evidence is required for this action")
            except PIPAction.DoesNotExist:
                pass
        return data


class PIPReviewSerializer(BaseTenantSerializer):
    """
    Serializer for PIPReview model.
    """

    rating_display = serializers.CharField(source='get_rating_display', read_only=True)
    reviewer_name = serializers.CharField(source='reviewer.get_full_name', read_only=True)
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)

    class Meta:
        model = PIPReview
        fields = [
            'id', 'pip', 'reviewer', 'reviewer_name',
            'employee', 'employee_name', 'review_date',
            'rating', 'rating_display', 'summary',
            'accomplishments', 'challenges', 'action_items',
            'employee_attended', 'employee_signature',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PIPSerializer(BaseTenantSerializer, BaseStatusSerializer):
    """
    Main serializer for PIP model.
    """

    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)
    employee_email = serializers.EmailField(source='employee.email', read_only=True)
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    review_cycle_name = serializers.CharField(source='review_cycle.name', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    outcome_display = serializers.CharField(source='get_outcome_display', read_only=True)
    days_remaining = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()

    def get_days_remaining(self, obj):
        """Calculate days remaining until PIP end date."""
        if obj.status == 'completed':
            return 0
        effective_end = obj.extended_to_date or obj.end_date
        today = timezone.now().date()
        if today > effective_end:
            return 0
        return (effective_end - today).days

    def get_completion_percentage(self, obj):
        """Calculate completion percentage based on actions."""
        total_actions = obj.actions.count()
        if total_actions == 0:
            return 0
        completed_actions = obj.actions.filter(status='completed').count()
        return round((completed_actions / total_actions) * 100, 1)

    def get_is_overdue(self, obj):
        """Check if PIP is overdue."""
        if obj.status == 'completed':
            return False
        effective_end = obj.extended_to_date or obj.end_date
        return timezone.now().date() > effective_end

    class Meta:
        model = PIP
        fields = [
            'id', 'title', 'description', 'tenant_id', 'tenant_name',
            'employee', 'employee_name', 'employee_email',
            'owner', 'owner_name', 'review_cycle', 'review_cycle_name',
            'severity', 'severity_display', 'status', 'status_display',
            'start_date', 'end_date', 'extended_to_date', 'extension_reason',
            'improvement_areas', 'success_criteria', 'success_metrics',
            'consequences_if_failed', 'consequences_if_successful',
            'employee_acknowledged_at', 'employee_comments',
            'manager_signed_at', 'hr_signed_at',
            'outcome', 'outcome_display', 'outcome_notes', 'completed_at',
            'days_remaining', 'completion_percentage', 'is_overdue',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'completed_at',
                           'employee_acknowledged_at', 'manager_signed_at', 'hr_signed_at']


class PIPListSerializer(PIPSerializer):
    """
    Simplified serializer for list views.
    """

    class Meta(PIPSerializer.Meta):
        fields = [
            'id', 'title', 'employee_name', 'employee_email',
            'severity', 'severity_display', 'status', 'status_display',
            'start_date', 'end_date', 'days_remaining',
            'completion_percentage', 'is_overdue', 'outcome_display'
        ]


class PIPDetailSerializer(PIPSerializer):
    """
    Detailed serializer with actions and reviews.
    """

    actions = PIPActionSerializer(many=True, read_only=True)
    reviews = PIPReviewSerializer(many=True, read_only=True)

    class Meta(PIPSerializer.Meta):
        fields = PIPSerializer.Meta.fields + ['actions', 'reviews']


class PIPCreateSerializer(PIPSerializer):
    """
    Serializer for creating a new PIP.
    """

    actions = PIPActionSerializer(many=True, required=False)

    class Meta(PIPSerializer.Meta):
        read_only_fields = ['id', 'created_at', 'updated_at', 'status']


class PIPApproveSerializer(serializers.Serializer):
    """
    Serializer for approving a PIP.
    """

    approve = serializers.BooleanField(required=True)
    comments = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        if not data.get('approve'):
            raise serializers.ValidationError("Must approve to proceed")
        return data


class PIPExtendSerializer(serializers.Serializer):
    """
    Serializer for extending a PIP deadline.
    """

    new_end_date = serializers.DateField(required=True)
    reason = serializers.CharField(required=True)

    def validate_new_end_date(self, value):
        if value <= timezone.now().date():
            raise serializers.ValidationError("New end date must be in the future")
        return value