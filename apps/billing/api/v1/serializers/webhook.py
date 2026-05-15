from rest_framework import serializers
from django.utils.translation import gettext_lazy as _

class WebhookAuthorizationSerializer(serializers.Serializer):
    """PayStack authorization data serializer."""
    
    authorization_code = serializers.CharField(allow_blank=True)
    card_type = serializers.CharField(allow_blank=True)
    last4 = serializers.CharField(allow_blank=True)
    exp_month = serializers.CharField(allow_blank=True)
    exp_year = serializers.CharField(allow_blank=True)
    bin = serializers.CharField(allow_blank=True)
    bank = serializers.CharField(allow_blank=True)
    channel = serializers.CharField(allow_blank=True)
    signature = serializers.CharField(allow_blank=True)
    reusable = serializers.BooleanField(default=True)
    country_code = serializers.CharField(allow_blank=True)


class WebhookCustomerSerializer(serializers.Serializer):
    """PayStack customer data serializer."""
    
    id = serializers.IntegerField()
    first_name = serializers.CharField(allow_blank=True)
    last_name = serializers.CharField(allow_blank=True)
    email = serializers.EmailField()
    customer_code = serializers.CharField()
    phone = serializers.CharField(allow_blank=True)
    metadata = serializers.JSONField(required=False, default=dict)
    risk_action = serializers.CharField(allow_blank=True)


class WebhookDataSerializer(serializers.Serializer):
    """PayStack webhook data serializer."""
    
    id = serializers.IntegerField()
    domain = serializers.CharField()
    status = serializers.CharField()
    reference = serializers.CharField()
    amount = serializers.IntegerField()
    message = serializers.CharField(allow_blank=True)
    gateway_response = serializers.CharField(allow_blank=True)
    paid_at = serializers.DateTimeField()
    created_at = serializers.DateTimeField()
    channel = serializers.CharField()
    currency = serializers.CharField()
    ip_address = serializers.CharField(allow_blank=True)
    metadata = serializers.JSONField(required=False, default=dict)
    log = serializers.JSONField(required=False, default=dict)
    fees = serializers.IntegerField()
    fees_split = serializers.JSONField(required=False, default=dict)
    authorization = WebhookAuthorizationSerializer()
    customer = WebhookCustomerSerializer()
    plan = serializers.JSONField(required=False, default=dict)
    subscription = serializers.JSONField(required=False, default=dict)


class WebhookPayloadSerializer(serializers.Serializer):
    """Complete PayStack webhook payload serializer."""
    
    event = serializers.CharField(help_text="Webhook event type")
    data = WebhookDataSerializer(help_text="Webhook data payload")
    
    def validate_event(self, value):
        """Validate event type is supported."""
        supported_events = [
            'charge.success', 'charge.dispute.create', 'charge.dispute.remind',
            'charge.dispute.resolve', 'subscription.create', 'subscription.disable',
            'subscription.enable', 'invoice.create', 'invoice.update',
            'invoice.payment_failed', 'paymentrequest.success'
        ]
        
        if value not in supported_events:
            raise serializers.ValidationError(f"Unsupported event type: {value}")
        
        return value


class WebhookResponseSerializer(serializers.Serializer):
    """Webhook processing response serializer."""
    
    status = serializers.CharField(help_text="Processing status")
    message = serializers.CharField(help_text="Response message")
    event_type = serializers.CharField(help_text="Processed event type")
    processed_at = serializers.DateTimeField(help_text="Processing timestamp")