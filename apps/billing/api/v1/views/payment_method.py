from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from apps.billing.models import PaymentMethod
from apps.billing.api.v1.serializers import (
    PaymentMethodSerializer, PaymentMethodDetailSerializer, PaymentMethodCreateSerializer, PaymentMethodSetDefaultSerializer
)
from apps.billing.api.v1.permission import CanManagePaymentMethods
from apps.billing.api.v1.views.base import BillingBaseViewSet
from apps.billing.services import PaymentService, StripeClient, SubscriptionService

class PaymentMethodViewSet(BillingBaseViewSet):
    queryset = PaymentMethod.objects.filter(is_deleted=False)
    permission_classes = [IsAuthenticated, CanManagePaymentMethods]
    def get_serializer_class(self):
        if self.action == 'create':
            return PaymentMethodCreateSerializer
        if self.action == 'set_default':
            return PaymentMethodSetDefaultSerializer
        if self.action == 'retrieve':
            return PaymentMethodDetailSerializer
        return PaymentMethodSerializer
    def get_queryset(self):
        queryset = super().get_queryset()
        if hasattr(self.request.user, 'tenant_id') and self.request.user.tenant_id:
            return queryset.filter(tenant_id=self.request.user.tenant_id)
        if self.request.user.role == 'super_admin':
            return queryset
        return queryset.none
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        default_method = queryset.filter(is_default=True).first()
        return Response({
            'payment_methods': serializer.data,
            'default_payment_method_id': str(default_method.id) if default_method else None,
            'has_payment_method': queryset.exists(),
            'count': queryset.count()
        })
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment_method_id = serializer.validated_data['payment_method_id']
        set_as_default = serializer.validated_data.get('set_as_default', True)
        tenant = self.get_tenant()
        if not tenant:
            return Response(
                {'error': 'No tenant associated with user'},
                status=status.HTTP_400_BAD_REQUEST
            )
        sub_service = SubscriptionService()
        stripe_customer = sub_service._get_or_create_stripe_customer(tenant)
        payment_service = PaymentService()
        try:
            payment_method = payment_service.save_payment_method(
                tenant=tenant,
                stripe_payment_method_id=payment_method_id,
                stripe_customer_id=stripe_customer.id,
                set_as_default=set_as_default
            )
            return Response(
                PaymentMethodDetailSerializer(payment_method).data,
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return self.handle_exception(e)
    def destroy(self, request, *args, **kwargs):
        payment_method = self.get_object()
        other_methods = PaymentMethod.objects.filter(
            tenant=payment_method.tenant,
            is_active=True,
            is_deleted=False
        ).exclude(id=payment_method.id)
        if not other_methods.exists():
            return Response(
                {'error': 'Cannot delete the only payment method. Add another payment method first.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        payment_service = PaymentService()
        payment_service.delete_payment_method(payment_method)
        return Response(
            {'message': 'Payment method deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )
    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        payment_method = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment_service = PaymentService()
        try:
            updated = payment_service.set_default_payment_method(payment_method)
            return Response(PaymentMethodDetailSerializer(updated).data)
        except Exception as e:
            return self.handle_exception(e)
    @action(detail=False, methods=['get'])
    def default(self, request):
        tenant = self.get_tenant()
        if not tenant:
            return Response(
                {'error': 'No tenant associated with user'},
                status=status.HTTP_400_BAD_REQUEST
            )
        payment_service = PaymentService()
        default_method = payment_service.get_default_payment_method(tenant)
        if default_method:
            return Response(PaymentMethodDetailSerializer(default_method).data)
        return Response(
            {'error': 'No default payment method found'},
            status=status.HTTP_404_NOT_FOUND
        )
    @action(detail=False, methods=['get'])
    def expiring_soon(self, request):
        queryset = self.get_queryset().filter(is_expiring_soon=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'expiring_methods': serializer.data,
            'count': queryset.count()
        })