from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
import logging
from django.utils.translation import gettext_lazy as _
from django.db.models import Count, Q
from django.utils import timezone
from django.shortcuts import get_object_or_404
from apps.accounts.api.v1.serializers.system_settings import AccountsSystemSettingsSerializer
from apps.accounts.api.v1.permissions.policy import IsSuperAdminOrReadOnly
from apps.accounts.api.v1.permissions import IsSuperAdmin, IsClientAdmin, IsAuthenticated
from apps.accounts.services.policy import AccountsPolicyService
from apps.accounts.services import AuditService
from apps.accounts.models import User, TenantPreference
from apps.accounts.api.v1.serializers import UserMinimalSerializer

logger = logging.getLogger(__name__)

class AccountsSystemSettingsView(APIView):
    permission_classes = [IsSuperAdminOrReadOnly]

    def get(self, request):
        record = AccountsPolicyService.get_system_record()
        serializer = AccountsSystemSettingsSerializer(record)
        return Response(serializer.data)

    def patch(self, request):
        record = AccountsPolicyService.get_system_record()
        serializer = AccountsSystemSettingsSerializer(
            record, data=request.data, partial=True, context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        record = serializer.save()
        AuditService().log(
            user=request.user,
            action='accounts.system_policy_updated',
            action_type='update',
            request=request,
            severity='warning',
            metadata={'version': record.version},
        )
        from apps.accounts.services.realtime import AccountsEventBroadcaster
        AccountsEventBroadcaster.policy_updated(scope='system', version=record.version)
        return Response(AccountsSystemSettingsSerializer(record).data)

    def put(self, request):
        return self.patch(request)


class AccountsSystemSettingsResetView(APIView):
    permission_classes = [IsSuperAdmin]

    def post(self, request):
        record = AccountsPolicyService.reset_system_policy(user_id=str(request.user.id))
        AuditService().log(
            user=request.user,
            action='accounts.system_policy_reset',
            action_type='update',
            request=request,
            severity='warning',
            metadata={'version': record.version},
        )
        from apps.accounts.services.realtime import AccountsEventBroadcaster
        AccountsEventBroadcaster.policy_updated(scope='system', version=record.version)
        return Response(
            AccountsSystemSettingsSerializer(record).data,
            status=status.HTTP_200_OK,
        )


class AccountsSyncPolicyView(APIView):
    permission_classes = [IsSuperAdmin]

    def post(self, request):
        synced = AccountsPolicyService.sync_all_tenants()
        AuditService().log(
            user=request.user,
            action='accounts.policy_sync_all',
            action_type='update',
            request=request,
            severity='info',
            metadata={'tenant_count': len(synced)},
        )
        return Response({
            'message': f'Synced policy for {len(synced)} tenant(s).',
            'tenant_ids': synced,
        })


# MFA POLICY ADMIN ENDPOINTS
class TenantMFAPolicyView(APIView):
    permission_classes = [IsAuthenticated, IsClientAdmin]

    def get(self, request):
        try:
            pref, _ = TenantPreference.objects.get_or_create(
                client_id=request.user.tenant_id,
                defaults={'tenant_id': request.user.tenant_id}
            )
            users = User.objects.filter(tenant_id=request.user.tenant_id, is_active=True)
            user_list = []
            for user in users:
                user_list.append({
                    'id': str(user.id),
                    'email': user.email,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role,
                    'role_display': user.get_role_display(),
                    'mfa_enabled': user.mfa_enabled,
                    'mfa_required_override': user.mfa_required,
                    'mfa_required_by_role': AccountsPolicyService.tenant_requires_mfa(user),
                    'mfa_effective_required': AccountsPolicyService.user_requires_mfa(user),
                    'mfa_verified_at': user.mfa_verified_at,
                })
            available_roles = [{'value': r[0], 'label': r[1]} for r in User.ROLE_CHOICES]
            return Response({
                'tenant_id': str(request.user.tenant_id),
                'mfa_required_roles': pref.mfa_required_roles,
                'available_roles': available_roles,
                'policy_version': pref.policy_version,
                'users': user_list,
            })
        except Exception as e:
            logger.error(f"Failed to get tenant MFA policy: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to retrieve MFA policy'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def patch(self, request):
        try:
            pref, _ = TenantPreference.objects.get_or_create(
                client_id=request.user.tenant_id,
                defaults={'tenant_id': request.user.tenant_id}
            )
            mfa_required_roles = request.data.get('mfa_required_roles')
            if mfa_required_roles is not None:
                pref.mfa_required_roles = mfa_required_roles
                pref.policy_version += 1
                pref.save()
                AccountsPolicyService.invalidate_tenant_cache(str(request.user.tenant_id))
                AuditService().log(
                    user=request.user,
                    action='accounts.tenant_mfa_policy_updated',
                    action_type='update',
                    request=request,
                    severity='warning',
                    metadata={
                        'tenant_id': str(request.user.tenant_id),
                        'mfa_required_roles': mfa_required_roles,
                        'policy_version': pref.policy_version
                    }
                )
            return Response({
                'message': 'MFA policy updated successfully',
                'mfa_required_roles': pref.mfa_required_roles,
                'policy_version': pref.policy_version
            })
        except Exception as e:
            logger.error(f"Failed to update tenant MFA policy: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to update MFA policy'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserMFAPolicyView(APIView):
    permission_classes = [IsAuthenticated, IsClientAdmin]
    def get(self, request, user_id=None):
        try:
            if user_id:
                user = get_object_or_404(
                    User, 
                    id=user_id, 
                    tenant_id=request.user.tenant_id,
                    is_active=True
                )
                return Response({
                    'id': str(user.id),
                    'email': user.email,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role,
                    'role_display': user.get_role_display(),
                    'mfa_enabled': user.mfa_enabled,
                    'mfa_required_override': user.mfa_required,
                    'mfa_required_by_role': AccountsPolicyService.tenant_requires_mfa(user),
                    'mfa_effective_required': AccountsPolicyService.user_requires_mfa(user),
                    'mfa_devices_count': user.auth_devices.filter(is_active=True).count(),
                    'mfa_verified_at': user.mfa_verified_at,
                })
            users = User.objects.filter(tenant_id=request.user.tenant_id, is_active=True)
            return Response([
                {
                    'id': str(u.id),
                    'email': u.email,
                    'username': u.username,
                    'first_name': u.first_name,
                    'last_name': u.last_name,
                    'role': u.role,
                    'role_display': u.get_role_display(),
                    'mfa_enabled': u.mfa_enabled,
                    'mfa_required_override': u.mfa_required,
                    'mfa_effective_required': AccountsPolicyService.user_requires_mfa(u),
                }
                for u in users
            ])
        except Exception as e:
            logger.error(f"Failed to get user MFA policy: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to retrieve user MFA policy'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def patch(self, request, user_id):
        try:
            user = get_object_or_404(
                User, 
                id=user_id, 
                tenant_id=request.user.tenant_id,
                is_active=True
            )
            mfa_required = request.data.get('mfa_required')
            old_value = user.mfa_required
            if mfa_required is not None:
                if mfa_required == 'none' or mfa_required is None:
                    user.mfa_required = None
                else:
                    user.mfa_required = bool(mfa_required)
                user.save(update_fields=['mfa_required'])
                AuditService().log(
                    user=request.user,
                    action='accounts.user_mfa_policy_updated',
                    action_type='update',
                    request=request,
                    severity='warning',
                    metadata={
                        'target_user_id': str(user.id),
                        'target_user_email': user.email,
                        'old_value': old_value,
                        'new_value': user.mfa_required,
                    }
                )
                AccountsPolicyService.invalidate_tenant_cache(str(request.user.tenant_id))
            return Response({
                'message': 'User MFA policy updated successfully',
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'mfa_required_override': user.mfa_required,
                    'mfa_effective_required': AccountsPolicyService.user_requires_mfa(user),
                }
            })
        except Exception as e:
            logger.error(f"Failed to update user MFA policy: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to update user MFA policy'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, user_id):
        try:
            user = get_object_or_404(
                User, 
                id=user_id, 
                tenant_id=request.user.tenant_id,
                is_active=True
            )
            user.mfa_required = None
            user.save(update_fields=['mfa_required'])
            AuditService().log(
                user=request.user,
                action='accounts.user_mfa_override_cleared',
                action_type='update',
                request=request,
                severity='info',
                metadata={
                    'target_user_id': str(user.id),
                    'target_user_email': user.email,
                }
            )
            AccountsPolicyService.invalidate_tenant_cache(str(request.user.tenant_id))
            return Response({
                'message': 'MFA override cleared. User now follows role-based policy.',
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'mfa_required_override': None,
                    'mfa_effective_required': AccountsPolicyService.user_requires_mfa(user),
                }
            })
        except Exception as e:
            logger.error(f"Failed to clear user MFA override: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to clear MFA override'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserMFAStatusView(APIView):
    permission_classes = [IsAuthenticated, IsClientAdmin]
    def get(self, request, user_id):
        try:
            user = get_object_or_404(
                User, 
                id=user_id, 
                tenant_id=request.user.tenant_id
            )
            devices = user.auth_devices.filter(is_active=True)
            return Response({
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'full_name': user.get_full_name(),
                    'role': user.role,
                    'role_display': user.get_role_display(),
                },
                'mfa': {
                    'enabled': user.mfa_enabled,
                    'verified_at': user.mfa_verified_at,
                    'devices_count': devices.count(),
                    'devices': [
                        {
                            'id': str(d.id),
                            'name': d.name,
                            'device_type': d.device_type,
                            'is_primary': d.is_primary,
                            'is_verified': d.is_verified,
                            'last_used_at': d.last_used_at,
                        }
                        for d in devices
                    ],
                    'backup_codes_remaining': user.backup_codes.filter(is_used=False, expires_at__gt=timezone.now()).count(),
                },
                'policy': {
                    'user_override': user.mfa_required,
                    'required_by_role': AccountsPolicyService.tenant_requires_mfa(user),
                    'effectively_required': AccountsPolicyService.user_requires_mfa(user),
                    'requires_enrollment': AccountsPolicyService.user_requires_mfa(user) and not user.mfa_enabled,
                }
            })
        except Exception as e:
            logger.error(f"Failed to get user MFA status: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to retrieve user MFA status'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )