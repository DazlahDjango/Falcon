from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from apps.tenant.models import OrganizationDomain
from apps.tenant.api.v1.serializers import (
    DomainSerializer,
    DomainCreateSerializer,
    DomainUpdateSerializer,
    DomainDetailSerializer,
    DomainVerifySerializer,
)
from apps.tenant.api.v1.permissions import CanManageDomain, IsSuperAdmin
from apps.tenant.api.v1.throttles import OrganizationApiThrottle
from apps.tenant.api.v1.filters import DomainFilter
from apps.tenant.services import DomainService


class DomainViewSet(viewsets.ModelViewSet):
    queryset = OrganizationDomain.objects.filter(is_deleted=False)
    permission_classes = [IsAuthenticated, CanManageDomain]
    throttle_classes = [OrganizationApiThrottle]
    filterset_class = DomainFilter
    search_fields = ['domain', 'organization__name']
    ordering_fields = ['domain', 'created_at', 'status']
    ordering = ['-created_at']

    def get_serializer_class(self):
        action_serializers = {
            'create': DomainCreateSerializer,
            'update': DomainUpdateSerializer,
            'partial_update': DomainUpdateSerializer,
            'retrieve': DomainDetailSerializer,
            'list': DomainSerializer,
            'verify': DomainVerifySerializer,
        }
        return action_serializers.get(self.action, DomainSerializer)

    def get_permissions(self):
        if self.action in ['verify', 'set_primary']:
            self.permission_classes = [IsAuthenticated, IsSuperAdmin]
        else:
            self.permission_classes = [IsAuthenticated, CanManageDomain]
        return super().get_permissions()

    def get_queryset(self):
        queryset = super().get_queryset()
        org_id = self.request.query_params.get('organization_id')
        if org_id:
            queryset = queryset.filter(organization_id=org_id)
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        is_primary = self.request.query_params.get('is_primary')
        if is_primary is not None:
            queryset = queryset.filter(is_primary=is_primary.lower() == 'true')
        return queryset

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        domain = self.get_object()
        if domain.status in ['ACTIVE', 'VERIFYING']:
            return Response(
                {'error': f'Domain {domain.domain} is already being verified or active'},
                status=status.HTTP_400_BAD_REQUEST
            )
        service = DomainService()
        result = service.verify_domain(domain.id)
        return Response({
            'success': result.status == 'ACTIVE',
            'domain': result.domain,
            'status': result.status,
            'message': 'Domain verified successfully' if result.status == 'ACTIVE' else 'Domain verification failed'
        })

    @action(detail=True, methods=['post'])
    def set_primary(self, request, pk=None):
        domain = self.get_object()
        if domain.status != 'ACTIVE':
            return Response(
                {'error': f'Domain {domain.domain} must be active to set as primary'},
                status=status.HTTP_400_BAD_REQUEST
            )
        service = DomainService()
        result = service.set_primary_domain(domain.id)
        return Response({
            'success': True,
            'message': f'Domain {result.domain} set as primary',
            'domain_id': str(result.id)
        })

    @action(detail=True, methods=['post'])
    def renew_ssl(self, request, pk=None):
        domain = self.get_object()
        if domain.status != 'ACTIVE':
            return Response(
                {'error': f'Domain {domain.domain} is not active'},
                status=status.HTTP_400_BAD_REQUEST
            )
        service = DomainService()
        result = service.renew_ssl(domain.id)
        return Response({
            'success': True,
            'message': f'SSL renewed for {result.domain}',
            'expires_at': result.ssl_expires_at
        })