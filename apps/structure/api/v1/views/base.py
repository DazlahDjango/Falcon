from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from django.core.cache import cache
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

class BaseStructureViewSet(viewsets.ModelViewSet):
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']
    cache_ttl = 300
    def get_queryset(self):
        queryset = super().get_queryset()
        if hasattr(self.request, 'user') and hasattr(self.request.user, 'tenant_id'):
            tenant_id = self.request.user.tenant_id
            if tenant_id:
                queryset = queryset.filter(tenant_id=tenant_id)
        if hasattr(queryset.model, 'is_deleted'):
            queryset = queryset.filter(is_deleted=False)
        return queryset
    
    def perform_create(self, serializer):
        if hasattr(self.request, 'user'):
            serializer.save(
                tenant_id=self.request.user.tenant_id,
                created_by=self.request.user.id,
                updated_by=self.request.user.id
            )
        else:
            serializer.save()
        self._invalidate_cache()
        logger.info(f"Created {self.get_serializer_class().__name__} by user {getattr(self.request.user, 'id', 'unknown')}")
    
    def perform_update(self, serializer):
        if hasattr(self.request, 'user'):
            serializer.save(updated_by=self.request.user.id)
        else:
            serializer.save()
        self._invalidate_cache()
        logger.info(f"Updated {self.get_serializer_class().__name__} by user {getattr(self.request.user, 'id', 'unknown')}")
    
    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.deleted_at = timezone.now()
        if hasattr(self.request, 'user'):
            instance.deleted_by = self.request.user.id
        instance.save()
        self._invalidate_cache()
        logger.info(f"Soft deleted {self.get_serializer_class().__name__} {instance.id}")
    
    def _invalidate_cache(self):
        if hasattr(self.request, 'user') and hasattr(self.request.user, 'tenant_id'):
            cache_key_pattern = f"structure:*:{self.request.user.tenant_id}:*"
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
            'tenant_id': str(getattr(request.user, 'tenant_id', None)) if hasattr(request.user, 'tenant_id') else None
        })

class BaseStructureReadOnlyViewSet(viewsets.ReadOnlyModelViewSet):
    http_method_names = ['get', 'head', 'options']
    def get_queryset(self):
        queryset = super().get_queryset()
        if hasattr(self.request, 'user') and hasattr(self.request.user, 'tenant_id'):
            tenant_id = self.request.user.tenant_id
            if tenant_id:
                queryset = queryset.filter(tenant_id=tenant_id)
        if hasattr(queryset.model, 'is_deleted'):
            queryset = queryset.filter(is_deleted=False)
        return queryset