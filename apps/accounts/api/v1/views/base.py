from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from apps.accounts.api.v1.permissions import IsTenantMember
from apps.accounts.api.v1.throttles import UserRateThrottle, AnonRateThrottle

class BaseViewset(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsTenantMember]
    throttle_classes = [UserRateThrottle]
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
class BaseModelViewset(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsTenantMember]
    throttle_classes = [UserRateThrottle]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    def get_queryset(self):
        qs = super().get_queryset()
        if hasattr(qs.model, 'tenant_id') and not self.request.user.is_superuser:
            qs = qs.filter(tenant_id=self.request.user.tenant_id)
        return qs
    
    def get_serializer_context(self):
        context =  super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user,
            tenant_id=self.request.user.tenant_id
        )
    
    def perform_update(self, serializer):
        serializer.save(modified_by=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if hasattr(instance, 'soft_delete'):
            instance.soft_delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return super().destroy(request, *args, **kwargs)
    
class BaseReadOnlyViewset(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, IsTenantMember]
    throttle_classes = [UserRateThrottle]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    def get_queryset(self):
        qs = super().get_queryset()
        if hasattr(qs.model, 'tenant_id') and not self.request.user.is_superuser:
            qs = qs.filter(tenant_id=self.request.user.tenant_id)
        return qs