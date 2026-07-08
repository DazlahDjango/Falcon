import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from uuid import UUID
from typing import Dict, Any, Optional

class OrgEventsConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.tenant_id = self.scope['url_route']['kwargs'].get('tenant_id')
        self.user_id = self.scope.get('user', {}).get('id') if hasattr(self.scope, 'user') else None
        self.room_group_name = f"org_events_{self.tenant_id}"
        self.subscribed_units = []
        
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
        
        if event_type == 'subscribe_division':
            division_id = content.get('division_id')
            await self._subscribe_to_division(division_id)
        
        elif event_type == 'subscribe_department':
            department_id = content.get('department_id')
            await self._subscribe_to_department(department_id)
        
        elif event_type == 'subscribe_section':
            section_id = content.get('section_id')
            await self._subscribe_to_section(section_id)
        
        elif event_type == 'subscribe_unit':
            unit_id = content.get('unit_id')
            await self._subscribe_to_unit(unit_id)
        
        elif event_type == 'unsubscribe_division':
            division_id = content.get('division_id')
            await self._unsubscribe_from_division(division_id)
        
        elif event_type == 'unsubscribe_department':
            department_id = content.get('department_id')
            await self._unsubscribe_from_department(department_id)
        
        elif event_type == 'unsubscribe_section':
            section_id = content.get('section_id')
            await self._unsubscribe_from_section(section_id)
        
        elif event_type == 'unsubscribe_unit':
            unit_id = content.get('unit_id')
            await self._unsubscribe_from_unit(unit_id)
        
        elif event_type == 'ping':
            await self.send_json({'type': 'pong', 'timestamp': content.get('timestamp')})
    
    async def org_event(self, event):
        await self.send_json({
            'type': 'org_event',
            'event_type': event.get('event_type'),
            'data': event.get('data'),
            'timestamp': event.get('timestamp')
        })
    
    async def division_change(self, event):
        await self.send_json({
            'type': 'division_change',
            'division_id': event.get('division_id'),
            'change_type': event.get('change_type'),
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
    
    async def section_change(self, event):
        await self.send_json({
            'type': 'section_change',
            'section_id': event.get('section_id'),
            'change_type': event.get('change_type'),
            'data': event.get('data'),
            'timestamp': event.get('timestamp')
        })
    
    async def unit_change(self, event):
        await self.send_json({
            'type': 'unit_change',
            'unit_id': event.get('unit_id'),
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
    
    async def interim_change(self, event):
        await self.send_json({
            'type': 'interim_change',
            'employee_id': event.get('employee_id'),
            'interim_manager_id': event.get('interim_manager_id'),
            'change_type': event.get('change_type'),
            'data': event.get('data'),
            'timestamp': event.get('timestamp')
        })
    
    async def org_unit_change(self, event):
        await self.send_json({
            'type': 'org_unit_change',
            'unit_id': event.get('unit_id'),
            'level': event.get('level'),
            'change_type': event.get('change_type'),
            'data': event.get('data'),
            'timestamp': event.get('timestamp')
        })
    
    async def bulk_change(self, event):
        await self.send_json({
            'type': 'bulk_change',
            'changes': event.get('changes'),
            'count': event.get('count'),
            'timestamp': event.get('timestamp')
        })
    
    async def hierarchy_restructure(self, event):
        await self.send_json({
            'type': 'hierarchy_restructure',
            'restructure_id': event.get('restructure_id'),
            'changes': event.get('changes'),
            'timestamp': event.get('timestamp')
        })
    
    @database_sync_to_async
    def _check_authorization(self) -> bool:
        from apps.structure.models.employment import Employment
        from apps.structure.services.security.hierarchy_access import HierarchyAccessEnforcer
        
        if not self.user_id:
            return False
        
        employment = Employment.objects.filter(
            user_id=self.user_id,
            tenant_id=self.tenant_id,
            is_current=True,
            is_active=True,
            is_deleted=False
        ).first()
        
        if not employment:
            return False
        
        return employment.is_executive or employment.is_board_member or employment.is_manager
    
    async def _subscribe_to_division(self, division_id: str):
        if division_id not in self.subscribed_units:
            self.subscribed_units.append(division_id)
            group_name = f"division_{self.tenant_id}_{division_id}"
            await self.channel_layer.group_add(group_name, self.channel_name)
            await self.send_json({
                'type': 'subscribed',
                'subscription': 'division',
                'division_id': division_id
            })
    
    async def _subscribe_to_department(self, department_id: str):
        if department_id not in self.subscribed_units:
            self.subscribed_units.append(department_id)
            group_name = f"department_{self.tenant_id}_{department_id}"
            await self.channel_layer.group_add(group_name, self.channel_name)
            await self.send_json({
                'type': 'subscribed',
                'subscription': 'department',
                'department_id': department_id
            })
    
    async def _subscribe_to_section(self, section_id: str):
        if section_id not in self.subscribed_units:
            self.subscribed_units.append(section_id)
            group_name = f"section_{self.tenant_id}_{section_id}"
            await self.channel_layer.group_add(group_name, self.channel_name)
            await self.send_json({
                'type': 'subscribed',
                'subscription': 'section',
                'section_id': section_id
            })
    
    async def _subscribe_to_unit(self, unit_id: str):
        if unit_id not in self.subscribed_units:
            self.subscribed_units.append(unit_id)
            group_name = f"unit_{self.tenant_id}_{unit_id}"
            await self.channel_layer.group_add(group_name, self.channel_name)
            await self.send_json({
                'type': 'subscribed',
                'subscription': 'unit',
                'unit_id': unit_id
            })
    
    async def _unsubscribe_from_division(self, division_id: str):
        if division_id in self.subscribed_units:
            self.subscribed_units.remove(division_id)
            group_name = f"division_{self.tenant_id}_{division_id}"
            await self.channel_layer.group_discard(group_name, self.channel_name)
            await self.send_json({
                'type': 'unsubscribed',
                'subscription': 'division',
                'division_id': division_id
            })
    
    async def _unsubscribe_from_department(self, department_id: str):
        if department_id in self.subscribed_units:
            self.subscribed_units.remove(department_id)
            group_name = f"department_{self.tenant_id}_{department_id}"
            await self.channel_layer.group_discard(group_name, self.channel_name)
            await self.send_json({
                'type': 'unsubscribed',
                'subscription': 'department',
                'department_id': department_id
            })
    
    async def _unsubscribe_from_section(self, section_id: str):
        if section_id in self.subscribed_units:
            self.subscribed_units.remove(section_id)
            group_name = f"section_{self.tenant_id}_{section_id}"
            await self.channel_layer.group_discard(group_name, self.channel_name)
            await self.send_json({
                'type': 'unsubscribed',
                'subscription': 'section',
                'section_id': section_id
            })
    
    async def _unsubscribe_from_unit(self, unit_id: str):
        if unit_id in self.subscribed_units:
            self.subscribed_units.remove(unit_id)
            group_name = f"unit_{self.tenant_id}_{unit_id}"
            await self.channel_layer.group_discard(group_name, self.channel_name)
            await self.send_json({
                'type': 'unsubscribed',
                'subscription': 'unit',
                'unit_id': unit_id
            })