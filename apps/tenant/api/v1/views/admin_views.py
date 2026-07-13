from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.tenant.models import Organization
from apps.tenant.api.v1.serializers import OrganizationListSerializer, OrganizationDetailSerializer
from apps.tenant.api.v1.permissions import IsSuperAdmin
from apps.tenant.api.v1.throttles import AdminOperationThrottle
from apps.tenant.services import OrganizationService


class AdminOrganizationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Organization.objects.filter(is_deleted=False)
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    throttle_classes = [AdminOperationThrottle]
    serializer_class = OrganizationListSerializer

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return OrganizationDetailSerializer
        return OrganizationListSerializer

    @action(detail=True, methods=['post'])
    def force_suspend(self, request, pk=None):
        org = self.get_object()
        service = OrganizationService()
        result = service.suspend_organization(org.id)
        return Response({
            'success': True,
            'message': f'Organization {result.name} suspended by admin'
        })

    @action(detail=True, methods=['post'])
    def force_activate(self, request, pk=None):
        org = self.get_object()
        service = OrganizationService()
        result = service.activate_organization(org.id)
        return Response({
            'success': True,
            'message': f'Organization {result.name} activated by admin'
        })

    @action(detail=True, methods=['delete'])
    def force_delete(self, request, pk=None):
        org = self.get_object()
        service = OrganizationService()
        service.delete_organization(org.id, hard=True, user=request.user)
        return Response({
            'success': True,
            'message': f'Organization {org.name} permanently deleted',
        })