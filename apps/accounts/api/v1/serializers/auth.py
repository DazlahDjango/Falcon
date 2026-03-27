from rest_framework import serializers
from django.utils.translation import gettext_lazy as _ 
from .base import BaseSerializer

class LoginSerializer(BaseSerializer):
    email = serializers.EmailField(required=True, write_only=True)
    password = serializers.CharField(required=True, write_only=True, style={'input_type', 'password'})
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        if not email or not password:
            raise serializers.ValidationError(_("Email and password are required"))
        return attrs

class LoginResponseSerializer(BaseSerializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    access_expires_in = serializers.IntegerField()
    refresh_expires_in = serializers.IntegerField()
    token_type = serializers.CharField(default='Bearer')
    session_id = serializers.CharField()
    user = serializers.SerializerMethodField()
    def get_user(self, obj):
        from .user import UserMinimalSerializer
        return UserMinimalSerializer(obj.get('user')).data if obj.get('user') else None
    
class MFATokenSerializer(BaseSerializer):
    requires_mfa =serializers.BooleanField(default=True)
    mfa_token = serializers.CharField()

class MFAAuthSerializer(BaseSerializer):
    mfa_token = serializers.CharField(required=True)
    otp = serializers.CharField(required=True, max_length=10)
    def validate_otp(self, value):
        if not value.isdigit():
            raise serializers.ValidationError(_("OTP must contain only digits"))
        if len(value) not in [6, 8]:
            raise serializers.ValidationError(_("OTP must be 6 or 8 digits"))
        return value
    
class MFASetupSerializer(BaseSerializer):
    device_name = serializers.CharField(required=False, default='Authenticator', max_length=100)

class MFASetupResponseSerializer(BaseSerializer):
    secret = serializers.CharField()
    provisioning_uri = serializers.CharField()
    qr_code_data = serializers.CharField()
    backup_codes = serializers.ListField(child=serializers.CharField())
    device_id = serializers.CharField()

class MFAResponseSerializer(BaseSerializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    access_expires_in = serializers.IntegerField()
    refresh_expires_in = serializers.IntegerField()
    token_type = serializers.CharField(default='Bearer')
    session_id = serializers.CharField()
    user = serializers.SerializerMethodField()
    def get_user(self, obj):
        from .user import UserMinimalSerializer
        return UserMinimalSerializer(obj.get('user')).data if obj.get('user') else None
    
class RefreshTokenSerializer(BaseSerializer):
    refresh = serializers.CharField(required=True)

class LogoutSerializer(BaseSerializer):
    refresh = serializers.CharField(required=False)
    all_devices = serializers.BooleanField(default=False)