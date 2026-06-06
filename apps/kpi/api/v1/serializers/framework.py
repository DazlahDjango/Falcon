# framework.py
from rest_framework import serializers
from ....models import KPIFramework, KPICategory, Sector, KPITemplate
from .base import TenantAwareSerializer


class SectorSerializer(TenantAwareSerializer):
    sector_type_display = serializers.CharField(source='get_sector_type_display', read_only=True)

    class Meta:
        model = Sector
        fields = [
            'id', 'name', 'code', 'sector_type', 'sector_type_display',
            'description', 'icon', 'is_active', 'metadata',
            'tenant_id', 'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']

    def create(self, validated_data):
        # Get tenant_id from request context if not provided
        if 'tenant_id' not in validated_data and 'request' in self.context:
            request = self.context.get('request')
            tenant_id = getattr(request, 'current_tenant_id', None)
            if tenant_id:
                validated_data['tenant_id'] = tenant_id
        return super().create(validated_data)

class KPICategorySerializer(TenantAwareSerializer):
    category_type_display = serializers.CharField(source='get_category_type_display', read_only=True)
    parent_name = serializers.CharField(source='parent.name', read_only=True, default=None)
    framework_name = serializers.CharField(source='framework.name', read_only=True, default=None)
    children_count = serializers.SerializerMethodField()

    class Meta:
        model = KPICategory
        fields = [
            'id', 'name', 'code', 'category_type', 'category_type_display',
            'framework', 'framework_name', 'parent', 'parent_name',
            'description', 'color', 'icon', 'display_order', 'is_active',
            'children_count', 'tenant_id', 'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by', 'tenant_id']

    def get_children_count(self, obj):
        return obj.children.count()
    
    def create(self, validated_data):
        if 'tenant_id' not in validated_data and 'request' in self.context:
            request = self.context.get('request')
            tenant_id = getattr(request, 'current_tenant_id', None)
            if tenant_id:
                validated_data['tenant_id'] = tenant_id
            elif hasattr(request.user, 'tenant_id'):
                validated_data['tenant_id'] = str(request.user.tenant_id)
        return super().create(validated_data)


class KPIFrameworkSerializer(TenantAwareSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    sector_name = serializers.CharField(source='sector.name', read_only=True)
    kpi_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = KPIFramework
        fields = [
            'id', 'name', 'code', 'sector', 'sector_name', 'description',
            'version', 'status', 'status_display', 'is_default',
            'effective_from', 'effective_to', 'metadata', 'kpi_count',
            'tenant_id', 'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']


class KPITemplateSerializer(TenantAwareSerializer):
    difficulty_display = serializers.CharField(source='get_difficulty_display', read_only=True)
    sector_name = serializers.CharField(source='sector.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True, default=None)

    class Meta:
        model = KPITemplate
        fields = [
            'id', 'name', 'code', 'sector', 'sector_name', 'category',
            'category_name', 'description', 'kpi_definition', 'target_phasing_pattern',
            'difficulty', 'difficulty_display', 'is_published', 'usage_count', 'metadata',
            'tenant_id', 'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by', 'usage_count']