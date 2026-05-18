from django.db import models
from .base import BaseConfigModel
from .registered_app import RegisteredApp
from .maintenance_window import MaintenanceWindow

class RiskAssessment(BaseConfigModel):
    RISK_LEVEL_CHOICES = [('low', 'Low Risk'), ('medium', 'Medium Risk'), ('high', 'High Risk'), ('critical', 'Critical Risk - Immediate Action Required')]
    
    app = models.ForeignKey(RegisteredApp, on_delete=models.CASCADE, related_name='risk_assessments')
    risk_level = models.CharField(max_length=20, choices=RISK_LEVEL_CHOICES, db_index=True)
    risk_score = models.DecimalField(max_digits=5, decimal_places=2, help_text="0.00 - 100.00", db_index=True)
    factors = models.JSONField(default=dict, help_text="Factors contributing to risk (error rate, backup age, etc.)")
    recommended_maintenance_type = models.CharField(max_length=20, choices=MaintenanceWindow.MAINTENANCE_TYPE_CHOICES, null=True, blank=True)
    recommended_maintenance_window_minutes = models.IntegerField(null=True, blank=True, help_text="Recommended duration")
    requires_super_admin = models.BooleanField(default=False, help_text="Does this risk require Super Admin action?")
    action_taken = models.TextField(blank=True, help_text="What action was taken based on this assessment")
    assessed_by = models.UUIDField(help_text="User ID or 'system' for automated")
    assessed_at = models.DateTimeField(auto_now_add=True, db_index=True)
    expires_at = models.DateTimeField(help_text="When this assessment expires and needs recalculation")
    
    class Meta:
        db_table = 'config_risk_assessment'
        ordering = ['-risk_score', '-assessed_at']
        indexes = [models.Index(fields=['app', 'risk_level']), models.Index(fields=['risk_score']), models.Index(fields=['expires_at'])]
    
    def __str__(self):
        return f"{self.app.name} - {self.risk_level} (Score: {self.risk_score})"