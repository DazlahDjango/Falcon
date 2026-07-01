from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from apps.structure.models.organizational_unit import OrganizationalUnit
from apps.structure.enums.org_level import OrgLevel
from .base import BaseStructureSerializer, BaseStructureDetailSerializer

class OrganizationalUnitSerializer(BaseStructureSerializer):
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    parent_name = serializers.CharField(source='parent.name', read_only=True, allow_null=True)
    parent_code = serializers.CharField(source='parent.code', read_only=True, allow_null=True)
    children_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = OrganizationalUnit
        fields = [
            'id', 'tenant_id', 'code', 'name', 'description',
            'level', 'level_display', 'parent_id', 'parent_name',
            'parent_code', 'path', 'depth', 'cost_center_id',
            'budget_code', 'headcount_limit', 'is_active', 'is_deleted',
            'children_count', 'created_at'
        ]
        read_only_fields = ['id', 'tenant_id', 'path', 'depth', 'created_at', 'updated_at']

class OrganizationalUnitDetailSerializer(BaseStructureDetailSerializer):
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    parent_name = serializers.CharField(source='parent.name', read_only=True, allow_null=True)
    parent_code = serializers.CharField(source='parent.code', read_only=True, allow_null=True)
    children_count = serializers.IntegerField(read_only=True)
    full_path = serializers.SerializerMethodField()
    
    class Meta:
        model = OrganizationalUnit
        fields = [
            'id', 'tenant_id', 'code', 'name', 'description',
            'level', 'level_display', 'parent_id', 'parent_name',
            'parent_code', 'path', 'depth', 'cost_center_id',
            'budget_code', 'headcount_limit', 'is_active', 'is_deleted',
            'children_count', 'full_path',
            'created_at', 'updated_at', 'created_by', 'updated_by',
            'deleted_at', 'deleted_by'
        ]
        read_only_fields = ['id', 'tenant_id', 'path', 'depth', 'created_at', 'updated_at', 'deleted_at']
    
    def get_full_path(self, obj):
        return obj.get_full_path()