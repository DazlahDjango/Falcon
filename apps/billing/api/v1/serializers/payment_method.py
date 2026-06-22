from rest_framework import serializers
from ....models import PaymentMethod
from ....constants import PaymentMethodType

class PaymentMethodSerializer(serializers.ModelSerializer):
    payment_type_display = serializers.CharField(source='get_payment_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    display_name = serializers.SerializerMethodField()
    is_expired_status = serializers.SerializerMethodField()
    class Meta:
        model = PaymentMethod
        fields = ['id', 'authorization_code', 'payment_type', 'payment_type_display', 'card_last4', 'card_brand', 'card_expiry_month', 'card_expiry_year', 'bank_name', 'account_name', 'email', 'status', 'status_display', 'is_default', 'display_name', 'is_expired_status', 'reusable', 'created_at', 'updated_at']
        read_only_fields = ['id', 'authorization_code', 'created_at', 'updated_at']
    def get_display_name(self, obj):
        if obj.payment_type == PaymentMethodType.CARD:
            return f"{obj.card_brand} •••• {obj.card_last4}"
        elif obj.payment_type == PaymentMethodType.BANK:
            return f"{obj.bank_name} - {obj.account_name}"
        return obj.payment_type
    def get_is_expired_status(self, obj):
        return {'is_expired': obj.is_expired, 'expiry_date': f"{obj.card_expiry_month}/{obj.card_expiry_year}" if obj.card_expiry_month else None}

class PaymentMethodListSerializer(PaymentMethodSerializer):
    class Meta(PaymentMethodSerializer.Meta):
        fields = ['id', 'payment_type', 'payment_type_display', 'display_name', 'card_brand', 'card_last4', 'is_default', 'is_expired_status']

class PaymentMethodCreateSerializer(serializers.Serializer):
    authorization_code = serializers.CharField()
    email = serializers.EmailField()
    def validate_authorization_code(self, value):
        if not value.startswith('AUTH_'):
            raise serializers.ValidationError("Invalid authorization code format")
        return value
    def validate(self, data):
        tenant_id = self.context.get('tenant_id')
        existing = PaymentMethod.objects.filter(tenant_id=tenant_id, authorization_code=data['authorization_code']).first()
        if existing:
            raise serializers.ValidationError("Payment method already exists")
        return data

class PaymentMethodDeleteSerializer(serializers.Serializer):
    confirm = serializers.BooleanField()
    def validate(self, data):
        payment_method = self.context.get('payment_method')
        tenant_id = self.context.get('tenant_id')
        if not payment_method:
            raise serializers.ValidationError("Payment method not found")
        if str(payment_method.tenant_id) != str(tenant_id):
            raise serializers.ValidationError("You do not have permission to delete this payment method")
        if payment_method.is_default:
            other_methods = PaymentMethod.objects.filter(tenant_id=tenant_id, status__in=['active', 'default']).exclude(id=payment_method.id)
            if not other_methods.exists() and data.get('confirm'):
                data['is_last_method'] = True
        if not data.get('confirm'):
            raise serializers.ValidationError("Must confirm deletion")
        return data