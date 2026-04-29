# apps/tenant/api/v1/serializers/domain.py
"""
Serializers for CustomDomain model.
"""

from rest_framework import serializers
from django.utils import timezone

from apps.tenant.models import CustomDomain
from apps.tenant.constants import DomainStatus


class DomainSerializer(serializers.ModelSerializer):
    """Base serializer for CustomDomain model."""

    status_display = serializers.CharField(
        source='get_status_display', read_only=True)
    ssl_valid = serializers.SerializerMethodField()
    days_until_ssl_expiry = serializers.SerializerMethodField()

    class Meta:
        model = CustomDomain
        fields = [
            'id', 'domain', 'tenant', 'is_primary', 'status', 'status_display',
            'verified_at', 'verification_token', 'ssl_issued_at', 'ssl_expires_at',
            'ssl_issuer', 'ssl_valid', 'days_until_ssl_expiry', 'force_https',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'verification_token',
                            'created_at', 'updated_at']

    def get_ssl_valid(self, obj):
        """Check if SSL certificate is valid."""
        if obj.ssl_expires_at:
            return obj.ssl_expires_at > timezone.now()
        return False

    def get_days_until_ssl_expiry(self, obj):
        """Get days until SSL certificate expires."""
        if obj.ssl_expires_at:
            delta = obj.ssl_expires_at - timezone.now()
            return max(0, delta.days)
        return None


class DomainCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new domain."""

    class Meta:
        model = CustomDomain
        fields = ['domain', 'is_primary', 'force_https']

    def validate_domain(self, value):
        """Validate domain format and uniqueness."""
        from apps.tenant.validators import validate_domain

        validate_domain(value)

        if CustomDomain.objects.filter(domain=value, is_deleted=False).exists():
            raise serializers.ValidationError(
                "This domain is already registered.")

        return value


class DomainVerifySerializer(serializers.Serializer):
    """Serializer for domain verification."""

    domain_id = serializers.UUIDField()

    def validate_domain_id(self, value):
        """Ensure domain exists."""
        try:
            domain = CustomDomain.objects.get(id=value, is_deleted=False)
            self.context['domain'] = domain
            return value
        except CustomDomain.DoesNotExist:
            raise serializers.ValidationError("Domain not found.")


class DomainDetailSerializer(serializers.ModelSerializer):
    """Detailed domain serializer."""

    verification_dns_record = serializers.SerializerMethodField()

    class Meta:
        model = CustomDomain
        fields = '__all__'
        read_only_fields = ['id', 'verification_token',
                            'created_at', 'updated_at']

    def get_verification_dns_record(self, obj):
        """Get DNS record needed for verification."""
        return f"falcon-domain-verification={obj.verification_token.hex}"
