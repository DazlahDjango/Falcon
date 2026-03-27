from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from apps.accounts.models import Role
from apps.accounts.constants import UserRoles
from .base import DynamicFieldsModelSerializer, AuditSerializer

class RoleMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name', 'code']

class RoleListSerializer(DynamicFieldsModelSerializer, AuditSerializer):
    class Meta:
        model = Role
        fields = [
            'id', 'name', 'code', 'description', 'role_type', 'is_system',
            'is_assignable', 'order', 'parent', 'permission_count',
            'child_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_permission_count(self, obj):
        return obj.permissions.count()
    
    def get_child_count(self, obj):
        return obj.children.count()
    
class RoleDetailSerializer(RoleListSerializer):
    permissions = serializers.SlugRelatedField(many=True, read_only=True, slug_field='codename')
    parent_name = serializers.SerializerMethodField()
    class Meta(RoleListSerializer.Meta):
        fields = RoleListSerializer.Meta.fields + ['permissions', 'parent_name']
    
    def get_parent_name(self, obj):
        if obj.parent:
            return obj.parent.name
        return None
    
class RoleCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['name', 'code', 'description', 'parent', 'order', 'is_assignable']

    def validate_code(self, value):
        if Role.objects.filter(code=value).exists():
            raise serializers.ValidationError(_("A role with this code already exists."))
        if value in UserRoles.ALL:
            raise serializers.ValidationError(_("Cannot overide system role code."))
        return value
    
    def validate_parent(self, value):
        if value in value.is_system:
            raise serializers.ValidationError(_("Cannot set system role as parent"))
        return value
    
class RoleUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['name', 'description', 'parent', 'order', 'is_assignable', 'permissions']
    
    def validate_parent(self, value):
        if value and value.is_system:
            raise serializers.ValidationError(_('Cannot set system role as parent.'))
        return value
    
class RoleSerializer(DynamicFieldsModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'tenant_id']