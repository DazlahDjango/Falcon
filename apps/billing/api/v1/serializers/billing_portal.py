from rest_framework import serializers
from django.utils.translation import gettext_lazy as _

class BillingPortalAccessSerializer(serializers.Serializer):
    """Serializer for requesting billing portal access."""
    
    return_url = serializers.URLField(required=False, help_text="URL to return after portal session")
    
    def validate(self, data):
        """Validate tenant has active subscription."""
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
    portal_url = serializers.URLField(help_text="URL to redirect user to billing portal")
    session_id = serializers.CharField(help_text="Portal session ID")
    expires_at = serializers.DateTimeField(help_text="Session expiration time")