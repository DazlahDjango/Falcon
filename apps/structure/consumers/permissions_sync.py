from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from typing import Dict, Any

class PermissionsSyncConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.tenant_id = self.scope['url_route']['kwargs'].get('tenant_id')
        self.user_id = self.scope.get('user', {}).get('id') if hasattr(self.scope, 'user') else None
        self.room_group_name = f"permissions_{self.tenant_id}_{self.user_id}"
        if not self.tenant_id or not self.user_id:
            await self.close()
            return
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        initial_permissions = await self._get_user_permissions()
        await self.send_json({
            'type': 'initial_permissions',
            'data': initial_permissions
        })
    
    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
    
    async def permissions_updated(self, event):
        await self.send_json({
            'type': 'permissions_updated',
            'new_permissions': event.get('permissions'),
            'timestamp': event.get('timestamp')
        })
    
    async def role_changed(self, event):
        await self.send_json({
            'type': 'role_changed',
            'old_role': event.get('old_role'),
            'new_role': event.get('new_role'),
            'timestamp': event.get('timestamp')
        })
    
    async def hierarchy_access_changed(self, event):
        await self.send_json({
            'type': 'hierarchy_access_changed',
            'changes': event.get('changes'),
            'timestamp': event.get('timestamp')
        })
    
    @database_sync_to_async
    def _get_user_permissions(self) -> Dict[str, Any]:
        from ..models.employment import Employment
        employment = Employment.objects.filter(
            user_id=self.user_id,
            tenant_id=self.tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).first()
        return {
            'user_id': self.user_id,
            'is_manager': employment.is_manager if employment else False,
            'is_executive': employment.is_executive if employment else False,
            'is_board_member': employment.is_board_member if employment else False,
            'department_id': str(employment.department_id) if employment and employment.department_id else None,
            'team_id': str(employment.team_id) if employment and employment.team_id else None,
            'can_manage_tenant': employment.is_executive if employment else False,
            'can_validate_kpi': employment.is_manager or employment.is_executive if employment else False
        }