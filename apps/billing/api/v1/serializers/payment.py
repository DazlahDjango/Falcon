from rest_framework import serializers
from decimal import Decimal
from django.utils.translation import gettext_lazy as _
from apps.billing.models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    invoice_number = serializers.CharField(source='invoice.invoice_number', read_only=True)
    formatted_amount = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    class Meta:
        model = Payment
        fields = [
            'id', 'tenant', 'tenant_name', 'subscription', 'invoice',
            'invoice_number', 'amount', 'currency', 'status', 'status_display',
            'payment_date', 'receipt_url', 'formatted_amount', 'created_at'
        ]
        read_only_fields = [
            'id', 'stripe_payment_intent_id', 'stripe_charge_id',
            'failure_reason', 'refunded_amount', 'refunded_at'
        ]    
    def get_formatted_amount(self, obj):
        return f"{obj.currency} {obj.amount:,.2f}"

class PaymentDetailSerializer(PaymentSerializer):
    failure_reason_display = serializers.CharField(source='failure_reason', read_only=True)
    refund_status = serializers.SerializerMethodField()
    class Meta(PaymentSerializer.Meta):
        fields = PaymentSerializer.Meta.fields + [
            'failure_reason', 'failure_reason_display', 'refunded_amount',
            'refunded_at', 'refund_status', 'metadata'
        ]
    def get_refund_status(self, obj):
        if obj.status == 'refunded':
            return 'fully_refunded'
        if obj.status == 'partially_refunded':
            return f"partially_refunded ({obj.refunded_amount})"
        return None

class PaymentListSerializer(serializers.ModelSerializer):
    formatted_amount = serializers.SerializerMethodField()
    class Meta:
        model = Payment
        fields = [
            'id', 'amount', 'currency', 'status', 'payment_date',
            'receipt_url', 'formatted_amount'
        ]
    def get_formatted_amount(self, obj):
        return f"{obj.currency} {obj.amount:,.2f}"