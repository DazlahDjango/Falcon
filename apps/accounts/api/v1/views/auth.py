from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils.translation import gettext_lazy as _ 
from apps.accounts.models import User
from apps.accounts.services import AuthenticationService, MFAService, JWTServices
from apps.accounts.api.v1.serializers import (
    LoginSerializer, LoginResponseSerializer, LogoutSerializer,
    RefreshTokenSerializer, MFATokenSerializer, MFAAuthSerializer,
    MFASetupSerializer, MFASetupResponseSerializer, MFAResponseSerializer
)
from apps.accounts.api.v1.throttles import LoginRateThrottle, MFARateThrottle
from apps.accounts.api.v1.permissions import AllowAny

class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [LoginRateThrottle]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        ip_address = self._get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')[:500]
        
        auth_service = AuthenticationService()
        user, result, error = auth_service.authenticate(
            email=email,
            password=password,
            ip_address=ip_address,
            user_agent=user_agent,
            request=request
        )
        
        if error:
            return Response({'error': error}, status=status.HTTP_401_UNAUTHORIZED)
        
        if isinstance(result, dict) and result.get('requires_mfa'):
            return Response({
                'requires_mfa': True,
                'mfa_token': result.get('mfa_token')
            }, status=status.HTTP_200_OK)
        
        # ✅ Build response data with proper UUID conversion
        response_data = {
            'user': {
                'id': str(user.id),
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
                'is_superuser': user.is_superuser,
                'is_verified': user.is_verified,
                'tenant_id': str(user.tenant_id) if user.tenant_id else None,
            },
            'access': result.get('access'),
            'refresh': result.get('refresh'),
            'access_expires_in': result.get('access_expires_in', 3600),
            'refresh_expires_in': result.get('refresh_expires_in', 86400),
            'session_id': str(result.get('session_id')) if result.get('session_id') else None,
            'token_type': 'Bearer',
        }
        
        response_serializer = LoginResponseSerializer(response_data)
        return Response(response_serializer.data, status=status.HTTP_200_OK)
    
    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR', '')

    
class MFAAuthView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [MFARateThrottle]
    def post(self, request):
        serializer = MFAAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        mfa_token = serializer.validated_data['mfa_token']
        otp = serializer.validated_data['otp']
        ip_address = self._get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')[:500]
        jwt_service = JWTServices()
        payload = jwt_service.verify_token(mfa_token)
        if not payload or not payload.get('mfa_pending'):
            return Response({'error': 'Invalid MFA token'}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            user = User.objects.get(id=payload.get('user_id'), is_active=True)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        auth_service = AuthenticationService()
        user, result, error = auth_service.verify_mfa(
            user=user,
            mfa_token=mfa_token,
            otp=otp,
            ip_address=ip_address,
            user_agent=user_agent,
            request=request
        )
        if error:
            return Response({'error': error}, status=status.HTTP_401_UNAUTHORIZED)
        response_serializer = MFAResponseSerializer({
            'user': user,
            **result
        })
        return Response(response_serializer.data, status=status.HTTP_200_OK)
    
    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR', '')
    
class MFASetupView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        serializer = MFASetupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        device_name = serializer.validated_data.get('device_name', 'Authenticator')
        mfa_service = MFAService()
        setup_data = mfa_service.setup_totp(request.user, device_name)
        response_serializer = MFASetupResponseSerializer(setup_data)
        return Response(response_serializer.data, status=status.HTTP_200_OK)
    
class MFADeviceView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        mfa_service = MFAService()
        devices = mfa_service.get_devices(request.user)
        return Response(devices, status=status.HTTP_200_OK)
    def delete(self, request, device_id=None):
        mfa_service = MFAService()
        if device_id:
            success = mfa_service.disable_mfa(request.user, device_id)
        else:
            success = mfa_service.disable_mfa(request.user)
        if success:
            return Response({'message': 'MFA device removed'}, status=status.HTTP_200_OK)
        return Response({'error': 'Failed to remove MFA'}, status=status.HTTP_400_BAD_REQUEST)
    
class MFABackupCodesView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        mfa_service = MFAService()
        remaining = mfa_service.get_backup_codes_remaining(request.user)
        return Response({'remaining': remaining}, status=status.HTTP_200_OK)
    def post(self, request):
        mfa_service = MFAService()
        codes = mfa_service.regenerate_backup_codes(request.user)
        return Response({'backup_codes': codes}, status=status.HTTP_200_OK)
    
class RefreshTokenView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = RefreshTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        refresh_token = serializer.validated_data['refresh']
        ip_address = self._get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')[:500]
        auth_service = AuthenticationService()
        tokens, error = auth_service.refresh_token(refresh_token, ip_address, user_agent)
        if error:
            return Response({'error': error}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(tokens, status=status.HTTP_200_OK)
    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR', '')
    
class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        refresh_token = serializer.validated_data['refresh']
        all_devices = serializer.validated_data.get('all_devices', False)
        auth_service = AuthenticationService()
        if all_devices:
            success, error = auth_service.logout(user=request.user, request=request)
        else:
            session_id = getattr(request, 'current_session_id', None)
            success, error = auth_service.logout(
                user=request.user,
                session_id=session_id,
                token=refresh_token,
                request=request
            )
        if error:
            return Response({'error': error}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
    
class AuthViewSet(viewsets.ViewSet):
    def get_permissions(self):
        if self.action in ['logout', 'mfa_devices', 'mfa_backup_codes']:
            return [permissions.IsAuthenticated()]
        return [AllowAny()]
    @action(detail=False, methods=['post'], url_path='login')
    def login(self, request):
        return LoginView().post(request)
    @action(detail=False, methods=['post'], url_path='mfa-verify')
    def mfa_verify(self, request):
        return MFAAuthView().post(request)
    @action(detail=False, methods=['post'], url_path='mfa-setup')
    def mfa_setup(self, request):
        return MFASetupView().post(request)
    @action(detail=False, methods=['get'], url_path='mfa-devices')
    def mfa_devices(self, request):
        return MFADeviceView().get(request)
    @action(detail=False, methods=['post'], url_path='mfa-backup-codes')
    def mfa_backup_codes(self, request):
        return MFABackupCodesView().post(request)
    @action(detail=False, methods=['get'], url_path='mfa-backup-codes')
    def get_backup_codes(self, request):
        return MFABackupCodesView().get(request)
    @action(detail=False, methods=['post'], url_path='refresh')
    def refresh(self, request):
        return RefreshTokenView().post(request)
    @action(detail=False, methods=['post'], url_path='logout')
    def logout(self, request):
        return LogoutView().post(request)