from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from django.core.cache import cache
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


def get_request_tenant_id(request):
    """
    Safely get the tenant_id for the current request.
    1. Checks request.tenant_id / request.current_organization_id (set by middleware / X-Tenant-ID header)
    2. Checks request.user.tenant_id / request.user.organization_id
    3. Fallback: Returns first active Organization ID if authenticated
    """
    if not request:
        return None

    tenant_id = (
        getattr(request, 'tenant_id', None) or
        getattr(request, 'current_organization_id', None) or
        getattr(request, 'current_tenant_id', None)
    )

    if not tenant_id and hasattr(request, 'user') and request.user and request.user.is_authenticated:
        tenant_id = getattr(request.user, 'tenant_id', None) or getattr(request.user, 'organization_id', None)

    if not tenant_id and hasattr(request, 'user') and request.user and request.user.is_authenticated:
        try:
            from apps.tenant.models import Organization
            first_org = Organization.objects.filter(is_active=True).first()
            if first_org:
                tenant_id = str(first_org.id)
        except Exception:
            pass

    return str(tenant_id) if tenant_id else None


class BaseStructureViewSet(viewsets.ModelViewSet):
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']
    cache_ttl = 300

    def get_queryset(self):
        queryset = super().get_queryset()
        tenant_id = get_request_tenant_id(self.request)
        if tenant_id:
            queryset = queryset.filter(tenant_id=tenant_id)
        if hasattr(queryset.model, 'is_deleted'):
            queryset = queryset.filter(is_deleted=False)
        return queryset

    def perform_create(self, serializer):
        tenant_id = get_request_tenant_id(self.request)
        user_id = getattr(self.request.user, 'id', None) if hasattr(self.request, 'user') else None
        serializer.save(
            tenant_id=tenant_id,
            created_by=user_id,
            updated_by=user_id
        )
        self._invalidate_cache()
        logger.info(f"Created {self.get_serializer_class().__name__} by user {user_id or 'unknown'}")

    def perform_update(self, serializer):
        user_id = getattr(self.request.user, 'id', None) if hasattr(self.request, 'user') else None
        serializer.save(updated_by=user_id)
        self._invalidate_cache()
        logger.info(f"Updated {self.get_serializer_class().__name__} by user {user_id or 'unknown'}")

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.deleted_at = timezone.now()
        if hasattr(self.request, 'user'):
            instance.deleted_by = getattr(self.request.user, 'id', None)
        instance.save()
        self._invalidate_cache()
        logger.info(f"Soft deleted {self.get_serializer_class().__name__} {instance.id}")

    def _invalidate_cache(self):
        tenant_id = get_request_tenant_id(self.request)
        if tenant_id:
            try:
                cache.delete(f"structure:org_tree:{tenant_id}")
            except Exception:
                pass
            cache_key_pattern = f"structure:*:{tenant_id}:*"
            try:
                cache.delete_pattern(cache_key_pattern)
            except Exception:
                pass

    @action(detail=False, methods=['get'], url_path='health')
    def health_check(self, request):
        return Response({
            'status': 'healthy',
            'timestamp': timezone.now().isoformat(),
            'app': 'structure',
            'tenant_id': get_request_tenant_id(request)
        })


class BaseStructureReadOnlyViewSet(viewsets.ReadOnlyModelViewSet):
    http_method_names = ['get', 'head', 'options']

    def get_queryset(self):
        queryset = super().get_queryset()
        tenant_id = get_request_tenant_id(self.request)
        if tenant_id:
            queryset = queryset.filter(tenant_id=tenant_id)
        if hasattr(queryset.model, 'is_deleted'):
            queryset = queryset.filter(is_deleted=False)
        return queryset