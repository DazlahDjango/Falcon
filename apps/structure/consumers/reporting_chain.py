from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from uuid import UUID
from typing import Dict, Any, Optional

class ReportingChainConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.tenant_id = self.scope['url_route']['kwargs'].get('tenant_id')
        self.user_id = self.scope.get('user', {}).get('id') if hasattr(self.scope, 'user') else None
        self.room_group_name = f"reporting_chain_{self.tenant_id}_{self.user_id}"
        if not self.tenant_id or not self.user_id:
            await self.close()
            return
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        initial_chain = await self._get_reporting_chain()
        await self.send_json({
            'type': 'initial_chain',
            'data': initial_chain
        })
    
    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
    
    async def receive_json(self, content):
        event_type = content.get('type')
        if event_type == 'refresh_chain':
            chain = await self._get_reporting_chain()
            await self.send_json({
                'type': 'chain_updated',
                'data': chain
            })
        elif event_type == 'get_team':
            team_data = await self._get_team_members(content.get('user_id'))
            await self.send_json({
                'type': 'team_data',
                'data': team_data
            })
    
    async def chain_updated(self, event):
        """Send chain update notification"""
        await self.send_json({
            'type': 'chain_updated',
            'data': event.get('data'),
            'timestamp': event.get('timestamp')
        })
    
    async def manager_changed(self, event):
        await self.send_json({
            'type': 'manager_changed',
            'old_manager': event.get('old_manager'),
            'new_manager': event.get('new_manager'),
            'timestamp': event.get('timestamp')
        })

    async def new_subordinate(self, event):
        await self.send_json({
            'type': 'new_subordinate',
            'subordinate': event.get('subordinate'),
            'timestamp': event.get('timestamp')
        })
    
    @database_sync_to_async
    def _get_reporting_chain(self) -> Dict[str, Any]:
        from ..services.reporting.chain_service import ReportingChainService
        chain_service = ReportingChainService()
        try:
            chain_up = chain_service.get_chain_up(UUID(self.user_id), UUID(self.tenant_id), include_self=True)
            chain_down = chain_service.get_chain_down(UUID(self.user_id), UUID(self.tenant_id))
            return {
                'user_id': self.user_id,
                'managers': chain_up,
                'subordinates': chain_down,
                'direct_report_count': len([c for c in chain_down if c.get('depth') == 1])
            }
        except Exception:
            return {'user_id': self.user_id, 'managers': [], 'subordinates': [], 'direct_report_count': 0}
    
    @database_sync_to_async
    def _get_team_members(self, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Get team members for a user"""
        from ..models.employment import Employment
        from ..models.team import Team
        target_id = user_id or self.user_id
        employment = Employment.objects.filter(
            user_id=target_id,
            tenant_id=self.tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).first()
        if not employment or not employment.team_id:
            return {'team_id': None, 'members': []}
        team = Team.objects.filter(id=employment.team_id).first()
        members = Employment.objects.filter(
            team_id=employment.team_id,
            tenant_id=self.tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).select_related('position')
        return {
            'team_id': str(employment.team_id),
            'team_name': team.name if team else None,
            'members': [
                {
                    'user_id': str(m.user_id),
                    'position': m.position.title if m.position else None,
                    'is_manager': m.is_manager
                }
                for m in members
            ]
        }
