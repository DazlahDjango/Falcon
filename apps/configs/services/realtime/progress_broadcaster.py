"""
Push config job progress to WebSocket groups (real-time / real-change).

Uses Channels group_send; safe no-op when channel layer is unavailable.
"""
import logging
from django.utils import timezone
from asgiref.sync import async_to_sync

logger = logging.getLogger(__name__)


class ConfigProgressBroadcaster:
    @staticmethod
    def _group_send(group_name: str, event_type: str, payload: dict) -> None:
        try:
            from channels.layers import get_channel_layer
            channel_layer = get_channel_layer()
            if channel_layer is None:
                logger.debug('No channel layer; skip WS broadcast to %s', group_name)
                return
            async_to_sync(channel_layer.group_send)(
                group_name,
                {'type': event_type, **payload, 'timestamp': timezone.now().isoformat()},
            )
        except Exception as exc:
            logger.warning('WS broadcast failed (%s): %s', group_name, exc)

    @classmethod
    def broadcast_backup_progress(
        cls,
        job_id,
        *,
        status='running',
        progress_percent=0,
        completed_items=0,
        total_items=1,
        current_item=None,
        size_bytes=None,
        duration_seconds=None,
    ) -> None:
        cls._group_send(
            f'backup_progress_{job_id}',
            'backup_progress',
            {
                'status': status,
                'progress_percent': progress_percent,
                'completed_items': completed_items,
                'total_items': total_items,
                'current_item': current_item,
                'size_bytes': size_bytes,
                'duration_seconds': duration_seconds,
            },
        )

    @classmethod
    def broadcast_dr_progress(
        cls,
        execution_id,
        *,
        status='in_progress',
        progress_percent=0,
        completed_steps=0,
        total_steps=1,
        current_step=None,
        steps=None,
        rto_achieved_minutes=None,
        rpo_achieved_minutes=None,
    ) -> None:
        cls._group_send(
            f'dr_progress_{execution_id}',
            'dr_progress',
            {
                'status': status,
                'progress_percent': progress_percent,
                'completed_steps': completed_steps,
                'total_steps': total_steps,
                'current_step': current_step,
                'steps': steps or [],
                'rto_achieved_minutes': rto_achieved_minutes,
                'rpo_achieved_minutes': rpo_achieved_minutes,
            },
        )

    @classmethod
    def broadcast_maintenance_update(
        cls,
        tenant_id='system',
        *,
        maintenance_active=False,
        maintenance_type='none',
        message='',
        affected_apps=None,
        started_at=None,
        expected_end=None,
    ) -> None:
        cls._group_send(
            f'maintenance_{tenant_id}',
            'maintenance_update',
            {
                'maintenance_active': maintenance_active,
                'maintenance_type': maintenance_type,
                'message': message,
                'affected_apps': affected_apps or [],
                'started_at': started_at,
                'expected_end': expected_end,
            },
        )

    @classmethod
    def broadcast_maintenance_from_mode(cls, tenant_id='system') -> None:
        """Snapshot current MaintenanceMode cache and push to subscribers."""
        from apps.configs.services.maintenance.maintenance_mode import MaintenanceMode
        mode = MaintenanceMode()
        cls.broadcast_maintenance_update(
            tenant_id,
            maintenance_active=mode.is_active(),
            maintenance_type=mode.get_type(),
            message=mode.get_message(),
            affected_apps=mode.get_affected_apps(),
        )
