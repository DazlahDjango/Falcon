"""
apps/tenant/api/v1/views/resource_views.py

Enterprise ResourceViewSet — wraps ResourceService with DRF actions.

Standard CRUD + extended actions:
  POST   /{id}/increment/          — increment usage
  POST   /{id}/decrement/          — decrement usage
  POST   /{id}/reset/              — reset single resource
  POST   /{id}/snapshot/           — take a manual snapshot
  GET    /summary/                 — enriched all-resource summary for an org
  GET    /analytics/               — trend, peak, forecast for one resource type
  POST   /sync_from_billing/       — force limit re-sync from billing plans/overrides
  POST   /bulk_increment/          — increment multiple resource types atomically
  GET    /exceeded/                — admin: all resources at/past limit
  POST   /reset_daily_limits/      — reset API_CALLS_PER_DAY globally
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.tenant.models import OrganizationResource
from apps.tenant.api.v1.serializers import (
    ResourceSerializer,
    ResourceCreateSerializer,
    ResourceUpdateSerializer,
    ResourceDetailSerializer,
    ResourceUsageSummarySerializer,
    ResourceAnalyticsSerializer,
    ResourceSnapshotSerializer,
    ResourceBulkIncrementSerializer,
    ResourceSyncResponseSerializer,
)
from apps.tenant.api.v1.permissions import CanViewResource, IsSuperAdmin
from apps.tenant.api.v1.throttles import OrganizationApiThrottle
from apps.tenant.api.v1.filters import ResourceFilter
from apps.tenant.services import ResourceService
from apps.tenant.exceptions import ResourceError


class ResourceViewSet(viewsets.ModelViewSet):
    queryset = OrganizationResource.objects.filter(is_deleted=False)
    permission_classes = [IsAuthenticated, CanViewResource]
    throttle_classes = [OrganizationApiThrottle]
    filterset_class = ResourceFilter
    ordering_fields = ['resource_type', 'current_value', 'limit_value']
    ordering = ['resource_type']

    # ------------------------------------------------------------------ #
    # Serializer & permission routing                                      #
    # ------------------------------------------------------------------ #

    def get_serializer_class(self):
        action_serializers = {
            'create': ResourceCreateSerializer,
            'update': ResourceUpdateSerializer,
            'partial_update': ResourceUpdateSerializer,
            'retrieve': ResourceDetailSerializer,
            'list': ResourceSerializer,
        }
        return action_serializers.get(self.action, ResourceSerializer)

    def get_permissions(self):
        write_actions = {'create', 'update', 'partial_update', 'destroy',
                         'increment', 'decrement', 'reset', 'snapshot',
                         'sync_from_billing', 'bulk_increment', 'reset_daily_limits'}
        admin_actions = {'exceeded'}
        if self.action in admin_actions:
            self.permission_classes = [IsAuthenticated, IsSuperAdmin]
        elif self.action in write_actions:
            self.permission_classes = [IsAuthenticated, IsSuperAdmin]
        else:
            self.permission_classes = [IsAuthenticated, CanViewResource]
        return super().get_permissions()

    def get_queryset(self):
        queryset = super().get_queryset()
        org_id = self.request.query_params.get('organization_id')
        resource_type = self.request.query_params.get('resource_type')
        if org_id:
            queryset = queryset.filter(organization_id=org_id)
        if resource_type:
            queryset = queryset.filter(resource_type=resource_type)
        return queryset

    # ------------------------------------------------------------------ #
    # Detail actions                                                       #
    # ------------------------------------------------------------------ #

    @action(detail=True, methods=['post'], url_path='increment')
    def increment(self, request, pk=None):
        """Increment usage for a single resource by `amount` (default 1)."""
        resource = self.get_object()
        amount = int(request.data.get('amount', 1))
        if amount < 1:
            return Response(
                {'error': 'amount must be >= 1'},
                status=status.HTTP_400_BAD_REQUEST
            )
        service = ResourceService()
        try:
            updated = service.increment_usage(
                organization_id=resource.organization_id,
                resource_type=resource.resource_type,
                amount=amount,
                user=request.user,
            )
        except ResourceError as e:
            return Response({'error': str(e)}, status=status.HTTP_409_CONFLICT)
        if not updated:
            return Response({'error': 'Resource not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(
            ResourceDetailSerializer(updated).data,
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], url_path='decrement')
    def decrement(self, request, pk=None):
        """Decrement usage for a single resource by `amount` (default 1)."""
        resource = self.get_object()
        amount = int(request.data.get('amount', 1))
        if amount < 1:
            return Response(
                {'error': 'amount must be >= 1'},
                status=status.HTTP_400_BAD_REQUEST
            )
        service = ResourceService()
        try:
            updated = service.decrement_usage(
                organization_id=resource.organization_id,
                resource_type=resource.resource_type,
                amount=amount,
                user=request.user,
            )
        except ResourceError as e:
            return Response({'error': str(e)}, status=status.HTTP_409_CONFLICT)
        if not updated:
            return Response({'error': 'Resource not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(ResourceDetailSerializer(updated).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='reset')
    def reset(self, request, pk=None):
        """Reset a single resource's current_value to zero."""
        resource = self.get_object()
        service = ResourceService()
        updated = service.reset_resource(resource_id=resource.id, user=request.user)
        return Response({
            'success': True,
            'message': f"{resource.get_resource_type_display()} reset to 0.",
            'resource': ResourceDetailSerializer(updated).data,
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='snapshot')
    def snapshot(self, request, pk=None):
        """Manually trigger a usage snapshot for this resource."""
        resource = self.get_object()
        snapshot_type = request.data.get('snapshot_type', 'daily')
        period_label = request.data.get('period_label')
        service = ResourceService()
        result = service.take_snapshot(
            organization_id=resource.organization_id,
            resource_type=resource.resource_type,
            snapshot_type=snapshot_type,
            period_label=period_label,
            source='manual',
        )
        if not result:
            return Response(
                {'message': 'Snapshot already exists for this period.'},
                status=status.HTTP_200_OK
            )
        return Response(
            ResourceSnapshotSerializer(result).data,
            status=status.HTTP_201_CREATED
        )

    # ------------------------------------------------------------------ #
    # List / bulk actions                                                  #
    # ------------------------------------------------------------------ #

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        """
        Enriched usage summary for all resource types in an org.
        Requires `organization_id` query param.
        """
        org_id = request.query_params.get('organization_id')
        if not org_id:
            return Response(
                {'error': 'organization_id query parameter is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        service = ResourceService()
        data = service.get_usage_summary(org_id)
        return Response(
            ResourceUsageSummarySerializer(data, many=True).data,
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'], url_path='analytics')
    def analytics(self, request):
        """
        Time-series trend, peak, and projected exhaustion for one resource type.
        Requires `organization_id` and `resource_type` query params.
        Optional: `days` (default 7).
        """
        org_id = request.query_params.get('organization_id')
        resource_type = request.query_params.get('resource_type')
        days = int(request.query_params.get('days', 7))

        if not org_id or not resource_type:
            return Response(
                {'error': 'organization_id and resource_type are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        service = ResourceService()
        data = service.get_usage_analytics(org_id, resource_type, days=days)
        if not data:
            return Response(
                {'error': 'Resource not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response(ResourceAnalyticsSerializer(data).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='sync_from_billing')
    def sync_from_billing(self, request):
        """
        Force re-sync limit_value for all resources (or one org) from billing plans/overrides.
        Optional body: {"organization_id": "<uuid>"}
        """
        org_id = request.data.get('organization_id')
        service = ResourceService()
        result = service.sync_limits_from_billing(organization_id=org_id)
        return Response(
            ResourceSyncResponseSerializer(result).data,
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['post'], url_path='bulk_increment')
    def bulk_increment(self, request):
        """
        Atomically increment multiple resource types.
        Body:
          {
            "organization_id": "<uuid>",
            "increments": [{"resource_type": "USERS", "amount": 2}]
          }
        """
        org_id = request.data.get('organization_id')
        if not org_id:
            return Response(
                {'error': 'organization_id is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer = ResourceBulkIncrementSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        service = ResourceService()
        result = service.bulk_increment(
            organization_id=org_id,
            increments=serializer.validated_data['increments'],
            user=request.user,
        )
        http_status = status.HTTP_200_OK if result['success'] else status.HTTP_409_CONFLICT
        return Response(result, status=http_status)

    @action(detail=False, methods=['get'], url_path='exceeded')
    def exceeded(self, request):
        """Admin: list all resources at or above their hard limit."""
        resources = OrganizationResource.objects.exceeded_limits().select_related('organization')
        serializer = ResourceSerializer(resources, many=True)
        return Response({
            'count': resources.count(),
            'results': serializer.data,
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='reset_daily_limits')
    def reset_daily_limits(self, request):
        """Reset API_CALLS_PER_DAY counters globally (scheduled or manual trigger)."""
        service = ResourceService()
        result = service.reset_daily_limits(user=request.user)
        return Response({
            'success': True,
            'message': 'Daily API call limits reset.',
            **result,
        }, status=status.HTTP_200_OK)