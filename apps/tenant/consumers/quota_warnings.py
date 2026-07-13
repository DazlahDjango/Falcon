import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()
logger = logging.getLogger(__name__)


class QuotaWarningConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return
        self.org_id = self.scope['url_route']['kwargs'].get('organization_id')
        if not self.org_id:
            await self.close()
            return
        if not await self._has_access(self.user, self.org_id):
            await self.close()
            return
        self.room_group_name = f"org_{self.org_id}_quota"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        await self._send_initial_quota_status()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def quota_warning(self, event):
        await self.send(text_data=json.dumps({
            'type': 'quota_warning',
            'resource_type': event['resource_type'],
            'current_value': event['current_value'],
            'limit_value': event['limit_value'],
            'percentage': event['percentage'],
            'message': event['message'],
            'timestamp': event['timestamp']
        }))

    async def quota_exceeded(self, event):
        await self.send(text_data=json.dumps({
            'type': 'quota_exceeded',
            'resource_type': event['resource_type'],
            'current_value': event['current_value'],
            'limit_value': event['limit_value'],
            'message': event['message'],
            'timestamp': event['timestamp']
        }))

    async def quota_updated(self, event):
        await self.send(text_data=json.dumps({
            'type': 'quota_updated',
            'resource_type': event['resource_type'],
            'current_value': event['current_value'],
            'limit_value': event['limit_value'],
            'percentage': event['percentage'],
            'timestamp': event['timestamp']
        }))

    async def _send_initial_quota_status(self):
        from apps.tenant.models import OrganizationResource
        resources = await self._get_resources(self.org_id)
        data = []
        for r in resources:
            data.append({
                'resource_type': r['resource_type'],
                'type_display': r['type_display'],
                'current_value': r['current_value'],
                'limit_value': r['limit_value'],
                'percentage': r['percentage'],
                'is_exceeded': r['is_exceeded'],
                'is_warning': r['is_warning']
            })
        await self.send(text_data=json.dumps({
            'type': 'initial_quota_status',
            'organization_id': self.org_id,
            'resources': data
        }))

    @database_sync_to_async
    def _get_resources(self, org_id):
        from apps.tenant.models import OrganizationResource
        resources = OrganizationResource.objects.filter(organization_id=org_id, is_deleted=False)
        return [{
            'resource_type': r.resource_type,
            'type_display': r.get_resource_type_display(),
            'current_value': r.current_value,
            'limit_value': r.limit_value,
            'percentage': r.percentage_used(),
            'is_exceeded': r.is_exceeded(),
            'is_warning': r.is_warning_level()
        } for r in resources]

    @database_sync_to_async
    def _has_access(self, user, org_id):
        if user.is_superuser or getattr(user, 'role', '') == 'super_admin':
            return True
        if hasattr(user, 'organization_id') and user.organization_id:
            return str(user.organization_id) == str(org_id)
        return False