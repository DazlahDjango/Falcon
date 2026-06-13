from rest_framework import serializers

class BillingPortalAccessSerializer(serializers.Serializer):
    return_url = serializers.URLField(required=False)
    def validate(self, data):
        tenant_id = self.context.get('tenant_id')
        if not tenant_id:
            raise serializers.ValidationError("Tenant context required")
        from ....models import Subscription
        subscription = Subscription.objects.get_current_for_tenant(tenant_id)
        if not subscription or not subscription.is_active:
            raise serializers.ValidationError("Active subscription required to access billing portal")
        self.context['subscription'] = subscription
        return data

class BillingPortalResponseSerializer(serializers.Serializer):
    portal_url = serializers.URLField()
    session_id = serializers.CharField()
    expires_at = serializers.DateTimeField()