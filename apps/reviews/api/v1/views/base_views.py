from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, NotFound, ValidationError
from django.utils import timezone
from django.db import models

class BaseReviewViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    throttle_classes = []

    def get_queryset(self):
        queryset = super().get_queryset()
        if hasattr(queryset.model, 'is_deleted'):
            queryset = queryset.filter(is_deleted=False)
        if hasattr(queryset.model, 'review_cycle'):
            queryset = queryset.filter(models.Q(review_cycle__isnull=True) | models.Q(review_cycle__is_deleted=False))
        tenant_id = getattr(self.request.user, 'tenant_id', None)
        if tenant_id and hasattr(queryset.model, 'tenant_id'):
            queryset = queryset.filter(tenant_id=tenant_id)
        elif tenant_id and hasattr(queryset.model, 'employee') and hasattr(queryset.model.employee, 'tenant_id'):
            queryset = queryset.filter(employee__tenant_id=tenant_id)
        return queryset

    def perform_destroy(self, instance):
        if hasattr(instance, 'soft_delete'):
            instance.soft_delete()
        else:
            instance.delete()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context

    def handle_exception(self, exc):
        import logging
        logger = logging.getLogger(__name__)
        from django.core.exceptions import ValidationError as DjangoValidationError
        if isinstance(exc, DjangoValidationError):
            detail = exc.message_dict if hasattr(exc, 'message_dict') else exc.messages
            return Response({'error': 'Validation error', 'detail': detail}, status=status.HTTP_400_BAD_REQUEST)
        if isinstance(exc, PermissionDenied):
            return Response({'error': 'Permission denied', 'detail': str(exc)}, status=status.HTTP_403_FORBIDDEN)
        elif isinstance(exc, NotFound):
            return Response({'error': 'Not found', 'detail': str(exc)}, status=status.HTTP_404_NOT_FOUND)
        elif isinstance(exc, ValidationError):
            return Response({'error': 'Validation error', 'detail': exc.detail}, status=status.HTTP_400_BAD_REQUEST)
        logger.exception(f"Unhandled exception in {self.__class__.__name__}: {exc}")
        return super().handle_exception(exc)

class BaseReadOnlyReviewViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    throttle_classes = []

    def get_queryset(self):
        queryset = super().get_queryset()
        if hasattr(queryset.model, 'is_deleted'):
            queryset = queryset.filter(is_deleted=False)
        if hasattr(queryset.model, 'review_cycle'):
            queryset = queryset.filter(models.Q(review_cycle__isnull=True) | models.Q(review_cycle__is_deleted=False))
        tenant_id = getattr(self.request.user, 'tenant_id', None)
        if tenant_id and hasattr(queryset.model, 'tenant_id'):
            queryset = queryset.filter(tenant_id=tenant_id)
        return queryset

class BaseActionViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    throttle_classes = []

    def get_queryset(self):
        queryset = super().get_queryset()
        if queryset is not None and hasattr(queryset.model, 'is_deleted'):
            queryset = queryset.filter(is_deleted=False)
        if queryset is not None and hasattr(queryset.model, 'review_cycle'):
            queryset = queryset.filter(models.Q(review_cycle__isnull=True) | models.Q(review_cycle__is_deleted=False))
        tenant_id = getattr(self.request.user, 'tenant_id', None)
        if tenant_id and queryset and hasattr(queryset.model, 'tenant_id'):
            queryset = queryset.filter(tenant_id=tenant_id)
        return queryset