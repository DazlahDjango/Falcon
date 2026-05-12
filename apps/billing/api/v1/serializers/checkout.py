from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from apps.billing.constants import BillingInterval

class CheckoutSessionCreateSerializer(serializers.Serializer):
    plan_id = serializers.UUIDField(required=True, help_text="ID of the plan to purchase")
    billing_interval = serializers.ChoiceField(
        choices=BillingInterval.CHOICES,
        default=BillingInterval.MONTHLY
    )
    success_url = serializers.URLField(
        required=False,
        help_text="URL to redirect after successful payment"
    )
    cancel_url = serializers.URLField(
        required=False,
        help_text="URL to redirect after cancelled payment"
    )
    allow_promotion_codes = serializers.BooleanField(default=True)    
    def validate_plan_id(self, value):
        from billing.models import Plan
        try:
            plan = Plan.objects.get(id=value, is_active=True, is_deleted=False)
            return plan
        except Plan.DoesNotExist:
            raise serializers.ValidationError("Plan not found or inactive")

class CheckoutSessionSerializer(serializers.Serializer):
    session_id = serializers.CharField()
    checkout_url = serializers.URLField()
    stripe_customer_id = serializers.CharField()

class CustomerPortalSerializer(serializers.Serializer):
    portal_url = serializers.URLField()
    session_id = serializers.CharField()
    return_url = serializers.URLField()

class CustomerPortalCreateSerializer(serializers.Serializer):
    return_url = serializers.URLField(
        required=False,
        help_text="URL to redirect after portal session"
    )