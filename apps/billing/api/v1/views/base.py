from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.db import transaction
from django.utils import timezone
import logging
from apps.billing.exceptions import (
    SubscriptionError, PaymentError, QuotaError, WebhookError
)
logger = logging.getLogger(__name__)

class BillingBaseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'options']
    def get_queryset(self):
        queryset = super().get_queryset()
        if hasattr(queryset.model, 'tenant_id'):
            if hasattr(self.request.user, 'tenant_id') and self.request.user.tenant_id:
                return queryset.filter(tenant_id=self.request.user.tenant_id)
        return queryset
    
    def get_tenant(self):
        if hasattr(self.request, 'tenant'):
            return self.request.tenant
        if hasattr(self.request.user, 'tenant_id') and self.request.user.tenant_id:
            from apps.tenant.models import Client
            try:
                return Client.objects.get(id=self.request.user.tenant_id)
            except Client.DoesNotExist:
                pass
        return None
    
    def get_audit_context(self, request, **kwargs):
        return {
            'ip_address': self._get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            'request_path': request.path,
            'request_method': request.method,
            **kwargs
        }
    
    def handle_exception(self, exc):
        if isinstance(exc, SubscriptionError):
            return Response(
                {
                    'error': 'subscription_error',
                    'message': str(exc),
                    'code': getattr(exc, 'code', 'SUBSCRIPTION_ERROR')
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        if isinstance(exc, PaymentError):
            return Response(
                {
                    'error': 'payment_error',
                    'message': str(exc),
                    'code': getattr(exc, 'code', 'PAYMENT_ERROR')
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        if isinstance(exc, QuotaError):
            return Response(
                {
                    'error': 'quota_error',
                    'message': str(exc),
                    'code': 'QUOTA_EXCEEDED'
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        if isinstance(exc, WebhookError):
            return Response(
                {
                    'error': 'webhook_error',
                    'message': str(exc),
                    'code': 'WEBHOOK_ERROR'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        if isinstance(exc, PermissionDenied):
            return Response(
                {
                    'error': 'permission_denied',
                    'message': str(exc),
                    'code': 'PERMISSION_DENIED'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        if isinstance(exc, ValidationError):
            return Response(
                {
                    'error': 'validation_error',
                    'message': str(exc),
                    'code': 'VALIDATION_ERROR'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        logger.error(f"Unhandled exception in {self.__class__.__name__}: {exc}")
        return Response(
            {
                'error': 'internal_error',
                'message': 'An internal error occurred. Please try again later.',
                'code': 'INTERNAL_ERROR'
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')