from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from ....services import WebhookProcessor
from ....services.decorators import circuit_breaker

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