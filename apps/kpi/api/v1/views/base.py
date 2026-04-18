from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError, PermissionDenied
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist
import logging
from apps.accounts.api.v1.permissions import IsTenantMember, CanViewKPIDashboard
from ....exceptions import KPIException, PermissionDeniedError

logger = logging.getLogger(__name__)

class BaseKpiViewset(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsTenantMember]
    def get_queryset(self):
        queryset = super().get_queryset()
        if hasattr(self.request, 'tenant') and self.request.tenant:
            return queryset.filter(tenant_id=self.request.tenant.id)
        return queryset
    def perform_create(self, serializer):
        with transaction.atomic():
            serializer.save(
                tenant_id=self.request.tenant.id if hasattr(self.request, 'tenant') else None,
                created_by=self.request.user,
                updated_by=self.request.user
            )
    def perform_update(self, serializer):
        with transaction.atomic():
            serializer.save(updated_by=self.request.user)
    def handle_exception(self, exc):
        if isinstance(exc, ValidationError):
            return Response(
                {'error': 'Validation Error', 'details': exc.detail},
                status=status.HTTP_400_BAD_REQUEST
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
    def validate_bulk_request(self, request):
        if not request.data or not isinstance(request.data, list):
            raise ValidationError("Request must be a list of items")
        if len(request.data) > 1000:
            raise ValidationError("Bulk operation limited to 1000")
        return request.data 
    def bulk_response(self, success_count, failed_count, errors):
        return Response({
            'success_count': success_count,
            'failed_count': failed_count,
            'errors': errors
        }, status=status.HTTP_207_MULTI_STATUS if failed_count > 0 else status.HTTP_200_OK)