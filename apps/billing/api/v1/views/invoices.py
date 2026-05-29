from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.accounts.api.v1.permissions import IsAuthenticated
from django.http import HttpResponse, FileResponse
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.core.files.storage import default_storage

from ....models import Invoice
from ....services.billing.invoice import InvoiceService
from ....services.audit.logger import audit_logger
from ..serializers import (
    InvoiceSerializer,
    InvoiceListSerializer,
    InvoiceDetailSerializer,
    InvoiceDownloadSerializer,
)
from ..permissions import CanViewInvoices, IsSameTenant
from ..throttles import InvoiceDownloadThrottle
from ..filters import InvoiceFilter


class InvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Invoice ViewSet for billing invoices.
    
    Actions:
    - list: List tenant invoices
    - retrieve: Get invoice details
    - download: Download invoice PDF
    - send: Resend invoice email
    """
    
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated, CanViewInvoices]
    filterset_class = InvoiceFilter
    
    def get_queryset(self):
        """Filter invoices by tenant."""
        tenant_id = self.request.tenant_id
        
        queryset = Invoice.objects.for_tenant(tenant_id)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter unpaid only
        unpaid_only = self.request.query_params.get('unpaid_only', 'false').lower() == 'true'
        if unpaid_only:
            queryset = queryset.filter(status__in=['pending', 'overdue'])
        
        # Date range filters
        start_date = self.request.query_params.get('start_date')
        if start_date:
            queryset = queryset.filter(invoice_date__date__gte=start_date)
        
        end_date = self.request.query_params.get('end_date')
        if end_date:
            queryset = queryset.filter(invoice_date__date__lte=end_date)
        
        return queryset.order_by('-invoice_date')
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'list':
            return InvoiceListSerializer
        elif self.action == 'retrieve':
            return InvoiceDetailSerializer
        elif self.action == 'download':
            return InvoiceDownloadSerializer
        return InvoiceSerializer
    
    @method_decorator(cache_page(600))  # Cache for 10 minutes
    def retrieve(self, request, *args, **kwargs):
        """Get invoice with caching."""
        return super().retrieve(request, *args, **kwargs)
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download invoice PDF."""
        invoice = self.get_object()
        
        # Check if user has access
        if str(invoice.tenant_id) != str(request.tenant_id):
            return Response(
                {'error': 'You do not have access to this invoice'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Generate PDF if not exists
        invoice_service = InvoiceService()
        
        if not invoice.pdf_url:
            pdf_bytes = invoice_service.generate_pdf(str(invoice.id))
            
            # Return as file response
            response = HttpResponse(pdf_bytes, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="invoice_{invoice.invoice_number}.pdf"'
            
            # Log audit
            audit_logger.log(
                user=request.user,
                tenant_id=request.tenant_id,
                action='view',
                resource_type='invoice',
                resource_id=invoice.id,
                metadata={'action': 'download_pdf'},
                request=request
            )
            
            return response
        
        # Return existing PDF from storage
        if invoice.pdf_url:
            response = HttpResponse(content_type='application/pdf')
            response['Content-Disposition'] = f'inline; filename="{invoice.invoice_number}.pdf"'
            return response
        
        return Response(
            {'error': 'PDF not available'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    @action(detail=True, methods=['post'])
    def send(self, request, pk=None):
        """Resend invoice email."""
        invoice = self.get_object()
        
        # Check if user has access
        if str(invoice.tenant_id) != str(request.tenant_id):
            return Response(
                {'error': 'You do not have access to this invoice'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get tenant email
        from apps.tenant.models import Client
        try:
            tenant = Client.objects.get(id=invoice.tenant_id)
            email = tenant.contact_email or request.user.email
            
            invoice_service = InvoiceService()
            invoice_service.send_invoice_email(str(invoice.id), email)
            
            # Log audit
            audit_logger.log(
                user=request.user,
                tenant_id=request.tenant_id,
                action='update',
                resource_type='invoice',
                resource_id=invoice.id,
                metadata={'action': 'resend_email', 'email': email},
                request=request
            )
            
            return Response({
                'status': 'sent',
                'message': f'Invoice email sent to {email}'
            })
            
        except Client.DoesNotExist:
            return Response(
                {'error': 'Tenant not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        """Initiate payment for an invoice."""
        invoice = self.get_object()
        
        # Check if invoice is payable
        if invoice.status not in ['pending', 'overdue']:
            return Response(
                {'error': f'Invoice {invoice.status} cannot be paid'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Initialize checkout for invoice payment
        from ..serializers.checkout import CheckoutInitializeSerializer
        from .checkout import CheckoutViewSet
        
        # Get tenant email
        from apps.tenant.models import Client
        tenant = Client.objects.get(id=invoice.tenant_id)
        email = tenant.contact_email or request.user.email
        
        checkout_serializer = CheckoutInitializeSerializer(data={
            'amount': invoice.total_amount,
            'description': f'Payment for invoice {invoice.invoice_number}',
            'metadata': {
                'invoice_id': str(invoice.id),
                'invoice_number': invoice.invoice_number
            }
        })
        checkout_serializer.is_valid(raise_exception=True)
        
        checkout_view = CheckoutViewSet()
        checkout_view.request = request
        
        # Override email
        request.data = checkout_serializer.validated_data
        request.data['email'] = email
        
        return checkout_view.initialize_checkout(request)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get invoice summary for tenant."""
        tenant_id = request.tenant_id
        
        summary = Invoice.objects.get_tenant_invoice_summary(tenant_id)
        
        return Response({
            'tenant_id': tenant_id,
            'total_invoices': summary['total_invoices'],
            'paid': summary['paid'],
            'pending': summary['pending'],
            'overdue': summary['overdue'],
            'total_paid_amount': summary['total_paid_amount'],
            'total_paid_display': f"KES {summary['total_paid_amount'] / 100:.2f}",
            'total_outstanding': summary['total_outstanding'],
            'total_outstanding_display': f"KES {summary['total_outstanding'] / 100:.2f}"
        })