from apps.configs.models import RiskAssessment, HealthCheck, RegisteredApp
from apps.configs.constants import RiskLevel, HealthStatus
from apps.configs.services.maintenance.maintenance_orchestrator import MaintenanceOrchestrator
from django.utils import timezone
from datetime import timedelta

class MaintenanceRisk:
    def __init__(self):
        self.orchestrator = MaintenanceOrchestrator()
    def assess_and_schedule(self, system_user_id):
        high_risk_apps = RiskAssessment.objects.filter(
            risk_level__in=[RiskLevel.HIGH, RiskLevel.CRITICAL],
            expires_at__gt=timezone.now()
        ).select_related('app')
        unhealthy_apps = HealthCheck.objects.filter(
            status=HealthStatus.UNHEALTHY,
            created_at__gte=timezone.now() - timedelta(minutes=30)
        ).select_related('app')
        apps_to_maintain = set()
        for risk in high_risk_apps:
            apps_to_maintain.add(risk.app_id)
        for health in unhealthy_apps:
            apps_to_maintain.add(health.app_id)
        results = []
        for app_id in apps_to_maintain:
            app = RegisteredApp.objects.get(id=app_id)
            window = self.orchestrator.schedule_maintenance(
                title=f"Risk-based maintenance for {app.name}",
                maintenance_type='partial',
                scheduled_start=timezone.now(),
                scheduled_end=timezone.now() + timedelta(hours=2),
                triggered_by=system_user_id,
                triggered_by_role='system',
                reason=f"Automated risk-based maintenance due to high risk score or unhealthy health status",
                affected_app_ids=[app_id]
            )
            results.append({'app': app.name, 'window_id': str(window.id)})
        return results