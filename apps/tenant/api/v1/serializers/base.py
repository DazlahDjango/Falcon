# apps/tenant/api/v1/serializers/base.py
"""
Base Serializer for Tenant Module
Provides common validation, formatting, and utility methods for all tenant serializers.
"""

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import ValidationError
import re
import uuid
from datetime import datetime, date


class BaseSerializer(serializers.Serializer):
    """
    Base serializer with common validation and utility methods.
    All tenant serializers should inherit from this class.
    """
    
    # Common validation patterns
    EMAIL_REGEX = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    SLUG_REGEX = r'^[a-z0-9]+(?:-[a-z0-9]+)*$'
    DOMAIN_REGEX = r'^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$'
    UUID_REGEX = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    PHONE_REGEX = r'^\+?1?\d{9,15}$'
    COLOR_HEX_REGEX = r'^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
    
    def __init__(self, *args, **kwargs):
        """
        Initialize serializer with optional context and metadata.
        """
        # Extract partial flag for PATCH requests
        self.partial = kwargs.pop('partial', False)
        super().__init__(*args, **kwargs)
    
    def validate(self, attrs):
        """
        Base validation method - can be overridden by child classes.
        """
        return attrs
    
    def validate_uuid(self, value, field_name="id"):
        """
        Validate UUID format.
        
        Args:
            value: The value to validate
            field_name: Name of the field for error message
        
        Returns:
            str: Validated UUID as string
        
        Raises:
            ValidationError: If UUID format is invalid
        """
        if not value:
            return None
        
        if isinstance(value, uuid.UUID):
            return str(value)
        
        if not re.match(self.UUID_REGEX, str(value)):
            raise ValidationError(
                _("{field_name} must be a valid UUID").format(field_name=field_name)
            )
        
        return str(value)
    
    def validate_slug(self, value):
        """
        Validate slug format (lowercase letters, numbers, hyphens).
        
        Args:
            value: The slug to validate
        
        Returns:
            str: Validated slug
        
        Raises:
            ValidationError: If slug format is invalid
        """
        if not value:
            return value
        
        if not re.match(self.SLUG_REGEX, value):
            raise ValidationError(
                _("Slug must contain only lowercase letters, numbers, and hyphens")
            )
        
        if len(value) < 3:
            raise ValidationError(_("Slug must be at least 3 characters long"))
        
        if len(value) > 100:
            raise ValidationError(_("Slug must not exceed 100 characters"))
        
        return value.lower()
    
    def validate_domain(self, value):
        """
        Validate domain name format.
        
        Args:
            value: The domain to validate
        
        Returns:
            str: Validated domain (lowercase)
        
        Raises:
            ValidationError: If domain format is invalid
        """
        if not value:
            return value
        
        value = value.lower().strip()
        
        if not re.match(self.DOMAIN_REGEX, value):
            raise ValidationError(_("Please enter a valid domain name"))
        
        if len(value) > 255:
            raise ValidationError(_("Domain name must not exceed 255 characters"))
        
        return value
    
    def validate_email(self, value):
        """
        Validate email format.
        
        Args:
            value: The email to validate
        
        Returns:
            str: Validated email (lowercase)
        
        Raises:
            ValidationError: If email format is invalid
        """
        if not value:
            return value
        
        value = value.lower().strip()
        
        if not re.match(self.EMAIL_REGEX, value):
            raise ValidationError(_("Please enter a valid email address"))
        
        if len(value) > 254:
            raise ValidationError(_("Email address must not exceed 254 characters"))
        
        return value
    
    def validate_phone(self, value):
        """
        Validate phone number format.
        
        Args:
            value: The phone number to validate
        
        Returns:
            str: Validated phone number
        
        Raises:
            ValidationError: If phone format is invalid
        """
        if not value:
            return value
        
        # Remove common separators
        cleaned = re.sub(r'[\s\(\)\-\.\+]', '', value)
        
        if not re.match(self.PHONE_REGEX, cleaned):
            raise ValidationError(
                _("Please enter a valid phone number (10-15 digits, optional + prefix)")
            )
        
        return value
    
    def validate_color_hex(self, value):
        """
        Validate HEX color code.
        
        Args:
            value: The color code to validate
        
        Returns:
            str: Validated color code
        
        Raises:
            ValidationError: If color format is invalid
        """
        if not value:
            return value
        
        if not re.match(self.COLOR_HEX_REGEX, value):
            raise ValidationError(_("Please enter a valid HEX color code (e.g., #FF0000 or #F00)"))
        
        return value.upper()
    
    def validate_date_range(self, start_date, end_date, allow_same=True):
        """
        Validate date range.
        
        Args:
            start_date: Start date
            end_date: End date
            allow_same: Whether start and end can be the same
        
        Returns:
            tuple: (validated_start, validated_end)
        
        Raises:
            ValidationError: If date range is invalid
        """
        if not start_date or not end_date:
            return start_date, end_date
        
        if start_date > end_date:
            raise ValidationError(_("Start date must be before end date"))
        
        if not allow_same and start_date == end_date:
            raise ValidationError(_("Start date and end date cannot be the same"))
        
        return start_date, end_date
    
    def validate_json_field(self, value, required_keys=None):
        """
        Validate JSON field structure.
        
        Args:
            value: JSON data to validate
            required_keys: List of required keys
        
        Returns:
            dict: Validated JSON data
        
        Raises:
            ValidationError: If JSON structure is invalid
        """
        if not value:
            return value or {}
        
        if not isinstance(value, dict):
            raise ValidationError(_("Value must be a valid JSON object"))
        
        if required_keys:
            missing_keys = [key for key in required_keys if key not in value]
            if missing_keys:
                raise ValidationError(
                    _("Missing required keys: {keys}").format(keys=', '.join(missing_keys))
                )
        
        return value
    
    def validate_percentage(self, value, field_name="percentage"):
        """
        Validate percentage value (0-100).
        
        Args:
            value: Percentage value
            field_name: Name of the field for error message
        
        Returns:
            float: Validated percentage
        
        Raises:
            ValidationError: If percentage is out of range
        """
        if value is None:
            return value
        
        try:
            value = float(value)
        except (TypeError, ValueError):
            raise ValidationError(_("{field_name} must be a number").format(field_name=field_name))
        
        if value < 0 or value > 100:
            raise ValidationError(
                _("{field_name} must be between 0 and 100").format(field_name=field_name)
            )
        
        return value
    
    def validate_enum(self, value, choices, field_name="field"):
        if not value:
            return value
        
        valid_choices = list(choices.keys()) if isinstance(choices, dict) else list(choices)
        
        if value not in valid_choices:
            raise ValidationError(
                _("Invalid {field_name} value. Choose from: {choices}").format(
                    field_name=field_name,
                    choices=', '.join(str(c) for c in valid_choices)
                )
            )
        
        return value
    
    def validate_positive_integer(self, value, field_name="value", allow_zero=False):
        if value is None:
            return value
        
        try:
            value = int(value)
        except (TypeError, ValueError):
            raise ValidationError(_("{field_name} must be an integer").format(field_name=field_name))
        
        if allow_zero and value < 0:
            raise ValidationError(_("{field_name} cannot be negative").format(field_name=field_name))
        elif not allow_zero and value <= 0:
            raise ValidationError(_("{field_name} must be greater than zero").format(field_name=field_name))
        
        return value
    
    def validate_positive_decimal(self, value, field_name="value", allow_zero=False):
        if value is None:
            return value
        
        try:
            from decimal import Decimal
            value = Decimal(str(value))
        except (TypeError, ValueError, ImportError):
            try:
                value = float(value)
            except (TypeError, ValueError):
                raise ValidationError(_("{field_name} must be a number").format(field_name=field_name))
        
        if allow_zero and value < 0:
            raise ValidationError(_("{field_name} cannot be negative").format(field_name=field_name))
        elif not allow_zero and value <= 0:
            raise ValidationError(_("{field_name} must be greater than zero").format(field_name=field_name))
        
        return value
    
    def truncate_string(self, value, max_length, field_name=None):
        if not value or len(value) <= max_length:
            return value
        
        if field_name:
            self.add_warning(field_name, f"Truncated to {max_length} characters")
        
        return value[:max_length]
    
    def add_warning(self, field_name, message):
        if not hasattr(self, '_warnings'):
            self._warnings = {}
        
        if field_name not in self._warnings:
            self._warnings[field_name] = []
        
        self._warnings[field_name].append(message)
    
    def get_warnings(self):
        return getattr(self, '_warnings', {})
    
    def clear_warnings(self):
        if hasattr(self, '_warnings'):
            self._warnings = {}
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        for key, value in representation.items():
            if isinstance(value, uuid.UUID):
                representation[key] = str(value)
            elif isinstance(value, datetime):
                representation[key] = value.isoformat()
            elif isinstance(value, date):
                representation[key] = value.isoformat()
        return representation
    
    def to_internal_value(self, data):
        for field_name, field in self.fields.items():
            if not field.required and data.get(field_name) == '':
                data[field_name] = None
        return super().to_internal_value(data)
    
    def create(self, validated_data):
        raise NotImplementedError("Subclasses must implement create() method")
    def update(self, instance, validated_data):
        raise NotImplementedError("Subclasses must implement update() method")
    class Meta:
        abstract = True

class BaseModelSerializer(BaseSerializer, serializers.ModelSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if hasattr(self.Meta, 'read_only_fields'):
            for field_name in self.Meta.read_only_fields:
                if field_name in self.fields:
                    self.fields[field_name].read_only = True
    
    def validate(self, attrs):
        attrs = super().validate(attrs)
        if hasattr(self.Meta, 'unique_together') and hasattr(self, 'instance'):
            self._validate_unique_constraints(attrs)
        
        return attrs
    
    def _validate_unique_constraints(self, attrs):
        for unique_fields in getattr(self.Meta, 'unique_together', []):
            values = {}
            all_present = True
            
            for field in unique_fields:
                if field in attrs:
                    values[field] = attrs[field]
                elif hasattr(self.instance, field):
                    values[field] = getattr(self.instance, field)
                else:
                    all_present = False
                    break
            
            if all_present and len(values) == len(unique_fields):
                # Check if any instance with these values exists
                queryset = self.Meta.model.objects.filter(**values)
                if self.instance:
                    queryset = queryset.exclude(pk=self.instance.pk)
                if queryset.exists():
                    field_names = ' and '.join(unique_fields)
                    raise ValidationError(
                        {field: _("This combination of values already exists.") for field in unique_fields},
                        code='unique_together'
                    )
    
    def create(self, validated_data):
        return self.Meta.model.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
    class Meta:
        abstract = True

class ListSerializer(BaseSerializer):
    count = serializers.IntegerField(read_only=True)
    next = serializers.URLField(read_only=True, allow_null=True)
    previous = serializers.URLField(read_only=True, allow_null=True)
    results = serializers.ListField(read_only=True)
    
    def to_representation(self, instance):
        if isinstance(instance, dict):
            return {
                'count': instance.get('count', 0),
                'next': instance.get('next'),
                'previous': instance.get('previous'),
                'results': instance.get('results', [])
            }
        # Handle queryset (when not paginated)
        return {
            'count': instance.count() if hasattr(instance, 'count') else len(instance),
            'next': None,
            'previous': None,
            'results': super().to_representation(instance) if hasattr(instance, '__iter__') else instance
        }


class ErrorSerializer(BaseSerializer):
    success = serializers.BooleanField(default=False, read_only=True)
    error = serializers.CharField(read_only=True)
    code = serializers.CharField(read_only=True, required=False)
    details = serializers.DictField(read_only=True, required=False)
    timestamp = serializers.DateTimeField(read_only=True)
    correlation_id = serializers.CharField(read_only=True, required=False)
    
    def to_representation(self, instance):
        return {
            'success': False,
            'error': instance.get('error', 'An error occurred'),
            'code': instance.get('code', 'UNKNOWN_ERROR'),
            'details': instance.get('details', {}),
            'timestamp': instance.get('timestamp', datetime.now().isoformat()),
            'correlation_id': instance.get('correlation_id'),
        }


class SuccessSerializer(BaseSerializer):
    success = serializers.BooleanField(default=True, read_only=True)
    message = serializers.CharField(read_only=True)
    data = serializers.DictField(read_only=True, required=False)
    timestamp = serializers.DateTimeField(read_only=True)
    
    def to_representation(self, instance):
        return {
            'success': True,
            'message': instance.get('message', 'Operation completed successfully'),
            'data': instance.get('data'),
            'timestamp': instance.get('timestamp', datetime.now().isoformat()),
        }