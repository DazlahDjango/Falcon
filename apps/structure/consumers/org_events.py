import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from uuid import UUID

class OrgEventsConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.tenant_id = self.scope['url_route']['kwargs'].get('tenant_id')
        self.user_id = self.scope.get('user', {}).get('id') if hasattr(self.scope, 'user') else None
        self.room_group_name = f"org_events_{self.tenant_id}"
        if not self.tenant_id or not self.user_id:
            await self.close()
            return
        authorized = await self._check_authorization()
        if not authorized:
            await self.close()
            return
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        await self.send_json({
            'type': 'connection_established',
            'tenant_id': self.tenant_id,
            'message': 'Connected to organization events stream'
        })
    
    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
    
    async def receive_json(self, content):
        event_type = content.get('type')
        if event_type == 'subscribe_department':
            department_id = content.get('department_id')
            await self._subscribe_to_department(department_id)
        elif event_type == 'subscribe_team':
            team_id = content.get('team_id')
            await self._subscribe_to_team(team_id)
        elif event_type == 'ping':
            await self.send_json({'type': 'pong', 'timestamp': content.get('timestamp')})
    
    async def org_event(self, event):
        await self.send_json({
            'type': 'org_event',
            'event_type': event.get('event_type'),
            'data': event.get('data'),
            'timestamp': event.get('timestamp')
        })
    
    async def department_change(self, event):
        await self.send_json({
            'type': 'department_change',
            'department_id': event.get('department_id'),
            'change_type': event.get('change_type'),
            'data': event.get('data'),
            'timestamp': event.get('timestamp')
        })
    
    async def team_change(self, event):
        await self.send_json({
            'type': 'team_change',
            'team_id': event.get('team_id'),
            'change_type': event.get('change_type'),
            'data': event.get('data'),
            'timestamp': event.get('timestamp')
        })
    
    async def employment_change(self, event):
        await self.send_json({
            'type': 'employment_change',
            'user_id': event.get('user_id'),
            'change_type': event.get('change_type'),
            'data': event.get('data'),
            'timestamp': event.get('timestamp')
        })
    
    async def reporting_change(self, event):
        await self.send_json({
            'type': 'reporting_change',
            'employee_id': event.get('employee_id'),
            'manager_id': event.get('manager_id'),
            'change_type': event.get('change_type'),
            'data': event.get('data'),
            'timestamp': event.get('timestamp')
        })
    
    async def _check_authorization(self) -> bool:
        from ..services.security.hierarchy_access import HierarchyAccessEnforcer
        enforcer = HierarchyAccessEnforcer()
        return await database_sync_to_async(
            lambda: enforcer._is_hr_or_admin(UUID(self.user_id), UUID(self.tenant_id)) if self.user_id else False
        )()
    
    async def _subscribe_to_department(self, department_id: str):
        dept_group = f"dept_{self.tenant_id}_{department_id}"
        await self.channel_layer.group_add(dept_group, self.channel_name)
        await self.send_json({
            'type': 'subscribed',
            'subscription': 'department',
            'department_id': department_id
        })
    
    async def _subscribe_to_team(self, team_id: str):
        team_group = f"team_{self.tenant_id}_{team_id}"
        await self.channel_layer.group_add(team_group, self.channel_name)
        await self.send_json({
            'type': 'subscribed',
            'subscription': 'team',
            'team_id': team_id
        })