from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from apps.accounts.api.v1.permissions import AllowAny
from apps.accounts.api.v1.serializers.password import (
    PasswordChangeSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer
)
from apps.accounts.services.auth.password import PasswordService
from apps.accounts.api.v1.throttles import (
    PasswordResetRateThrottle,
    SensitiveEndpointThrottle
)
class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [SensitiveEndpointThrottle]
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        password_service = PasswordService()
        success, message = password_service.change_password(
            user=request.user,
            old_password=serializer.validated_data['old_password'],
            new_password=serializer.validated_data['new_password'],
            request=request
        )
        if not success:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': message}, status=status.HTTP_200_OK)
class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [PasswordResetRateThrottle]
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        password_service = PasswordService()
        success, message = password_service.reset_password(
            email=serializer.validated_data['email'],
            request=request
        )
        if not success:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': message}, status=status.HTTP_200_OK)
class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [PasswordResetRateThrottle]
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        password_service = PasswordService()
        success, message = password_service.confirm_reset(
            token=serializer.validated_data['token'],
            new_password=serializer.validated_data['new_password'],
            request=request
        )
        if not success:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': message}, status=status.HTTP_200_OK)
