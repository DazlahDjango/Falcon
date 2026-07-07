from rest_framework import viewsets
from django.db import models
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from ....models import Invoice
from ..serializers import InvoiceSerializer, InvoiceListSerializer, InvoiceDetailSerializer, InvoiceDownloadSerializer
from ....services import InvoiceService
from ....services.decorators import tenant_isolation
from ..permissions import IsSuperAdmin, IsClientAdmin, IsAuthenticated

class InvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Invoice.objects.filter(is_deleted=False)
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['generate_pdf', 'send_email']:
            self.permission_classes = [IsClientAdmin]
        elif self.action == 'admin_stats':
            self.permission_classes = [IsSuperAdmin]
        else:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return InvoiceListSerializer
        if self.action == 'retrieve':
            return InvoiceDetailSerializer
        return InvoiceSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == 'super_admin':
            return super().get_queryset()
        tenant_id = self.request.tenant_id if hasattr(self.request, 'tenant_id') else user.tenant_id
        return super().get_queryset().filter(tenant_id=tenant_id)
    
    @action(detail=True, methods=['get'], url_path='download')
    def download_invoice(self, request, pk=None):
        invoice = self.get_object()
        format = request.query_params.get('format', 'pdf')
        service = InvoiceService()
        pdf_bytes = service.generate_pdf(invoice.id)
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="invoice_{invoice.invoice_number}.pdf"'
        return response
    
    @action(detail=True, methods=['post'], url_path='send')
    def send_email(self, request, pk=None):
        invoice = self.get_object()
        email = request.data.get('email')
        if not email:
            tenant_id = request.tenant_id if hasattr(request, 'tenant_id') else request.user.tenant_id
            from apps.tenant.models import Organization
            tenant = Organization.objects.get(id=tenant_id)
            email = tenant.contact_email or tenant.email
        service = InvoiceService()
        service.send_invoice_email(invoice.id, email)
        return Response({'status': 'email_sent', 'recipient': email})
    
    @action(detail=False, methods=['get'], url_path='outstanding')
    def outstanding_invoices(self, request):
        tenant_id = request.tenant_id if hasattr(request, 'tenant_id') else request.user.tenant_id
        invoices = self.get_queryset().filter(status__in=['pending', 'overdue']).order_by('due_date')
        total_outstanding = invoices.aggregate(total=models.Sum('total_amount'))['total'] or 0
        return Response({'outstanding_count': invoices.count(), 'total_outstanding': total_outstanding, 'total_outstanding_display': f"KES {total_outstanding/100:.2f}", 'invoices': InvoiceListSerializer(invoices, many=True).data})
    
    @action(detail=False, methods=['get'], url_path='admin/overdue')
    def admin_overdue(self, request):
        from django.utils import timezone
        overdue = Invoice.objects.filter(status='pending', due_date__lt=timezone.now())
        return Response({'count': overdue.count(), 'invoices': InvoiceListSerializer(overdue, many=True).data})