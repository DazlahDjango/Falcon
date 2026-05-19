from django.utils import timezone
from .base import DashboardBaseManager

class DashboardAlertManager(DashboardBaseManager):
    def get_active_alerts_for_user(self, user_id, tenant_id):
        now = timezone.now()
        return self.for_tenant(tenant_id).filter(
            user_id=user_id,
            is_active=True
        ).exclude(
            suppress_until__gte=now
        ).order_by('-severity', 'created_at')
    
    def get_alerts_by_type(self, user_id, tenant_id, alert_type):
        return self.get_active_alerts_for_user(user_id, tenant_id).filter(alert_type=alert_type)
    
    def suppress_alert(self, alert_id, user_id, tenant_id, duration_minutes=60):
        alert = self.get(id=alert_id, user_id=user_id, tenant_id=tenant_id)
        alert.suppress_until = timezone.now() + timezone.timedelta(minutes=duration_minutes)
        alert.save(update_fields=['suppress_until', 'updated_at'])
        return alert
    
    def record_trigger(self, alert_id, user_id, tenant_id):
        alert = self.get(id=alert_id, user_id=user_id, tenant_id=tenant_id)
        alert.last_triggered_at = timezone.now()
        alert.trigger_count += 1
        alert.save(update_fields=['last_triggered_at', 'trigger_count', 'updated_at'])
        return alert
    
    def create_default_alerts(self, user_id, tenant_id, role):
        default_alerts = []
        if role in ['super_admin', 'client_admin', 'executive']:
            default_alerts.extend([
                {
                    'alert_type': 'red_kpi',
                    'severity': 'critical',
                    'config': {'threshold_days': 30},
                    'frequency': 'daily'
                },
                {
                    'alert_type': 'missing_data',
                    'severity': 'warning',
                    'config': {'grace_period_days': 5},
                    'frequency': 'daily'
                }
            ])
        
        if role in ['super_admin', 'client_admin']:
            default_alerts.append({
                'alert_type': 'tenant_expiry',
                'severity': 'critical',
                'config': {'days_before_notice': 30},
                'frequency': 'daily'
            })
        
        for alert_config in default_alerts:
            existing = self.filter(
                user_id=user_id,
                tenant_id=tenant_id,
                alert_type=alert_config['alert_type']
            ).first()
            
            if not existing:
                self.secure_create(
                    tenant_id=tenant_id,
                    user_id=user_id,
                    **alert_config
                )