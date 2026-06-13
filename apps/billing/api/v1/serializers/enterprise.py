from rest_framework import serializers
from django.utils import timezone

class DynamicFeatureSerializer(serializers.Serializer):
    feature_key = serializers.CharField(max_length=100)
    feature_value = serializers.CharField(max_length=255)
    feature_type = serializers.ChoiceField(choices=['integer', 'boolean', 'string', 'json'], default='integer')
    display_name = serializers.CharField(required=False, allow_blank=True)
    display_icon = serializers.CharField(required=False, allow_blank=True)
    display_order = serializers.IntegerField(default=0)
    is_core_feature = serializers.BooleanField(default=False)

class DynamicPlanSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    plan_type = serializers.ChoiceField(choices=['trial', 'basic', 'professional', 'enterprise'])
    price = serializers.IntegerField(min_value=0)
    yearly_price = serializers.IntegerField(required=False, allow_null=True)
    description = serializers.CharField(required=False, allow_blank=True)
    max_users = serializers.IntegerField(default=10)
    max_kpis = serializers.IntegerField(default=50)
    max_departments = serializers.IntegerField(default=10)
    max_storage_mb = serializers.IntegerField(default=100)
    custom_branding = serializers.BooleanField(default=False)
    api_access = serializers.BooleanField(default=False)
    sso_enabled = serializers.BooleanField(default=False)
    advanced_analytics = serializers.BooleanField(default=False)
    priority_support = serializers.BooleanField(default=False)
    display_order = serializers.IntegerField(default=0)
    is_active = serializers.BooleanField(default=True)
    dynamic_features = serializers.ListField(child=DynamicFeatureSerializer(), required=False, default=list)

class TenantOverrideSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    tenant_id = serializers.UUIDField()
    plan_id = serializers.UUIDField()
    plan_name = serializers.CharField()
    override_type = serializers.ChoiceField(choices=['pricing', 'limits', 'features', 'all'])
    custom_price_monthly = serializers.IntegerField(allow_null=True)
    custom_price_yearly = serializers.IntegerField(allow_null=True)
    override_features = serializers.DictField()
    discount_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, allow_null=True)
    valid_from = serializers.DateTimeField()
    valid_until = serializers.DateTimeField(allow_null=True)
    is_active = serializers.BooleanField()
    approved_by = serializers.UUIDField()
    approval_notes = serializers.CharField()

class TenantOverrideCreateSerializer(serializers.Serializer):
    plan_id = serializers.UUIDField()
    custom_price_monthly = serializers.IntegerField(required=False, min_value=0)
    custom_price_yearly = serializers.IntegerField(required=False, min_value=0)
    discount_percentage = serializers.DecimalField(required=False, max_digits=5, decimal_places=2, min_value=0, max_value=100)
    override_features = serializers.DictField(required=False, default=dict)
    valid_until = serializers.DateTimeField(required=False)
    approval_notes = serializers.CharField(required=False, allow_blank=True)
    def validate(self, data):
        if not data.get('custom_price_monthly') and not data.get('custom_price_yearly') and not data.get('discount_percentage') and not data.get('override_features'):
            raise serializers.ValidationError("At least one override must be provided")
        return data

class TenantOverrideUpdateSerializer(serializers.Serializer):
    custom_price_monthly = serializers.IntegerField(required=False, min_value=0)
    custom_price_yearly = serializers.IntegerField(required=False, min_value=0)
    override_features = serializers.DictField(required=False)
    valid_until = serializers.DateTimeField(required=False)
    is_active = serializers.BooleanField(required=False)
    approval_notes = serializers.CharField(required=False, allow_blank=True)