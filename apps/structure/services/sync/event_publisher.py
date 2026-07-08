import json
from typing import Dict, Any, List, Optional
from uuid import UUID
from django.utils import timezone
from apps.structure.utils import get_redis_connection

class EventPublisherService:
    def __init__(self):
        self._subscribers = []
        self.redis = get_redis_connection()
    
    def publish_org_unit_change(self, tenant_id: UUID, unit_id: UUID, change_type: str, old_data: dict = None, new_data: dict = None) -> None:
        event = {
            'type': 'org_unit_change',
            'tenant_id': str(tenant_id),
            'unit_id': str(unit_id),
            'change_type': change_type,
            'old_data': old_data,
            'new_data': new_data,
            'timestamp': None
        }
        self._publish(event)
    
    def publish_division_change(self, tenant_id: UUID, division_id: UUID, change_type: str, old_data: dict = None, new_data: dict = None) -> None:
        event = {
            'type': 'division_change',
            'tenant_id': str(tenant_id),
            'division_id': str(division_id),
            'change_type': change_type,
            'old_data': old_data,
            'new_data': new_data,
            'timestamp': None
        }
        self._publish(event)
    
    def publish_department_change(self, tenant_id: UUID, department_id: UUID, change_type: str, old_data: dict = None, new_data: dict = None) -> None:
        event = {
            'type': 'department_change',
            'tenant_id': str(tenant_id),
            'department_id': str(department_id),
            'change_type': change_type,
            'old_data': old_data,
            'new_data': new_data,
            'timestamp': None
        }
        self._publish(event)
    
    def publish_section_change(self, tenant_id: UUID, section_id: UUID, change_type: str, old_data: dict = None, new_data: dict = None) -> None:
        event = {
            'type': 'section_change',
            'tenant_id': str(tenant_id),
            'section_id': str(section_id),
            'change_type': change_type,
            'old_data': old_data,
            'new_data': new_data,
            'timestamp': None
        }
        self._publish(event)
    
    def publish_unit_change(self, tenant_id: UUID, unit_id: UUID, change_type: str, old_data: dict = None, new_data: dict = None) -> None:
        event = {
            'type': 'unit_change',
            'tenant_id': str(tenant_id),
            'unit_id': str(unit_id),
            'change_type': change_type,
            'old_data': old_data,
            'new_data': new_data,
            'timestamp': None
        }
        self._publish(event)
    
    def publish_employment_change(self, tenant_id: UUID, user_id: UUID, change_type: str, old_data: dict = None, new_data: dict = None) -> None:
        event = {
            'type': 'employment_change',
            'tenant_id': str(tenant_id),
            'user_id': str(user_id),
            'change_type': change_type,
            'old_data': old_data,
            'new_data': new_data,
            'timestamp': None
        }
        self._publish(event)
    
    def publish_reporting_change(self, tenant_id: UUID, employee_user_id: UUID, manager_user_id: UUID, change_type: str, old_data: dict = None, new_data: dict = None) -> None:
        event = {
            'type': 'reporting_change',
            'tenant_id': str(tenant_id),
            'employee_user_id': str(employee_user_id),
            'manager_user_id': str(manager_user_id),
            'change_type': change_type,
            'old_data': old_data,
            'new_data': new_data,
            'timestamp': None
        }
        self._publish(event)
    
    def publish_interim_change(self, tenant_id: UUID, employee_user_id: UUID, interim_manager_user_id: UUID, change_type: str, old_data: dict = None, new_data: dict = None) -> None:
        event = {
            'type': 'interim_change',
            'tenant_id': str(tenant_id),
            'employee_user_id': str(employee_user_id),
            'interim_manager_user_id': str(interim_manager_user_id),
            'change_type': change_type,
            'old_data': old_data,
            'new_data': new_data,
            'timestamp': None
        }
        self._publish(event)
    
    def publish_hierarchy_restructure(self, tenant_id: UUID, restructure_id: str, changes: list) -> None:
        event = {
            'type': 'hierarchy_restructure',
            'tenant_id': str(tenant_id),
            'restructure_id': restructure_id,
            'changes': changes,
            'timestamp': None
        }
        self._publish(event)
    
    def publish_bulk_change(self, tenant_id: UUID, changes: List[Dict[str, Any]]) -> None:
        event = {
            'type': 'bulk_change',
            'tenant_id': str(tenant_id),
            'changes': changes,
            'count': len(changes),
            'timestamp': None
        }
        self._publish(event)
    
    def _publish(self, event: dict) -> None:
        from django.utils import timezone
        event['timestamp'] = timezone.now().isoformat()
        self._broadcast_channels(event)
        for subscriber in self._subscribers:
            try:
                subscriber(event)
            except Exception:
                pass
    
    def _broadcast_channels(self, event: dict) -> None:
        if not self.redis:
            return
        tenant_id = event.get('tenant_id')
        if tenant_id:
            channel = f"org_changes:{tenant_id}"
            try:
                self.redis.publish(channel, json.dumps(event))
            except Exception:
                pass
    
    def subscribe(self, callback) -> None:
        self._subscribers.append(callback)
    
    def unsubscribe(self, callback) -> None:
        if callback in self._subscribers:
            self._subscribers.remove(callback)