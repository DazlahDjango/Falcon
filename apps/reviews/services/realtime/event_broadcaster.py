import logging
from typing import Any, Dict, Optional
from django.utils import timezone
from asgiref.sync import async_to_sync

logger = logging.getLogger(__name__)

class ReviewsEventBroadcaster:
    @staticmethod
    def _realtime_flag(key: str) -> bool:
        try:
            from apps.reviews.services.settings import ReviewsSettingsService
            return ReviewsSettingsService.get_section('realtime').get(key, True)
        except Exception:
            return True

    @staticmethod
    def _group_send(group_name: str, handler_type: str, payload: dict) -> None:
        try:
            from channels.layers import get_channel_layer
            from apps.reviews.services.settings import ReviewsSettingsService
            if not ReviewsSettingsService.get_section('realtime').get('websocket_enabled', True):
                return
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
            logger.warning('Reviews WS broadcast failed (%s): %s', group_name, exc)

    @classmethod
    def review_submitted(
        cls,
        *,
        cycle_id: str,
        employee_id: str,
        employee_name: str,
        review_type: str = 'self_assessment',
    ) -> None:
        if not cls._realtime_flag('push_submission_updates'):
            return
        event = {
            'employee_name': employee_name,
            'employee_id': str(employee_id),
            'cycle_id': str(cycle_id),
            'submitted_at': timezone.now().isoformat(),
            'review_type': review_type,
        }
        cls._group_send(f'review_status_{cycle_id}', 'review_submitted', event)
        cls._group_send(f'employee_{employee_id}', 'review_submitted', event)

    @classmethod
    def review_approved(
        cls,
        *,
        cycle_id: str,
        employee_id: str,
        employee_name: str,
        approved_by: str,
    ) -> None:
        if not cls._realtime_flag('push_approval_updates'):
            return
        event = {
            'employee_name': employee_name,
            'employee_id': str(employee_id),
            'approved_by': approved_by,
            'approved_at': timezone.now().isoformat(),
            'cycle_id': str(cycle_id),
        }
        cls._group_send(f'review_status_{cycle_id}', 'review_approved', event)

    @classmethod
    def review_completed(
        cls,
        *,
        cycle_id: str,
        employee_id: str,
        final_score: Optional[float] = None,
    ) -> None:
        cls._group_send(f'review_status_{cycle_id}', 'completion_updated', {
            'submitted_count': None,
            'total_count': None,
            'percentage': None,
            'employee_id': str(employee_id),
            'final_score': final_score,
            'event': 'review_completed',
        })

    @classmethod
    def dashboard_metrics(cls, *, tenant_id: str, metrics: Dict[str, Any]) -> None:
        cls._group_send(f'reviews_dashboard_{tenant_id}', 'metrics_updated', {'data': metrics})

    @classmethod
    def dependency_sync(cls, *, tenant_id: str, source: str, payload: Dict[str, Any]) -> None:
        if not cls._realtime_flag('push_dependency_sync'):
            return
        cls._group_send(f'reviews_dashboard_{tenant_id}', 'dependency_sync', {
            'source': source,
            'payload': payload,
        })
