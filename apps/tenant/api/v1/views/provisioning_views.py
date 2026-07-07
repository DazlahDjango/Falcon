import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.tenant.models import Organization
from apps.tenant.api.v1.permissions import IsSuperAdmin
from apps.tenant.api.v1.throttles import AdminOperationThrottle
from apps.tenant.api.v1.serializers.provisioning_serializers import (
    ProvisioningStatusSerializer,
    ProvisioningListSerializer,
    ProvisioningTriggerSerializer,
    ProvisioningRetrySerializer,
)
from apps.tenant.services import OrganizationService
from apps.tenant.exceptions import OrganizationInvalidError, OrganizationError

logger = logging.getLogger(__name__)


class ProvisioningViewSet(viewsets.GenericViewSet):
    """
    Admin-only ViewSet for monitoring and managing the organization
    provisioning lifecycle.

    All actions require IsSuperAdmin permission.

    Endpoints
    ---------
    GET  /provisioning/                  → list all orgs with provisioning state
    GET  /provisioning/failed/           → list FAILED orgs
    GET  /provisioning/in_progress/      → list PROVISIONING orgs
    GET  /provisioning/{id}/status/      → full step-level provisioning status
    POST /provisioning/{id}/trigger/     → manually trigger provisioning
    POST /provisioning/{id}/retry/       → retry a FAILED provisioning
    POST /provisioning/{id}/rollback/    → force rollback (drop schema, mark FAILED)
    """

    permission_classes = [IsAuthenticated, IsSuperAdmin]
    throttle_classes = [AdminOperationThrottle]

    def get_queryset(self):
        return Organization.objects.filter(is_deleted=False).order_by('-created_at')

    # ------------------------------------------------------------------
    # LIST — all organizations with their provisioning state
    # ------------------------------------------------------------------

    def list(self, request):
        """
        Returns all organizations with their provisioning metadata summary.
        Useful for admin dashboards to see the overall provisioning health.
        """
        queryset = self.get_queryset()

        # Optional status filter
        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter.upper())

        serializer = ProvisioningListSerializer(queryset, many=True)
        return Response({
            'count': queryset.count(),
            'results': serializer.data
        })

    # ------------------------------------------------------------------
    # FAILED — only orgs with FAILED status
    # ------------------------------------------------------------------

    @action(detail=False, methods=['get'])
    def failed(self, request):
        """
        Returns organizations that failed provisioning.
        These are candidates for a retry.
        """
        queryset = self.get_queryset().filter(status='FAILED')
        serializer = ProvisioningListSerializer(queryset, many=True)
        return Response({
            'count': queryset.count(),
            'results': serializer.data
        })

    # ------------------------------------------------------------------
    # IN_PROGRESS — only orgs currently being provisioned
    # ------------------------------------------------------------------

    @action(detail=False, methods=['get'], url_path='in-progress')
    def in_progress(self, request):
        """
        Returns organizations that are currently in the PROVISIONING state.
        Use this to monitor active provisioning pipelines.
        """
        queryset = self.get_queryset().filter(status='PROVISIONING')
        serializer = ProvisioningListSerializer(queryset, many=True)
        return Response({
            'count': queryset.count(),
            'results': serializer.data
        })

    # ------------------------------------------------------------------
    # STATUS — full step-level progress for a single org
    # ------------------------------------------------------------------

    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):
        """
        Returns the rich, step-level provisioning status for an organization,
        including progress percentage, current step name, timestamps, and
        any error details stored in org.metadata['provisioning'].
        """
        try:
            org = self.get_queryset().get(pk=pk)
        except Organization.DoesNotExist:
            return Response(
                {'error': 'Organization not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = ProvisioningStatusSerializer(org)
        return Response(serializer.data)

    # ------------------------------------------------------------------
    # TRIGGER — manually kick off provisioning for a PENDING org
    # ------------------------------------------------------------------

    @action(detail=True, methods=['post'])
    def trigger(self, request, pk=None):
        """
        Manually triggers the provisioning pipeline for an organization.

        Allowed for:
        - PENDING orgs (standard trigger)
        - Any status if `force=true` is passed (super-admin emergency use)

        The task is dispatched via Celery and runs asynchronously.
        """
        try:
            org = self.get_queryset().get(pk=pk)
        except Organization.DoesNotExist:
            return Response(
                {'error': 'Organization not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ProvisioningTriggerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        force = serializer.validated_data.get('force', False)

        service = OrganizationService()
        try:
            service.trigger_provisioning(org.id, force=force, user=request.user)
        except (OrganizationInvalidError, OrganizationError) as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        logger.info("Provisioning manually triggered for org %s by user %s", org.id, request.user.id)
        return Response({
            'success': True,
            'message': f'Provisioning triggered for organization: {org.name}',
            'organization_id': str(org.id),
        })

    # ------------------------------------------------------------------
    # RETRY — retry a FAILED provisioning
    # ------------------------------------------------------------------

    @action(detail=True, methods=['post'])
    def retry(self, request, pk=None):
        """
        Retries provisioning for an organization in FAILED status.

        This resets the organization status back to PENDING and dispatches
        a fresh provisioning task. The ProvisioningService handles
        idempotency — it will skip already-completed steps.
        """
        try:
            org = self.get_queryset().get(pk=pk)
        except Organization.DoesNotExist:
            return Response(
                {'error': 'Organization not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ProvisioningRetrySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        force = serializer.validated_data.get('force', False)

        service = OrganizationService()
        try:
            if force and org.status != 'FAILED':
                service.trigger_provisioning(org.id, force=True, user=request.user)
            else:
                service.retry_provisioning(org.id, user=request.user)
        except (OrganizationInvalidError, OrganizationError) as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        logger.info("Provisioning retry dispatched for org %s by user %s", org.id, request.user.id)
        return Response({
            'success': True,
            'message': f'Provisioning retry started for organization: {org.name}',
            'organization_id': str(org.id),
        })

    # ------------------------------------------------------------------
    # ROLLBACK — force drop schema and mark org FAILED
    # ------------------------------------------------------------------

    @action(detail=True, methods=['post'])
    def rollback(self, request, pk=None):
        """
        Forces a rollback of the provisioning for an organization.

        This will:
        1. Drop the PostgreSQL schema (CASCADE) if it exists.
        2. Delete any associated OrganizationSchema records.
        3. Delete any OrganizationResource records.
        4. Reset the organization status to FAILED.

        Use this for manual cleanup of stuck or partially-provisioned orgs.
        This is a destructive operation — use with caution.
        """
        try:
            org = self.get_queryset().get(pk=pk)
        except Organization.DoesNotExist:
            return Response(
                {'error': 'Organization not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        service = OrganizationService()
        try:
            service.rollback_provisioning(
                org.id,
                user=request.user,
                reason=f'Manual rollback by admin user {request.user.id}',
            )
        except (OrganizationInvalidError, OrganizationError) as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        logger.warning(
            "Admin rollback performed for org %s (%s) by user %s",
            org.id, org.name, request.user.id,
        )
        return Response({
            'success': True,
            'message': (
                f'Rollback complete for organization: {org.name}. '
                f'Schema dropped, status set to FAILED.'
            ),
            'organization_id': str(org.id),
        })
