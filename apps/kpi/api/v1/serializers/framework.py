# framework.py
from rest_framework import serializers
from ....models import KPICategory
from .base import TenantAwareSerializer


class KPICategorySerializer(TenantAwareSerializer):
    category_type_display = serializers.CharField(source='get_category_type_display', read_only=True)
    parent_name = serializers.CharField(source='parent.name', read_only=True, default=None)
    children_count = serializers.SerializerMethodField()
    kpis_count = serializers.SerializerMethodField()
    kpis = serializers.SerializerMethodField()

    class Meta:
        model = KPICategory
        fields = [
            'id', 'name', 'category_type', 'category_type_display',
            'parent', 'parent_name',
            'description', 'color', 'icon', 'display_order', 'is_active',
            'children_count', 'kpis_count', 'kpis', 'tenant_id', 'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by', 'tenant_id']

    def get_children_count(self, obj):
        return obj.children.count()

    def get_kpis_count(self, obj):
        return obj.kpis.count()

    def get_kpis(self, obj):
        from .definition import KPIListSerializer
        return KPIListSerializer(obj.kpis.filter(is_active=True), many=True).data