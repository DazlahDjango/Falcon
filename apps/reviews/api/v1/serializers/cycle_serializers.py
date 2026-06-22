from rest_framework import serializers
from django.utils import timezone
from apps.reviews.models import ReviewCycle, CycleCompetency
from .base_serializers import BaseTenantSerializer, BaseStatusSerializer

class CycleCompetencySerializer(serializers.ModelSerializer):
    competency_id = serializers.UUIDField(source='competency.id', read_only=True)
    competency_name = serializers.CharField(source='competency.name', read_only=True)
    class Meta:
        model = CycleCompetency
        fields = ['id', 'competency', 'competency_id', 'competency_name', 'weight', 'display_order']


class ReviewCycleSerializer(BaseTenantSerializer, BaseStatusSerializer):
    cycle_type_display = serializers.CharField(source='get_cycle_type_display', read_only=True)
    rating_scale_name = serializers.CharField(source='rating_scale.name', read_only=True)
    is_active_period = serializers.SerializerMethodField()
    days_remaining = serializers.SerializerMethodField()
    def get_is_active_period(self, obj):
        today = timezone.now().date()
        return obj.start_date <= today <= obj.end_date
    def get_days_remaining(self, obj):
        today = timezone.now().date()
        if today > obj.end_date:
            return 0
        return (obj.end_date - today).days
    class Meta:
        model = ReviewCycle
        fields = [
            'id', 'name', 'description', 'tenant_id', 'cycle_type', 'cycle_type_display',
            'status', 'status_display', 'start_date', 'end_date', 'self_assessment_deadline',
            'supervisor_review_deadline', 'calibration_date', 'final_approval_deadline',
            'kpi_weight', 'competency_weight', 'mission_weight', 'task_weight',
            'rating_scale', 'rating_scale_name', 'include_all_departments',
            'included_departments', 'included_positions', 'require_self_assessment',
            'allow_self_assessment_edit', 'require_360_feedback', 'enable_calibration',
            'kpi_start_date', 'kpi_end_date', 'is_active_period', 'days_remaining',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class ReviewCycleListSerializer(ReviewCycleSerializer):
    class Meta(ReviewCycleSerializer.Meta):
        fields = ['id', 'name', 'cycle_type', 'cycle_type_display', 'status', 'status_display', 'start_date', 'end_date', 'is_active_period', 'days_remaining']

class ReviewCycleDetailSerializer(ReviewCycleSerializer):
    competencies = CycleCompetencySerializer(source='cycle_competencies', many=True, read_only=True)
    class Meta(ReviewCycleSerializer.Meta):
        fields = ReviewCycleSerializer.Meta.fields + ['competencies']

class ReviewCycleCreateUpdateSerializer(ReviewCycleSerializer):
    competencies = CycleCompetencySerializer(many=True, required=False)
    def validate(self, data):
        if data.get('start_date') and data.get('end_date') and data['start_date'] >= data['end_date']:
            raise serializers.ValidationError({"end_date": "End date must be after start date"})
        if data.get('self_assessment_deadline') and data.get('start_date') and data['self_assessment_deadline'] <= data['start_date']:
            raise serializers.ValidationError({"self_assessment_deadline": "Must be after start date"})
        if data.get('supervisor_review_deadline') and data.get('self_assessment_deadline') and data['supervisor_review_deadline'] <= data['self_assessment_deadline']:
            raise serializers.ValidationError({"supervisor_review_deadline": "Must be after self-assessment deadline"})
        total_weight = float(data.get('kpi_weight', 0)) + float(data.get('competency_weight', 0)) + float(data.get('mission_weight', 0)) + float(data.get('task_weight', 0))
        if total_weight < 95 or total_weight > 105:
            raise serializers.ValidationError(f"Total weights must be 100% (currently {total_weight}%)")
        return data
    def create(self, validated_data):
        competencies_data = validated_data.pop('competencies', [])
        cycle = ReviewCycle.objects.create(**validated_data)
        for competency_data in competencies_data:
            CycleCompetency.objects.create(review_cycle=cycle, **competency_data)
        return cycle
    def update(self, instance, validated_data):
        competencies_data = validated_data.pop('competencies', [])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if competencies_data:
            instance.competencies.clear()
            for competency_data in competencies_data:
                CycleCompetency.objects.create(review_cycle=instance, **competency_data)
        return instance
    class Meta(ReviewCycleSerializer.Meta):
        fields = ReviewCycleSerializer.Meta.fields + ['competencies']
        read_only_fields = ['id', 'created_at', 'updated_at', 'status', 'tenant_id']

class CycleProgressSerializer(serializers.Serializer):
    total_employees = serializers.IntegerField()
    self_assessment_submitted = serializers.IntegerField()
    self_assessment_pending = serializers.IntegerField()
    self_assessment_percentage = serializers.FloatField()
    supervisor_review_completed = serializers.IntegerField()
    supervisor_review_pending = serializers.IntegerField()
    supervisor_review_percentage = serializers.FloatField()
    final_rating_locked = serializers.IntegerField()
    final_rating_pending = serializers.IntegerField()
    final_rating_percentage = serializers.FloatField()
    overall_completion_percentage = serializers.FloatField()

class CycleActivateSerializer(serializers.Serializer):
    confirm = serializers.BooleanField(required=True)
    def validate_confirm(self, value):
        if not value:
            raise serializers.ValidationError("Must confirm to activate cycle")
        return value

class CycleDateRangeSerializer(serializers.Serializer):
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False)
    cycle_type = serializers.ChoiceField(choices=ReviewCycle.CycleType.choices, required=False)
    status = serializers.ChoiceField(choices=ReviewCycle.Status.choices, required=False)
    def validate(self, data):
        if data.get('date_from') and data.get('date_to') and data['date_from'] > data['date_to']:
            raise serializers.ValidationError("date_from must be before date_to")
        return data