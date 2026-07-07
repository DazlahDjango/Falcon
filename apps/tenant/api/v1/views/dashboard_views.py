from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.tenant.api.v1.serializers import (
    SuperAdminDashboardSerializer,
    ClientAdminDashboardSerializer,
)
from apps.tenant.api.v1.permissions import IsSuperAdmin, IsOrganizationAdmin
from apps.tenant.services import OrganizationService, DomainService, ResourceService
from apps.tenant.services.stats_service import OrganizationStatsService


class DashboardViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action == 'super_admin':
            self.permission_classes = [IsAuthenticated, IsSuperAdmin]
        elif self.action == 'client_admin':
            self.permission_classes = [IsAuthenticated, IsOrganizationAdmin]
        else:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()

    @action(detail=False, methods=['get'])
    def super_admin(self, request):
        stats_service = OrganizationStatsService()
        data = stats_service.get_super_admin_stats()
        serializer = SuperAdminDashboardSerializer(data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def client_admin(self, request):
        org_id = request.user.tenant_id
        if not org_id:
            return Response({'error': 'Organization not found for user'}, status=status.HTTP_400_BAD_REQUEST)
        stats_service = OrganizationStatsService()
        data = stats_service.get_client_admin_stats(org_id)
        serializer = ClientAdminDashboardSerializer(data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def org_stats(self, request):
        org_id = request.query_params.get('organization_id')
        if not org_id:
            return Response({'error': 'organization_id required'}, status=status.HTTP_400_BAD_REQUEST)
        stats_service = OrganizationStatsService()
        data = stats_service.get_org_stats(org_id)
        return Response(data)