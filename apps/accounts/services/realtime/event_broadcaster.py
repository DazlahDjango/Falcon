"""
Push accounts security events to WebSocket groups (Phase C — real-time / real-change).
"""
import logging
from typing import Any, Dict, Optional

from django.utils import timezone
from asgiref.sync import async_to_sync

logger = logging.getLogger(__name__)


class AccountsEventBroadcaster:
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
            logger.warning('WS broadcast failed (%s): %s', group_name, exc)

    @classmethod
    def _emit(
        cls,
        *,
        event: str,
        user_id: Optional[str] = None,
        tenant_id: Optional[str] = None,
        data: Optional[Dict[str, Any]] = None,
        notify_tenant_admins: bool = False,
    ) -> None:
        body = {
            'event': event,
            'data': data or {},
        }
        if user_id:
            cls._group_send(f'user_{user_id}', 'security_event', body)
        if tenant_id and notify_tenant_admins:
            cls._group_send(f'tenant_{tenant_id}', 'security_event', body)

    @classmethod
    def session_revoked(
        cls,
        *,
        user_id: str,
        session_id: str,
        tenant_id: str,
        revoked_by_id: Optional[str] = None,
        reason: str = 'admin_revoke',
    ) -> None:
        payload = {
            'session_id': session_id,
            'revoked_by_id': revoked_by_id,
            'reason': reason,
        }
        cls._emit(
            event='session_revoked',
            user_id=user_id,
            tenant_id=tenant_id,
            data=payload,
            notify_tenant_admins=True,
        )

    @classmethod
    def user_deactivated(
        cls,
        *,
        user_id: str,
        tenant_id: str,
        email: str,
        deactivated_by_id: Optional[str] = None,
        sessions_terminated: int = 0,
    ) -> None:
        cls._emit(
            event='user_deactivated',
            user_id=user_id,
            data={
                'email': email,
                'deactivated_by_id': deactivated_by_id,
                'sessions_terminated': sessions_terminated,
                'force_logout': True,
            },
        )
        cls._group_send(
            f'tenant_{tenant_id}',
            'security_event',
            {
                'event': 'user_deactivated',
                'data': {
                    'user_id': user_id,
                    'email': email,
                    'deactivated_by_id': deactivated_by_id,
                    'sessions_terminated': sessions_terminated,
                    'force_logout': False,
                },
            },
        )

    @classmethod
    def role_changed(
        cls,
        *,
        user_id: str,
        tenant_id: str,
        old_role: str,
        new_role: str,
        assigned_by_id: Optional[str] = None,
    ) -> None:
        cls._emit(
            event='role_changed',
            user_id=user_id,
            tenant_id=tenant_id,
            data={
                'old_role': old_role,
                'new_role': new_role,
                'assigned_by_id': assigned_by_id,
            },
            notify_tenant_admins=True,
        )

    @classmethod
    def mfa_enabled(
        cls,
        *,
        user_id: str,
        tenant_id: str,
        device_id: Optional[str] = None,
    ) -> None:
        cls._emit(
            event='mfa_enabled',
            user_id=user_id,
            tenant_id=tenant_id,
            data={'device_id': device_id},
        )

    @classmethod
    def mfa_required(
        cls,
        *,
        user_id: str,
        tenant_id: str,
        roles: list,
    ) -> None:
        cls._emit(
            event='mfa_required',
            user_id=user_id,
            tenant_id=tenant_id,
            data={'required_roles': roles},
        )

    @classmethod
    def policy_updated(
        cls,
        *,
        tenant_id: Optional[str] = None,
        scope: str = 'tenant',
        version: int = 1,
    ) -> None:
        data = {'scope': scope, 'version': version}
        if tenant_id:
            cls._group_send(f'tenant_{tenant_id}', 'security_event', {
                'event': 'policy_updated',
                'data': data,
            })
        else:
            cls._group_send('tenant_system', 'security_event', {
                'event': 'policy_updated',
                'data': data,
            })

    @classmethod
    def account_locked(
        cls,
        *,
        user_id: str,
        tenant_id: str,
        locked_until: Optional[str] = None,
        reason: str = 'failed_attempts',
    ) -> None:
        cls._emit(
            event='account_locked',
            user_id=user_id,
            tenant_id=tenant_id,
            data={'locked_until': locked_until, 'reason': reason},
        )
