from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError, PermissionDenied
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist, ValidationError as DjangoValidationError
import logging
from apps.accounts.api.v1.permissions import IsTenantMember, CanViewKPIDashboard
from ....exceptions import KPIException, PermissionDeniedError

logger = logging.getLogger(__name__)


class BaseKpiViewset(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsTenantMember]

    def get_queryset(self):
        queryset = super().get_queryset()
        tenant_id = getattr(self.request, 'current_tenant_id', None)
        
        if not tenant_id and hasattr(self.request, 'user') and self.request.user.is_authenticated:
            tenant_id = str(self.request.user.tenant_id)
        
        if tenant_id and hasattr(queryset.model, 'tenant_id'):
            return queryset.filter(tenant_id=tenant_id)
        return queryset

    def perform_create(self, serializer):
        tenant_id = getattr(self.request, 'current_tenant_id', None)
        if not tenant_id and hasattr(self.request, 'user') and self.request.user.is_authenticated:
            tenant_id = str(self.request.user.tenant_id)
        
        with transaction.atomic():
            serializer.save(
                tenant_id=tenant_id,
                created_by=self.request.user,
                updated_by=self.request.user
            )

    def perform_update(self, serializer):
        with transaction.atomic():
            serializer.save(updated_by=self.request.user)

    def handle_exception(self, exc):
        if isinstance(exc, DjangoValidationError):
            details = exc.message_dict if hasattr(exc, 'message_dict') else exc.messages
            return Response(
                {'error': 'Validation Error', 'details': details},
                status=status.HTTP_400_BAD_REQUEST
            )
        if isinstance(exc, ValidationError):
            return Response(
                {'error': 'Validation Error', 'details': exc.detail},
                status=status.HTTP_400_BAD_REQUEST
            )
        if isinstance(exc, PermissionDenied):
            return Response(
                {'error': 'Permission Denied', 'details': exc.detail if hasattr(exc, 'detail') else str(exc)},
                status=status.HTTP_403_FORBIDDEN
            )
        if isinstance(exc, PermissionDeniedError):
            return Response(
                {'error': 'Permission Denied', 'details': str(exc)},
                status=status.HTTP_403_FORBIDDEN
            )
        if isinstance(exc, ObjectDoesNotExist):
            return Response(
                {'error': 'Not Found', 'details': 'The requested resource does not exist'},
                status=status.HTTP_404_NOT_FOUND
            )
        if isinstance(exc, KPIException):
            return Response(
                {'error': exc.__class__.__name__, 'details': str(exc)},
                status=status.HTTP_400_BAD_REQUEST
            )
        logger.exception(f"Unhandled exception: {exc}")
        return Response(
            {'error': 'Internal Server Error', 'details': 'An unexpected error occurred'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class ReadOnlyKPIViewset(BaseKpiViewset):
    def create(self, request, *args, **kwargs):
        return Response(
            {'error': 'Method not allowed'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    def update(self, request, *args, **kwargs):
        return Response(
            {'error': 'Method not allowed'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    def destroy(self, request, *args, **kwargs):
        return Response(
            {'error': 'Method not allowed'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )


class BulkOperationMixin:
    MAX_BULK_SIZE = 1000

    def validate_bulk_request(self, request):
        if not request.data or not isinstance(request.data, list):
            raise ValidationError("Request must be a list of items")
        if len(request.data) > self.MAX_BULK_SIZE:
            raise ValidationError(f"Bulk operation limited to {self.MAX_BULK_SIZE} items")
        return request.data

    def bulk_response(self, success_count, failed_count, errors):
        return Response({
            'success_count': success_count,
            'failed_count': failed_count,
            'errors': errors
        }, status=status.HTTP_207_MULTI_STATUS if failed_count > 0 else status.HTTP_200_OK)