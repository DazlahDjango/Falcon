"""
Push organisation structure events to WebSocket groups (Channels primary).
"""
import logging
from typing import Any, Dict, Optional

from django.utils import timezone
from asgiref.sync import async_to_sync

logger = logging.getLogger(__name__)


class StructureEventBroadcaster:
    @staticmethod
    def _enabled(flag: str) -> bool:
        try:
            from apps.structure.services.settings import StructureSettingsService
            rt = StructureSettingsService.get_section('realtime')
            if not rt.get('websocket_enabled', True):
                return False
            return rt.get(flag, True)
        except Exception:
            return True

    @staticmethod
    def _group_send(group_name: str, handler_type: str, payload: dict) -> None:
        try:
            from channels.layers import get_channel_layer
            channel_layer = get_channel_layer()
            if channel_layer is None:
                return
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': handler_type,
                    **payload,
                    'timestamp': timezone.now().isoformat(),
                },
            )
        except Exception as exc:
            logger.warning('Structure WS broadcast failed (%s): %s', group_name, exc)

    @classmethod
    def _tenant_group(cls, tenant_id) -> str:
        return f'org_events_{tenant_id}'

    @classmethod
    def department_change(
        cls,
        *,
        tenant_id,
        department_id,
        change_type: str,
        data: Optional[Dict[str, Any]] = None,
    ) -> None:
        if not cls._enabled('push_department_changes'):
            return
        cls._group_send(
            cls._tenant_group(tenant_id),
            'department_change',
            {
                'department_id': str(department_id),
                'change_type': change_type,
                'data': data or {},
            },
        )

    @classmethod
    def team_change(
        cls,
        *,
        tenant_id,
        team_id,
        change_type: str,
        data: Optional[Dict[str, Any]] = None,
    ) -> None:
        if not cls._enabled('push_team_changes'):
            return
        cls._group_send(
            cls._tenant_group(tenant_id),
            'team_change',
            {
                'team_id': str(team_id),
                'change_type': change_type,
                'data': data or {},
            },
        )

    @classmethod
    def employment_change(
        cls,
        *,
        tenant_id,
        user_id,
        change_type: str,
        data: Optional[Dict[str, Any]] = None,
    ) -> None:
        if not cls._enabled('push_employment_changes'):
            return
        cls._group_send(
            cls._tenant_group(tenant_id),
            'employment_change',
            {
                'user_id': str(user_id),
                'change_type': change_type,
                'data': data or {},
            },
        )

    @classmethod
    def policy_updated(cls, *, version: int) -> None:
        cls._group_send(
            'structure_system',
            'org_event',
            {
                'event_type': 'policy_updated',
                'data': {'version': version},
            },
        )
