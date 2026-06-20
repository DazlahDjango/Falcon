from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from ..serializers.system_settings import BillingSystemSettingsSerializer
from ....services.settings import BillingSettingsService
from ..permissions import IsSuperAdmin

class SystemSettingsView(APIView):
    permission_classes = [IsSuperAdmin]
    
    def get(self, request):
        settings = BillingSettingsService.get_settings(use_cache=False)
        return Response({'settings': settings, 'version': 1})
    
    def patch(self, request):
        service = BillingSettingsService()
        record = service.update_settings(request.data, user_id=request.user.id)
        return Response(BillingSystemSettingsSerializer(record).data)
    
    def post(self, request):
        action = request.data.get('action')
        if action == 'reset':
            service = BillingSettingsService()
            record = service.reset_to_defaults(user_id=request.user.id)
            return Response(BillingSystemSettingsSerializer(record).data)
        return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)