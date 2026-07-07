from rest_framework import serializers
from apps.tenant.models import Organization


class ProvisioningStepSerializer(serializers.Serializer):
    """Represents a single step inside org.metadata['provisioning']."""
    status = serializers.CharField(read_only=True)
    step_name = serializers.CharField(read_only=True, allow_null=True)
    progress = serializers.IntegerField(read_only=True, default=0)
    message = serializers.CharField(read_only=True, allow_null=True)
    started_at = serializers.CharField(read_only=True, allow_null=True)
    updated_at = serializers.CharField(read_only=True, allow_null=True)
    failed_at = serializers.CharField(read_only=True, allow_null=True)
    error = serializers.CharField(read_only=True, allow_null=True)


class ProvisioningStatusSerializer(serializers.ModelSerializer):
    """
    Full provisioning state for an organization, including step-level
    progress data recorded by ProvisioningService into org.metadata.
    """
    provisioning = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = [
            'id', 'name', 'slug',
            'status', 'is_active', 'is_onboarded',
            'onboarded_at', 'subscription_tier',
            'created_at', 'updated_at',
            'provisioning',
        ]
        read_only_fields = fields

    def get_provisioning(self, obj):
        meta = obj.metadata.get('provisioning', {}) if obj.metadata else {}
        return {
            'status': meta.get('status'),
            'step_name': meta.get('step_name'),
            'progress': meta.get('progress', 0),
            'message': meta.get('message'),
            'started_at': meta.get('started_at'),
            'updated_at': meta.get('updated_at'),
            'failed_at': meta.get('failed_at'),
            'error': meta.get('error'),
        }


class ProvisioningListSerializer(serializers.ModelSerializer):
    """
    Compact representation for listing organizations with their
    provisioning state — used in admin monitoring endpoints.
    """
    provisioning_status = serializers.SerializerMethodField()
    provisioning_progress = serializers.SerializerMethodField()
    provisioning_error = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = [
            'id', 'name', 'slug',
            'status', 'is_active', 'is_onboarded',
            'subscription_tier', 'created_at',
            'provisioning_status', 'provisioning_progress', 'provisioning_error',
        ]
        read_only_fields = fields

    def get_provisioning_status(self, obj):
        meta = obj.metadata.get('provisioning', {}) if obj.metadata else {}
        return meta.get('status')

    def get_provisioning_progress(self, obj):
        meta = obj.metadata.get('provisioning', {}) if obj.metadata else {}
        return meta.get('progress', 0)

    def get_provisioning_error(self, obj):
        meta = obj.metadata.get('provisioning', {}) if obj.metadata else {}
        return meta.get('error')


class ProvisioningTriggerSerializer(serializers.Serializer):
    """
    Used to validate the body for a manual provisioning trigger.
    `force` allows triggering even if status is not PENDING (super-admin only).
    """
    force = serializers.BooleanField(required=False, default=False)

    def validate(self, attrs):
        return attrs


class ProvisioningRetrySerializer(serializers.Serializer):
    """Validate a retry request for a FAILED provisioning."""
    force = serializers.BooleanField(required=False, default=False)

    def validate(self, attrs):
        return attrs
