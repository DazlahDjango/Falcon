from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from apps.structure.models.unit import Unit
from apps.structure.enums.org_level import OrgLevel
from .base import BaseStructureSerializer, BaseStructureDetailSerializer

class UnitSerializer(BaseStructureSerializer):
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    parent_name = serializers.CharField(source='parent.name', read_only=True, allow_null=True)
    parent_code = serializers.CharField(source='parent.code', read_only=True, allow_null=True)
    headcount = serializers.SerializerMethodField()
    
    class Meta:
        model = Unit
        fields = [
            'id', 'tenant_id', 'code', 'name', 'description',
            'level', 'level_display', 'parent_id', 'parent_name',
            'parent_code', 'depth', 'path', 'cost_center_id',
            'budget_code', 'headcount_limit', 'is_active', 'is_deleted',
            'headcount', 'created_at'
        ]
        read_only_fields = ['id', 'tenant_id', 'level', 'depth', 'path', 'created_at', 'updated_at']
    
    def get_headcount(self, obj):
        from apps.structure.models.employment import Employment
        return Employment.objects.filter(unit_id=obj.id, is_current=True, is_deleted=False, is_active=True).count()

class UnitDetailSerializer(BaseStructureDetailSerializer):
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    parent_name = serializers.CharField(source='parent.name', read_only=True, allow_null=True)
    parent_code = serializers.CharField(source='parent.code', read_only=True, allow_null=True)
    employee_count = serializers.SerializerMethodField()
    full_path = serializers.SerializerMethodField()
    
    class Meta:
        model = Unit
        fields = [
            'id', 'tenant_id', 'code', 'name', 'description',
            'level', 'level_display', 'parent_id', 'parent_name',
            'parent_code', 'depth', 'path', 'cost_center_id',
            'budget_code', 'headcount_limit', 'is_active', 'is_deleted',
            'employee_count', 'full_path',
            'created_at', 'updated_at', 'created_by', 'updated_by',
            'deleted_at', 'deleted_by'
        ]
        read_only_fields = ['id', 'tenant_id', 'level', 'depth', 'path', 'created_at', 'updated_at', 'deleted_at']
    
    def get_employee_count(self, obj):
        from apps.structure.models.employment import Employment
        return Employment.objects.filter(unit_id=obj.id, is_current=True, is_deleted=False, is_active=True).count()
    
    def get_full_path(self, obj):
        return obj.get_full_path()