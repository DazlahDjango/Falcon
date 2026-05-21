from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.accounts.api.v1.permissions.policy import IsSuperAdminOrReadOnly
from apps.accounts.api.v1.permissions import IsSuperAdmin
from apps.billing.api.v1.serializers.system_settings import BillingSystemSettingsSerializer
from apps.billing.services.settings import BillingSettingsService


class BillingSystemSettingsView(APIView):
    permission_classes = [IsSuperAdminOrReadOnly]

    def get(self, request):
        record = BillingSettingsService.get_record()
        return Response(BillingSystemSettingsSerializer(record).data)

    def patch(self, request):
        record = BillingSettingsService.get_record()
        serializer = BillingSystemSettingsSerializer(
            record, data=request.data, partial=True, context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        record = serializer.save()
        return Response(BillingSystemSettingsSerializer(record).data)

    def put(self, request):
        return self.patch(request)


class BillingSystemSettingsResetView(APIView):
    permission_classes = [IsSuperAdmin]

    def post(self, request):
        record = BillingSettingsService.reset_to_defaults(user_id=str(request.user.id))
        return Response(
            BillingSystemSettingsSerializer(record).data,
            status=status.HTTP_200_OK,
        )
