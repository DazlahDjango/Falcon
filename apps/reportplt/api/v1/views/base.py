# apps/reportplt/api/v1/views/base.py
from rest_framework import viewsets, status, mixins
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.utils import timezone
from apps.reportplt.api.v1.permissions import TenantIsolationPermission
from apps.reportplt.api.v1.filters import TenantFilterBackend
from apps.reportplt.api.v1.throttles import TenantRateThrottle, TieredThrottle
from apps.reportplt.middleware.rls_enforcer import RLSEnforcer
from apps.reportplt.services.security.row_level_security import RLSEnforcer as RLSEnforcerService

class BaseViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated, TenantIsolationPermission]
    throttle_classes = [TenantRateThrottle, TieredThrottle]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter, TenantFilterBackend]
    search_fields = []
    ordering_fields = []
    ordering = ['-created_at']

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        with transaction.atomic():
            instance = serializer.save()
            self._post_create(instance)
        return instance

    def perform_update(self, serializer):
        with transaction.atomic():
            instance = serializer.save()
            self._post_update(instance)
        return instance

    def perform_destroy(self, instance):
        with transaction.atomic():
            if hasattr(instance, 'soft_delete'):
                instance.soft_delete()
            else:
                instance.delete()
            self._post_delete(instance)

    def _post_create(self, instance):
        pass

    def _post_update(self, instance):
        pass

    def _post_delete(self, instance):
        pass

    def handle_exception(self, exc):
        from django.core.exceptions import ValidationError as DjangoValidationError
        from rest_framework.exceptions import ValidationError as DRFValidationError
        if isinstance(exc, DjangoValidationError):
            detail = exc.message_dict if hasattr(exc, 'message_dict') else exc.messages
            exc = DRFValidationError(detail)
        if hasattr(self, 'exception_handler'):
            response = self.exception_handler(exc, self.get_context())
            if response:
                return response
        return super().handle_exception(exc)

class BaseModelViewSet(BaseViewSet, viewsets.ModelViewSet):
    pass

class BaseReadOnlyViewSet(BaseViewSet, viewsets.ReadOnlyModelViewSet):
    pass

class BaseListCreateViewSet(BaseViewSet, mixins.ListModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    pass

class BaseRetrieveUpdateDestroyViewSet(BaseViewSet, mixins.RetrieveModelMixin, mixins.UpdateModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet):
    pass

class PaginatedViewSet(BaseViewSet):
    pagination_class = None

    def get_paginated_response(self, data):
        if self.pagination_class:
            return super().get_paginated_response(data)
        return Response(data)