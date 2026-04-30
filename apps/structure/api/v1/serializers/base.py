from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from uuid import UUID

class BaseStructureSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    tenant_id = serializers.UUIDField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    is_deleted = serializers.BooleanField(read_only=True)
    class Meta:
        abstract = True
    def validate_tenant_id(self, value):
        request = self.context.get('request')
        if request and hasattr(request.user, 'tenant_id'):
            if value and str(value) != str(request.user.tenant_id):
                raise serializers.ValidationError(_("Tenant ID does not match user's tenant."))
        return value

class BaseStructureDetailSerializer(BaseStructureSerializer):
    created_by = serializers.UUIDField(read_only=True)
    updated_by = serializers.UUIDField(read_only=True)
    deleted_by = serializers.UUIDField(read_only=True)
    deleted_at = serializers.DateTimeField(read_only=True)