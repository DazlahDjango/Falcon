from rest_framework import serializers
from django.conf import settings
from ....constants import BillingInterval

class CheckoutInitializeSerializer(serializers.Serializer):
    plan_id = serializers.UUIDField(required=False)
    billing_interval = serializers.ChoiceField(choices=BillingInterval.choices, default=BillingInterval.MONTHLY)
    amount = serializers.IntegerField(required=False, min_value=1)
    description = serializers.CharField(required=False, max_length=500)
    success_url = serializers.URLField(required=False)
    cancel_url = serializers.URLField(required=False)
    metadata = serializers.JSONField(required=False, default=dict)
    def validate(self, data):
        has_plan = bool(data.get('plan_id'))
        has_amount = bool(data.get('amount'))
        if not has_plan and not has_amount:
            raise serializers.ValidationError("Either plan_id or amount must be provided")
        if has_plan and has_amount:
            raise serializers.ValidationError("Cannot provide both plan_id and amount")
        if has_plan:
            from ....models import SubscriptionPlan
            try:
                plan = SubscriptionPlan.objects.get_by_id(data['plan_id'])
                if not plan.is_active:
                    raise serializers.ValidationError({"plan_id": "Plan is not active"})
                data['plan'] = plan
            except SubscriptionPlan.DoesNotExist:
                raise serializers.ValidationError({"plan_id": "Plan not found"})
        if has_amount:
            if data['amount'] > 100000000:
                raise serializers.ValidationError({"amount": "Amount exceeds maximum allowed"})
            if not data.get('description'):
                raise serializers.ValidationError({"description": "Description is required for one-time payment"})
        base_url = getattr(settings, 'BASE_URL', '')
        if not data.get('success_url'):
            data['success_url'] = f"{base_url}/payment/success"
        if not data.get('cancel_url'):
            data['cancel_url'] = f"{base_url}/payment/cancelled"
        return data

class CheckoutResponseSerializer(serializers.Serializer):
    authorization_url = serializers.URLField()
    access_code = serializers.CharField()
    reference = serializers.CharField()
    transaction_id = serializers.UUIDField()

class CheckoutVerifySerializer(serializers.Serializer):
    reference = serializers.CharField()
    def validate_reference(self, value):
        from ....models import Transaction
        transaction = Transaction.objects.get_by_reference(value)
        if not transaction:
            raise serializers.ValidationError(f"Transaction with reference {value} not found")
        self.context['transaction'] = transaction
        return value