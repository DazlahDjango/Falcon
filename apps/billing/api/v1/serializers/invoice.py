from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from ....models import Invoice
from ....constants import InvoiceStatus

class InvoiceSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    total_display = serializers.SerializerMethodField()
    subtotal_display = serializers.SerializerMethodField()
    tax_display = serializers.SerializerMethodField()
    is_overdue_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'tenant_id', 'subscription_id',
            'invoice_date', 'due_date', 'paid_at', 'subtotal', 'subtotal_display',
            'tax_rate', 'tax_amount', 'tax_display', 'total_amount', 'total_display',
            'currency', 'status', 'status_display', 'is_overdue_status',
            'line_items', 'pdf_url', 'pdf_generated_at', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'invoice_number', 'created_at', 'updated_at', 'pdf_generated_at']
    
    def get_total_display(self, obj):
        return obj.total_display
    
    def get_subtotal_display(self, obj):
        return f"{obj.currency} {obj.subtotal / 100:.2f}"
    
    def get_tax_display(self, obj):
        return f"{obj.currency} {obj.tax_amount / 100:.2f}"
    
    def get_is_overdue_status(self, obj):
        return {
            'is_overdue': obj.is_overdue,
            'days_overdue': (timezone.now().date() - obj.due_date.date()).days if obj.is_overdue else 0
        }


class InvoiceListSerializer(InvoiceSerializer):
    """Lightweight serializer for list views."""
    
    class Meta(InvoiceSerializer.Meta):
        fields = [
            'id', 'invoice_number', 'total_display', 'currency',
            'invoice_date', 'due_date', 'status', 'status_display',
            'is_overdue_status', 'pdf_url'
        ]


class InvoiceDetailSerializer(InvoiceSerializer):
    """Full detail serializer with formatted line items."""
    
    formatted_line_items = serializers.SerializerMethodField()
    payment_url = serializers.SerializerMethodField()
    
    class Meta(InvoiceSerializer.Meta):
        fields = InvoiceSerializer.Meta.fields + ['formatted_line_items', 'payment_url']
    
    def get_formatted_line_items(self, obj):
        """Format line items with calculated totals."""
        formatted = []
        for item in obj.line_items:
            formatted.append({
                'description': item.get('description', ''),
                'quantity': item.get('quantity', 1),
                'unit_price': item.get('unit_price', 0),
                'unit_price_display': f"{obj.currency} {item.get('unit_price', 0) / 100:.2f}",
                'total': item.get('total', 0),
                'total_display': f"{obj.currency} {item.get('total', 0) / 100:.2f}",
                'is_tax': item.get('is_tax', False)
            })
        return formatted
    
    def get_payment_url(self, obj):
        """Get payment URL for unpaid invoices."""
        if obj.status in [InvoiceStatus.PENDING, InvoiceStatus.OVERDUE]:
            from django.conf import settings
            return f"{getattr(settings, 'BASE_URL', '')}/pay/invoice/{obj.id}"
        return None


class InvoiceDownloadSerializer(serializers.Serializer):
    """Serializer for invoice download request."""
    
    format = serializers.ChoiceField(
        choices=[('pdf', 'PDF'), ('csv', 'CSV'), ('json', 'JSON')],
        default='pdf'
    )
    
    def validate(self, data):
        """Validate invoice exists and user has access."""
        invoice_id = self.context.get('invoice_id')
        tenant_id = self.context.get('tenant_id')
        
        try:
            invoice = Invoice.objects.get_by_id(invoice_id)
            if str(invoice.tenant_id) != str(tenant_id):
                raise serializers.ValidationError("You do not have access to this invoice")
            self.context['invoice'] = invoice
        except Invoice.DoesNotExist:
            raise serializers.ValidationError("Invoice not found")
        
        return data