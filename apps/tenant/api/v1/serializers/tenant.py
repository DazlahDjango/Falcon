# apps/tenant/api/v1/serializers/tenant.py
"""
Serializers for Tenant (Client) model.
"""

from rest_framework import serializers
from django.utils import timezone
import re
from apps.tenant.models import Client
from apps.tenant.constants import SubscriptionPlan, TenantStatus


class TenantSerializer(serializers.ModelSerializer):
    """Base serializer for Tenant model."""

    class Meta:
        model = Client
        fields = [
            'id', 'name', 'slug', 'domain', 'subscription_plan',
            'subscription_expires_at', 'status', 'is_active', 'is_verified',
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
            'name',
            'slug',
            'domain',
            'subscription_plan',
            'contact_email',
            'contact_phone',
            'address',
            'city',
            'country',
            'primary_color',
            'secondary_color',
            'settings',
            'features',
        ]

    def validate_name(self, value):
        """Ensure tenant name is unique."""
        if Client.objects.filter(name=value, is_deleted=False).exists():
            raise serializers.ValidationError("A tenant with this name already exists.")
        return value

    def validate_slug(self, value):
        """Validate slug format and uniqueness."""
        if not value:
            raise serializers.ValidationError("Slug is required")
        
        # Convert to lowercase and replace spaces with hyphens
        value = value.lower().replace(' ', '-')
        
        # Remove invalid characters
        value = re.sub(r'[^a-z0-9-]', '', value)
        
        # Check if slug is unique
        if Client.objects.filter(slug=value, is_deleted=False).exists():
            raise serializers.ValidationError("A tenant with this slug already exists.")
        return value

    def validate_domain(self, value):
        """Validate domain format and uniqueness."""
        if value:
            # Basic domain validation
            if not re.match(r'^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', value):
                raise serializers.ValidationError("Enter a valid domain name.")
            
            if Client.objects.filter(domain=value, is_deleted=False).exists():
                raise serializers.ValidationError("This domain is already registered.")
        return value

    def validate_contact_email(self, value):
        """Validate contact email."""
        if not value:
            raise serializers.ValidationError("Contact email is required.")
        return value.lower()

    def validate_primary_color(self, value):
        """Validate hex color."""
        if value and not re.match(r'^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$', value):
            raise serializers.ValidationError("Enter a valid hex color code (e.g., #2563eb).")
        return value

    def validate_secondary_color(self, value):
        """Validate hex color."""
        if value and not re.match(r'^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$', value):
            raise serializers.ValidationError("Enter a valid hex color code (e.g., #7c3aed).")
        return value

    def create(self, validated_data):
        """Create tenant with default values."""
        # Extract subscription plan
        subscription_plan = validated_data.get('subscription_plan', SubscriptionPlan.TRIAL)
        
        # Set default subscription expiry for trial (30 days)
        subscription_expires_at = None
        if subscription_plan == SubscriptionPlan.TRIAL:
            subscription_expires_at = timezone.now() + timezone.timedelta(days=30)
        
        # Create tenant - system sets is_active and is_verified
        tenant = Client.objects.create(
            **validated_data,
            subscription_expires_at=subscription_expires_at,
            is_active=True,      # ✅ System-controlled
            is_verified=False,   # ✅ System-controlled
        )
        
        return tenant


class TenantUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating an existing tenant."""

    class Meta:
        model = Client
        fields = [
            'name', 'domain', 'contact_email', 'contact_phone',
            'address', 'city', 'country', 'primary_color', 'secondary_color',
            'logo', 'favicon', 'settings', 'features', 'status', 'is_active', 'is_verified'
        ]

    def validate_name(self, value):
        """Ensure name is unique (excluding current tenant)."""
        if self.instance and Client.objects.filter(
            name=value, is_deleted=False
        ).exclude(id=self.instance.id).exists():
            raise serializers.ValidationError("A tenant with this name already exists.")
        return value

    def validate_domain(self, value):
        """Validate domain format and uniqueness."""
        if value:
            if not re.match(r'^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', value):
                raise serializers.ValidationError("Enter a valid domain name.")

            if self.instance and Client.objects.filter(
                domain=value, is_deleted=False
            ).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("This domain is already registered.")
        return value


class TenantDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer with additional computed fields."""

    is_trial = serializers.BooleanField(read_only=True)
    is_subscription_active = serializers.BooleanField(read_only=True)
    days_until_expiry = serializers.SerializerMethodField()
    user_count = serializers.SerializerMethodField()
    resource_summary = serializers.SerializerMethodField()
    branding = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = [
            'id', 'name', 'slug', 'domain', 'schema_type', 'database_name',
            'subscription_plan', 'subscription_expires_at', 'status', 'is_active', 'is_verified',
            'is_trial', 'is_subscription_active', 'days_until_expiry',
            'contact_email', 'contact_phone', 'address', 'city', 'country',
            'primary_color', 'secondary_color', 'logo', 'favicon',
            'user_count', 'resource_summary', 'branding',
            'settings', 'features', 'metadata',
            'created_at', 'updated_at', 'provisioned_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at', 'provisioned_at']

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
        from apps.tenant.constants import ResourceType

        resources = TenantResource.objects.filter(tenant_id=obj.id, is_deleted=False)
        return {
            r.resource_type: {
                'current': r.current_value,
                'limit': r.limit_value,
                'percentage': round((r.current_value / r.limit_value) * 100, 1) if r.limit_value > 0 else 0,
            }
            for r in resources
        }

    def get_branding(self, obj):
        """Get branding information."""
        return obj.get_branding()


class TenantListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list views."""

    user_count = serializers.SerializerMethodField()
    display_status = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = [
            'id', 'name', 'slug', 'subscription_plan', 'is_active',
            'is_verified', 'user_count', 'status', 'display_status', 'created_at'
        ]

    def get_user_count(self, obj):
        from apps.accounts.models import User
        return User.objects.filter(tenant_id=obj.id, is_deleted=False).count()

    def get_display_status(self, obj):
        """Get tenant status."""
        if not obj.is_active:
            return 'inactive'
        if obj.subscription_expires_at and obj.subscription_expires_at < timezone.now():
            return 'expired'
        if obj.subscription_plan == SubscriptionPlan.TRIAL:
            days_left = (obj.subscription_expires_at - timezone.now()).days if obj.subscription_expires_at else 30
            if days_left <= 7:
                return 'trial_expiring_soon'
            return 'trial'
        return 'active'