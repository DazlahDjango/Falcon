# apps/tenant/api/v1/views/domain_views.py
"""
Domain management views for custom domains.
"""

from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from apps.tenant.models import CustomDomain
from apps.tenant.api.v1.serializers import DomainSerializer, DomainCreateSerializer, DomainDetailSerializer
from apps.tenant.api.v1.permissions import IsTenantAdmin, IsSuperAdmin, HasTenantAccess
from apps.tenant.api.v1.throttles import TenantApiThrottle, AdminOperationThrottle
from apps.tenant.services.domain.domain_service import DomainService
from apps.tenant.services.domain.dns_validator import DNSValidator


class DomainViewSet(viewsets.ModelViewSet):
    """
    ViewSet for CustomDomain CRUD operations.

    Provides:
        - List domains for a tenant
        - Add new domain
        - Update domain settings
        - Delete domain
        - Verify domain
        - Set as primary domain
    """

    queryset = CustomDomain.objects.filter(is_deleted=False)
    serializer_class = DomainSerializer
    permission_classes = [IsAuthenticated, IsTenantAdmin]
    throttle_classes = [TenantApiThrottle]

    def get_serializer_class(self):
        if self.action == 'create':
            return DomainCreateSerializer
        elif self.action == 'retrieve':
            return DomainDetailSerializer
        return DomainSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by tenant
        tenant_id = self.request.query_params.get('tenant_id')
        if tenant_id:
            queryset = queryset.filter(tenant_id=tenant_id)
        elif hasattr(self.request, 'tenant_id'):
            queryset = queryset.filter(tenant_id=self.request.tenant_id)

        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Filter by is_primary
        is_primary = self.request.query_params.get('is_primary')
        if is_primary is not None:
            is_primary_bool = is_primary.lower() == 'true'
            queryset = queryset.filter(is_primary=is_primary_bool)

        return queryset

    def perform_create(self, serializer):
        """Create a new domain."""
        service = DomainService()
        domain = service.add_domain(
            tenant_id=self.request.data.get('tenant_id'),
            domain_name=serializer.validated_data['domain'],
            is_primary=serializer.validated_data.get('is_primary', False)
        )
        serializer.instance = domain

    @action(detail=True, methods=['post'], url_path='verify')
    def verify(self, request, pk=None):
        """
        Verify domain ownership via DNS.
        """
        domain = self.get_object()

        service = DomainService()
        is_verified = service.verify_domain(domain.id)

        if is_verified:
            return Response({
                'status': 'success',
                'message': f'Domain {domain.domain} verified successfully',
                'domain_id': str(domain.id),
                'verified_at': timezone.now()
            })
        else:
            return Response({
                'status': 'failed',
                'message': 'Domain verification failed. Please check DNS records.',
                'domain_id': str(domain.id),
                'verification_token': str(domain.verification_token),
                'dns_record': f"falcon-domain-verification={domain.verification_token.hex}"
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='set-primary')
    def set_primary(self, request, pk=None):
        """
        Set this domain as the primary domain for the tenant.
        """
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
        """
        Get DNS verification information for the domain.
        """
        domain = self.get_object()

        return Response({
            'domain_id': str(domain.id),
            'domain': domain.domain,
            'status': domain.status,
            'verification_token': str(domain.verification_token),
            'dns_record': f"falcon-domain-verification={domain.verification_token.hex}",
            'instructions': """
                1. Add a TXT record to your domain's DNS settings
                2. Record name: @ or your domain
                3. Record value: falcon-domain-verification={token}
                4. Wait 5-10 minutes for DNS propagation
                5. Click 'Verify' button to complete verification
            """.format(token=domain.verification_token.hex)
        })


class DomainVerifyView(generics.GenericAPIView):
    """Verify a domain."""
    permission_classes = [IsAuthenticated, IsTenantAdmin]
    throttle_classes = [AdminOperationThrottle]

    def post(self, request, pk):
        domain = get_object_or_404(CustomDomain, id=pk, is_deleted=False)

        service = DomainService()
        is_verified = service.verify_domain(domain.id)

        if is_verified:
            return Response({
                'message': f'Domain {domain.domain} verified successfully',
                'verified': True
            })

        return Response({
            'message': 'Verification failed. Check DNS records.',
            'verified': False,
            'verification_token': str(domain.verification_token),
            'dns_record': f"falcon-domain-verification={domain.verification_token.hex}"
        }, status=status.HTTP_400_BAD_REQUEST)


class DomainSetPrimaryView(generics.GenericAPIView):
    """Set a domain as primary."""
    permission_classes = [IsAuthenticated, IsTenantAdmin]
    throttle_classes = [AdminOperationThrottle]

    def post(self, request, pk):
        domain = get_object_or_404(CustomDomain, id=pk, is_deleted=False)

        service = DomainService()
        service.set_as_primary(domain.id)

        return Response({
            'message': f'Domain {domain.domain} is now primary',
            'domain_id': str(domain.id)
        })


class TenantDomainsView(generics.GenericAPIView):
    """Get all domains for a tenant."""
    permission_classes = [IsAuthenticated, HasTenantAccess]

    def get(self, request, tenant_id):
        domains = CustomDomain.objects.filter(
            tenant_id=tenant_id,
            is_deleted=False
        )

        serializer = DomainSerializer(domains, many=True)

        return Response({
            'tenant_id': tenant_id,
            'domains': serializer.data,
            'total': domains.count(),
            'primary_domain': next(
                (d.domain for d in domains if d.is_primary),
                None
            )
        })
