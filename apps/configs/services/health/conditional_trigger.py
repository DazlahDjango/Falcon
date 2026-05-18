import logging
from django.utils import timezone
from apps.configs.services.health.threshold_evaluator import ThresholdEvaluator
from apps.configs.services.maintenance.maintenance_orchestrator import MaintenanceOrchestrator
from apps.configs.models import RegisteredApp, HealthCheckHistory
from apps.configs.constants import HealthStatus

class ConditionalTrigger:
    def __init__(self):
        self.evaluator = ThresholdEvaluator()
        self.orchestrator = MaintenanceOrchestrator()
    def check_and_trigger(self, system_user_id):
        triggered_windows = []
        for app in RegisteredApp.objects.filter(is_registered=True):
            if self.evaluator.should_trigger_maintenance(app.name):
                window = self.orchestrator.schedule_maintenance(
                    title=f"Conditional maintenance triggered for {app.name}",
                    maintenance_type='partial',
                    scheduled_start=timezone.now(),
                    scheduled_end=timezone.now() + timezone.timedelta(hours=1),
                    triggered_by=system_user_id,
                    triggered_by_role='system',
                    reason=f"Automated conditional maintenance triggered due to health check failures",
                    affected_app_ids=[app.id]
                )
                triggered_windows.append(window)
                HealthCheckHistory.objects.create(
                    app=app,
                    previous_status=HealthStatus.UNHEALTHY,
                    new_status=HealthStatus.MAINTENANCE,
                    trigger_conditional_maintenance=True,
                    maintenance_window=window
                )
        return triggered_windows