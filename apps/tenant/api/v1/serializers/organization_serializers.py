from rest_framework import serializers
from apps.tenant.models import Organization, OrganizationSector
from apps.tenant.services import OrganizationService


class OrganizationSectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationSector
        fields = ['id', 'name', 'code', 'sector_type', 'description', 'icon', 'color', 'is_active']
        read_only_fields = ['id', 'created_at', 'updated_at']


class OrganizationListSerializer(serializers.ModelSerializer):
    sector_name = serializers.CharField(source='sector.name', read_only=True, allow_null=True)
    sector_type = serializers.CharField(source='sector.sector_type', read_only=True, allow_null=True)
    primary_domain = serializers.SerializerMethodField()
    user_count = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = [
            'id', 'name', 'slug', 'sector', 'sector_name', 'sector_type',
            'status', 'is_active', 'is_onboarded', 'contact_email',
            'primary_domain', 'user_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

    def get_primary_domain(self, obj):
        try:
            domain = obj.domains.filter(is_primary=True, is_deleted=False).first()
            return domain.domain if domain else None
        except Exception:
            return None

    def get_user_count(self, obj):
        try:
            from apps.accounts.models import User
            return User.objects.filter(tenant_id=obj.id, is_active=True).count()
        except Exception:
            return 0


class OrganizationDetailSerializer(serializers.ModelSerializer):
    sector = OrganizationSectorSerializer(read_only=True)
    sector_id = serializers.PrimaryKeyRelatedField(
        source='sector',
        queryset=OrganizationSector.objects.filter(is_active=True),
        write_only=True,
        required=False
    )
    domains = serializers.SerializerMethodField()
    schema_info = serializers.SerializerMethodField()
    resources = serializers.SerializerMethodField()
    primary_domain = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = [
            'id', 'name', 'slug', 'sector', 'sector_id', 'status',
            'is_active', 'is_onboarded', 'onboarded_at',
            'contact_email', 'contact_phone', 'contact_address',
            'website', 'logo', 'favicon',
            'primary_color', 'secondary_color',
            'subscription_tier', 'metadata',
            'domains', 'schema_info', 'resources', 'primary_domain',
            'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = [
            'id', 'slug', 'onboarded_at', 'created_at', 'updated_at',
            'created_by', 'updated_by'
        ]

    def get_domains(self, obj):
        try:
            from apps.tenant.api.v1.serializers import DomainSerializer
            domains = obj.domains.filter(is_deleted=False)
            return DomainSerializer(domains, many=True).data
        except Exception:
            return []

    def get_schema_info(self, obj):
        try:
            if hasattr(obj, 'schema') and obj.schema:
                from apps.tenant.api.v1.serializers import SchemaSerializer
                return SchemaSerializer(obj.schema).data
        except Exception:
            pass
        return None

    def get_resources(self, obj):
        try:
            from apps.tenant.api.v1.serializers import ResourceSerializer
            resources = obj.resources.all()
            return ResourceSerializer(resources, many=True).data
        except Exception:
            return []

    def get_primary_domain(self, obj):
        try:
            domain = obj.domains.filter(is_primary=True, is_deleted=False).first()
            return domain.domain if domain else None
        except Exception:
            return None


class OrganizationCreateSerializer(serializers.ModelSerializer):
    sector_id = serializers.UUIDField(required=False, allow_null=True)

    class Meta:
        model = Organization
        fields = [
            'name', 'contact_email', 'contact_phone', 'contact_address',
            'website', 'sector_id', 'primary_color', 'secondary_color',
            'logo', 'favicon', 'subscription_tier', 'metadata'
        ]

    def validate_name(self, value):
        if Organization.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError(f"Organization with name '{value}' already exists")
        return value

    def validate_contact_email(self, value):
        from django.core.validators import EmailValidator
        EmailValidator()(value)
        return value

    def validate_sector_id(self, value):
        if value and not OrganizationSector.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError(f"Sector with ID '{value}' not found")
        return value

    def create(self, validated_data):
        from apps.tenant.exceptions import OrganizationAlreadyExistsError, OrganizationInvalidError
        service = OrganizationService()
        request = self.context.get('request')
        user = request.user if request else None
        try:
            return service.create_organization(validated_data, user=user)
        except (OrganizationAlreadyExistsError, OrganizationInvalidError) as exc:
            raise serializers.ValidationError(str(exc))


class OrganizationUpdateSerializer(serializers.ModelSerializer):
    sector_id = serializers.UUIDField(required=False, allow_null=True)

    class Meta:
        model = Organization
        fields = [
            'name', 'contact_email', 'contact_phone', 'contact_address',
            'website', 'sector_id', 'primary_color', 'secondary_color',
            'logo', 'favicon', 'subscription_tier', 'status', 'metadata',
            'is_active'
        ]

    def validate_name(self, value):
        instance = self.instance
        if Organization.objects.filter(name__iexact=value).exclude(id=instance.id).exists():
            raise serializers.ValidationError(f"Organization with name '{value}' already exists")
        return value

    def validate_sector_id(self, value):
        if value and not OrganizationSector.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError(f"Sector with ID '{value}' not found")
        return value

    def update(self, instance, validated_data):
        from apps.tenant.exceptions import OrganizationInvalidError, OrganizationError
        service = OrganizationService()
        request = self.context.get('request')
        user = request.user if request else None
        try:
            return service.update_organization(instance.id, validated_data, user=user)
        except (OrganizationInvalidError, OrganizationError) as exc:
            raise serializers.ValidationError(str(exc))


class OrganizationOnboardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ['id', 'name', 'slug', 'status', 'is_onboarded', 'onboarded_at']
        read_only_fields = ['id', 'name', 'slug', 'status', 'is_onboarded', 'onboarded_at']


class OrganizationSerializer(serializers.ModelSerializer):
    sector_name = serializers.CharField(source='sector.name', read_only=True, allow_null=True)
    sector_type = serializers.CharField(source='sector.sector_type', read_only=True, allow_null=True)
    primary_domain = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = [
            'id', 'name', 'slug', 'sector', 'sector_name', 'sector_type',
            'status', 'is_active', 'is_onboarded', 'contact_email',
            'contact_phone', 'contact_address', 'website',
            'primary_color', 'secondary_color', 'logo', 'favicon',
            'subscription_tier', 'primary_domain', 'metadata',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

    def get_primary_domain(self, obj):
        try:
            domain = obj.domains.filter(is_primary=True, is_deleted=False).first()
            return domain.domain if domain else None
        except Exception:
            return None