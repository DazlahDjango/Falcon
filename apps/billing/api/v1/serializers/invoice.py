from rest_framework import serializers
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from apps.billing.models import Invoice, InvoiceLineItem

class InvoiceLineItemSerializer(serializers.ModelSerializer):
    line_type_display = serializers.CharField(source='get_line_type_display', read_only=True)
    formatted_unit_amount = serializers.SerializerMethodField()
    formatted_amount = serializers.SerializerMethodField()
    class Meta:
        model = InvoiceLineItem
        fields = [
            'id', 'line_type', 'line_type_display', 'description',
            'quantity', 'unit_amount', 'amount', 'tax_rate', 'tax_amount',
            'discount_rate', 'discount_amount', 'period_start', 'period_end',
            'formatted_unit_amount', 'formatted_amount'
        ]
        read_only_fields = ['id', 'stripe_price_id', 'stripe_line_item_id']
    def get_formatted_unit_amount(self, obj):
        if hasattr(obj, 'invoice') and obj.invoice:
            return f"{obj.invoice.currency} {obj.unit_amount:,.2f}"
        return f"KES {obj.unit_amount:,.2f}"    
    def get_formatted_amount(self, obj):
        if hasattr(obj, 'invoice') and obj.invoice:
            return f"{obj.invoice.currency} {obj.amount:,.2f}"
        return f"KES {obj.amount:,.2f}"

class InvoiceSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    plan_name = serializers.CharField(source='subscription.plan.name', read_only=True)
    line_items = InvoiceLineItemSerializer(many=True, read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    formatted_amount_due = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'tenant', 'tenant_name', 'subscription',
            'plan_name', 'status', 'status_display', 'amount_due', 'amount_paid',
            'amount_remaining', 'currency', 'invoice_date', 'due_date',
            'period_start', 'period_end', 'invoice_pdf_url', 'is_overdue',
            'line_items', 'formatted_amount_due', 'created_at'
        ]
        read_only_fields = [
            'id', 'stripe_invoice_id', 'stripe_payment_intent_id',
            'invoice_pdf_url', 'metadata'
        ]

    def get_formatted_amount_due(self, obj):
        return f"{obj.currency} {obj.amount_due:,.2f}"

class InvoiceDetailSerializer(InvoiceSerializer):
    payment_status = serializers.SerializerMethodField()
    days_until_due = serializers.SerializerMethodField()
    class Meta(InvoiceSerializer.Meta):
        fields = InvoiceSerializer.Meta.fields + [
            'payment_status', 'days_until_due', 'metadata'
        ]
    def get_payment_status(self, obj):
        if obj.status == 'paid':
            return 'paid'
        if obj.is_overdue:
            return 'overdue'
        if obj.due_date and obj.due_date > timezone.now():
            return 'upcoming'
        return 'pending'
    def get_days_until_due(self, obj):
        if obj.due_date:
            delta = obj.due_date - timezone.now()
            return max(0, delta.days)
        return None

class InvoiceListSerializer(serializers.ModelSerializer):
    formatted_amount = serializers.SerializerMethodField()
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'status', 'amount_due', 'currency',
            'invoice_date', 'due_date', 'invoice_pdf_url', 'formatted_amount'
        ]
    def get_formatted_amount(self, obj):
        return f"{obj.currency} {obj.amount_due:,.2f}"