# billing/api/v1/views/invoice_views.py
"""
Views for Invoice management.
"""
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from apps.billing.models import Invoice
from apps.billing.api.v1.serializers import InvoiceSerializer, InvoiceDetailSerializer, InvoiceListSerializer
from apps.billing.api.v1.filters import InvoiceFilter
from apps.billing.api.v1.permission import CanViewInvoices
from apps.billing.api.v1.views.base import BillingBaseViewSet
from apps.billing.services import InvoiceService, BillingNotificationService

class InvoiceViewSet(BillingBaseViewSet):
    queryset = Invoice.objects.filter(is_deleted=False)
    permission_classes = [IsAuthenticated, CanViewInvoices]
    filter_backends = [DjangoFilterBackend]
    filterset_class = InvoiceFilter
    ordering_fields = ['invoice_date', 'due_date', 'amount_due']
    ordering = ['-invoice_date']
    def get_serializer_class(self):
        if self.action == 'list':
            return InvoiceListSerializer
        if self.action == 'retrieve':
            return InvoiceDetailSerializer
        if self.action == 'download':
            return None
        return InvoiceSerializer
    def get_queryset(self):
        queryset = super().get_queryset()
        if hasattr(self.request.user, 'tenant_id') and self.request.user.tenant_id:
            return queryset.filter(tenant_id=self.request.user.tenant_id)
        if self.request.user.role == 'super_admin':
            return queryset
        return queryset.none()
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = InvoiceDetailSerializer(instance)
        return Response(serializer.data)
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        total_amount = queryset.aggregate(total=models.Sum('amount_due'))['total'] or 0
        total_paid = queryset.filter(status='paid').aggregate(total=models.Sum('amount_paid'))['total'] or 0
        total_outstanding = queryset.filter(status__in=['draft', 'open']).aggregate(total=models.Sum('amount_remaining'))['total'] or 0
        overdue_count = queryset.filter(status__in=['draft', 'open'], due_date__lt=timezone.now()).count()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = InvoiceListSerializer(page, many=True)
            return self.get_paginated_response({
                'invoices': serializer.data,
                'summary': {
                    'total_amount': float(total_amount),
                    'total_paid': float(total_paid),
                    'total_outstanding': float(total_outstanding),
                    'overdue_count': overdue_count,
                    'currency': 'KES'
                }
            })
        serializer = InvoiceListSerializer(queryset, many=True)
        return Response({
            'invoices': serializer.data,
            'summary': {
                'total_amount': float(total_amount),
                'total_paid': float(total_paid),
                'total_outstanding': float(total_outstanding),
                'overdue_count': overdue_count,
                'currency': 'KES'
            }
        })
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        invoice = self.get_object()
        service = InvoiceService()
        pdf_url = service.get_invoice_pdf(invoice)
        if pdf_url:
            return HttpResponseRedirect(pdf_url)
        return Response(
            {'error': 'PDF not available for this invoice'},
            status=status.HTTP_404_NOT_FOUND
        )
    @action(detail=True, methods=['post'])
    def remind(self, request, pk=None):
        invoice = self.get_object()
        if invoice.status not in ['draft', 'open']:
            return Response(
                {'error': 'Reminders can only be sent for unpaid invoices'},
                status=status.HTTP_400_BAD_REQUEST
            )
        service = BillingNotificationService()
        sent = service.send_invoice_created_notification(invoice)
        if sent:
            return Response({'message': 'Reminder sent successfully'})
        return Response(
            {'error': 'Failed to send reminder. No email configured.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    @action(detail=False, methods=['get'])
    def outstanding(self, request):
        queryset = self.get_queryset().filter(
            status__in=['draft', 'open'],
            is_deleted=False
        ).order_by('due_date')
        serializer = InvoiceListSerializer(queryset, many=True)
        total_outstanding = sum(inv.amount_remaining for inv in queryset)
        return Response({
            'invoices': serializer.data,
            'total_outstanding': float(total_outstanding),
            'currency': 'KES',
            'count': len(serializer.data)
        })