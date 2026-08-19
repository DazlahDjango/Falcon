from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from ....services import WebhookProcessor
from ....services.decorators import circuit_breaker
from rest_framework import viewsets
from ..permissions import IsSuperAdmin
from ....models import WebhookEventLog
from ..serializers.webhook import WebhookEventLogSerializer
from rest_framework.decorators import action

@method_decorator(csrf_exempt, name='dispatch')
@method_decorator(never_cache, name='dispatch')
class WebhookView(APIView):
    permission_classes = [permissions.AllowAny]
    
    @circuit_breaker('webhook_processing')
    def post(self, request):
        processor = WebhookProcessor()
        try:
            result = processor.process(request)
            return Response({'status': 'processed', 'event': result.event_type}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'status': 'failed', 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request):
        return Response({'status': 'webhook_endpoint_active', 'methods': ['POST']})


class WebhookEventLogViewSet(viewsets.ModelViewSet):
    queryset = WebhookEventLog.objects.all().order_by('-created_at')
    serializer_class = WebhookEventLogSerializer
    permission_classes = [IsSuperAdmin]

    @action(detail=True, methods=['post'])
    def retry(self, request, pk=None):
        webhook_log = self.get_object()
        from apps.billing.tasks import process_webhook
        # Since celery is set to always eager in dev, this runs synchronously
        process_webhook.delay(str(webhook_log.id))
        # Refresh log from db to get latest status
        webhook_log.refresh_from_db()
        return Response(self.get_serializer(webhook_log).data)