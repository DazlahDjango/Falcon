from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from uuid import UUID
from apps.structure.models.department import Department
from apps.structure.enums.org_level import OrgLevel
from .base import BaseStructureSerializer, BaseStructureDetailSerializer

from .base import get_node_leader_info

class DepartmentSerializer(BaseStructureSerializer):
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    parent_name = serializers.CharField(source='division.name', read_only=True, allow_null=True)
    parent_code = serializers.CharField(source='division.code', read_only=True, allow_null=True)
    leader = serializers.SerializerMethodField()
    
    class Meta:
        model = Department
        fields = [
            'id', 'tenant_id', 'code', 'name', 'description',
            'level_display', 'parent_id', 'parent_name',
            'parent_code', 'division_id', 'manager_id', 'leader', 'depth', 'path', 'is_active',
            'headcount_limit', 'sensitivity_level', 'created_at'
        ]
        read_only_fields = ['id', 'tenant_id', 'depth', 'path', 'created_at', 'updated_at']

    def get_leader(self, obj):
        return get_node_leader_info(obj)

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

from .base import BaseStructureSerializer, BaseStructureDetailSerializer, get_node_leader_info

class DepartmentDetailSerializer(BaseStructureDetailSerializer):
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    parent_code = serializers.CharField(source='division.code', read_only=True, allow_null=True)
    parent_name = serializers.CharField(source='division.name', read_only=True, allow_null=True)
    child_count = serializers.SerializerMethodField()
    section_count = serializers.SerializerMethodField()
    sections = serializers.SerializerMethodField()
    leader = serializers.SerializerMethodField()
    employee_count = serializers.SerializerMethodField()
    full_path = serializers.SerializerMethodField()
    cost_center_id = serializers.SerializerMethodField()
    
    class Meta:
        model = Department
        fields = [
            'id', 'tenant_id', 'code', 'name', 'description',
            'level_display', 'parent_id', 'division_id', 'parent_code',
            'parent_name', 'depth', 'path', 'cost_center_id', 'manager_id',
            'budget_code', 'headcount_limit', 'sensitivity_level',
            'is_active', 'is_deleted', 'child_count', 'section_count',
            'sections', 'leader', 'employee_count', 'full_path',
            'created_at', 'updated_at', 'created_by', 'updated_by',
            'deleted_at', 'deleted_by'
        ]
        read_only_fields = ['id', 'tenant_id', 'depth', 'path', 'created_at', 'updated_at', 'deleted_at']
    
    def get_child_count(self, obj):
        return obj.sections.filter(is_deleted=False, is_active=True).count() if hasattr(obj, 'sections') else obj.children.filter(is_deleted=False, is_active=True).count()
    
    def get_section_count(self, obj):
        return obj.sections.filter(is_deleted=False, is_active=True).count() if hasattr(obj, 'sections') else obj.children.filter(is_deleted=False, is_active=True).count()
    
    def get_leader(self, obj):
        return get_node_leader_info(obj)

    def get_sections(self, obj):
        from apps.structure.models.employment import Employment
        secs = obj.sections.filter(is_deleted=False).order_by('name') if hasattr(obj, 'sections') else obj.children.filter(is_deleted=False).order_by('name')
        result = []
        for s in secs:
            units_count = s.units.filter(is_deleted=False, is_active=True).count() if hasattr(s, 'units') else s.children.filter(is_deleted=False, is_active=True).count()
            emp_count = Employment.objects.filter(position__section_id=s.id, is_current=True, is_deleted=False, is_active=True).count()
            leader_info = get_node_leader_info(s)
            result.append({
                'id': str(s.id),
                'code': s.code,
                'name': s.name,
                'description': s.description,
                'is_active': s.is_active,
                'unit_count': units_count,
                'employee_count': emp_count,
                'leader': leader_info,
            })
        return result
    
    def get_employee_count(self, obj):
        from apps.structure.models.employment import Employment
        return Employment.objects.filter(position__department_id=obj.id, is_current=True, is_deleted=False, is_active=True).count()
    
    def get_full_path(self, obj):
        return obj.get_full_path()

    def get_cost_center_id(self, obj):
        from apps.structure.models.cost_center_allocation import CostCenterAllocation
        from django.contrib.contenttypes.models import ContentType
        try:
            content_type = ContentType.objects.get_for_model(obj)
            allocation = CostCenterAllocation.objects.filter(
                tenant_id=obj.tenant_id,
                content_type=content_type,
                object_id=obj.id,
                is_deleted=False
            ).first()
            return str(allocation.cost_center_id) if allocation else None
        except Exception:
            return None

class DepartmentCreateUpdateSerializer(serializers.ModelSerializer):
    code = serializers.CharField(required=False, allow_blank=True, max_length=50)
    division_id = serializers.UUIDField(required=False, allow_null=True)
    
    class Meta:
        model = Department
        fields = [
            'code', 'name', 'description', 'division_id',
            'manager_id', 'budget_code', 'headcount_limit',
            'sensitivity_level', 'is_active'
        ]
    
    def validate_code(self, value):
        if not value:
            return value
        from apps.structure.validators import validate_department_code
        validate_department_code(value)
        request = self.context.get('request')
        tenant_id = getattr(request.user, 'tenant_id', None) if request else None
        if tenant_id and Department.objects.filter(code=value, tenant_id=tenant_id, is_deleted=False).exists():
            if self.instance and self.instance.code == value:
                return value
            raise serializers.ValidationError(_("Department with this code already exists."))
        return value

    def validate(self, attrs):
        if not attrs.get('code'):
            name = attrs.get('name') or (self.instance.name if self.instance else '')
            if name:
                import re
                clean_name = re.sub(r'[^A-Z0-9]', '-', name.upper())
                clean_name = re.sub(r'-+', '-', clean_name).strip('-')
                attrs['code'] = f"DEP-{clean_name}"[:50]
        return super().validate(attrs)
    

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
