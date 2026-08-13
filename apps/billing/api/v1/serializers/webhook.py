from rest_framework import serializers
from ....models import WebhookEventLog

class WebhookAuthorizationSerializer(serializers.Serializer):
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
    id = serializers.IntegerField()
    first_name = serializers.CharField(allow_blank=True)
    last_name = serializers.CharField(allow_blank=True)
    email = serializers.EmailField()
    customer_code = serializers.CharField()
    phone = serializers.CharField(allow_blank=True)
    metadata = serializers.JSONField(required=False, default=dict)
    risk_action = serializers.CharField(allow_blank=True)

class WebhookDataSerializer(serializers.Serializer):
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
    event = serializers.CharField()
    data = WebhookDataSerializer()
    def validate_event(self, value):
        supported_events = ['charge.success', 'charge.dispute.create', 'charge.dispute.remind', 'charge.dispute.resolve', 'subscription.create', 'subscription.disable', 'subscription.enable', 'invoice.create', 'invoice.update', 'invoice.payment_failed', 'paymentrequest.success']
        if value not in supported_events:
            raise serializers.ValidationError(f"Unsupported event type: {value}")
        return value

class WebhookResponseSerializer(serializers.Serializer):
    status = serializers.CharField()
    message = serializers.CharField()
    event_type = serializers.CharField()
    processed_at = serializers.DateTimeField()


class WebhookEventLogSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_processing_status_display', read_only=True)
    event_display = serializers.CharField(source='get_event_type_display', read_only=True)

    class Meta:
        model = WebhookEventLog
        fields = [
            'id', 'tenant_id', 'event_type', 'event_display',
            'event_idempotency_key', 'paystack_event_id', 'paystack_data_id',
            'processing_status', 'status_display', 'raw_payload', 'processed_at',
            'processing_error', 'retry_count', 'last_retry_at', 'signature_valid',
            'signature_error', 'related_transaction', 'related_subscription',
            'created_at', 'updated_at'
        ]