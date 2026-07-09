from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from uuid import UUID
from apps.structure.models.department import Department
from apps.structure.enums.org_level import OrgLevel
from .base import BaseStructureSerializer, BaseStructureDetailSerializer

class DepartmentSerializer(BaseStructureSerializer):
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    parent_name = serializers.CharField(source='division.name', read_only=True, allow_null=True)
    parent_code = serializers.CharField(source='division.code', read_only=True, allow_null=True)
    
    class Meta:
        model = Department
        fields = [
            'id', 'tenant_id', 'code', 'name', 'description',
            'level_display', 'parent_id', 'parent_name',
            'parent_code', 'division_id', 'depth', 'path', 'is_active',
            'headcount_limit', 'sensitivity_level', 'created_at'
        ]
        read_only_fields = ['id', 'tenant_id', 'depth', 'path', 'created_at', 'updated_at']

class DepartmentTreeSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()
    code = serializers.CharField()
    description = serializers.CharField(required=False)
    level = serializers.CharField()
    depth = serializers.IntegerField()
    path = serializers.CharField()
    parent_id = serializers.UUIDField(allow_null=True)
    headcount_limit = serializers.IntegerField(allow_null=True)
    sensitivity_level = serializers.CharField()
    is_active = serializers.BooleanField()
    children = serializers.ListField(child=serializers.DictField(), required=False, default=list)
    stats = serializers.DictField(required=False, default=dict)

class DepartmentDetailSerializer(BaseStructureDetailSerializer):
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    parent_code = serializers.CharField(source='division.code', read_only=True, allow_null=True)
    parent_name = serializers.CharField(source='division.name', read_only=True, allow_null=True)
    child_count = serializers.SerializerMethodField()
    section_count = serializers.SerializerMethodField()
    employee_count = serializers.SerializerMethodField()
    full_path = serializers.SerializerMethodField()
    
    class Meta:
        model = Department
        fields = [
            'id', 'tenant_id', 'code', 'name', 'description',
            'level_display', 'parent_id', 'division_id', 'parent_code',
            'parent_name', 'depth', 'path', 'cost_center_id', 'manager_id',
            'budget_code', 'headcount_limit', 'sensitivity_level',
            'is_active', 'is_deleted', 'child_count', 'section_count',
            'employee_count', 'full_path',
            'created_at', 'updated_at', 'created_by', 'updated_by',
            'deleted_at', 'deleted_by'
        ]
        read_only_fields = ['id', 'tenant_id', 'depth', 'path', 'created_at', 'updated_at', 'deleted_at']
    
    def get_child_count(self, obj):
        return obj.children.filter(is_deleted=False, is_active=True).count()
    
    def get_section_count(self, obj):
        return obj.children.filter(is_deleted=False, is_active=True).count()
    
    def get_employee_count(self, obj):
        from apps.structure.models.employment import Employment
        return Employment.objects.filter(department_id=obj.id, is_current=True, is_deleted=False, is_active=True).count()
    
    def get_full_path(self, obj):
        return obj.get_full_path()

class DepartmentCreateUpdateSerializer(serializers.ModelSerializer):
    division_id = serializers.UUIDField(required=False, allow_null=True)
    
    class Meta:
        model = Department
        fields = [
            'code', 'name', 'description', 'division_id',
            'cost_center_id', 'manager_id', 'budget_code', 'headcount_limit',
            'sensitivity_level', 'is_active'
        ]
    
    def validate_code(self, value):
        from apps.structure.validators import validate_department_code
        validate_department_code(value)
        request = self.context.get('request')
        tenant_id = getattr(request.user, 'tenant_id', None) if request else None
        if tenant_id and Department.objects.filter(code=value, tenant_id=tenant_id, is_deleted=False).exists():
            if self.instance and self.instance.code == value:
                return value
            raise serializers.ValidationError(_("Department with this code already exists."))
        return value
    

    def validate_headcount_limit(self, value):
        from apps.structure.validators import validate_headcount_limit_positive
        if value is not None:
            validate_headcount_limit_positive(value)
        return value
    
    def validate_sensitivity_level(self, value):
        if value not in dict(Department.SENSITIVITY_CHOICES):
            raise serializers.ValidationError(_("Invalid sensitivity level."))
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
