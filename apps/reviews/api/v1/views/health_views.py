from django.db import connection
from django.utils import timezone
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.reviews.models import ReviewCycle
from apps.reviews.services.settings import ReviewsSettingsService
from apps.reviews.services.sync import ReviewsResourceSyncService


class ReviewsHealthView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    def get(self, request):
        checks = {}
        status_code = 200
        overall = 'healthy'
        try:
            connection.ensure_connection()
            checks['database'] = 'ok'
        except Exception as exc:
            checks['database'] = str(exc)
            overall = 'degraded'
            status_code = 503

        try:
            settings = ReviewsSettingsService.get_settings(use_cache=True)
            checks['settings'] = 'ok' if settings else 'empty'
        except Exception as exc:
            checks['settings'] = str(exc)
            overall = 'degraded'
            status_code = 503
        try:
            active_cycles = ReviewCycle.objects.filter(status='active').count()
            checks['active_cycles'] = active_cycles
        except Exception as exc:
            checks['active_cycles'] = str(exc)
            overall = 'degraded'

        try:
            from channels.layers import get_channel_layer
            cl = get_channel_layer()
            checks['websocket'] = 'ok' if cl else 'no_channel_layer'
        except Exception as exc:
            checks['websocket'] = str(exc)

        try:
            from apps.configs.models import EncryptionKey
            key_ok = EncryptionKey.objects.filter(
                key_status='active', is_default=True,
            ).exists()
            checks['encryption_key'] = 'ok' if key_ok else 'missing_default_key'
            if not key_ok:
                overall = 'degraded'
        except Exception:
            checks['encryption_key'] = 'configs_unavailable'

        body = {
            'status': overall,
            'service': 'reviews',
            'timestamp': timezone.now().isoformat(),
            'checks': checks,
        }
        return Response(body, status=status_code)


from apps.accounts.api.v1.permissions import IsTenantMember
from rest_framework.permissions import IsAuthenticated


class ReviewsDashboardMetricsView(APIView):
    """Authenticated live dashboard metrics (also pushed via WebSocket)."""

    permission_classes = [IsAuthenticated, IsTenantMember]

    def get(self, request):
        tenant_id = request.user.tenant_id
        metrics = ReviewsResourceSyncService.build_dashboard_metrics(
            tenant_id, broadcast=False,
        )
        return Response(metrics)
