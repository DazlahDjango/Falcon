from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from apps.structure.models.division import Division
from apps.structure.enums.org_level import OrgLevel
from .base import BaseStructureSerializer, BaseStructureDetailSerializer, get_node_leader_info

class DivisionSerializer(BaseStructureSerializer):
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    children_count = serializers.IntegerField(read_only=True)
    leader = serializers.SerializerMethodField()
    
    class Meta:
        model = Division
        fields = [
            'id', 'tenant_id', 'code', 'name', 'description',
            'level', 'level_display', 'path', 'depth',
            'cost_center_id', 'manager_id', 'director_id', 'leader', 'budget_code', 'headcount_limit',
            'is_active', 'is_deleted', 'children_count', 'created_at'
        ]
        read_only_fields = ['id', 'tenant_id', 'level', 'path', 'depth', 'created_at', 'updated_at']

    def get_leader(self, obj):
        return get_node_leader_info(obj)

class DivisionDetailSerializer(BaseStructureDetailSerializer):
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    children_count = serializers.IntegerField(read_only=True)
    department_count = serializers.SerializerMethodField()
    employee_count = serializers.SerializerMethodField()
    departments = serializers.SerializerMethodField()
    leader = serializers.SerializerMethodField()
    full_path = serializers.SerializerMethodField()
    
    class Meta:
        model = Division
        fields = [
            'id', 'tenant_id', 'code', 'name', 'description',
            'level', 'level_display', 'path', 'depth',
            'cost_center_id', 'manager_id', 'director_id', 'budget_code', 'headcount_limit',
            'is_active', 'is_deleted', 'children_count',
            'department_count', 'employee_count', 'leader', 'departments', 'full_path',
            'created_at', 'updated_at', 'created_by', 'updated_by',
            'deleted_at', 'deleted_by'
        ]
        read_only_fields = ['id', 'tenant_id', 'level', 'path', 'depth', 'created_at', 'updated_at', 'deleted_at']
    
    def get_department_count(self, obj):
        return obj.departments.filter(is_deleted=False, is_active=True).count() if hasattr(obj, 'departments') else obj.children.filter(is_deleted=False, is_active=True).count()
    
    def get_employee_count(self, obj):
        from apps.structure.models.employment import Employment
        return Employment.objects.filter(position__division_id=obj.id, is_current=True, is_deleted=False, is_active=True).count()

    def get_leader(self, obj):
        return get_node_leader_info(obj)

    def get_departments(self, obj):
        from apps.structure.models.employment import Employment
        depts = obj.departments.filter(is_deleted=False).order_by('name') if hasattr(obj, 'departments') else obj.children.filter(is_deleted=False).order_by('name')
        result = []
        for d in depts:
            sections_count = d.sections.filter(is_deleted=False, is_active=True).count() if hasattr(d, 'sections') else d.children.filter(is_deleted=False, is_active=True).count()
            emp_count = Employment.objects.filter(position__department_id=d.id, is_current=True, is_deleted=False, is_active=True).count()
            leader_info = get_node_leader_info(d)
            result.append({
                'id': str(d.id),
                'code': d.code,
                'name': d.name,
                'description': d.description,
                'is_active': d.is_active,
                'section_count': sections_count,
                'employee_count': emp_count,
                'leader': leader_info,
            })
        return result

    def get_full_path(self, obj):
        return obj.get_full_path()

