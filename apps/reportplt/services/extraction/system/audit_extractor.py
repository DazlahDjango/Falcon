from typing import Dict, Any
from django.db import models
from django.utils import timezone
from datetime import timedelta
from apps.reportplt.services.extraction.base_extractor import BaseDataExtractor
from apps.accounts.models import AuditLog, LoginAttempt

class AuditDataExtractor(BaseDataExtractor):
    def extract(self) -> Dict[str, Any]:
        days = self.filters.get('days', 30)
        cutoff = timezone.now() - timedelta(days=days)
        logs = AuditLog.objects.filter(tenant_id=self.tenant_id, timestamp__gte=cutoff)
        login_attempts = LoginAttempt.objects.filter(tenant_id=self.tenant_id, timestamp__gte=cutoff)
        action_summary = list(logs.values('action_type').annotate(count=models.Count('id')))
        return {
            'period_days': days,
            'summary': {
                'total_audit_events': logs.count(),
                'total_login_attempts': login_attempts.count(),
                'failed_logins': login_attempts.filter(is_successful=False).count()
            },
            'action_summary': action_summary
        }
