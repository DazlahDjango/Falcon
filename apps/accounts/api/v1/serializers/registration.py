from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from apps.accounts.models import User
from apps.accounts.constants import UserRoles
from apps.accounts.validators import validate_password_strength
from .base import BaseSerializer

class UserRegistrationSerializer(BaseSerializer):
    email = serializers.EmailField(required=True)
    username = serializers.CharField(required=True, max_length=150)
    password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(_("A user with this email already exists"))
        return value.lower().strip()
    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError(_("A user with this username exists"))
        return value.lower().strip()
    def validate_password(self, value):
        is_valid, errors = validate_password_strength(value)
        if not is_valid:
            return serializers.ValidationError(errors)
        return value
    def validate(self, attrs):
        password = attrs.get('password')
        confirm_password = attrs.get('confirm_password')
        if password != confirm_password:
            raise serializers.ValidationError({'confirm_password': _('Passwords do not match.')})
        return attrs

class TenantRegistrationSerializer(BaseSerializer):
    company_name = serializers.CharField(required=True, max_length=200)
    admin_email = serializers.EmailField(required=True)
    admin_username = serializers.CharField(required=True, max_length=150)
    admin_password = serializers.CharField(required=True, write_only=True)
    admin_confirm_password = serializers.CharField(required=True, write_only=True)
    admin_first_name = serializers.CharField(required=False, allow_blank=True)
    admin_last_name = serializers.CharField(required=False, allow_blank=True)
    subscription_plan = serializers.ChoiceField(
        choices=['trial', 'basic', 'professional', 'enterprise'],
        default='trial'
    )
    def validate_admin_password(self, value):
        is_valid, errors = validate_password_strength(value)
        if not is_valid:
            raise serializers.ValidationError(errors)
        return value
    def validate(self, attrs):
        admin_password = attrs.get('admin_password')
        admin_confirm_password = attrs.get('admin_confirm_password')
        if admin_password != admin_confirm_password:
            raise serializers.ValidationError({'admin_confirm_password': _('Passwords do not match')})
        return attrs
    
class InvitationSerializer(BaseSerializer):
    email = serializers.EmailField(required=True)
    role = serializers.ChoiceField(choices=UserRoles.CHOICES, default=UserRoles.STAFF)
    message = serializers.CharField(required=False, allow_blank=True, max_length=500)
    department_id = serializers.UUIDField(required=False)

class InvitationAcceptSerializer(BaseSerializer):
    token = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    def validate_password(self, value):
        is_valid, errors = validate_password_strength(value)
        if not is_valid:
            raise serializers.ValidationError(errors)
        return value
    def validate(self, attrs):
        password = attrs.get('password')
        confirm_password = attrs.get('confirm_password')
        if password != confirm_password:
            raise serializers.ValidationError({'confirm_password': _('Passwords do not match.')})
        return attrs

class VerifyEmailSerializer(BaseSerializer):
    token = serializers.CharField(required=True)