from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import redirect
from django.conf import settings
from ..serializers import CheckoutInitializeSerializer, CheckoutResponseSerializer, CheckoutVerifySerializer
from ....services import CheckoutService
from ....services.decorators import idempotent, circuit_breaker
from ..permissions import IsAuthenticated

class CheckoutViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CheckoutInitializeSerializer
    
    @action(detail=False, methods=['post'], url_path='initialize')
    @idempotent('checkout_initialize')
    def initialize_checkout(self, request):
        serializer = CheckoutInitializeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tenant_id = request.tenant_id if hasattr(request, 'tenant_id') else request.user.tenant_id
        email = request.user.email
        service = CheckoutService()
        if 'plan_id' in serializer.validated_data:
            result = service.initialize_subscription_checkout(tenant_id=tenant_id, plan_id=str(serializer.validated_data['plan_id']), email=email, callback_url=serializer.validated_data.get('success_url'), metadata=serializer.validated_data.get('metadata'))
        else:
            result = service.initialize_one_time_checkout(tenant_id=tenant_id, amount=serializer.validated_data['amount'], email=email, description=serializer.validated_data['description'], callback_url=serializer.validated_data.get('success_url'), metadata=serializer.validated_data.get('metadata'))
        return Response(CheckoutResponseSerializer(result).data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'], url_path='verify')
    def verify_checkout(self, request):
        reference = request.query_params.get('reference')
        if not reference:
            return Response({'error': 'Reference is required'}, status=status.HTTP_400_BAD_REQUEST)
        service = CheckoutService()
        result = service.verify_checkout(reference)
        return Response(result)
    
    @action(detail=False, methods=['get'], url_path='callback')
    def payment_callback(self, request):
        reference = request.query_params.get('reference')
        trxref = request.query_params.get('trxref')
        ref = reference or trxref
        if not ref:
            return redirect(f"{getattr(settings, 'BASE_URL', '')}/payment/failed?error=no_reference")
        service = CheckoutService()
        result = service.verify_checkout(ref)
        if result.get('verified'):
            return redirect(f"{getattr(settings, 'BASE_URL', '')}/payment/success?reference={ref}")
        return redirect(f"{getattr(settings, 'BASE_URL', '')}/payment/failed?reference={ref}")