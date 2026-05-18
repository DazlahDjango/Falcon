from django.db import models
from .base import BaseConfigManager

class RiskAssessmentManager(BaseConfigManager):
    def current(self):
        from django.utils import timezone
        return self.get_queryset().filter(expires_at__gt=timezone.now())
    
    def high_risk(self):
        return self.current().filter(risk_level__in=['high', 'critical'])
    
    def low_risk(self):
        return self.current().filter(risk_level='low')
    
    def for_app(self, app_id):
        return self.current().filter(app_id=app_id)
    
    def requires_action(self):
        return self.current().filter(requires_super_admin=True)
    
    def latest_for_app(self, app_id):
        return self.get_queryset().filter(app_id=app_id).order_by('-assessed_at').first()
    
    def above_threshold(self, threshold=70):
        return self.current().filter(risk_score__gte=threshold)
    
    def by_assessed_by(self, user_id):
        return self.get_queryset().filter(assessed_by=user_id)