from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from apps.accounts.models import Permission
from apps.accounts.constants import PermissionCategories, PermissionLevels
from .base import DynamicFieldsModelSerializer, AuditSerializer

class PermissionMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'codename', 'name']
    
class PermissionListSerializer(DynamicFieldsModelSerializer, AuditSerializer):
    category_display = serializers.SerializerMethodField()
    level_display = serializers.SerializerMethodField()
    class Meta:
        model = Permission
        fields = [
            'id', 'codename', 'name', 'description', 'category', 'category_display',
            'level', 'level_display', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_category_display(self, obj):
        return dict(PermissionCategories.CHOICES).get(obj.category, obj.category)
    
    def get_level_display(self, obj):
        return dict(PermissionLevels.CHOICES).get(obj.level, obj.level)
    
class PermissionDetailSerializer(PermissionListSerializer):
    content_type_name = serializers.SerializerMethodField()
    class Meta(PermissionListSerializer.Meta):
        fields = PermissionListSerializer.Meta.fields + ['content_type', 'content_type_name']
    
    def get_content_type_name(self, obj):
        if obj.content_type:
            return f"{obj.content_type.app_label}.{obj.content_type.model}"
        return None

class PermissionSerializer(DynamicFieldsModelSerializer):
    class Meta:
        model = Permission
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'tenant_id']
