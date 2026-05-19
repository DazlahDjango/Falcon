from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.core.cache import cache
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import logging
logger = logging.getLogger(__name__)

@receiver(post_save, sender='kpi.MonthlyActual')
def on_kpi_actual_saved(sender, instance, created, **kwargs):
    from apps.kpi.services import KPIUpdater
    try:
        calc_service = KPIUpdater(None, instance.tenant_id)
        new_score = calc_service.update(instance.kpi_id)
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"dashboard_{instance.tenant_id}_*_*",
            {
                'type': 'kpi_update',
                'kpi_id': str(instance.kpi_id),
                'new_score': new_score,
                'timestamp': str(instance.updated_at)
            }
        )
        cache_pattern = f"dashboard:*:{instance.tenant_id}:*:*"
        _invalidate_cache_pattern(cache_pattern)        
    except Exception as e:
        logger.error(f"Signal error in on_kpi_actual_saved: {e}")

@receiver(post_save, sender='kpi.KPI')
def on_kpi_status_change(sender, instance, created, **kwargs):
    if not created and hasattr(instance, '_previous_status'):
        channel_layer = get_channel_layer()        
        async_to_sync(channel_layer.group_send)(
            f"dashboard_{instance.tenant_id}_*_*",
            {
                'type': 'dashboard_update',
                'update_type': 'kpi_status_change',
                'data': {
                    'kpi_id': str(instance.id),
                    'kpi_name': instance.name,
                    'old_status': instance._previous_status,
                    'new_status': instance.current_status
                },
                'timestamp': str(instance.updated_at)
            }
        )

@receiver(post_save, sender='dashboard.DashboardAlert')
def on_alert_triggered(sender, instance, created, **kwargs):
    if created or instance.last_triggered_at:
        channel_layer = get_channel_layer()
        
        async_to_sync(channel_layer.group_send)(
            f"notifications_{instance.tenant_id}_{instance.user_id}",
            {
                'type': 'send_notification',
                'notification_id': str(instance.id),
                'title': f"{instance.get_alert_type_display()} Alert",
                'message': f"Alert triggered for {instance.get_alert_type_display()}",
                'severity': instance.severity,
                'created_at': str(instance.created_at)
            }
        )


@receiver(post_save, sender='accounts.User')
@receiver(post_delete, sender='accounts.User')
def on_user_change(sender, instance, **kwargs):
    """Invalidate dashboard caches when user structure changes."""
    cache_pattern = f"dashboard:*:{instance.tenant_id}:*:*"
    _invalidate_cache_pattern(cache_pattern)
    
    cache_pattern_hierarchy = f"hierarchy:*:{instance.tenant_id}:*"
    _invalidate_cache_pattern(cache_pattern_hierarchy)


@receiver(post_save, sender='structure.Department')
@receiver(post_delete, sender='structure.Department')
def on_department_change(sender, instance, **kwargs):
    cache_pattern = f"dashboard:*:{instance.tenant_id}:*:*"
    _invalidate_cache_pattern(cache_pattern)

@receiver(post_save, sender='dashboard.PeriodComparison')
def on_comparison_saved(sender, instance, created, **kwargs):
    cache_key = f"dashboard:comparison:{instance.tenant_id}:{instance.id}:*"
    _invalidate_cache_pattern(cache_key)

def _invalidate_cache_pattern(pattern):
    try:
        if hasattr(cache, 'delete_pattern'):
            cache.delete_pattern(pattern)
        else:
            keys = cache.keys(pattern) if hasattr(cache, 'keys') else []
            for key in keys:
                cache.delete(key)
    except Exception as e:
        logger.warning(f"Failed to invalidate cache pattern {pattern}: {e}")