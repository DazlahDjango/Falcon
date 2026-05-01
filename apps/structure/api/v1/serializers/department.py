from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from uuid import UUID
from ....models.department import Department
from .base import BaseStructureSerializer, BaseStructureDetailSerializer

class DepartmentSerializer(BaseStructureSerializer):
    class Meta:
        model = Department
        fields = [
            'id', 'tenant_id', 'code', 'name', 'description',
            'parent_id', 'depth', 'path', 'is_active',
            'headcount_limit', 'sensitivity_level', 'created_at'
        ]
        read_only_fields = ['id', 'tenant_id', 'depth', 'path', 'created_at', 'updated_at']

class DepartmentTreeSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()
    code = serializers.CharField()
    description = serializers.CharField(required=False)
    depth = serializers.IntegerField()
    path = serializers.CharField()
    parent_id = serializers.UUIDField(allow_null=True)
    headcount_limit = serializers.IntegerField(allow_null=True)
    sensitivity_level = serializers.CharField()
    is_active = serializers.BooleanField()
    children = serializers.ListField(child=serializers.DictField(), required=False, default=list)
    stats = serializers.DictField(required=False, default=dict)


class DepartmentDetailSerializer(BaseStructureDetailSerializer):
    parent_code = serializers.CharField(source='parent.code', read_only=True, allow_null=True)
    parent_name = serializers.CharField(source='parent.name', read_only=True, allow_null=True)
    child_count = serializers.SerializerMethodField()
    team_count = serializers.SerializerMethodField()
    employee_count = serializers.SerializerMethodField()
    full_path = serializers.SerializerMethodField()
    
    class Meta:
        model = Department
        fields = [
            'id', 'tenant_id', 'code', 'name', 'description',
            'parent_id', 'parent_code', 'parent_name', 'depth', 'path',
            'cost_center_id', 'budget_code', 'headcount_limit',
            'sensitivity_level', 'is_active', 'is_deleted',
            'child_count', 'team_count', 'employee_count', 'full_path',
            'created_at', 'updated_at', 'created_by', 'updated_by',
            'deleted_at', 'deleted_by'
        ]
        read_only_fields = ['id', 'tenant_id', 'depth', 'path', 'created_at', 'updated_at', 'deleted_at']
    
    def get_child_count(self, obj):
        return obj.children.filter(is_deleted=False).count()
    
    def get_team_count(self, obj):
        from ....models.team import Team
        return Team.objects.filter(department_id=obj.id, is_deleted=False).count()
    
    def get_employee_count(self, obj):
        from ....models.employment import Employment
        return Employment.objects.filter(department_id=obj.id, is_current=True, is_deleted=False, is_active=True).count()
    
    def get_full_path(self, obj):
        from ....services.hierarchy.path_resolver import PathResolver
        return PathResolver.resolve_department_path(obj.id, obj.tenant_id)

class DepartmentCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = [
            'code', 'name', 'description', 'parent_id',
            'cost_center_id', 'budget_code', 'headcount_limit',
            'sensitivity_level', 'is_active'
        ]
    
    def validate_code(self, value):
        from ....validators import validate_department_code
        validate_department_code(value)
        request = self.context.get('request')
        tenant_id = getattr(request.user, 'tenant_id', None) if request else None
        if tenant_id and Department.objects.filter(code=value, tenant_id=tenant_id, is_deleted=False).exists():
            if self.instance and self.instance.code == value:
                return value
            raise serializers.ValidationError(_("Department with this code already exists."))
        return value
    
    def validate_parent_id(self, value):
        if value:
            from ....services.hierarchy.cycle_detector import CycleDetector
            from ....exceptions import HierarchyCycleError, SelfParentError
            request = self.context.get('request')
            tenant_id = getattr(request.user, 'tenant_id', None) if request else None
            if self.instance and self.instance.id == value:
                raise serializers.ValidationError(_("Department cannot be its own parent."))
            try:
                if self.instance:
                    CycleDetector.validate_assignment(value, self.instance.id, tenant_id, 'department')
            except (HierarchyCycleError, SelfParentError) as e:
                raise serializers.ValidationError(str(e))
        return value
    
    def validate_headcount_limit(self, value):
        from ....validators import validate_headcount_limit
        if value is not None:
            validate_headcount_limit(value)
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