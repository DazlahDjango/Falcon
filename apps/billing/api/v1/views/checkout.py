from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.accounts.api.v1.permissions import IsAuthenticated
from django.conf import settings
from django.shortcuts import redirect
from django.urls import reverse
from ....services.billing.checkout import CheckoutService
from ....services.paystack.verification import PaymentVerifier
from ....services.audit.logger import audit_logger
from ..serializers import (
    CheckoutInitializeSerializer,
    CheckoutResponseSerializer,
    CheckoutVerifySerializer,
)
from ..permissions import CanMakePayment
from ..throttles import BillingCheckoutThrottle, PaymentInitiationThrottle


class CheckoutViewSet(viewsets.GenericViewSet):
    """
    Checkout ViewSet for payment processing.
    
    Actions:
    - initialize: Initialize a checkout session
    - verify: Verify payment status
    - callback: Handle PayStack redirect callback
    """
    
    permission_classes = [IsAuthenticated, CanMakePayment]
    throttle_classes = [BillingCheckoutThrottle, PaymentInitiationThrottle]
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'initialize':
            return CheckoutInitializeSerializer
        elif self.action == 'verify':
            return CheckoutVerifySerializer
        return CheckoutResponseSerializer
    
    @action(detail=False, methods=['post'])
    def initialize(self, request):
        """Initialize a checkout session."""
        return self.initialize_checkout(request)
    
    def initialize_checkout(self, request):
        """Internal method for checkout initialization."""
        serializer = CheckoutInitializeSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        tenant_id = request.tenant_id
        
        # Get user email
        email = request.user.email
        
        checkout_service = CheckoutService()
        
        try:
            # Determine checkout type
            if data.get('plan_id'):
                # Subscription checkout
                result = checkout_service.initialize_subscription_checkout(
                    tenant_id=tenant_id,
                    plan_id=str(data['plan_id']),
                    email=email,
                    callback_url=data.get('success_url'),
                    metadata=data.get('metadata')
                )
            else:
                # One-time payment checkout
                result = checkout_service.initialize_one_time_checkout(
                    tenant_id=tenant_id,
                    amount=data['amount'],
                    email=email,
                    description=data['description'],
                    callback_url=data.get('success_url'),
                    metadata=data.get('metadata')
                )
            
            # Log audit
            audit_logger.log(
                user=request.user,
                tenant_id=tenant_id,
                action='create',
                resource_type='transaction',
                resource_id=result['transaction_id'],
                metadata={'checkout_type': 'subscription' if data.get('plan_id') else 'one_time'},
                request=request
            )
            
            return Response({
                'authorization_url': result['authorization_url'],
                'access_code': result['access_code'],
                'reference': result['reference'],
                'transaction_id': result['transaction_id']
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get', 'post'])
    def callback(self, request):
        """
        Handle PayStack redirect callback.
        This endpoint receives the redirect after payment.
        """
        reference = request.GET.get('reference') or request.data.get('reference')
        
        if not reference:
            return Response(
                {'error': 'Missing transaction reference'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify transaction
        verifier = PaymentVerifier()
        transaction = verifier.verify_and_update_transaction(reference)
        
        if not transaction:
            return Response(
                {'error': 'Transaction not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Redirect to success or failure page
        base_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        
        if transaction.status == 'success':
            return redirect(f"{base_url}/payment/success?reference={reference}")
        else:
            return redirect(f"{base_url}/payment/failed?reference={reference}")
    
    @action(detail=False, methods=['post'])
    def verify(self, request):
        """Verify payment status."""
        serializer = CheckoutVerifySerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        reference = serializer.validated_data['reference']
        transaction = serializer.context.get('transaction')
        
        # Verify with PayStack if needed
        if transaction and transaction.status == 'pending':
            verifier = PaymentVerifier()
            transaction = verifier.verify_and_update_transaction(reference)
        
        if not transaction:
            return Response(
                {'error': 'Transaction not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response({
            'verified': transaction.status == 'success',
            'status': transaction.status,
            'reference': transaction.reference,
            'amount': transaction.amount_display,
            'transaction_id': str(transaction.id)
        })