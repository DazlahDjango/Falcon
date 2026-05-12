from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from apps.billing.models import Payment
from apps.billing.api.v1.serializers import PaymentSerializer, PaymentDetailSerializer, PaymentListSerializer
from apps.billing.api.v1.filters import PaymentFilter
from apps.billing.api.v1.permission import CanViewBilling
from apps.billing.api.v1.views.base import BillingBaseViewSet

class PaymentViewSet(BillingBaseViewSet):
    queryset = Payment.objects.filter(is_deleted=False)
    permission_classes = [IsAuthenticated, CanViewBilling]
    filter_backends = [DjangoFilterBackend]
    filterset_class = PaymentFilter
    ordering_fields = ['payment_date', 'amount']
    ordering = ['-payment_date']
    def get_serializer_class(self):
        if self.action == 'list':
            return PaymentListSerializer
        if self.action == 'retrieve':
            return PaymentDetailSerializer
        return PaymentSerializer
    def get_queryset(self):
        queryset = super().get_queryset()
        if hasattr(self.request.user, 'tenant_id') and self.request.user.tenant_id:
            return queryset.filter(tenant_id=self.request.user.tenant_id)
        if self.request.user.role == 'super_admin':
            return queryset
        return queryset.none()
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        total_succeeded = queryset.filter(status='succeeded').aggregate(total=models.Sum('amount'))['total'] or 0
        total_failed = queryset.filter(status='failed').aggregate(total=models.Sum('amount'))['total'] or 0
        total_refunded = queryset.filter(status='refunded').aggregate(total=models.Sum('refunded_amount'))['total'] or 0
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = PaymentListSerializer(page, many=True)
            return self.get_paginated_response({
                'payments': serializer.data,
                'summary': {
                    'total_succeeded': float(total_succeeded),
                    'total_failed': float(total_failed),
                    'total_refunded': float(total_refunded),
                    'currency': 'KES'
                }
            })
        serializer = PaymentListSerializer(queryset, many=True)
        return Response({
            'payments': serializer.data,
            'summary': {
                'total_succeeded': float(total_succeeded),
                'total_failed': float(total_failed),
                'total_refunded': float(total_refunded),
                'currency': 'KES'
            }
        })