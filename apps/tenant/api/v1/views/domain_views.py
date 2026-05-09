"""
Domain management views for custom domains.
"""

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from apps.tenant.models import CustomDomain
from apps.tenant.api.v1.serializers import (
    DomainSerializer, DomainCreateSerializer, DomainDetailSerializer
)
from apps.tenant.api.v1.permissions import IsTenantAdmin
from apps.tenant.api.v1.throttles import TenantApiThrottle
from apps.tenant.services.domain.domain_service import DomainService


class DomainViewSet(viewsets.ModelViewSet):
    """
    ViewSet for CustomDomain CRUD + custom actions.
    
    Provides complete domain management including verification and primary domain setup.
    The nested router (/tenants/{tenant_pk}/domains/) handles tenant scoping automatically.
    """

    queryset = CustomDomain.objects.filter(is_deleted=False)
    permission_classes = [IsAuthenticated, IsTenantAdmin]
    throttle_classes = [TenantApiThrottle]

    def get_serializer_class(self):
        if self.action == 'create':
            return DomainCreateSerializer
        elif self.action == 'retrieve':
            return DomainDetailSerializer
        return DomainSerializer

    def get_queryset(self):
        """Filter domains based on tenant context from nested router or query params."""
        queryset = super().get_queryset()
        
        # Nested router provides tenant_pk automatically
        if hasattr(self.request, 'tenant_pk'):
            queryset = queryset.filter(tenant_id=self.request.tenant_pk)
        # Fallback to query param for top-level access
        elif tenant_id := self.request.query_params.get('tenant_id'):
            queryset = queryset.filter(tenant_id=tenant_id)
        
        # Additional filters
        if status_filter := self.request.query_params.get('status'):
            queryset = queryset.filter(status=status_filter)
        
        if is_primary := self.request.query_params.get('is_primary'):
            queryset = queryset.filter(is_primary=is_primary.lower() == 'true')
        
        return queryset

    def perform_create(self, serializer):
        """Create domain using domain service."""
        service = DomainService()
        domain = service.add_domain(
            tenant_id=self.request.tenant_pk if hasattr(self.request, 'tenant_pk') 
                     else self.request.data.get('tenant_id'),
            domain_name=serializer.validated_data['domain'],
            is_primary=serializer.validated_data.get('is_primary', False)
        )
        serializer.instance = domain

    @action(detail=True, methods=['post'], url_path='verify')
    def verify(self, request, pk=None):
        """POST /domains/{id}/verify/ - Verify domain ownership via DNS."""
        domain = self.get_object()
        service = DomainService()
        
        if service.verify_domain(domain.id):
            return Response({
                'status': 'success',
                'message': f'Domain {domain.domain} verified successfully',
                'domain_id': str(domain.id),
                'verified_at': timezone.now()
            })
        
        return Response({
            'status': 'failed',
            'message': 'Verification failed. Check DNS records.',
            'domain_id': str(domain.id),
            'verification_token': str(domain.verification_token),
            'dns_record': f"falcon-domain-verification={domain.verification_token.hex}"
        }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='set-primary')
    def set_primary(self, request, pk=None):
        """POST /domains/{id}/set-primary/ - Set as primary domain for tenant."""
        domain = self.get_object()
        service = DomainService()
        service.set_as_primary(domain.id)
        
        return Response({
            'status': 'success',
            'message': f'Domain {domain.domain} is now the primary domain',
            'domain_id': str(domain.id)
        })

    @action(detail=True, methods=['get'], url_path='verification-info')
    def verification_info(self, request, pk=None):
        """GET /domains/{id}/verification-info/ - Get DNS verification instructions."""
        domain = self.get_object()
        
        return Response({
            'domain_id': str(domain.id),
            'domain': domain.domain,
            'status': domain.status,
            'verification_token': str(domain.verification_token),
            'dns_record': f"falcon-domain-verification={domain.verification_token.hex}",
            'instructions': {
                'record_type': 'TXT',
                'record_name': '@',
                'record_value': f'falcon-domain-verification={domain.verification_token.hex}',
                'propagation_time': '5-10 minutes'
            }
        })