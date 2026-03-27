from rest_framework import serializers
from django.utils.translation import gettext_lazy as _ 
from django.core.exceptions import ValidationError as DjangoValidationError

class BaseSerializer(serializers.Serializer):
    def validate(self, attrs):
        return attrs
    
    def validate_fields(self, value, field_name, validators=None):
        if validators:
            for validator in validators:
                try:
                    validator(value)
                except DjangoValidationError as e:
                    raise serializers.ValidationError({field_name: e.message})
        return value
    
class DynamicFieldsModelSerializer(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs):
        fields = kwargs.pop('fields', None)
        exclude = kwargs.pop('exclude', None)
        super().__init__(*args, **kwargs)
        if fields is not None:
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)
        if exclude is not None:
            for field_name in exclude:
                if field_name in self.fields:
                    self.fields.pop(field_name)

class TenantAwareSerializer(serializers.Serializer):
    tenant_id = serializers.UUIDField(read_only=True)
    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            validated_data['tenant_id'] = request.user.tenant_id
        return super().create(validated_data)

class AuditSerializer(serializers.Serializer):
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    created_by = serializers.PrimaryKeyRelatedField(read_only=True)
    modified_by = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        abstract = True