# apps/reviews/api/v1/serializers/cycle_serializers.py
"""
Serializers for ReviewCycle model
"""

from rest_framework import serializers
from django.utils import timezone

from apps.reviews.models import ReviewCycle, CycleCompetency
from .base_serializers import BaseTenantSerializer, BaseStatusSerializer
from .competency_serializers import CompetencySerializer


class CycleCompetencySerializer(serializers.ModelSerializer):
    """
    Serializer for CycleCompetency (junction table).
    """
    
    competency_id = serializers.UUIDField(source='competency.id', read_only=True)
    competency_name = serializers.CharField(source='competency.name', read_only=True)
    
    class Meta:
        model = CycleCompetency
        fields = [
            'id', 'competency', 'competency_id', 'competency_name',
            'weight', 'display_order'
        ]


class ReviewCycleSerializer(BaseTenantSerializer, BaseStatusSerializer):
    """
    Main serializer for ReviewCycle model.
    """
    
    cycle_type_display = serializers.CharField(source='get_cycle_type_display', read_only=True)
    rating_scale_name = serializers.CharField(source='rating_scale.name', read_only=True)
    is_active_period = serializers.SerializerMethodField()
    days_remaining = serializers.SerializerMethodField()
    
    def get_is_active_period(self, obj):
        """Check if cycle is currently active based on dates."""
        today = timezone.now().date()
        return obj.start_date <= today <= obj.end_date
    
    def get_days_remaining(self, obj):
        """Calculate days remaining until cycle ends."""
        today = timezone.now().date()
        if today > obj.end_date:
            return 0
        return (obj.end_date - today).days
    
    class Meta:
        model = ReviewCycle
        fields = [
            'id', 'name', 'description', 'tenant', 'tenant_name',
            'cycle_type', 'cycle_type_display', 'status', 'status_display',
            'start_date', 'end_date', 'self_assessment_deadline',
            'supervisor_review_deadline', 'calibration_date',
            'final_approval_deadline',
            'kpi_weight', 'competency_weight', 'mission_weight', 'task_weight',
            'rating_scale', 'rating_scale_name',
            'include_all_departments', 'included_departments', 'included_positions',
            'require_self_assessment', 'allow_self_assessment_edit',
            'require_360_feedback', 'enable_calibration',
            'kpi_start_date', 'kpi_end_date',
            'is_active_period', 'days_remaining',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'status']


class ReviewCycleListSerializer(ReviewCycleSerializer):
    """
    Simplified serializer for list views.
    """
    
    class Meta(ReviewCycleSerializer.Meta):
        fields = [
            'id', 'name', 'cycle_type', 'cycle_type_display',
            'status', 'status_display', 'start_date', 'end_date',
            'is_active_period', 'days_remaining'
        ]


class ReviewCycleDetailSerializer(ReviewCycleSerializer):
    """
    Detailed serializer for single object views.
    """
    
    competencies = CycleCompetencySerializer(
        source='cycle_competencies',
        many=True,
        read_only=True
    )
    total_participants = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()
    
    def get_total_participants(self, obj):
        """Get total number of participants in this cycle."""
        return obj.get_participating_employees().count()
    
    def get_completion_percentage(self, obj):
        """Get overall completion percentage for this cycle."""
        from apps.reviews.services.cycle.cycle_service import CycleService
        progress = CycleService.get_cycle_progress(obj.id)
        return progress.get('overall_completion_percentage', 0)
    
    class Meta(ReviewCycleSerializer.Meta):
        fields = ReviewCycleSerializer.Meta.fields + [
            'competencies', 'total_participants', 'completion_percentage'
        ]


class ReviewCycleCreateUpdateSerializer(ReviewCycleSerializer):
    """
    Serializer for create/update operations.
    """
    
    competencies = CycleCompetencySerializer(many=True, required=False)
    
    class Meta(ReviewCycleSerializer.Meta):
        read_only_fields = ['id', 'created_at', 'updated_at', 'status', 'tenant']


class CycleProgressSerializer(serializers.Serializer):
    """
    Serializer for cycle progress data.
    """
    
    total_employees = serializers.IntegerField()
    self_assessment = serializers.DictField()
    supervisor_review = serializers.DictField()
    final_rating = serializers.DictField()
    overall_completion_percentage = serializers.FloatField()


class CycleActivateSerializer(serializers.Serializer):
    """
    Serializer for cycle activation.
    """
    
    confirm = serializers.BooleanField(required=True)
    
    def validate_confirm(self, value):
        if not value:
            raise serializers.ValidationError("Must confirm to activate cycle")
        return value


class CycleDateRangeSerializer(serializers.Serializer):
    """
    Serializer for cycle date range filtering.
    """
    
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False)
    cycle_type = serializers.ChoiceField(
        choices=ReviewCycle.CycleType.choices,
        required=False
    )
    status = serializers.ChoiceField(
        choices=ReviewCycle.Status.choices,
        required=False
    )
    
    def validate(self, data):
        if data.get('date_from') and data.get('date_to'):
            if data['date_from'] > data['date_to']:
                raise serializers.ValidationError("date_from must be before date_to")
        return data