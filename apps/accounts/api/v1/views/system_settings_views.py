from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.accounts.api.v1.serializers.system_settings import AccountsSystemSettingsSerializer
from apps.accounts.api.v1.permissions.policy import IsSuperAdminOrReadOnly
from apps.accounts.api.v1.permissions import IsSuperAdmin
from apps.accounts.services.policy import AccountsPolicyService
from apps.accounts.services import AuditService


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
