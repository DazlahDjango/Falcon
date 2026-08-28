from rest_framework import serializers
from apps.structure.models.unit import Unit
from .base import BaseStructureSerializer, BaseStructureDetailSerializer, get_node_leader_info

class UnitSerializer(BaseStructureSerializer):
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    parent_name = serializers.CharField(source='section.name', read_only=True, allow_null=True)
    parent_code = serializers.CharField(source='section.code', read_only=True, allow_null=True)
    headcount = serializers.SerializerMethodField()
    section_id = serializers.UUIDField(required=False, allow_null=True)
    leader = serializers.SerializerMethodField()
    
    class Meta:
        model = Unit
        fields = [
            'id', 'tenant_id', 'code', 'name', 'description',
            'level', 'level_display', 'section_id', 'parent_name',
            'parent_code', 'depth', 'path', 'cost_center_id', 'manager_id', 'leader',
            'budget_code', 'headcount_limit', 'is_active', 'is_deleted',
            'headcount', 'created_at'
        ]
        read_only_fields = ['id', 'tenant_id', 'level', 'depth', 'path', 'created_at', 'updated_at']

    def get_leader(self, obj):
        return get_node_leader_info(obj)
    
    def get_headcount(self, obj):
        from apps.structure.models.employment import Employment
        return Employment.objects.filter(position__unit_id=obj.id, is_current=True, is_deleted=False, is_active=True).count()

class UnitDetailSerializer(BaseStructureDetailSerializer):
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    parent_name = serializers.CharField(source='section.name', read_only=True, allow_null=True)
    parent_code = serializers.CharField(source='section.code', read_only=True, allow_null=True)
    department_id = serializers.SerializerMethodField()
    department_name = serializers.SerializerMethodField()
    division_id = serializers.SerializerMethodField()
    division_name = serializers.SerializerMethodField()
    leader = serializers.SerializerMethodField()
    employee_count = serializers.SerializerMethodField()
    full_path = serializers.SerializerMethodField()
    
    class Meta:
        model = Unit
        fields = [
            'id', 'tenant_id', 'code', 'name', 'description',
            'level', 'level_display', 'section_id', 'parent_name',
            'parent_code', 'department_id', 'department_name', 'division_id', 'division_name',
            'depth', 'path', 'cost_center_id', 'manager_id',
            'budget_code', 'headcount_limit', 'is_active', 'is_deleted',
            'leader', 'employee_count', 'full_path',
            'created_at', 'updated_at', 'created_by', 'updated_by',
            'deleted_at', 'deleted_by'
        ]
        read_only_fields = ['id', 'tenant_id', 'level', 'depth', 'path', 'created_at', 'updated_at', 'deleted_at']
    
    def get_department_id(self, obj):
        return str(obj.section.department_id) if hasattr(obj, 'section') and obj.section and obj.section.department_id else None

    def get_department_name(self, obj):
        return obj.section.department.name if hasattr(obj, 'section') and obj.section and hasattr(obj.section, 'department') and obj.section.department else None

    def get_division_id(self, obj):
        return str(obj.section.department.division_id) if hasattr(obj, 'section') and obj.section and hasattr(obj.section, 'department') and obj.section.department and obj.section.department.division_id else None

    def get_division_name(self, obj):
        return obj.section.department.division.name if hasattr(obj, 'section') and obj.section and hasattr(obj.section, 'department') and obj.section.department and hasattr(obj.section.department, 'division') and obj.section.department.division else None

    def get_leader(self, obj):
        return get_node_leader_info(obj)

    def get_employee_count(self, obj):
        from apps.structure.models.employment import Employment
        return Employment.objects.filter(position__unit_id=obj.id, is_current=True, is_deleted=False, is_active=True).count()
    
    def get_full_path(self, obj):
        return obj.get_full_path()

