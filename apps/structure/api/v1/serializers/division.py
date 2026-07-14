from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from apps.structure.models.division import Division
from apps.structure.enums.org_level import OrgLevel
from .base import BaseStructureSerializer, BaseStructureDetailSerializer

class DivisionSerializer(BaseStructureSerializer):
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    children_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Division
        fields = [
            'id', 'tenant_id', 'code', 'name', 'description',
            'level', 'level_display', 'path', 'depth',
            'cost_center_id', 'manager_id', 'budget_code', 'headcount_limit',
            'is_active', 'is_deleted', 'children_count', 'created_at'
        ]
        read_only_fields = ['id', 'tenant_id', 'level', 'path', 'depth', 'created_at', 'updated_at']

class DivisionDetailSerializer(BaseStructureDetailSerializer):
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    children_count = serializers.IntegerField(read_only=True)
    department_count = serializers.SerializerMethodField()
    full_path = serializers.SerializerMethodField()
    
    class Meta:
        model = Division
        fields = [
            'id', 'tenant_id', 'code', 'name', 'description',
            'level', 'level_display', 'path', 'depth',
            'cost_center_id', 'manager_id', 'budget_code', 'headcount_limit',
            'is_active', 'is_deleted', 'children_count',
            'department_count', 'full_path',
            'created_at', 'updated_at', 'created_by', 'updated_by',
            'deleted_at', 'deleted_by'
        ]
        read_only_fields = ['id', 'tenant_id', 'level', 'path', 'depth', 'created_at', 'updated_at', 'deleted_at']
    
    def get_department_count(self, obj):
        return obj.children.filter(is_deleted=False, is_active=True).count()
    
    def get_full_path(self, obj):
        return obj.get_full_path()
