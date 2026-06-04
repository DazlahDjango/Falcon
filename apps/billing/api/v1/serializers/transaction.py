from rest_framework import serializers
from ....models import Transaction
from ....constants import TransactionStatus

class TransactionSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)
    amount_display = serializers.SerializerMethodField()
    total_display = serializers.SerializerMethodField()
    tax_display = serializers.SerializerMethodField()
    class Meta:
        model = Transaction
        fields = ['id', 'reference', 'paystack_reference', 'tenant_id', 'subscription_id', 'invoice_id', 'transaction_type', 'type_display', 'amount', 'amount_display', 'tax_amount', 'tax_display', 'total_amount', 'total_display', 'currency', 'status', 'status_display', 'payment_method', 'card_last4', 'card_brand', 'payment_date', 'error_message', 'created_at', 'updated_at']
        read_only_fields = ['id', 'reference', 'created_at', 'updated_at']
    def get_amount_display(self, obj): return f"{obj.currency} {obj.amount / 100:.2f}"
    def get_total_display(self, obj): return f"{obj.currency} {obj.total_amount / 100:.2f}"
    def get_tax_display(self, obj): return f"{obj.currency} {obj.tax_amount / 100:.2f}"

class TransactionListSerializer(TransactionSerializer):
    class Meta(TransactionSerializer.Meta):
        fields = ['id', 'reference', 'transaction_type', 'type_display', 'amount_display', 'total_display', 'status', 'status_display', 'payment_date', 'created_at']

class TransactionDetailSerializer(TransactionSerializer):
    is_successful = serializers.BooleanField(source='is_successful', read_only=True)
    can_refund = serializers.SerializerMethodField()
    class Meta(TransactionSerializer.Meta):
        fields = TransactionSerializer.Meta.fields + ['is_successful', 'can_refund', 'paystack_response', 'metadata']
    def get_can_refund(self, obj):
        if obj.status == TransactionStatus.SUCCESS and obj.payment_date:
            from django.utils import timezone
            from datetime import timedelta
            return obj.payment_date > timezone.now() - timedelta(days=90)
        return False

class TransactionVerifySerializer(serializers.Serializer):
    reference = serializers.CharField()
    def validate_reference(self, value):
        transaction = Transaction.objects.get_by_reference(value)
        if not transaction:
            raise serializers.ValidationError(f"Transaction with reference {value} not found")
        self.context['transaction'] = transaction
        return value