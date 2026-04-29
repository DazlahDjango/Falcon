# apps/tenant/api/v1/serializers/tenant.py
"""
Serializers for Tenant (Client) model.
"""

from rest_framework import serializers
from django.utils import timezone

from apps.tenant.models import Client
from apps.tenant.constants import SubscriptionPlan, TenantStatus


class TenantSerializer(serializers.ModelSerializer):
    """Base serializer for Tenant model."""

    class Meta:
        model = Client
        fields = [
            'id', 'name', 'slug', 'domain', 'subscription_plan',
            'subscription_expires_at', 'is_active', 'is_verified',
            'contact_email', 'contact_phone', 'address', 'city', 'country',
            'primary_color', 'secondary_color', 'logo', 'favicon',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']


class TenantCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new tenant."""

    class Meta:
        model = Client
        fields = [
            'name', 'domain', 'subscription_plan', 'contact_email',
            'contact_phone', 'address', 'city', 'country'
        ]

    def validate_name(self, value):
        """Ensure tenant name is unique."""
        if Client.objects.filter(name=value, is_deleted=False).exists():
            raise serializers.ValidationError(
                "A tenant with this name already exists.")
        return value

    def validate_domain(self, value):
        """Validate domain format."""
        if value:
            from apps.tenant.validators import validate_domain
            validate_domain(value)

            if Client.objects.filter(domain=value, is_deleted=False).exists():
                raise serializers.ValidationError(
                    "This domain is already registered.")
        return value

    def create(self, validated_data):
        """Create tenant with default values."""
        if 'subscription_plan' not in validated_data:
            validated_data['subscription_plan'] = SubscriptionPlan.TRIAL

        return Client.objects.create(**validated_data)


class TenantUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating an existing tenant."""

    class Meta:
        model = Client
        fields = [
            'name', 'domain', 'contact_email', 'contact_phone',
            'address', 'city', 'country', 'primary_color', 'secondary_color',
            'logo', 'favicon', 'settings', 'features', 'is_active', 'is_verified'
        ]

    def validate_name(self, value):
        """Ensure name is unique (excluding current tenant)."""
        if self.instance and Client.objects.filter(
            name=value, is_deleted=False
        ).exclude(id=self.instance.id).exists():
            raise serializers.ValidationError(
                "A tenant with this name already exists.")
        return value

    def validate_domain(self, value):
        """Validate domain format and uniqueness."""
        if value:
            from apps.tenant.validators import validate_domain
            validate_domain(value)

            if self.instance and Client.objects.filter(
                domain=value, is_deleted=False
            ).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError(
                    "This domain is already registered.")
        return value


class TenantDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer with additional computed fields."""

    is_trial = serializers.BooleanField(read_only=True)
    is_subscription_active = serializers.BooleanField(read_only=True)
    days_until_expiry = serializers.SerializerMethodField()
    user_count = serializers.SerializerMethodField()
    resource_summary = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = [
            'id', 'name', 'slug', 'domain', 'subscription_plan',
            'subscription_expires_at', 'is_active', 'is_verified',
            'is_trial', 'is_subscription_active', 'days_until_expiry',
            'contact_email', 'contact_phone', 'address', 'city', 'country',
            'primary_color', 'secondary_color', 'logo', 'favicon',
            'user_count', 'resource_summary', 'settings', 'features', 'metadata',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

    def get_days_until_expiry(self, obj):
        """Calculate days until subscription expires."""
        if obj.subscription_expires_at:
            delta = obj.subscription_expires_at - timezone.now()
            return max(0, delta.days)
        return None

    def get_user_count(self, obj):
        """Get number of users in this tenant."""
        from apps.accounts.models import User
        return User.objects.filter(tenant_id=obj.id, is_deleted=False).count()

    def get_resource_summary(self, obj):
        """Get resource usage summary."""
        from apps.tenant.models import TenantResource

        resources = TenantResource.objects.filter(tenant_id=obj.id)
        return {
            r.resource_type: {
                'current': r.current_value,
                'limit': r.limit_value,
                'percentage': round((r.current_value / r.limit_value) * 100, 1) if r.limit_value > 0 else 0,
            }
            for r in resources
        }


class TenantListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list views."""

    user_count = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = [
            'id', 'name', 'slug', 'subscription_plan', 'is_active',
            'is_verified', 'user_count', 'created_at'
        ]

    def get_user_count(self, obj):
        from apps.accounts.models import User
        return User.objects.filter(tenant_id=obj.id, is_deleted=False).count()
