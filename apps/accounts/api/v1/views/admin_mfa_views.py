from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from apps.accounts.models import User
from apps.accounts.api.v1.permissions import IsSuperAdmin, IsClientAdmin
from apps.accounts.services.auth.mfa_admin_service import MFAAdminService
from apps.accounts.services.policy import AccountsPolicyService
from apps.accounts.services import AuditService
import logging
logger = logging.getLogger(__name__)

class AdminMfaResetView(APIView):
    permission_classes = [IsAuthenticated, IsClientAdmin]
    
    def post(self, request, user_id):
        target_user = get_object_or_404(
            User, 
            id=user_id, 
            tenant_id=request.user.tenant_id
        )
        if not request.user.is_superuser and request.user.tenant_id != target_user.tenant_id:
            return Response(
                {'error': 'You can only reset MFA for users in your tenant'},
                status=status.HTTP_403_FORBIDDEN
            )
        reason = request.data.get('reason', '')
        service = MFAAdminService()
        success, message = service.reset_user_mfa(
            admin_user=request.user,
            target_user=target_user,
            reason=reason,
            request=request
        )
        if success:
            return Response({
                'message': message,
                'user_id': str(target_user.id),
                'user_email': target_user.email
            }, status=status.HTTP_200_OK)
        return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)

class AdminMfaDeviceClearView(APIView):
    permission_classes = [IsAuthenticated, IsClientAdmin]
    
    def delete(self, request, user_id, device_id=None):
        target_user = get_object_or_404(
            User, 
            id=user_id, 
            tenant_id=request.user.tenant_id
        )
        if not request.user.is_superuser and request.user.tenant_id != target_user.tenant_id:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        service = MFAAdminService()
        success, message = service.clear_user_devices(
            admin_user=request.user,
            target_user=target_user,
            device_id=device_id,
            request=request
        )
        if success:
            return Response({'message': message}, status=status.HTTP_200_OK)
        return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)


class AdminMFAStatusView(APIView):
    permission_classes = [IsAuthenticated, IsClientAdmin]
    
    def get(self, request, user_id):
        target_user = get_object_or_404(
            User, 
            id=user_id, 
            tenant_id=request.user.tenant_id
        )
        if not request.user.is_superuser and request.user.tenant_id != target_user.tenant_id:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        devices = target_user.auth_devices.filter(is_deleted=False)
        backup_codes = target_user.backup_codes.filter(is_deleted=False)
        return Response({
            'user': {
                'id': str(target_user.id),
                'email': target_user.email,
                'full_name': target_user.get_full_name(),
                'role': target_user.role,
                'role_display': target_user.get_role_display(),
            },
            'mfa': {
                'enabled': target_user.mfa_enabled,
                'verified_at': target_user.mfa_verified_at,
                'devices': [
                    {
                        'id': str(d.id),
                        'name': d.name,
                        'device_type': d.device_type,
                        'is_active': d.is_active,
                        'is_primary': d.is_primary,
                        'is_verified': d.is_verified,
                        'last_used_at': d.last_used_at,
                    }
                    for d in devices
                ],
                'backup_codes': {
                    'total': backup_codes.count(),
                    'used': backup_codes.filter(is_used=True).count(),
                    'remaining': backup_codes.filter(is_used=False).count(),
                }
            },
            'policy': {
                'user_override': target_user.mfa_required,
                'required_by_role': AccountsPolicyService.tenant_requires_mfa(target_user),
                'effectively_required': AccountsPolicyService.user_requires_mfa(target_user),
            }
        }, status=status.HTTP_200_OK)