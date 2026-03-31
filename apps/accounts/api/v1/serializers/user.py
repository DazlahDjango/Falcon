from rest_framework import serializers
from django.utils.translation import gettext_lazy as _ 
from django.contrib.auth.password_validation import validate_password
from apps.accounts.models import User
from apps.accounts.validators import validate_password_strength
from .base import DynamicFieldsModelSerializer, AuditSerializer

class UserMinimalSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(format='hex')  # ✅ Converts UUID to string
    tenant_id = serializers.UUIDField(format='hex', source='tenant.id', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'role', 'full_name',
            'is_superuser', 'is_verified', 'tenant_id'
        ]
        read_only_fields = fields
    def get_full_name(self, obj):
        return obj.get_full_name()
    
class UserListSerializer(DynamicFieldsModelSerializer, AuditSerializer):
    full_name = serializers.SerializerMethodField()
    manager_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'full_name',
            'role', 'is_active', 'is_verified', 'is_onboarded', 'mfa_enabled',
            'manager', 'manager_name', 'department', 'title', 'employee_id',
            'last_login', 'created_at', 'updated_at', 'created_by', 'modified_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'modified_by']
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_manager_name(self, obj):
        if obj.manager():
            return obj.manager.get_full_name()
        return None
    
class UserDetailSerializer(UserListSerializer):
    class Meta(UserListSerializer.Meta):
        fields = UserListSerializer.Meta.fields + [
            'phone', 'tenant_id', 'last_login_ip', 'last_login_agent',
            'login_attempts', 'locked_until', 'joined_at', 'timezone', 'language'
        ]

class UserCreationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    class Meta:
        model = User
        fields = [
            'email', 'username', 'password', 'password_confirm', 'first_name', 'last_name',
            'phone', 'role', 'manager', 'department', 'title', 'employee_id', 'joined_at'
        ]
    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(_("A user with this email already exists"))
        return value.lower().strip()
    
    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError(_("User with this email exists"))
        return value.strip()
    
    def validate_password(self, value):
        is_valid, errors = validate_password_strength(value)
        if not is_valid:
            raise serializers.ValidationError(errors)
        return value
    
    def validate(self, attrs):
        password = attrs.get('password')
        password_confirm = attrs.get('password_confirm')
        if password != password_confirm:
            raise serializers.ValidationError({'password_confirm': _('Passwords do not match')})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
    
class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone', 'role', 'manager',
            'department', 'title', 'employee_id', 'joined_at',
            'is_active', 'is_verified', 'is_onboarded'
        ]

    def validate_role(self, value):
        request = self.context.get('request')
        if request and request.user:
            from apps.accounts.api.v1.permissions import CanAssignRole
            if not CanAssignRole()._can_assign_role(request.user, value):
                raise serializers.ValidationError(_("You do not have permission to assign this role"))
        return value
    
class UserSerializer(DynamicFieldsModelSerializer):
    full_name = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'full_name',
            'phone', 'role', 'tenant_id', 'is_active', 'is_verified',
            'is_onboarded', 'mfa_enabled', 'manager', 'department',
            'title', 'employee_id', 'joined_at', 'last_login',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'tenant_id', 'created_at', 'updated_at', 'last_login']
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
class UserProfileSerializer(UserSerializer):
    profile = serializers.SerializerMethodField()
    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['profile']
    def get_profile(self, obj):
        from .profile import ProfileMinimalSerializer
        if hasattr(obj, 'profile'):
            return ProfileMinimalSerializer(obj.profile).data
        return None