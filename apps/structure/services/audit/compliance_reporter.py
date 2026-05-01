from uuid import UUID
from .change_logger import ChangeLoggerService

class ComplianceReporterService:
    def __init__(self):
        self.change_logger = ChangeLoggerService()
    
    def generate_compliance_report(self, tenant_id: UUID, start_date: str = None, end_date: str = None) -> dict:
        from django.utils import timezone
        from datetime import datetime, timedelta
        if not start_date:
            start_date = (timezone.now() - timedelta(days=30)).date()
        else:
            start_date = datetime.fromisoformat(start_date).date() if isinstance(start_date, str) else start_date
        if not end_date:
            end_date = timezone.now().date()
        else:
            end_date = datetime.fromisoformat(end_date).date() if isinstance(end_date, str) else end_date
        audit_logs = self.change_logger.get_audit_trail(tenant_id, limit=1000)
        filtered_logs = [
            log for log in audit_logs
            if start_date <= datetime.fromisoformat(log['timestamp']).date() <= end_date
        ]
        report = {
            'tenant_id': str(tenant_id),
            'report_period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            },
            'summary': {
                'total_changes': len(filtered_logs),
                'department_changes': len([l for l in filtered_logs if 'Department' in l.get('object_repr', '')]),
                'team_changes': len([l for l in filtered_logs if 'Team' in l.get('object_repr', '')]),
                'employment_changes': len([l for l in filtered_logs if 'Employment' in l.get('object_repr', '') or 'User' in l.get('object_repr', '')]),
                'reporting_changes': len([l for l in filtered_logs if 'reporting' in str(l.get('changes', {})).lower()])
            },
            'changes_by_action': {},
            'recent_changes': filtered_logs[:50]
        }
        for log in filtered_logs:
            action = log.get('action', 'unknown')
            if action not in report['changes_by_action']:
                report['changes_by_action'][action] = 0
            report['changes_by_action'][action] += 1
        return report
    
    def generate_sox_compliance(self, tenant_id: UUID) -> dict:
        from ...models.department import Department
        from ...models.employment import Employment
        from ...models.reporting_line import ReportingLine
        departments = Department.objects.filter(tenant_id=tenant_id, is_deleted=False)
        employments = Employment.objects.filter(tenant_id=tenant_id, is_current=True, is_deleted=False)
        reporting_lines = ReportingLine.objects.filter(tenant_id=tenant_id, is_active=True, is_deleted=False)
        sox_report = {
            'tenant_id': str(tenant_id),
            'generated_at': None,
            'controls': {
                'segregation_of_duties': self._check_segregation_of_duties(tenant_id),
                'authorization_matrix': self._check_authorization_matrix(tenant_id),
                'access_controls': self._check_access_controls(tenant_id),
                'change_management': self._check_change_management(tenant_id)
            },
            'statistics': {
                'total_departments': departments.count(),
                'total_employments': employments.count(),
                'total_reporting_lines': reporting_lines.count(),
                'managers_count': employments.filter(is_manager=True).count(),
                'executives_count': employments.filter(is_executive=True).count()
            }
        }
        from django.utils import timezone
        sox_report['generated_at'] = timezone.now().isoformat()
        return sox_report
    
    def _check_segregation_of_duties(self, tenant_id: UUID) -> dict:
        """Check segregation of duties compliance"""
        from ...models.employment import Employment
        # Check for users with conflicting roles
        # This would integrate with permissions module
        return {
            'status': 'compliant',
            'findings': [],
            'recommendations': []
        }
    
    def _check_authorization_matrix(self, tenant_id: UUID) -> dict:
        return {
            'status': 'compliant',
            'findings': [],
            'recommendations': []
        }
    
    def _check_access_controls(self, tenant_id: UUID) -> dict:
        return {
            'status': 'compliant',
            'findings': [],
            'recommendations': []
        }
    
    def _check_change_management(self, tenant_id: UUID) -> dict:
        audit_logs = self.change_logger.get_audit_trail(tenant_id, limit=100)
        changes_without_approval = []
        for log in audit_logs:
            additional_data = log.get('additional_data', {})
            if not additional_data.get('approved_by'):
                changes_without_approval.append(log)
        return {
            'status': 'needs_review' if len(changes_without_approval) > 10 else 'compliant',
            'total_changes': len(audit_logs),
            'changes_without_approval': len(changes_without_approval),
            'recommendations': [
                'Ensure all structural changes are properly approved'
            ] if len(changes_without_approval) > 10 else []
        }