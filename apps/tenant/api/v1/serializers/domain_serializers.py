from rest_framework import serializers
from apps.tenant.models import OrganizationDomain, Organization
from apps.tenant.services import DomainService


class DomainSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source='organization.name', read_only=True, allow_null=True)
    days_until_expiry = serializers.SerializerMethodField()
    is_ssl_valid = serializers.SerializerMethodField()
    verification_dns_record = serializers.SerializerMethodField()

    class Meta:
        model = OrganizationDomain
        fields = [
            'id', 'domain', 'organization', 'organization_name',
            'is_primary', 'status', 'verification_token',
            'verified_at', 'verification_error',
            'ssl_issued_at', 'ssl_expires_at', 'ssl_issuer',
            'force_https', 'redirect_to', 'metadata',
            'days_until_expiry', 'is_ssl_valid', 'verification_dns_record',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'verification_token', 'verified_at', 'verification_error',
            'ssl_issued_at', 'ssl_expires_at', 'ssl_issuer',
            'created_at', 'updated_at', 'days_until_expiry',
            'is_ssl_valid', 'verification_dns_record'
        ]

    def get_days_until_expiry(self, obj):
        try:
            return obj.days_until_ssl_expiry
        except Exception:
            return None

    def get_is_ssl_valid(self, obj):
        try:
            return obj.ssl_is_valid
        except Exception:
            return False

    def get_verification_dns_record(self, obj):
        try:
            return obj.verification_dns_record
        except Exception:
            return None


class DomainCreateSerializer(serializers.ModelSerializer):
    organization_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = OrganizationDomain
        fields = ['domain', 'organization_id', 'is_primary', 'force_https', 'redirect_to']

    def validate_domain(self, value):
        import re
        domain_pattern = r'^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$'
        if not re.match(domain_pattern, value):
            raise serializers.ValidationError(f"Invalid domain format: {value}")
        if OrganizationDomain.objects.filter(domain=value, is_deleted=False).exists():
            raise serializers.ValidationError(f"Domain '{value}' is already registered")
        return value

    def validate_organization_id(self, value):
        if not Organization.objects.filter(id=value, is_deleted=False).exists():
            raise serializers.ValidationError(f"Organization with ID '{value}' not found")
        return value

    def create(self, validated_data):
        service = DomainService()
        org_id = validated_data.pop('organization_id')
        return service.add_domain(
            organization_id=org_id,
            domain_name=validated_data['domain'],
            is_primary=validated_data.get('is_primary', False)
        )


class DomainUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationDomain
        fields = ['is_primary', 'force_https', 'redirect_to', 'metadata']

    def validate(self, data):
        if data.get('is_primary') and self.instance.status != 'ACTIVE':
            raise serializers.ValidationError(
                f"Domain {self.instance.domain} must be active to set as primary"
            )
        return data

    def update(self, instance, validated_data):
        if validated_data.get('is_primary'):
            service = DomainService()
            service.set_primary_domain(instance.id)
        for field in ['force_https', 'redirect_to', 'metadata']:
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        instance.save(update_fields=['force_https', 'redirect_to', 'metadata'])
        return instance


class DomainDetailSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source='organization.name', read_only=True, allow_null=True)
    days_until_expiry = serializers.SerializerMethodField()
    is_ssl_valid = serializers.SerializerMethodField()
    verification_dns_record = serializers.SerializerMethodField()

    class Meta:
        model = OrganizationDomain
        fields = [
            'id', 'domain', 'organization', 'organization_name',
            'is_primary', 'status', 'verification_token',
            'verified_at', 'verification_error',
            'ssl_issued_at', 'ssl_expires_at', 'ssl_issuer',
            'force_https', 'redirect_to', 'metadata',
            'days_until_expiry', 'is_ssl_valid', 'verification_dns_record',
            'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = '__all__'

    def get_days_until_expiry(self, obj):
        try:
            return obj.days_until_ssl_expiry
        except Exception:
            return None

    def get_is_ssl_valid(self, obj):
        try:
            return obj.ssl_is_valid
        except Exception:
            return False

    def get_verification_dns_record(self, obj):
        try:
            return obj.verification_dns_record
        except Exception:
            return None


class DomainVerifySerializer(serializers.Serializer):
    domain_id = serializers.UUIDField(required=True)

    def validate_domain_id(self, value):
        if not OrganizationDomain.objects.filter(id=value, is_deleted=False).exists():
            raise serializers.ValidationError(f"Domain with ID '{value}' not found")
        return value