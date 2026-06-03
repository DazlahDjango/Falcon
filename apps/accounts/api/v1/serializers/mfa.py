from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinLengthValidator, MaxLengthValidator
import re
from apps.accounts.models import MFADevice, MFABackupCode, MFAAuditLog
from .base import DynamicFieldsModelSerializer, AuditSerializer
from .user import UserMinimalSerializer


class MFADeviceListSerializer(DynamicFieldsModelSerializer, AuditSerializer):
    user = UserMinimalSerializer(read_only=True)
    device_type_display = serializers.SerializerMethodField()
    is_locked = serializers.SerializerMethodField()
    
    class Meta:
        model = MFADevice
        fields = [
            'id', 'user', 'name', 'device_type', 'device_type_display',
            'is_active', 'is_primary', 'is_verified', 'is_locked',
            'verified_at', 'last_used_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'verified_at', 'last_used_at']

    def get_device_type_display(self, obj):
        return dict(MFADevice.DEVICE_CHOICES).get(obj.device_type, obj.device_type)
    
    def get_is_locked(self, obj):
        return obj.is_locked()


class MFADeviceDetailSerializer(MFADeviceListSerializer):
    """
    Detail serializer for MFA devices - includes sensitive fields
    Used for single device retrieval
    """
    
    class Meta(MFADeviceListSerializer.Meta):
        # Add extra fields to parent's fields
        fields = MFADeviceListSerializer.Meta.fields + [
            'phone', 'email', 'fail_count', 'locked_until', 'device_info'
        ]


class MFADeviceCreateSerializer(serializers.ModelSerializer):
    """
    Create serializer for new MFA devices
    Validates device-type specific requirements
    """
    device_type = serializers.ChoiceField(choices=MFADevice.DEVICE_CHOICES)
    name = serializers.CharField(max_length=100, validators=[MinLengthValidator(1)])
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    
    class Meta:
        model = MFADevice
        fields = ['name', 'device_type', 'phone', 'email']

    def validate_name(self, value):
        """Validate device name is not already used by user"""
        request = self.context.get('request')
        if request and request.user:
            if MFADevice.objects.filter(user=request.user, name=value, is_deleted=False).exists():
                raise serializers.ValidationError(
                    _("You already have a device with this name")
                )
        return value.strip()

    def validate_phone(self, value):
        """Validate phone number format for SMS devices"""
        if value:
            # Basic international phone number validation
            phone_pattern = re.compile(r'^\+?[1-9]\d{1,14}$')
            if not phone_pattern.match(value.replace(' ', '').replace('-', '')):
                raise serializers.ValidationError(
                    _("Invalid phone number format. Use international format (e.g., +1234567890)")
                )
        return value

    def validate_email(self, value):
        """Validate email format for email devices"""
        if value:
            # Email validation is handled by Django's EmailField
            return value.lower()
        return value

    def validate(self, attrs):
        device_type = attrs.get('device_type')
        phone = attrs.get('phone', '')
        email = attrs.get('email', '')
        
        # SMS device requires phone number
        if device_type == MFADevice.DEVICE_SMS:
            if not phone:
                raise serializers.ValidationError({
                    'phone': _("Phone number is required for SMS device")
                })
            # Clear email if present
            attrs['email'] = ''
        
        # Email device requires email address
        elif device_type == MFADevice.DEVICE_EMAIL:
            if not email:
                raise serializers.ValidationError({
                    'email': _("Email address is required for email device")
                })
            # Clear phone if present
            attrs['phone'] = ''
        
        # TOTP device should not have phone or email
        elif device_type == MFADevice.DEVICE_TOTP:
            if phone or email:
                raise serializers.ValidationError({
                    'non_field_errors': _("TOTP devices should not have phone or email")
                })
        
        # Hardware token device - minimal validation
        elif device_type == MFADevice.DEVICE_HARDWARE:
            if phone or email:
                # Clear them silently - hardware tokens don't need contact info
                attrs['phone'] = ''
                attrs['email'] = ''
        
        return attrs


class MFADeviceUpdateSerializer(serializers.ModelSerializer):
    """
    Update serializer for MFA devices
    Allows updating name and primary status
    """
    name = serializers.CharField(max_length=100, required=False, validators=[MinLengthValidator(1)])
    is_primary = serializers.BooleanField(required=False)
    is_active = serializers.BooleanField(required=False)
    
    class Meta:
        model = MFADevice
        fields = ['name', 'is_primary', 'is_active', 'device_info']
    
    def validate_name(self, value):
        """Validate device name is not already used by user"""
        if value:
            request = self.context.get('request')
            instance = self.instance
            if request and request.user:
                if MFADevice.objects.filter(
                    user=request.user, 
                    name=value, 
                    is_deleted=False
                ).exclude(id=instance.id).exists():
                    raise serializers.ValidationError(
                        _("You already have a device with this name")
                    )
        return value.strip() if value else value


class MFADeviceSerializer(DynamicFieldsModelSerializer):
    """
    Full device serializer - Admin use only
    Includes all fields for administrative purposes
    """
    
    class Meta:
        model = MFADevice
        fields = '__all__'
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'tenant_id', 
            'verified_at', '_secret'  # _secret is internal
        ]
        extra_kwargs = {
            '_secret': {'write_only': True},
            'secret': {'read_only': True},  # Expose decrypted secret via property
        }


# ============================================================================
# Backup Code Serializers
# ============================================================================

class MFABackupCodeReadSerializer(serializers.ModelSerializer):
    """
    Serializer for reading backup codes - shows raw codes only during generation
    Note: Raw codes are only available immediately after generation
    """
    raw_code = serializers.CharField(read_only=True)
    
    class Meta:
        model = MFABackupCode
        fields = ['id', 'raw_code', 'is_used', 'used_at', 'expires_at']
        read_only_fields = ['id', 'raw_code', 'is_used', 'used_at', 'expires_at']


class MFABackupCodeVerifySerializer(serializers.Serializer):
    """
    Serializer for verifying a backup code during MFA challenge
    """
    code = serializers.CharField(
        max_length=20, 
        required=True,
        validators=[MinLengthValidator(8), MaxLengthValidator(20)],
        help_text="Backup code from your recovery list"
    )
    
    def validate_code(self, value):
        """Normalize and validate backup code format"""
        # Remove any whitespace and convert to uppercase
        value = value.strip().upper().replace(' ', '').replace('-', '')
        
        # Basic format check
        if not value.isalnum():
            raise serializers.ValidationError(
                _("Backup code must contain only letters and numbers")
            )
        
        return value


class MFABackupCodeGenerateSerializer(serializers.Serializer):
    """
    Serializer for generating new backup codes
    """
    count = serializers.IntegerField(
        min_value=5, 
        max_value=20, 
        default=10,
        help_text="Number of backup codes to generate (5-20)"
    )
    
    def validate_count(self, value):
        """Validate count is reasonable"""
        if value < 5:
            raise serializers.ValidationError(_("Minimum 5 backup codes required"))
        if value > 20:
            raise serializers.ValidationError(_("Maximum 20 backup codes allowed"))
        return value


class MFABackupListSerializer(serializers.Serializer):
    """
    Serializer for returning backup codes list with metadata
    """
    codes = serializers.ListField(
        child=serializers.CharField(), 
        read_only=True,
        help_text="List of backup codes (show only once)"
    )
    remaining = serializers.IntegerField(
        read_only=True,
        help_text="Number of unused backup codes remaining"
    )
    regenerated_at = serializers.DateTimeField(
        read_only=True,
        help_text="Timestamp when codes were generated"
    )
    
    def to_representation(self, instance):
        """Add regenerated_at timestamp if not present"""
        data = super().to_representation(instance)
        if 'regenerated_at' not in data or not data['regenerated_at']:
            from django.utils import timezone
            data['regenerated_at'] = timezone.now()
        return data


# ============================================================================
# OTP Verification Serializers
# ============================================================================

class MFAVerifyOTPSerializer(serializers.Serializer):
    """
    Serializer for OTP verification during MFA challenge
    """
    otp = serializers.CharField(
        max_length=8, 
        required=True,
        validators=[MinLengthValidator(6), MaxLengthValidator(8)],
        help_text="6-8 digit OTP code from authenticator app"
    )
    device_id = serializers.CharField(
        max_length=36, 
        required=False, 
        allow_null=True,
        help_text="Optional device ID if verifying specific device"
    )
    
    def validate_otp(self, value):
        """Validate OTP format"""
        # Remove any whitespace
        value = value.strip().replace(' ', '')
        
        # OTP should be numeric
        if not value.isdigit():
            raise serializers.ValidationError(_("OTP code must contain only numbers"))
        
        # Check length
        if len(value) not in [6, 7, 8]:
            raise serializers.ValidationError(_("OTP code must be 6-8 digits"))
        
        return value


class MFADisableSerializer(serializers.Serializer):
    """
    Serializer for disabling MFA
    Requires confirmation to prevent accidental disable
    """
    confirm = serializers.BooleanField(
        required=True,
        help_text="Confirmation flag - must be true"
    )
    device_id = serializers.CharField(
        max_length=36, 
        required=False, 
        allow_null=True,
        help_text="Optional device ID to disable specific device only"
    )
    
    def validate_confirm(self, value):
        """Ensure confirmation is explicitly true"""
        if not value:
            raise serializers.ValidationError(
                _("You must confirm MFA disable by setting confirm=true")
            )
        return value


class MFASetPrimarySerializer(serializers.Serializer):
    """
    Serializer for setting primary MFA device
    """
    device_id = serializers.CharField(
        max_length=36, 
        required=True,
        help_text="ID of the device to set as primary"
    )
    
    def validate_device_id(self, value):
        """Validate device exists and is active"""
        request = self.context.get('request')
        if request and request.user:
            device = MFADevice.objects.filter(
                id=value, 
                user=request.user, 
                is_active=True,
                is_deleted=False
            ).first()
            
            if not device:
                raise serializers.ValidationError(
                    _("Device not found or inactive")
                )
            
            if not device.is_verified:
                raise serializers.ValidationError(
                    _("Cannot set unverified device as primary")
                )
        
        return value


# ============================================================================
# MFA Setup Serializers
# ============================================================================

class MFASetupTOTPSerializer(serializers.Serializer):
    """
    Serializer for initiating TOTP setup
    """
    device_name = serializers.CharField(
        max_length=100, 
        default="Authenticator",
        validators=[MinLengthValidator(1)],
        help_text="Name for this device (e.g., 'Google Authenticator')"
    )
    
    def validate_device_name(self, value):
        """Validate device name not already used"""
        request = self.context.get('request')
        if request and request.user:
            if MFADevice.objects.filter(
                user=request.user, 
                name=value, 
                device_type='totp',
                is_deleted=False
            ).exists():
                raise serializers.ValidationError(
                    _("You already have a TOTP device with this name")
                )
        return value.strip()


class MFAVerifySetupSerializer(serializers.Serializer):
    """
    Serializer for verifying TOTP setup with OTP
    """
    otp = serializers.CharField(
        max_length=8, 
        required=True,
        validators=[MinLengthValidator(6)],
        help_text="OTP code from authenticator app"
    )
    device_id = serializers.CharField(
        max_length=36, 
        required=True,
        help_text="Device ID from setup response"
    )
    
    def validate_otp(self, value):
        """Validate OTP format"""
        value = value.strip().replace(' ', '')
        if not value.isdigit():
            raise serializers.ValidationError(_("OTP code must contain only numbers"))
        return value
    
    def validate_device_id(self, value):
        """Validate device exists and belongs to user"""
        request = self.context.get('request')
        if request and request.user:
            device = MFADevice.objects.filter(
                id=value, 
                user=request.user, 
                device_type='totp',
                is_deleted=False
            ).first()
            
            if not device:
                raise serializers.ValidationError(
                    _("Device not found")
                )
            
            if device.is_verified:
                raise serializers.ValidationError(
                    _("Device already verified")
            )
        
        return value


# ============================================================================
# Audit Log Serializers
# ============================================================================

class MFAAuditLogSerializer(serializers.ModelSerializer):
    """
    Audit log serializer with enhanced fields
    """
    user = UserMinimalSerializer(read_only=True)
    device_name = serializers.CharField(source='device.name', read_only=True, default=None)
    device_type = serializers.CharField(source='device.device_type', read_only=True, default=None)
    event_type_display = serializers.SerializerMethodField()
    success_display = serializers.SerializerMethodField()
    
    class Meta:
        model = MFAAuditLog
        fields = [
            'id', 'user', 'device', 'device_name', 'device_type',
            'event_type', 'event_type_display', 'success', 'success_display',
            'ip_address', 'user_agent', 'message', 'metadata', 'request_id',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_event_type_display(self, obj):
        return dict(MFAAuditLog.EVENT_CHOICES).get(obj.event_type, obj.event_type)
    
    def get_success_display(self, obj):
        return "Success" if obj.success else "Failed"


class MFAAuditLogDetailSerializer(MFAAuditLogSerializer):
    """
    Detailed audit log with additional metadata formatting
    """
    
    class Meta(MFAAuditLogSerializer.Meta):
        fields = MFAAuditLogSerializer.Meta.fields + ['metadata']
        
    def to_representation(self, instance):
        """Format metadata for better readability"""
        data = super().to_representation(instance)
        
        # Pretty format metadata
        if data.get('metadata'):
            # Remove internal fields if needed
            if 'password' in data['metadata']:
                data['metadata']['password'] = '***'
        
        return data


# ============================================================================
# MFA Status Serializers
# ============================================================================

class MFADeviceStatusSerializer(serializers.Serializer):
    """
    Serializer for MFA status endpoint
    """
    id = serializers.CharField()
    name = serializers.CharField()
    device_type = serializers.CharField()
    device_type_display = serializers.CharField()
    is_active = serializers.BooleanField()
    is_primary = serializers.BooleanField()
    is_verified = serializers.BooleanField()
    is_locked = serializers.BooleanField()


class MFAMethodStatusSerializer(serializers.Serializer):
    """
    Serializer for individual MFA method status
    """
    enabled = serializers.BooleanField()
    configured = serializers.BooleanField()
    verified = serializers.BooleanField()
    primary = serializers.BooleanField()
    last_used = serializers.DateTimeField(allow_null=True)


class MFAMFAStatusSerializer(serializers.Serializer):
    """
    Complete MFA status serializer
    """
    enabled = serializers.BooleanField()
    has_active_devices = serializers.BooleanField()
    active_devices_count = serializers.IntegerField()
    verified_devices_count = serializers.IntegerField()
    backup_codes_remaining = serializers.IntegerField()
    requires_mfa = serializers.BooleanField()
    primary_device = MFADeviceStatusSerializer(allow_null=True)
    
    # Method-specific status
    totp = MFAMethodStatusSerializer()
    backup_codes = MFAMethodStatusSerializer()


# ============================================================================
# Error Response Serializers
# ============================================================================

class MFAErrorSerializer(serializers.Serializer):
    """
    Standard MFA error response format
    """
    error = serializers.CharField()
    code = serializers.CharField(required=False)
    details = serializers.DictField(required=False)
    timestamp = serializers.DateTimeField(read_only=True)
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        from django.utils import timezone
        if 'timestamp' not in data:
            data['timestamp'] = timezone.now()
        return data


class MFASuccessSerializer(serializers.Serializer):
    """
    Standard MFA success response format
    """
    message = serializers.CharField()
    data = serializers.DictField(required=False)
    timestamp = serializers.DateTimeField(read_only=True)
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        from django.utils import timezone
        if 'timestamp' not in data:
            data['timestamp'] = timezone.now()
        return data