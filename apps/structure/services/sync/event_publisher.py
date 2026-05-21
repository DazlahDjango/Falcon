from uuid import UUID

class EventPublisherService:
    def __init__(self):
        self._subscribers = []
    
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
    
    def publish_team_change(self, tenant_id: UUID, team_id: UUID, change_type: str, old_data: dict = None, new_data: dict = None) -> None:
        event = {
            'type': 'team_change',
            'tenant_id': str(tenant_id),
            'team_id': str(team_id),
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
    
    def publish_hierarchy_restructure(self, tenant_id: UUID, restructure_id: str, changes: list) -> None:
        event = {
            'type': 'hierarchy_restructure',
            'tenant_id': str(tenant_id),
            'restructure_id': restructure_id,
            'changes': changes,
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
        try:
            from apps.structure.services.settings import StructureSettingsService
            sync_cfg = StructureSettingsService.get_section('sync')
            rt_cfg = StructureSettingsService.get_section('realtime')
            if not sync_cfg.get('publish_org_events', True):
                return
            if not rt_cfg.get('use_channels_primary', True):
                return
            from apps.structure.services.realtime import StructureEventBroadcaster
            tenant_id = event.get('tenant_id')
            etype = event.get('type', '')
            if etype == 'department_change':
                StructureEventBroadcaster.department_change(
                    tenant_id=tenant_id,
                    department_id=event.get('department_id'),
                    change_type=event.get('change_type', 'updated'),
                    data=event.get('new_data') or event.get('old_data'),
                )
            elif etype == 'team_change':
                StructureEventBroadcaster.team_change(
                    tenant_id=tenant_id,
                    team_id=event.get('team_id'),
                    change_type=event.get('change_type', 'updated'),
                    data=event.get('new_data') or event.get('old_data'),
                )
            elif etype == 'employment_change':
                StructureEventBroadcaster.employment_change(
                    tenant_id=tenant_id,
                    user_id=event.get('user_id'),
                    change_type=event.get('change_type', 'updated'),
                    data=event.get('new_data') or event.get('old_data'),
                )
        except Exception:
            pass
    
    def subscribe(self, callback) -> None:
        self._subscribers.append(callback)
    
    def unsubscribe(self, callback) -> None:
        if callback in self._subscribers:
            self._subscribers.remove(callback)