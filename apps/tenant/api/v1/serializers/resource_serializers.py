from rest_framework import serializers
from apps.tenant.models import OrganizationResource, Organization, ResourceUsageSnapshot


# ------------------------------------------------------------------ #
# Base / list serializer                                               #
# ------------------------------------------------------------------ #

class ResourceSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    percentage_used = serializers.FloatField(source='percentage_used', read_only=True)
    is_exceeded = serializers.BooleanField(source='is_exceeded', read_only=True)
    is_warning = serializers.BooleanField(source='is_warning_level', read_only=True)
    is_soft_exceeded = serializers.BooleanField(source='is_soft_exceeded', read_only=True)
    is_hard_exceeded = serializers.BooleanField(source='is_hard_exceeded', read_only=True)
    alert_level = serializers.IntegerField(source='alert_level', read_only=True)
    resource_type_display = serializers.CharField(source='get_resource_type_display', read_only=True)

    class Meta:
        model = OrganizationResource
        fields = [
            'id', 'resource_type', 'resource_type_display',
            'organization', 'organization_name',
            'limit_value', 'current_value', 'remaining',
            'warning_threshold', 'last_reset_at',
            'burst_allowed', 'soft_limit_multiplier', 'hard_limit_multiplier',
            'is_synced_from_billing', 'last_billing_sync_at',
            'alert_80_sent_at', 'alert_90_sent_at', 'alert_100_sent_at',
            # Computed
            'percentage_used', 'is_exceeded', 'is_warning',
            'is_soft_exceeded', 'is_hard_exceeded', 'alert_level',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'last_reset_at', 'created_at', 'updated_at',
            'percentage_used', 'is_exceeded', 'is_warning',
            'is_soft_exceeded', 'is_hard_exceeded', 'alert_level',
            'is_synced_from_billing', 'last_billing_sync_at',
            'alert_80_sent_at', 'alert_90_sent_at', 'alert_100_sent_at',
        ]


# ------------------------------------------------------------------ #
# Create                                                               #
# ------------------------------------------------------------------ #

class ResourceCreateSerializer(serializers.ModelSerializer):
    organization_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = OrganizationResource
        fields = [
            'resource_type', 'organization_id', 'limit_value', 'warning_threshold',
            'burst_allowed', 'soft_limit_multiplier', 'hard_limit_multiplier',
        ]

    def validate_organization_id(self, value):
        if not Organization.objects.filter(id=value, is_deleted=False).exists():
            raise serializers.ValidationError(f"Organization with ID '{value}' not found.")
        return value

    def validate_resource_type(self, value):
        org_id = self.initial_data.get('organization_id')
        if OrganizationResource.objects.filter(
            organization_id=org_id,
            resource_type=value,
            is_deleted=False,
        ).exists():
            raise serializers.ValidationError(
                f"Resource '{value}' already exists for this organization."
            )
        return value

    def validate_limit_value(self, value):
        if value <= 0:
            raise serializers.ValidationError("Limit value must be greater than 0.")
        return value

    def validate_warning_threshold(self, value):
        if not (0 <= value <= 100):
            raise serializers.ValidationError("Warning threshold must be between 0 and 100.")
        return value

    def create(self, validated_data):
        org_id = validated_data.pop('organization_id')
        return OrganizationResource.objects.create(organization_id=org_id, **validated_data)


# ------------------------------------------------------------------ #
# Update                                                               #
# ------------------------------------------------------------------ #

class ResourceUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationResource
        fields = [
            'limit_value', 'warning_threshold',
            'burst_allowed', 'soft_limit_multiplier', 'hard_limit_multiplier',
        ]

    def validate_limit_value(self, value):
        if value <= 0:
            raise serializers.ValidationError("Limit value must be greater than 0.")
        return value

    def validate_warning_threshold(self, value):
        if not (0 <= value <= 100):
            raise serializers.ValidationError("Warning threshold must be between 0 and 100.")
        return value


# ------------------------------------------------------------------ #
# Detail (read-only, all fields)                                       #
# ------------------------------------------------------------------ #

class ResourceDetailSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    percentage_used = serializers.FloatField(source='percentage_used', read_only=True)
    is_exceeded = serializers.BooleanField(source='is_exceeded', read_only=True)
    is_warning = serializers.BooleanField(source='is_warning_level', read_only=True)
    is_soft_exceeded = serializers.BooleanField(source='is_soft_exceeded', read_only=True)
    is_hard_exceeded = serializers.BooleanField(source='is_hard_exceeded', read_only=True)
    alert_level = serializers.IntegerField(source='alert_level', read_only=True)
    resource_type_display = serializers.CharField(source='get_resource_type_display', read_only=True)

    class Meta:
        model = OrganizationResource
        fields = [
            'id', 'resource_type', 'resource_type_display',
            'organization', 'organization_name',
            'limit_value', 'current_value', 'remaining',
            'warning_threshold', 'last_reset_at',
            'burst_allowed', 'soft_limit_multiplier', 'hard_limit_multiplier',
            'effective_soft_limit', 'effective_hard_limit',
            'is_synced_from_billing', 'last_billing_sync_at',
            'alert_80_sent_at', 'alert_90_sent_at', 'alert_100_sent_at',
            'percentage_used', 'is_exceeded', 'is_warning',
            'is_soft_exceeded', 'is_hard_exceeded', 'alert_level',
            'created_at', 'updated_at', 'created_by', 'updated_by',
        ]
        read_only_fields = '__all__'


# ------------------------------------------------------------------ #
# Usage summary (enriched, multi-resource)                             #
# ------------------------------------------------------------------ #

class ResourceUsageSummarySerializer(serializers.Serializer):
    """Serializes the dict output of ResourceService.get_usage_summary()."""
    id = serializers.UUIDField()
    resource_type = serializers.CharField()
    resource_type_display = serializers.CharField()
    current_value = serializers.IntegerField()
    limit_value = serializers.IntegerField()
    percentage_used = serializers.FloatField()
    remaining = serializers.IntegerField()
    is_exceeded = serializers.BooleanField()
    is_soft_exceeded = serializers.BooleanField()
    is_hard_exceeded = serializers.BooleanField()
    is_warning_level = serializers.BooleanField()
    alert_level = serializers.IntegerField()
    burst_allowed = serializers.BooleanField()
    is_synced_from_billing = serializers.BooleanField()
    last_billing_sync_at = serializers.DateTimeField(allow_null=True)
    billing_period_current = serializers.IntegerField(allow_null=True)
    billing_period_limit = serializers.IntegerField(allow_null=True)
    billing_period_percentage = serializers.FloatField(allow_null=True)


# ------------------------------------------------------------------ #
# Analytics                                                            #
# ------------------------------------------------------------------ #

class ResourceAnalyticsSerializer(serializers.Serializer):
    """Serializes the dict output of ResourceService.get_usage_analytics()."""
    resource_type = serializers.CharField()
    resource_type_display = serializers.CharField()
    current_value = serializers.IntegerField()
    limit_value = serializers.IntegerField()
    percentage_used = serializers.FloatField()
    peak_value = serializers.IntegerField()
    projected_exhaustion_days = serializers.IntegerField(allow_null=True)
    billing_period_usage = serializers.DictField(allow_null=True)

    def to_representation(self, instance):
        # Dynamically include trend_Nd field (e.g. trend_7d)
        data = super().to_representation(instance)
        for key, value in instance.items():
            if key.startswith('trend_') and key not in data:
                data[key] = value
        return data


# ------------------------------------------------------------------ #
# Snapshot                                                             #
# ------------------------------------------------------------------ #

class ResourceSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceUsageSnapshot
        fields = [
            'id', 'organization', 'resource_type',
            'snapshot_value', 'limit_value', 'percentage_used',
            'snapshot_type', 'period_label', 'peak_value', 'source',
            'created_at',
        ]
        read_only_fields = '__all__'


# ------------------------------------------------------------------ #
# Bulk increment                                                        #
# ------------------------------------------------------------------ #

class BulkIncrementItemSerializer(serializers.Serializer):
    resource_type = serializers.ChoiceField(
        choices=[rt[0] for rt in OrganizationResource.RESOURCE_TYPES]
    )
    amount = serializers.IntegerField(min_value=1, default=1)


class ResourceBulkIncrementSerializer(serializers.Serializer):
    increments = BulkIncrementItemSerializer(many=True)

    def validate_increments(self, value):
        if not value:
            raise serializers.ValidationError("At least one increment item is required.")
        # Ensure no duplicate resource_types in a single request
        types = [item['resource_type'] for item in value]
        if len(types) != len(set(types)):
            raise serializers.ValidationError("Duplicate resource_type entries are not allowed.")
        return value


# ------------------------------------------------------------------ #
# Billing sync response                                                #
# ------------------------------------------------------------------ #

class ResourceSyncResponseSerializer(serializers.Serializer):
    synced_count = serializers.IntegerField()
    updated_limits = serializers.DictField(child=serializers.DictField())
    errors = serializers.ListField(child=serializers.DictField(), required=False)