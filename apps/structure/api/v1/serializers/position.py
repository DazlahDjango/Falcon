from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from ....models.position import Position
from .base import BaseStructureSerializer, BaseStructureDetailSerializer

class PositionSerializer(BaseStructureSerializer):
    reports_to_code = serializers.CharField(source='reports_to.job_code', read_only=True, allow_null=True)
    default_department_code = serializers.CharField(source='default_department.code', read_only=True, allow_null=True)
    class Meta:
        model = Position
        fields = [
            'id', 'tenant_id', 'job_code', 'title', 'grade', 'level',
            'reports_to_id', 'reports_to_code', 'default_department_id',
            'default_department_code', 'default_reporting_type',
            'is_single_incumbent', 'current_incumbents_count',
            'max_incumbents', 'created_at'
        ]
        read_only_fields = ['id', 'tenant_id', 'current_incumbents_count', 'created_at', 'updated_at']

class PositionDetailSerializer(BaseStructureDetailSerializer):
    reports_to_code = serializers.CharField(source='reports_to.job_code', read_only=True, allow_null=True)
    reports_to_title = serializers.CharField(source='reports_to.title', read_only=True, allow_null=True)
    default_department_code = serializers.CharField(source='default_department.code', read_only=True, allow_null=True)
    default_department_name = serializers.CharField(source='default_department.name', read_only=True, allow_null=True)
    is_vacant = serializers.BooleanField(read_only=True)
    is_over_occupied = serializers.BooleanField(read_only=True)
    direct_report_count = serializers.SerializerMethodField()
    class Meta:
        model = Position
        fields = [
            'id', 'tenant_id', 'job_code', 'title', 'grade', 'level',
            'reports_to_id', 'reports_to_code', 'reports_to_title',
            'default_department_id', 'default_department_code', 'default_department_name',
            'default_reporting_type', 'min_tenure_months',
            'required_competencies', 'is_single_incumbent',
            'current_incumbents_count', 'max_incumbents',
            'requires_supervisor_approval', 'is_deleted',
            'is_vacant', 'is_over_occupied', 'direct_report_count',
            'created_at', 'updated_at', 'created_by', 'updated_by',
            'deleted_at', 'deleted_by'
        ]
        read_only_fields = ['id', 'tenant_id', 'current_incumbents_count', 'created_at', 'updated_at', 'deleted_at']
    def get_direct_report_count(self, obj):
        return obj.direct_reports.filter(is_deleted=False).count()

class PositionCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = [
            'job_code', 'title', 'grade', 'level', 'reports_to_id',
            'default_department_id', 'default_reporting_type',
            'min_tenure_months', 'required_competencies',
            'is_single_incumbent', 'max_incumbents',
            'requires_supervisor_approval'
        ]
    
    def validate_job_code(self, value):
        from ....validators import validate_position_job_code
        validate_position_job_code(value)
        request = self.context.get('request')
        tenant_id = getattr(request.user, 'tenant_id', None) if request else None
        if tenant_id and Position.objects.filter(job_code=value, tenant_id=tenant_id, is_deleted=False).exists():
            if self.instance and self.instance.job_code == value:
                return value
            raise serializers.ValidationError(_("Position with this job code already exists."))
        return value
    
    def validate_level(self, value):
        from ....validators import validate_position_level
        validate_position_level(value)
        return value
    
    def validate_grade(self, value):
        from ....validators import validate_grade
        if value:
            validate_grade(value)
        return value
    
    def validate_max_incumbents(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError(_("Maximum incumbents must be positive."))
        return value
    
    def validate_required_competencies(self, value):
        from ....validators import validate_required_competencies
        if value:
            validate_required_competencies(value)
        return value
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request:
            validated_data['tenant_id'] = request.user.tenant_id
            validated_data['created_by'] = request.user.id
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        request = self.context.get('request')
        if request:
            validated_data['updated_by'] = request.user.id
        return super().update(instance, validated_data)