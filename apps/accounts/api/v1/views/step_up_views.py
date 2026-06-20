from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.accounts.api.v1.permissions import IsAuthenticated
from apps.accounts.services.auth.step_up_service import step_up_service
from apps.accounts.api.v1.serializers import MFAVerifyOTPSerializer

class StepUpVerifyView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = MFAVerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        otp = serializer.validated_data['otp']
        action = request.data.get('action')
        if not action:
            return Response(
                {'error': 'action is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        success, message = step_up_service.verify_step_up(
            user=request.user,
            action=action,
            otp=otp,
            ip_address=self._get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        if success:
            return Response({
                'success': True,
                'message': message,
                'action': action,
                'verified_until': step_up_service.VERIFICATION_TTL
            }, status=status.HTTP_200_OK)
        return Response({
            'success': False,
            'error': message,
            'step_up_required': True,
            'action': action
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR', '')