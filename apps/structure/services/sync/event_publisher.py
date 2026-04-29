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
        import json
        event['timestamp'] = timezone.now().isoformat()
        try:
            import redis
            from django.conf import settings
            redis_client = redis.Redis(
                host=getattr(settings, 'REDIS_HOST', 'localhost'),
                port=getattr(settings, 'REDIS_PORT', 6379),
                db=getattr(settings, 'REDIS_DB', 0)
            )
            channel = f"org_events:{event['tenant_id']}"
            redis_client.publish(channel, json.dumps(event))
        except Exception:
            pass
        for subscriber in self._subscribers:
            try:
                subscriber(event)
            except Exception:
                pass
    
    def subscribe(self, callback) -> None:
        self._subscribers.append(callback)
    
    def unsubscribe(self, callback) -> None:
        if callback in self._subscribers:
            self._subscribers.remove(callback)