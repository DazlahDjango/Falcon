from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.core.validators import RegexValidator
from apps.billing.models import PaymentMethod

class PaymentMethodSerializer(serializers.ModelSerializer):
    display_name = serializers.ReadOnlyField()
    is_expiring_soon = serializers.BooleanField(read_only=True)
    method_type_display = serializers.CharField(source='get_method_type_display', read_only=True)
    brand_display = serializers.CharField(source='get_brand_display', read_only=True)    
    class Meta:
        model = PaymentMethod
        fields = [
            'id', 'method_type', 'method_type_display', 'last4', 'brand',
            'brand_display', 'exp_month', 'exp_year', 'is_default',
            'is_active', 'is_expiring_soon', 'display_name',
            'billing_email', 'billing_name', 'created_at'
        ]
        read_only_fields = [
            'id', 'stripe_payment_method_id', 'stripe_customer_id',
            'is_verified', 'verified_at', 'created_at'
        ]

class PaymentMethodDetailSerializer(PaymentMethodSerializer):
    class Meta(PaymentMethodSerializer.Meta):
        fields = PaymentMethodSerializer.Meta.fields + [
            'phone_number', 'provider', 'bank_name', 'account_last4',
            'billing_address', 'metadata'
        ]

class PaymentMethodCreateSerializer(serializers.Serializer):
    payment_method_id = serializers.CharField(
        required=True,
        help_text="Stripe payment method ID (e.g., pm_xxx)"
    )
    set_as_default = serializers.BooleanField(
        default=True,
        help_text="Set this as the default payment method"
    )
    def validate_payment_method_id(self, value):
        if not value.startswith('pm_'):
            raise serializers.ValidationError("Invalid payment method ID format. Must start with 'pm_'")
        if len(value) < 10:
            raise serializers.ValidationError("Invalid payment method ID length")
        return value

class PaymentMethodDeleteSerializer(serializers.Serializer):
    payment_method_id = serializers.UUIDField(required=True)

class PaymentMethodSetDefaultSerializer(serializers.Serializer):
    payment_method_id = serializers.UUIDField(required=True)