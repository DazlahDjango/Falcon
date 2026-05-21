"""
Push tenant lifecycle and quota events to WebSocket groups (real-time / real-change).
"""
import logging
from typing import Any, Dict, Optional

from django.utils import timezone
from asgiref.sync import async_to_sync

logger = logging.getLogger(__name__)


class TenantEventBroadcaster:
    @staticmethod
    def _enabled(flag: str) -> bool:
        try:
            from apps.tenant.services.settings import TenantSettingsService
            rt = TenantSettingsService.get_section('realtime')
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
                logger.debug('No channel layer; skip WS broadcast to %s', group_name)
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
            logger.warning('Tenant WS broadcast failed (%s): %s', group_name, exc)

    @classmethod
    def tenant_status_changed(
        cls,
        *,
        tenant_id: str,
        status: str,
        is_active: bool,
        extra: Optional[Dict[str, Any]] = None,
    ) -> None:
        if not cls._enabled('push_status_changes'):
            return
        data = {'status': status, 'is_active': is_active, **(extra or {})}
        cls._group_send(f'tenant_{tenant_id}_status', 'tenant_status_changed', {'data': data})

    @classmethod
    def quota_warning(
        cls,
        *,
        tenant_id: str,
        resource_type: str,
        current_value: int,
        limit_value: int,
        percentage: float,
    ) -> None:
        if not cls._enabled('push_quota_warnings'):
            return
        cls._group_send(
            f'tenant_{tenant_id}_status',
            'quota_warning',
            {
                'resource_type': resource_type,
                'current_value': current_value,
                'limit_value': limit_value,
                'percentage': percentage,
            },
        )

    @classmethod
    def resource_usage_updated(
        cls,
        *,
        tenant_id: str,
        usage: Dict[str, Any],
    ) -> None:
        if not cls._enabled('push_resource_usage'):
            return
        cls._group_send(
            f'tenant_{tenant_id}_status',
            'tenant_status_changed',
            {
                'data': {
                    'event': 'resource_usage_updated',
                    'usage': usage,
                },
            },
        )

    @classmethod
    def policy_updated(cls, *, version: int) -> None:
        cls._group_send(
            'tenant_system',
            'tenant_status_changed',
            {'data': {'event': 'policy_updated', 'version': version}},
        )

    @classmethod
    def provisioning_progress(
        cls,
        *,
        tenant_id: str,
        task_id: str,
        progress_percent: int,
        status: str = 'running',
        message: str = '',
    ) -> None:
        cls._group_send(
            f'tenant_provisioning_{task_id}',
            'provisioning_progress',
            {
                'tenant_id': tenant_id,
                'progress_percent': progress_percent,
                'status': status,
                'message': message,
            },
        )
