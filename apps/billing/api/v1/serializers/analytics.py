from rest_framework import serializers
from django.utils.translation import gettext_lazy as _

class BillingSummarySerializer(serializers.Serializer):
    tenant_id = serializers.UUIDField()
    has_active_subscription = serializers.BooleanField()
    current_plan = serializers.DictField(required=False, allow_null=True)
    subscription_status = serializers.CharField(allow_null=True)
    trial_info = serializers.DictField(required=False)
    billing_info = serializers.DictField()
    recent_transactions = serializers.ListField()
    invoice_summary = serializers.DictField()
    total_spent = serializers.IntegerField()
    total_spent_display = serializers.CharField()
    
    def get_total_spent_display(self, obj):
        if isinstance(obj, dict):
            currency = obj.get('billing_info', {}).get('currency', 'KES')
            amount = obj.get('total_spent', 0)
            return f"{currency} {amount / 100:.2f}"
        return None


class RevenueReportSerializer(serializers.Serializer):
    """Serializer for revenue reports."""
    
    period = serializers.CharField()
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    total_revenue = serializers.IntegerField()
    total_revenue_display = serializers.CharField()
    total_transactions = serializers.IntegerField()
    successful_transactions = serializers.IntegerField()
    failed_transactions = serializers.IntegerField()
    success_rate = serializers.FloatField()
    breakdown = serializers.ListField()
    
    def get_total_revenue_display(self, obj):
        if isinstance(obj, dict):
            currency = obj.get('currency', 'KES')
            amount = obj.get('total_revenue', 0)
            return f"{currency} {amount / 100:.2f}"
        return None


class SubscriptionAnalyticsSerializer(serializers.Serializer):
    """Serializer for subscription analytics."""
    
    total_active = serializers.IntegerField()
    total_trialing = serializers.IntegerField()
    total_expired = serializers.IntegerField()
    total_cancelled = serializers.IntegerField()
    by_plan = serializers.DictField()
    by_plan_type = serializers.DictField()
    monthly_recurring_revenue = serializers.IntegerField()
    monthly_recurring_revenue_display = serializers.CharField()
    yearly_recurring_revenue = serializers.IntegerField()
    yearly_recurring_revenue_display = serializers.CharField()
    total_mrr = serializers.IntegerField()
    total_mrr_display = serializers.CharField()
    recent_activity = serializers.ListField()
    
    def get_monthly_recurring_revenue_display(self, obj):
        if isinstance(obj, dict):
            currency = obj.get('currency', 'KES')
            amount = obj.get('monthly_recurring_revenue', 0)
            return f"{currency} {amount / 100:.2f}"
        return None
    
    def get_yearly_recurring_revenue_display(self, obj):
        if isinstance(obj, dict):
            currency = obj.get('currency', 'KES')
            amount = obj.get('yearly_recurring_revenue', 0)
            return f"{currency} {amount / 100:.2f}"
        return None
    
    def get_total_mrr_display(self, obj):
        if isinstance(obj, dict):
            currency = obj.get('currency', 'KES')
            amount = obj.get('total_mrr', 0)
            return f"{currency} {amount / 100:.2f}"
        return None