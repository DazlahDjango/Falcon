from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from apps.structure.models.section import Section
from apps.structure.enums.org_level import OrgLevel
from .base import BaseStructureSerializer, BaseStructureDetailSerializer

class SectionSerializer(BaseStructureSerializer):
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    parent_name = serializers.CharField(source='department.name', read_only=True, allow_null=True)
    parent_code = serializers.CharField(source='department.code', read_only=True, allow_null=True)
    children_count = serializers.IntegerField(read_only=True)
    department_id = serializers.UUIDField(required=False, allow_null=True)
    
    class Meta:
        model = Section
        fields = [
            'id', 'tenant_id', 'code', 'name', 'description',
            'level', 'level_display', 'department_id', 'parent_name',
            'parent_code', 'depth', 'path', 'cost_center_id', 'manager_id',
            'budget_code', 'headcount_limit', 'is_active', 'is_deleted',
            'children_count', 'created_at'
        ]
        read_only_fields = ['id', 'tenant_id', 'level', 'depth', 'path', 'created_at', 'updated_at']

class SectionDetailSerializer(BaseStructureDetailSerializer):
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    parent_name = serializers.CharField(source='department.name', read_only=True, allow_null=True)
    parent_code = serializers.CharField(source='department.code', read_only=True, allow_null=True)
    child_count = serializers.SerializerMethodField()
    unit_count = serializers.SerializerMethodField()
    employee_count = serializers.SerializerMethodField()
    full_path = serializers.SerializerMethodField()
    
    class Meta:
        model = Section
        fields = [
            'id', 'tenant_id', 'code', 'name', 'description',
            'level', 'level_display', 'department_id', 'parent_name',
            'parent_code', 'depth', 'path', 'cost_center_id', 'manager_id',
            'budget_code', 'headcount_limit', 'is_active', 'is_deleted',
            'child_count', 'unit_count', 'employee_count', 'full_path',
            'created_at', 'updated_at', 'created_by', 'updated_by',
            'deleted_at', 'deleted_by'
        ]
        read_only_fields = ['id', 'tenant_id', 'level', 'depth', 'path', 'created_at', 'updated_at', 'deleted_at']
    
    def get_child_count(self, obj):
        return obj.children.filter(is_deleted=False, is_active=True).count()
    
    def get_unit_count(self, obj):
        return obj.children.filter(is_deleted=False, is_active=True).count()
    
    def get_employee_count(self, obj):
        from apps.structure.models.employment import Employment
        return Employment.objects.filter(position__section_id=obj.id, is_current=True, is_deleted=False, is_active=True).count()
    
    def get_full_path(self, obj):
        return obj.get_full_path()
