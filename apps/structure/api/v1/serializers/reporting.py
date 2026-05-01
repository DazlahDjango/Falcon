from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from ....models.reporting_line import ReportingLine
from .base import BaseStructureSerializer, BaseStructureDetailSerializer


class ReportingLineSerializer(BaseStructureSerializer):
    employee_user_id = serializers.UUIDField(source='employee.user_id', read_only=True)
    employee_position = serializers.CharField(source='employee.position.job_code', read_only=True, allow_null=True)
    manager_user_id = serializers.UUIDField(source='manager.user_id', read_only=True)
    manager_position = serializers.CharField(source='manager.position.job_code', read_only=True, allow_null=True)
    
    class Meta:
        model = ReportingLine
        fields = [
            'id', 'tenant_id', 'employee_id', 'employee_user_id', 'employee_position',
            'manager_id', 'manager_user_id', 'manager_position', 'relation_type',
            'reporting_weight', 'effective_from', 'effective_to', 'is_active',
            'can_approve_kpi', 'can_conduct_review', 'created_at'
        ]
        read_only_fields = ['id', 'tenant_id', 'created_at', 'updated_at']


class ReportingLineDetailSerializer(BaseStructureDetailSerializer):
    employee_user_id = serializers.UUIDField(source='employee.user_id', read_only=True)
    employee_name = serializers.SerializerMethodField()
    employee_position = serializers.CharField(source='employee.position.title', read_only=True, allow_null=True)
    manager_user_id = serializers.UUIDField(source='manager.user_id', read_only=True)
    manager_name = serializers.SerializerMethodField()
    manager_position = serializers.CharField(source='manager.position.title', read_only=True, allow_null=True)
    
    class Meta:
        model = ReportingLine
        fields = [
            'id', 'tenant_id', 'employee_id', 'employee_user_id', 'employee_name',
            'employee_position', 'manager_id', 'manager_user_id', 'manager_name',
            'manager_position', 'relation_type', 'reporting_weight',
            'effective_from', 'effective_to', 'is_active', 'is_deleted',
            'can_approve_kpi', 'can_conduct_review', 'can_approve_leave',
            'can_approve_expenses', 'change_reason', 'approved_by_id',
            'created_at', 'updated_at', 'created_by', 'updated_by',
            'deleted_at', 'deleted_by'
        ]
        read_only_fields = ['id', 'tenant_id', 'created_at', 'updated_at', 'deleted_at']
    
    def get_employee_name(self, obj):
        if obj.employee:
            return f"{obj.employee.user_id}"
        return None
    
    def get_manager_name(self, obj):
        if obj.manager:
            return f"{obj.manager.user_id}"
        return None

class ReportingLineCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportingLine
        fields = [
            'employee_id', 'manager_id', 'relation_type', 'reporting_weight',
            'effective_from', 'effective_to', 'can_approve_kpi',
            'can_conduct_review', 'can_approve_leave', 'can_approve_expenses',
            'change_reason', 'approved_by_id'
        ]
    
    def validate_employee_id(self, value):
        from ....models.employment import Employment
        request = self.context.get('request')
        tenant_id = getattr(request.user, 'tenant_id', None) if request else None
        employment = Employment.objects.filter(id=value, tenant_id=tenant_id, is_current=True, is_deleted=False, is_active=True).first()
        if not employment:
            raise serializers.ValidationError(_("Employee employment not found or not active."))
        return value
    
    def validate_manager_id(self, value):
        from ....models.employment import Employment
        request = self.context.get('request')
        tenant_id = getattr(request.user, 'tenant_id', None) if request else None
        employment = Employment.objects.filter(id=value, tenant_id=tenant_id, is_current=True, is_deleted=False, is_active=True).first()
        if not employment:
            raise serializers.ValidationError(_("Manager employment not found or not active."))
        return value
    
    def validate_reporting_weight(self, value):
        from ....validators import validate_reporting_weight
        if value is not None:
            validate_reporting_weight(value)
        return value
    
    def validate_relation_type(self, value):
        if value not in dict(ReportingLine.RELATION_TYPE_CHOICES):
            raise serializers.ValidationError(_("Invalid relation type."))
        return value
    
    def validate(self, data):
        from ....services.validation.org_validator import OrgValidatorService
        employee_id = data.get('employee_id')
        manager_id = data.get('manager_id')
        relation_type = data.get('relation_type', 'solid')
        if employee_id and manager_id:
            employee_emp = employee_id
            manager_emp = manager_id
            if employee_emp == manager_emp:
                raise serializers.ValidationError(_("Employee cannot report to themselves."))
            request = self.context.get('request')
            tenant_id = getattr(request.user, 'tenant_id', None) if request else None
            employee = employee_emp
            manager = manager_emp
            if hasattr(employee, 'user_id') and hasattr(manager, 'user_id'):
                errors = OrgValidatorService.validate_reporting_relationship(
                    employee.user_id, manager.user_id, tenant_id, relation_type
                )
                if errors:
                    raise serializers.ValidationError({'non_field_errors': errors})
        effective_from = data.get('effective_from')
        effective_to = data.get('effective_to')
        if effective_from and effective_to and effective_from > effective_to:
            raise serializers.ValidationError(_("Effective from cannot be after effective to."))
        return data
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request:
            validated_data['tenant_id'] = request.user.tenant_id
            validated_data['created_by'] = request.user.id
            validated_data['is_active'] = True
        if not validated_data.get('effective_from'):
            validated_data['effective_from'] = timezone.now().date()
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        request = self.context.get('request')
        if request:
            validated_data['updated_by'] = request.user.id
        return super().update(instance, validated_data)