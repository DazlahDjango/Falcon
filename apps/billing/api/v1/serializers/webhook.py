from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from apps.billing.models import WebhookEvent

class WebhookEventSerializer(serializers.ModelSerializer):
    event_type_display = serializers.CharField(source='get_event_type_display', read_only=True)
    is_high_priority = serializers.BooleanField(read_only=True)    
    class Meta:
        model = WebhookEvent
        fields = [
            'id', 'stripe_event_id', 'event_type', 'event_type_display',
            'is_processed', 'processed_at', 'processing_error', 'retry_count',
            'is_high_priority', 'created_at'
        ]
        read_only_fields = '__all__'

class WebhookPayloadSerializer(serializers.Serializer):
    pass