from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from typing import Dict, Any, List
from uuid import UUID

class PermissionsSyncConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.tenant_id = self.scope['url_route']['kwargs'].get('tenant_id')
        user = self.scope.get('user')
        if user and getattr(user, 'is_authenticated', False):
            self.user_id = str(user.id)
        elif isinstance(user, dict):
            self.user_id = str(user.get('id'))
        else:
            self.user_id = None
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
    
    async def receive_json(self, content):
        event_type = content.get('type')
        
        if event_type == 'refresh_permissions':
            permissions = await self._get_user_permissions()
            await self.send_json({
                'type': 'permissions_refreshed',
                'data': permissions
            })
        
        elif event_type == 'get_scope':
            scope = await self._get_user_scope()
            await self.send_json({
                'type': 'scope_response',
                'data': scope
            })
        
        elif event_type == 'ping':
            await self.send_json({
                'type': 'pong',
                'timestamp': content.get('timestamp')
            })
    
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
    
    async def scope_changed(self, event):
        await self.send_json({
            'type': 'scope_changed',
            'data': event.get('data'),
            'timestamp': event.get('timestamp')
        })
    
    @database_sync_to_async
    def _get_user_permissions(self) -> Dict[str, Any]:
        from apps.structure.models.employment import Employment
        from apps.structure.models.organizational_unit import OrganizationalUnit
        
        try:
            employment = Employment.objects.filter(
                user_id=self.user_id,
                tenant_id=self.tenant_id,
                is_current=True,
                is_deleted=False,
                is_active=True
            ).select_related('position').first()
        except Exception as e:
            return {
                'user_id': self.user_id,
                'is_manager': False,
                'is_executive': False,
                'is_board_member': False,
                'tenant_id': self.tenant_id
            }
        
        if not employment:
            return {
                'user_id': self.user_id,
                'is_manager': False,
                'is_executive': False,
                'is_board_member': False,
                'tenant_id': self.tenant_id
            }
        
        pos = employment.position
        permissions = {
            'user_id': self.user_id,
            'tenant_id': self.tenant_id,
            'is_manager': employment.is_manager,
            'is_executive': employment.is_executive,
            'is_board_member': employment.is_board_member,
            'position': {
                'id': str(pos.id) if pos else None,
                'title': pos.title if pos else None,
                'job_code': pos.job_code if pos else None,
                'level': pos.level if pos else None
            },
            'org_units': {
                'division': {
                    'id': str(pos.division.id) if pos and pos.division else None,
                    'code': pos.division.code if pos and pos.division else None,
                    'name': pos.division.name if pos and pos.division else None
                },
                'department': {
                    'id': str(pos.department.id) if pos and pos.department else None,
                    'code': pos.department.code if pos and pos.department else None,
                    'name': pos.department.name if pos and pos.department else None
                },
                'section': {
                    'id': str(pos.section.id) if pos and pos.section else None,
                    'code': pos.section.code if pos and pos.section else None,
                    'name': pos.section.name if pos and pos.section else None
                },
                'unit': {
                    'id': str(pos.unit.id) if pos and pos.unit else None,
                    'code': pos.unit.code if pos and pos.unit else None,
                    'name': pos.unit.name if pos and pos.unit else None
                }
            },
            'permissions': {
                'can_manage_tenant': employment.is_executive or employment.is_board_member,
                'can_manage_department': employment.is_manager or employment.is_executive,
                'can_approve_kpi': employment.is_manager or employment.is_executive,
                'can_conduct_review': employment.is_manager or employment.is_executive,
                'can_approve_leave': employment.is_manager or employment.is_executive,
                'can_approve_expenses': employment.is_manager or employment.is_executive,
                'can_manage_reports': employment.is_manager or employment.is_executive,
                'can_view_org_chart': True,
                'can_view_employee_data': employment.is_manager or employment.is_executive
            }
        }
        
        return permissions
    
    @database_sync_to_async
    def _get_user_scope(self) -> Dict[str, Any]:
        from apps.structure.services.security.scope_enforcer import ScopeEnforcerService
        scope_enforcer = ScopeEnforcerService()
        return scope_enforcer.get_full_scope(UUID(self.user_id), UUID(self.tenant_id))