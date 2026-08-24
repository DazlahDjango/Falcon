from rest_framework import serializers
from django.utils import timezone
from apps.reviews.models import ReviewCycle, CycleCompetency
from .base_serializers import BaseTenantSerializer, BaseStatusSerializer

class CycleCompetencySerializer(serializers.ModelSerializer):
    competency_id = serializers.IntegerField(required=False)
    competency_name = serializers.CharField(source='competency.name', read_only=True)
    class Meta:
        model = CycleCompetency
        fields = ['id', 'competency', 'competency_id', 'competency_name', 'weight', 'display_order']
        extra_kwargs = {
            'competency': {'required': False}
        }


class ReviewCycleSerializer(BaseTenantSerializer, BaseStatusSerializer):
    cycle_type_display = serializers.CharField(source='get_cycle_type_display', read_only=True)
    rating_scale_name = serializers.CharField(source='rating_scale.name', read_only=True)
    is_active_period = serializers.SerializerMethodField()
    days_remaining = serializers.SerializerMethodField()
    participants_count = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()

    def get_is_active_period(self, obj):
        today = timezone.now().date()
        return obj.start_date <= today <= obj.end_date

    def get_days_remaining(self, obj):
        today = timezone.now().date()
        if today > obj.end_date:
            return 0
        return (obj.end_date - today).days

    def get_participants_count(self, obj):
        from apps.reviews.models import SelfAssessment
        count = SelfAssessment.objects.filter(review_cycle=obj).count()
        if count > 0:
            return count
        from apps.accounts.models import User
        return User.objects.filter(tenant_id=obj.tenant_id, is_active=True, is_deleted=False).count()

    def get_progress(self, obj):
        from apps.reviews.models import SelfAssessment
        total = SelfAssessment.objects.filter(review_cycle=obj).count()
        if total == 0:
            return 0
        completed = SelfAssessment.objects.filter(review_cycle=obj, status='submitted').count()
        return round((completed / total) * 100)

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
            'participants_count', 'progress',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class ReviewCycleListSerializer(ReviewCycleSerializer):
    class Meta(ReviewCycleSerializer.Meta):
        fields = [
            'id', 'name', 'description', 'cycle_type', 'cycle_type_display',
            'status', 'status_display', 'start_date', 'end_date',
            'is_active_period', 'days_remaining', 'participants_count', 'progress',
            'created_at', 'updated_at'
        ]

class ReviewCycleDetailSerializer(ReviewCycleSerializer):
    competencies = CycleCompetencySerializer(source='cycle_competencies', many=True, read_only=True)
    class Meta(ReviewCycleSerializer.Meta):
        fields = ReviewCycleSerializer.Meta.fields + ['competencies']

class ReviewCycleCreateUpdateSerializer(ReviewCycleSerializer):
    competencies = CycleCompetencySerializer(source='cycle_competencies', many=True, required=False)
    def validate(self, data):
        start = data.get('start_date') or (self.instance.start_date if self.instance else None)
        self_deadline = data.get('self_assessment_deadline') or (self.instance.self_assessment_deadline if self.instance else None)
        sup_deadline = data.get('supervisor_review_deadline') or (self.instance.supervisor_review_deadline if self.instance else None)
        approval_deadline = data.get('final_approval_deadline') or (self.instance.final_approval_deadline if self.instance else None)
        end = data.get('end_date') or (self.instance.end_date if self.instance else None)

        if start and self_deadline and start >= self_deadline:
            raise serializers.ValidationError({"self_assessment_deadline": "Self assessment deadline must be after start date."})
        if self_deadline and sup_deadline and self_deadline >= sup_deadline:
            raise serializers.ValidationError({"supervisor_review_deadline": "Supervisor review deadline must be after self assessment deadline."})
        if sup_deadline and approval_deadline and sup_deadline >= approval_deadline:
            raise serializers.ValidationError({"final_approval_deadline": "Final approval deadline must be after supervisor review deadline."})
        if approval_deadline and end and approval_deadline >= end:
            raise serializers.ValidationError({"end_date": "End date must be after final approval deadline."})
        elif start and end and start >= end:
            raise serializers.ValidationError({"end_date": "End date must be after start date."})

        kpi_w = float(data.get('kpi_weight', self.instance.kpi_weight if self.instance else 70))
        comp_w = float(data.get('competency_weight', self.instance.competency_weight if self.instance else 30))
        mission_w = float(data.get('mission_weight', self.instance.mission_weight if self.instance else 0))
        task_w = float(data.get('task_weight', self.instance.task_weight if self.instance else 0))
        total_weight = kpi_w + comp_w + mission_w + task_w
        if total_weight < 95 or total_weight > 105:
            raise serializers.ValidationError({"weights": f"Total weights must equal 100% (currently {total_weight}%)."})
        return data
    def create(self, validated_data):
        competencies_data = validated_data.pop('cycle_competencies', validated_data.pop('competencies', []))
        included_departments = validated_data.pop('included_departments', None)
        included_positions = validated_data.pop('included_positions', None)
        if 'tenant' in validated_data:
            tenant_obj = validated_data.pop('tenant')
            if not validated_data.get('tenant_id'):
                validated_data['tenant_id'] = tenant_obj.id if hasattr(tenant_obj, 'id') else tenant_obj
        cycle = ReviewCycle.objects.create(**validated_data)
        if included_departments is not None:
            cycle.included_departments.set(included_departments)
        if included_positions is not None:
            cycle.included_positions.set(included_positions)
        for comp_data in competencies_data:
            comp_id = comp_data.get('competency_id') or (comp_data.get('competency').id if hasattr(comp_data.get('competency'), 'id') else comp_data.get('competency'))
            weight = comp_data.get('weight', 0)
            display_order = comp_data.get('display_order', 0)
            if comp_id:
                CycleCompetency.objects.create(
                    review_cycle=cycle,
                    competency_id=comp_id,
                    weight=weight,
                    display_order=display_order
                )
        return cycle
    def update(self, instance, validated_data):
        competencies_data = validated_data.pop('cycle_competencies', validated_data.pop('competencies', None))
        included_departments = validated_data.pop('included_departments', None)
        included_positions = validated_data.pop('included_positions', None)
        if 'tenant' in validated_data:
            validated_data.pop('tenant')
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if included_departments is not None:
            instance.included_departments.set(included_departments)
        if included_positions is not None:
            instance.included_positions.set(included_positions)
        if competencies_data is not None:
            CycleCompetency.objects.filter(review_cycle=instance).delete()
            for comp_data in competencies_data:
                comp_id = comp_data.get('competency_id') or (comp_data.get('competency').id if hasattr(comp_data.get('competency'), 'id') else comp_data.get('competency'))
                weight = comp_data.get('weight', 0)
                display_order = comp_data.get('display_order', 0)
                if comp_id:
                    CycleCompetency.objects.create(
                        review_cycle=instance,
                        competency_id=comp_id,
                        weight=weight,
                        display_order=display_order
                    )
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