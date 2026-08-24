from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from apps.tenant.models import Organization
from apps.tenant.api.v1.serializers import (
    OrganizationSerializer,
    OrganizationCreateSerializer,
    OrganizationUpdateSerializer,
    OrganizationDetailSerializer,
    OrganizationListSerializer,
    OrganizationOnboardSerializer,
)
from apps.accounts.constants import UserRoles
from apps.tenant.api.v1.permissions import (
    IsSuperAdmin,
    CanManageOrganization,
    CanViewOrganization,
)
from apps.tenant.api.v1.throttles import OrganizationApiThrottle
from apps.tenant.api.v1.filters import OrganizationFilter
from apps.tenant.services import OrganizationService, ResourceService
from apps.tenant.exceptions import OrganizationInvalidError, OrganizationError

class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.filter(is_deleted=False).select_related('sector').prefetch_related('domains', 'resources')
    permission_classes = [IsAuthenticated]
    throttle_classes = [OrganizationApiThrottle]
    filterset_class = OrganizationFilter
    search_fields = ['name', 'slug', 'contact_email']
    ordering_fields = ['name', 'created_at', 'status']
    ordering = ['-created_at']

    def get_serializer_class(self):
        action_serializers = {
            'create': OrganizationCreateSerializer,
            'update': OrganizationUpdateSerializer,
            'partial_update': OrganizationUpdateSerializer,
            'retrieve': OrganizationDetailSerializer,
            'list': OrganizationListSerializer,
            'onboard': OrganizationOnboardSerializer,
        }
        return action_serializers.get(self.action, OrganizationSerializer)

    def get_permissions(self):
        if self.action in ['create', 'destroy', 'onboard', 'activate', 'suspend']:
            self.permission_classes = [IsAuthenticated, IsSuperAdmin]
        elif self.action in ['update', 'partial_update']:
            self.permission_classes = [IsAuthenticated, CanManageOrganization]
        elif self.action in ['list', 'retrieve']:
            self.permission_classes = [IsAuthenticated, CanViewOrganization]
        else:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Enforce strict multi-tenant isolation for non-SuperAdmins
        if user.is_authenticated and getattr(user, 'role', None) != UserRoles.SUPER_ADMIN and not getattr(user, 'is_staff', False):
            user_org_id = getattr(user, 'tenant_id', None) or getattr(user, 'organization_id', None)
            if not user_org_id and hasattr(user, 'organization') and user.organization:
                user_org_id = user.organization.id
            
            if user_org_id:
                queryset = queryset.filter(Q(id=user_org_id) | Q(slug=str(user_org_id)))
            else:
                queryset = queryset.none()

        filters = {}
        if self.request.query_params.get('status'):
            filters['status'] = self.request.query_params.get('status')
        if self.request.query_params.get('is_active') is not None:
            filters['is_active'] = self.request.query_params.get('is_active').lower() == 'true'
        if self.request.query_params.get('is_onboarded') is not None:
            filters['is_onboarded'] = self.request.query_params.get('is_onboarded').lower() == 'true'
        if self.request.query_params.get('sector_id'):
            filters['sector_id'] = self.request.query_params.get('sector_id')
        if self.request.query_params.get('subscription_tier'):
            filters['subscription_tier'] = self.request.query_params.get('subscription_tier')
        if filters:
            queryset = queryset.filter(**filters)
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(slug__icontains=search) |
                Q(contact_email__icontains=search)
            )
        ordering = self.request.query_params.get('ordering', '-created_at')
        return queryset.order_by(ordering)

    def perform_create(self, serializer):
        """Save the organization; provisioning auto-dispatches via post_save signal."""
        serializer.save()

    def create(self, request, *args, **kwargs):
        """Override to return full OrganizationDetailSerializer on success."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        instance = serializer.instance
        detail_serializer = OrganizationDetailSerializer(instance, context={'request': request})
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        service = OrganizationService()
        try:
            service.delete_organization(instance.id, hard=False, user=request.user)
        except (OrganizationInvalidError, OrganizationError) as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def onboard(self, request, pk=None):
        """
        Manually trigger the full provisioning pipeline for an organization.
        Routes through OrganizationService → ProvisioningService via Celery.
        """
        org = self.get_object()
        service = OrganizationService()
        try:
            service.trigger_provisioning(org.id, user=request.user)
        except (OrganizationInvalidError, OrganizationError) as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'success': True,
            'message': f'Provisioning started for organization: {org.name}',
            'organization_id': str(org.id),
            'status': 'PROVISIONING',
        })

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        service = OrganizationService()
        try:
            result = service.activate_organization(self.get_object().id, user=request.user)
        except (OrganizationInvalidError, OrganizationError) as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({
            'success': True,
            'message': f'Organization {result.name} activated',
            'organization_id': str(result.id),
        })

    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        service = OrganizationService()
        try:
            result = service.suspend_organization(self.get_object().id, user=request.user)
        except (OrganizationInvalidError, OrganizationError) as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({
            'success': True,
            'message': f'Organization {result.name} suspended',
            'organization_id': str(result.id),
        })

    @action(detail=True, methods=['get'])
    def usage_summary(self, request, pk=None):
        org = self.get_object()
        service = ResourceService()
        resources = service.get_all_usage(org.id)
        data = []
        for r in resources:
            data.append({
                'type': r.resource_type,
                'type_display': r.get_resource_type_display(),
                'limit': r.limit_value,
                'current': r.current_value,
                # percentage_used, is_exceeded, is_warning_level are @property — no ()
                'percentage': r.percentage_used,
                'is_exceeded': r.is_exceeded,
                'is_warning': r.is_warning_level
            })
        return Response({
            'organization_id': str(org.id),
            'organization_name': org.name,
            'resources': data,
            'summary': {
                'total': len(data),
                'exceeded': sum(1 for r in data if r['is_exceeded']),
                'warning': sum(1 for r in data if r['is_warning'] and not r['is_exceeded'])
            }
        })

    @action(detail=True, methods=['get'])
    def provisioning_status(self, request, pk=None):
        """Returns step-level provisioning progress from org.metadata."""
        service = OrganizationService()
        return Response(service.get_provisioning_status(self.get_object().id))