from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from django.conf import settings
from apps.billing.api.v1.serializers import (
    CheckoutSessionCreateSerializer, CheckoutSessionSerializer
)
from apps.billing.api.v1.permission import CanManageBilling
from apps.billing.api.v1.views.base import BillingBaseViewSet
from apps.billing.services.checkout_service import CheckoutService
from apps.billing.exceptions import SubscriptionError

class CheckoutViewSet(BillingBaseViewSet):
    permission_classes = [IsAuthenticated, CanManageBilling]
    def get_serializer_class(self):
        if self.action == 'create':
            return CheckoutSessionCreateSerializer
        return CheckoutSessionSerializer
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tenant = self.get_tenant()
        if not tenant:
            return Response(
                {'error': 'No tenant associated with user'},
                status=status.HTTP_400_BAD_REQUEST
            )
        plan = serializer.validated_data['plan_id']
        billing_interval = serializer.validated_data['billing_interval']
        success_url = serializer.validated_data.get('success_url')
        cancel_url = serializer.validated_data.get('cancel_url')
        allow_promotion_codes = serializer.validated_data.get('allow_promotion_codes', True)
        if not success_url:
            success_url = f"{settings.FRONTEND_URL}/billing/success?session_id={{CHECKOUT_SESSION_ID}}"
        if not cancel_url:
            cancel_url = f"{settings.FRONTEND_URL}/billing/cancel"
        checkout_service = CheckoutService()
        try:
            session_data = checkout_service.create_checkout_session(
                tenant=tenant,
                plan=plan,
                billing_interval=billing_interval,
                success_url=success_url,
                cancel_url=cancel_url,
                allow_promotion_codes=allow_promotion_codes
            )
            return Response(session_data, status=status.HTTP_201_CREATED)
        except SubscriptionError as e:
            return self.handle_exception(e)
        except Exception as e:
            return Response(
                {'error': f'Failed to create checkout session: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    @action(detail=False, methods=['get'])
    def session(self, request):
        session_id = request.query_params.get('session_id')
        if not session_id:
            return Response(
                {'error': 'session_id query parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        checkout_service = CheckoutService()
        try:
            session_data = checkout_service.get_checkout_session(session_id)
            return Response(session_data)
        except Exception as e:
            return Response(
                {'error': f'Failed to retrieve session: {str(e)}'},
                status=status.HTTP_404_NOT_FOUND
            )