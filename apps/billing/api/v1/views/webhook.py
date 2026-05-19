import json
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils import timezone
from ....services.webhook.processor import WebhookProcessor
from ....services.paystack.signature import WebhookSignatureVerifier
from ....exceptions import WebhookSignatureError, WebhookProcessingError
from ..serializers import WebhookPayloadSerializer
from ..throttles import BillingWebhookThrottle, BurstWebhookThrottle

logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, name='dispatch')
class WebhookView(APIView):
    """
    PayStack Webhook endpoint.
    
    Receives payment notifications from PayStack.
    - Signature verification is CRITICAL for security
    - Idempotency prevents duplicate processing
    - Returns 200 OK quickly, processes async
    """
    
    permission_classes = [AllowAny]
    throttle_classes = [BillingWebhookThrottle, BurstWebhookThrottle]
    
    def post(self, request):
        """Handle incoming webhook from PayStack."""
        
        # Step 1: Verify signature
        verifier = WebhookSignatureVerifier()
        is_valid, message = verifier.verify(request)
        
        if not is_valid:
            logger.error(f"Webhook signature verification failed: {message}")
            return Response(
                {'error': 'Invalid signature'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Step 2: Parse payload
        try:
            payload = json.loads(request.body)
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON payload: {str(e)}")
            return Response(
                {'error': 'Invalid JSON'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Step 3: Validate payload structure
        serializer = WebhookPayloadSerializer(data=payload)
        if not serializer.is_valid():
            logger.error(f"Invalid webhook payload: {serializer.errors}")
            return Response(
                {'error': 'Invalid payload', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Step 4: Process webhook (async for heavy processing, sync for quick response)
        processor = WebhookProcessor()
        
        try:
            # Process webhook (this will handle idempotency)
            result = processor.process(request)
            
            if result:
                logger.info(f"Webhook processed: {payload.get('event')}")
                return Response(
                    {'status': 'processed', 'event': payload.get('event')},
                    status=status.HTTP_200_OK
                )
            else:
                # Idempotency - already processed
                return Response(
                    {'status': 'duplicate', 'event': payload.get('event')},
                    status=status.HTTP_200_OK
                )
                
        except WebhookSignatureError as e:
            logger.error(f"Signature error: {str(e)}")
            return Response(
                {'error': 'Signature verification failed'},
                status=status.HTTP_401_UNAUTHORIZED
            )
            
        except WebhookProcessingError as e:
            logger.error(f"Processing error: {str(e)}")
            # Return 200 to prevent PayStack retry for non-retryable errors
            return Response(
                {'status': 'error', 'message': str(e)},
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.exception(f"Unexpected webhook error: {str(e)}")
            # Return 500 for unexpected errors (PayStack will retry)
            return Response(
                {'error': 'Internal server error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get(self, request):
        """GET method not allowed for webhook."""
        return Response(
            {'error': 'Method not allowed'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )