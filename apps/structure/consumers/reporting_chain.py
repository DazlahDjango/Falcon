from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from uuid import UUID
from typing import Dict, Any, Optional, List

class ReportingChainConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.tenant_id = self.scope['url_route']['kwargs'].get('tenant_id')
        self.user_id = self.scope.get('user', {}).get('id') if hasattr(self.scope, 'user') else None
        self.room_group_name = f"reporting_chain_{self.tenant_id}_{self.user_id}"
        
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
        
        elif event_type == 'get_chain_for_user':
            target_user_id = content.get('user_id')
            if target_user_id:
                chain = await self._get_reporting_chain_for_user(target_user_id)
                await self.send_json({
                    'type': 'user_chain',
                    'user_id': target_user_id,
                    'data': chain
                })
        
        elif event_type == 'get_direct_reports':
            target_user_id = content.get('user_id') or self.user_id
            reports = await self._get_direct_reports(target_user_id)
            await self.send_json({
                'type': 'direct_reports',
                'user_id': target_user_id,
                'data': reports
            })
        
        elif event_type == 'get_all_reports':
            target_user_id = content.get('user_id') or self.user_id
            reports = await self._get_all_reports(target_user_id)
            await self.send_json({
                'type': 'all_reports',
                'user_id': target_user_id,
                'data': reports
            })
        
        elif event_type == 'get_org_unit_reports':
            unit_id = content.get('unit_id')
            if unit_id:
                reports = await self._get_org_unit_reports(unit_id)
                await self.send_json({
                    'type': 'org_unit_reports',
                    'unit_id': unit_id,
                    'data': reports
                })
        
        elif event_type == 'ping':
            await self.send_json({
                'type': 'pong',
                'timestamp': content.get('timestamp')
            })
    
    async def chain_updated(self, event):
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
    
    async def interim_assigned(self, event):
        await self.send_json({
            'type': 'interim_assigned',
            'interim_manager': event.get('interim_manager'),
            'employee': event.get('employee'),
            'timestamp': event.get('timestamp')
        })
    
    async def interim_ended(self, event):
        await self.send_json({
            'type': 'interim_ended',
            'employee': event.get('employee'),
            'timestamp': event.get('timestamp')
        })
    
    async def span_of_control_updated(self, event):
        await self.send_json({
            'type': 'span_of_control_updated',
            'data': event.get('data'),
            'timestamp': event.get('timestamp')
        })
    
    @database_sync_to_async
    def _check_authorization(self) -> bool:
        from apps.structure.models.employment import Employment
        
        if not self.user_id:
            return False
        
        employment = Employment.objects.filter(
            user_id=self.user_id,
            tenant_id=self.tenant_id,
            is_current=True,
            is_active=True,
            is_deleted=False
        ).first()
        
        return employment is not None
    
    @database_sync_to_async
    def _get_reporting_chain(self) -> Dict[str, Any]:
        from apps.structure.services.reporting.chain_service import ChainService
        from apps.structure.services.reporting.span_of_control import SpanOfControl
        
        chain_service = ChainService()
        span_service = SpanOfControl()
        
        try:
            chain_up = chain_service.get_chain_of_command(UUID(self.user_id), UUID(self.tenant_id))
            direct_reports = chain_service.get_direct_reports(UUID(self.user_id), UUID(self.tenant_id))
            all_reports = chain_service.get_all_reports(UUID(self.user_id), UUID(self.tenant_id))
            span = span_service.calculate_span(UUID(self.user_id))
            
            return {
                'user_id': self.user_id,
                'managers': chain_up,
                'direct_reports': [{
                    'user_id': str(emp.user_id),
                    'position': emp.position.title if emp.position else None,
                    'is_manager': emp.is_manager
                } for emp in direct_reports],
                'all_reports_count': len(all_reports),
                'span_of_control': span
            }
        except Exception as e:
            return {
                'user_id': self.user_id,
                'managers': [],
                'direct_reports': [],
                'all_reports_count': 0,
                'error': str(e)
            }
    
    @database_sync_to_async
    def _get_reporting_chain_for_user(self, target_user_id: str) -> Dict[str, Any]:
        from apps.structure.services.reporting.chain_service import ChainService
        from apps.structure.services.security.hierarchy_access import HierarchyAccessEnforcer
        
        access_enforcer = HierarchyAccessEnforcer()
        can_view = access_enforcer.can_view(UUID(self.user_id), UUID(target_user_id), UUID(self.tenant_id))
        
        if not can_view:
            return {'error': 'Access denied'}
        
        chain_service = ChainService()
        
        try:
            chain_up = chain_service.get_chain_of_command(UUID(target_user_id), UUID(self.tenant_id))
            return {
                'user_id': target_user_id,
                'managers': chain_up
            }
        except Exception as e:
            return {
                'user_id': target_user_id,
                'managers': [],
                'error': str(e)
            }
    
    @database_sync_to_async
    def _get_direct_reports(self, target_user_id: str) -> List[Dict[str, Any]]:
        from apps.structure.services.reporting.chain_service import ChainService
        from apps.structure.services.security.hierarchy_access import HierarchyAccessEnforcer
        
        access_enforcer = HierarchyAccessEnforcer()
        can_view = access_enforcer.can_view(UUID(self.user_id), UUID(target_user_id), UUID(self.tenant_id))
        
        if not can_view:
            return []
        
        chain_service = ChainService()
        
        try:
            direct_reports = chain_service.get_direct_reports(UUID(target_user_id), UUID(self.tenant_id))
            return [{
                'user_id': str(emp.user_id),
                'position': emp.position.title if emp.position else None,
                'position_code': emp.position.job_code if emp.position else None,
                'is_manager': emp.is_manager,
                'is_executive': emp.is_executive,
                'unit': emp.unit.name if emp.unit else None,
                'department': emp.department.name if emp.department else None
            } for emp in direct_reports]
        except Exception:
            return []
    
    @database_sync_to_async
    def _get_all_reports(self, target_user_id: str) -> List[Dict[str, Any]]:
        from apps.structure.services.reporting.chain_service import ChainService
        from apps.structure.services.security.hierarchy_access import HierarchyAccessEnforcer
        
        access_enforcer = HierarchyAccessEnforcer()
        can_view = access_enforcer.can_view(UUID(self.user_id), UUID(target_user_id), UUID(self.tenant_id))
        
        if not can_view:
            return []
        
        chain_service = ChainService()
        
        try:
            all_reports = chain_service.get_all_reports(UUID(target_user_id), UUID(self.tenant_id))
            return [{
                'user_id': str(emp.user_id),
                'position': emp.position.title if emp.position else None,
                'position_code': emp.position.job_code if emp.position else None,
                'is_manager': emp.is_manager,
                'is_executive': emp.is_executive
            } for emp in all_reports]
        except Exception:
            return []
    
    @database_sync_to_async
    def _get_org_unit_reports(self, unit_id: str) -> List[Dict[str, Any]]:
        from apps.structure.models.organizational_unit import OrganizationalUnit
        from apps.structure.models.employment import Employment
        
        try:
            unit = OrganizationalUnit.objects.get(id=unit_id, tenant_id=self.tenant_id, is_deleted=False)
            employments = Employment.objects.filter(
                unit_id=unit.id,
                is_current=True,
                is_active=True,
                is_deleted=False
            ).select_related('position')
            
            return [{
                'user_id': str(emp.user_id),
                'position': emp.position.title if emp.position else None,
                'position_code': emp.position.job_code if emp.position else None,
                'is_manager': emp.is_manager,
                'is_executive': emp.is_executive
            } for emp in employments]
        except OrganizationalUnit.DoesNotExist:
            return []