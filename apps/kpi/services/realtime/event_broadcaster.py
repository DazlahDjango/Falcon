"""
Push KPI domain events to WebSocket groups (real-time / real-change).
"""
import logging
from typing import Any, Dict, Optional

from django.utils import timezone
from asgiref.sync import async_to_sync

logger = logging.getLogger(__name__)


class KPIEventBroadcaster:
    @staticmethod
    def _group_send(group_name: str, handler_type: str, payload: dict) -> None:
        try:
            from channels.layers import get_channel_layer
            from apps.kpi.services.settings import KpiSettingsService
            if not KpiSettingsService.get_section('realtime').get('websocket_enabled', True):
                return
            channel_layer = get_channel_layer()
            if channel_layer is None:
                logger.debug('No channel layer; skip WS broadcast to %s', group_name)
                return
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': handler_type,
                    'data': payload,
                    'timestamp': timezone.now().isoformat(),
                },
            )
        except Exception as exc:
            logger.warning('KPI WS broadcast failed (%s): %s', group_name, exc)

    @classmethod
    def score_updated(
        cls,
        *,
        user_id: str,
        kpi_id: str,
        score: float,
        period: str,
        status: str = 'UNKNOWN',
        manager_id: Optional[str] = None,
    ) -> None:
        if not cls._realtime_flag('push_score_updates'):
            return
        payload = {
            'kpi_id': kpi_id,
            'score': score,
            'period': period,
            'status': status,
        }
        cls._group_send(f'user_{user_id}', 'score_update', payload)
        cls._group_send(f'scores_{user_id}', 'score_update', payload)
        if manager_id:
            cls._group_send(f'manager_{manager_id}', 'team_update', {
                'user_id': user_id,
                'type': 'score_update',
                **payload,
            })
            cls._group_send(f'team_{manager_id}', 'member_score_update', payload)

    @classmethod
    def validation_updated(
        cls,
        *,
        user_id: str,
        actual_id: str,
        status: str,
        kpi_id: Optional[str] = None,
        supervisor_id: Optional[str] = None,
        pending_count: Optional[int] = None,
    ) -> None:
        if not cls._realtime_flag('push_validation_updates'):
            return
        payload = {
            'actual_id': actual_id,
            'status': status,
            'kpi_id': kpi_id,
            'user_id': user_id,
        }
        if supervisor_id:
            if pending_count is None:
                from apps.kpi.services.validation import (
                    pending_validation_count_for_supervisor_id,
                )
                pending_count = pending_validation_count_for_supervisor_id(supervisor_id)
            payload['pending_count'] = pending_count
        cls._group_send(f'user_{user_id}', 'validation_update', payload)
        if supervisor_id:
            cls._group_send(f'validation_{supervisor_id}', 'validation_update', payload)
            cls._group_send(f'manager_{supervisor_id}', 'validation_update', payload)

    @classmethod
    def actual_submitted(
        cls,
        *,
        user_id: str,
        actual_id: str,
        manager_id: Optional[str] = None,
        year: int = None,
        month: int = None,
    ) -> None:
        cls.validation_updated(
            user_id=user_id,
            actual_id=actual_id,
            status='PENDING',
            supervisor_id=manager_id,
        )
        if manager_id:
            cls._group_send(f'manager_{manager_id}', 'team_update', {
                'user_id': user_id,
                'actual_id': actual_id,
                'status': 'PENDING',
                'year': year,
                'month': month,
            })

    @classmethod
    def kpi_definition_changed(cls, *, tenant_id: str, kpi_id: str, action: str) -> None:
        cls._group_send(f'tenant_{tenant_id}', 'notification', {
            'event': 'kpi_changed',
            'kpi_id': kpi_id,
            'action': action,
        })

    @classmethod
    def organization_health(cls, *, tenant_id: str, data: Dict[str, Any]) -> None:
        cls._group_send(f'executive_{tenant_id}', 'organization_health_update', data)

    @classmethod
    def red_alert(cls, *, tenant_id: str, data: Dict[str, Any]) -> None:
        cls._group_send(f'executive_{tenant_id}', 'red_alert_update', data)
        cls._group_send(f'tenant_{tenant_id}', 'notification', {
            'event': 'red_alert',
            **data,
        })

    @classmethod
    def _realtime_flag(cls, key: str) -> bool:
        try:
            from apps.kpi.services.settings import KpiSettingsService
            return KpiSettingsService.get_section('realtime').get(key, True)
        except Exception:
            return True
