# apps/tenant/api/v1/views/sector_views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from apps.tenant.models import OrganizationSector
from apps.tenant.api.v1.serializers import OrganizationSectorSerializer
from apps.tenant.api.v1.permissions import IsSuperAdmin, CanManageOrganization
from apps.tenant.api.v1.throttles import OrganizationApiThrottle

class SectorViewSet(viewsets.ModelViewSet):
    queryset = OrganizationSector.objects.filter(is_deleted=False)
    permission_classes = [IsAuthenticated]
    throttle_classes = [OrganizationApiThrottle]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['sector_type', 'is_active']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_serializer_class(self):
        return OrganizationSectorSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAuthenticated, IsSuperAdmin]
        elif self.action in ['list', 'retrieve']:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.query_params.get('sector_type'):
            queryset = queryset.filter(sector_type=self.request.query_params.get('sector_type'))
        if self.request.query_params.get('is_active') is not None:
            is_active = self.request.query_params.get('is_active').lower() == 'true'
            queryset = queryset.filter(is_active=is_active)
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        sector = self.get_object()
        sector.is_active = not sector.is_active
        sector.save(update_fields=['is_active'])
        return Response({
            'success': True,
            'is_active': sector.is_active,
            'message': f'Sector {sector.name} {"activated" if sector.is_active else "deactivated"}'
        })