import json
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from apps.billing.services import WebhookService
from apps.billing.exceptions import WebhookError
logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
class WebhookView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')
        if not sig_header:
            logger.warning("webhook received without signature header")
            return Response({'error': 'Missing signature header'}, status=status.HTTP_400_BAD_REQUEST)
        webhook_service = WebhookService()
        try:
            result = webhook_service.process_webhook(payload, sig_header)
            return Response(result, status=status.HTTP_200_OK)
        except WebhookError as e:
            logger.error(f"Webhook processing error: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Unexpected webhook error: {str(e)}")
            return Response(
                {'error': 'Internal server error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    def get(self, request, *args, **kwargs):
        return Response({'error': 'Method not allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)