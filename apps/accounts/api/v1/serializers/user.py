from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.password_validation import validate_password
from apps.accounts.models import User
from apps.accounts.validators import validate_password_strength
from .base import DynamicFieldsModelSerializer, AuditSerializer

class UserMinimalSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(format='hex')
    tenant_id = serializers.UUIDField(read_only=True)
    full_name = serializers.SerializerMethodField(read_only=True)
    avatar = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'role', 'full_name',
            'is_superuser', 'is_verified', 'tenant_id', 'avatar'
        ]
        read_only_fields = fields
    def get_full_name(self, obj):
        return obj.get_full_name()
    def get_avatar(self, obj):
        if hasattr(obj, 'profile') and obj.profile and obj.profile.avatar:
            try:
                request = self.context.get('request')
                url = obj.profile.avatar.url
                if request:
                    return request.build_absolute_uri(url)
                return url
            except Exception:
                return None
        return None

class UserListSerializer(DynamicFieldsModelSerializer, AuditSerializer):
    full_name = serializers.SerializerMethodField()
    manager_name = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'full_name',
            'role', 'is_active', 'is_verified', 'is_onboarded', 'mfa_enabled',
            'manager', 'manager_name', 'department', 'title', 'employee_id',
            'last_login', 'created_at', 'updated_at', 'created_by', 'modified_by', 'avatar'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'modified_by']    
    def get_full_name(self, obj):
        return obj.get_full_name()
    def get_manager_name(self, obj):
        return obj.manager.get_full_name() if obj.manager else None
    def get_avatar(self, obj):
        if hasattr(obj, 'profile') and obj.profile and obj.profile.avatar:
            try:
                request = self.context.get('request')
                url = obj.profile.avatar.url
                if request:
                    return request.build_absolute_uri(url)
                return url
            except Exception:
                return None
        return None

class UserDetailSerializer(UserListSerializer):
    phone = serializers.CharField(source='phone_number', required=False, allow_blank=True, max_length=20)
    class Meta(UserListSerializer.Meta):
        fields = UserListSerializer.Meta.fields + [
            'phone', 'tenant_id', 'last_login_ip', 'last_login_agent',
            'login_attempts', 'locked_until', 'joined_at', 'timezone', 'language'
        ]

class UserCreationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=False, allow_blank=True, style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True, required=False, allow_blank=True, style={'input_type': 'password'}
    )
    tenant_id = serializers.UUIDField(required=False, allow_null=True)
    phone = serializers.CharField(source='phone_number', required=False, allow_blank=True, max_length=20)
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'password', 'password_confirm', 'first_name', 'last_name',
            'phone', 'role', 'manager', 'department', 'title', 'employee_id', 'joined_at', 'tenant_id'
        ]
        read_only_fields = ['id']

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(_("A user with this email already exists"))
        return value.lower().strip()
    
    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError(_("A user with this username already exists"))
        return value.strip()
    
    def validate_role(self, value):
        request = self.context.get('request')
        if request and request.user:
            from apps.accounts.api.v1.permissions import CanAssignRole
            if not CanAssignRole()._can_assign_role(request.user, value):
                raise serializers.ValidationError(
                    _("You do not have permission to assign this role")
                )
        return value
    
    def validate(self, attrs):
        request = self.context.get('request')
        password = attrs.get('password')
        password_confirm = attrs.get('password_confirm')
        tenant_id = attrs.get('tenant_id')

        # Tenant validations
        if request and request.user:
            if not request.user.is_superuser:
                if tenant_id and str(tenant_id) != str(request.user.tenant_id):
                    raise serializers.ValidationError({
                        'tenant_id': _("You cannot specify a different organization's tenant ID.")
                    })
                attrs['tenant_id'] = request.user.tenant_id

        # Password validations
        if password or password_confirm:
            if password != password_confirm:
                raise serializers.ValidationError({
                    'password_confirm': _('Passwords do not match')
                })
            is_valid, errors = validate_password_strength(password)
            if not is_valid:
                raise serializers.ValidationError({
                    'password': errors
                })
        return attrs
    
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data.pop('password_confirm', None)
        password = validated_data.pop('password', None)
        
        tenant_id = validated_data.pop('tenant_id', None)
        if not tenant_id and request and request.user:
            tenant_id = request.user.tenant_id
            
        user = User(**validated_data)
        user.tenant_id = tenant_id
        
        from apps.accounts.services.auth.password import PasswordService
        password_service = PasswordService()
        
        if password:
            user.set_password(password)
            user.password_change_required = True
        else:
            raw_password, password_change_required, mode = password_service.generate_default_password_for_user(user, tenant_id)
            if mode == 'invite_only':
                user.set_unusable_password()
                user.password_change_required = False
            else:
                user.set_password(raw_password)
                user.password_change_required = password_change_required
                user._generated_raw_password = raw_password
            user._generated_password_mode = mode
            
        user.save()
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(source='phone_number', required=False, allow_blank=True, max_length=20)
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
                raise serializers.ValidationError(
                    _("You do not have permission to assign this role")
                )
        return value

class UserSerializer(DynamicFieldsModelSerializer):
    full_name = serializers.SerializerMethodField(read_only=True)
    phone = serializers.CharField(source='phone_number', required=False, allow_blank=True, max_length=20)
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
        if hasattr(obj, 'profile') and obj.profile:
            return ProfileMinimalSerializer(obj.profile).data
        return None