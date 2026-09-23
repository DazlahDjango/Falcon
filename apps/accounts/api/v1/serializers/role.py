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
    permission_count = serializers.SerializerMethodField()
    user_count = serializers.SerializerMethodField()
    child_count = serializers.SerializerMethodField()

    class Meta:
        model = Role
        fields = [
            'id', 'name', 'code', 'description', 'role_type', 'is_system',
            'is_assignable', 'order', 'parent', 'permission_count', 'user_count',
            'child_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_permission_count(self, obj):
        if hasattr(obj, 'permissions') and obj.permissions.exists():
            return obj.permissions.count()
        from apps.accounts.services import RBACService
        from apps.accounts.constants import PREDEFINED_PERMISSIONS_DATA
        if obj.code == 'super_admin':
            return len(PREDEFINED_PERMISSIONS_DATA)
        rbac = RBACService()
        defaults = rbac.get_role_default_permissions(obj.code)
        return len(defaults) if defaults else 0

    def get_user_count(self, obj):
        from apps.accounts.models import User
        request = self.context.get('request')
        tenant_id = None
        if request and getattr(request, 'user', None) and not request.user.is_superuser:
            tenant_id = getattr(request.user, 'tenant_id', None)

        qs = User.objects.filter(is_deleted=False)
        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)

        code_matches = ['champion', 'dashboard_champion'] if obj.code in ['champion', 'dashboard_champion'] else [obj.code]
        return qs.filter(role__in=code_matches).count()

    def get_child_count(self, obj):
        return obj.children.count() if hasattr(obj, 'children') else 0


class RoleDetailSerializer(RoleListSerializer):
    permissions = serializers.SerializerMethodField()
    parent_name = serializers.SerializerMethodField()

    class Meta(RoleListSerializer.Meta):
        fields = RoleListSerializer.Meta.fields + ['permissions', 'parent_name']

    def get_permissions(self, obj):
        from apps.accounts.services import RBACService
        from apps.accounts.constants import PREDEFINED_PERMISSIONS_DATA
        if obj.code == 'super_admin':
            return [p['codename'] for p in PREDEFINED_PERMISSIONS_DATA]
        rbac = RBACService()
        defaults = rbac.get_role_default_permissions(obj.code)
        if defaults:
            return defaults
        return list(obj.permissions.values_list('codename', flat=True)) if hasattr(obj, 'permissions') else []

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