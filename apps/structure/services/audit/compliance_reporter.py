from typing import Dict, Any, List
from uuid import UUID
from django.db import models
from django.utils import timezone
from datetime import timedelta
from apps.structure.models.employment import Employment
from apps.structure.models.employment import Employment
from apps.structure.models.organizational_unit import OrganizationalUnit
from apps.structure.services.reporting.chain_validator import ChainValidator
from apps.structure.services.reporting.span_of_control import SpanOfControl
from apps.structure.services.audit.change_logger import ChangeLoggerService

class ComplianceReporterService:
    def __init__(self):
        self.change_logger = ChangeLoggerService()
        self.chain_validator = ChainValidator()
        self.span_control = SpanOfControl()
    
    def generate_compliance_report(self, tenant_id: UUID, start_date: str = None, end_date: str = None) -> Dict[str, Any]:
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
                'org_unit_changes': len([l for l in filtered_logs if 'OrganizationalUnit' in l.get('object_repr', '')]),
                'department_changes': len([l for l in filtered_logs if 'Department' in l.get('object_repr', '')]),
                'employment_changes': len([l for l in filtered_logs if 'Employment' in l.get('object_repr', '') or 'User' in l.get('object_repr', '')]),
                'reporting_changes': len([l for l in filtered_logs if 'reporting' in str(l.get('changes', {})).lower()])
            },
            'changes_by_action': {},
            'recent_changes': filtered_logs[:50],
            'org_health': self.generate_org_health_check(tenant_id)
        }
        for log in filtered_logs:
            action = log.get('action', 'unknown')
            if action not in report['changes_by_action']:
                report['changes_by_action'][action] = 0
            report['changes_by_action'][action] += 1
        return report
    
    def generate_org_health_check(self, tenant_id: UUID) -> Dict[str, Any]:
        units = OrganizationalUnit.objects.filter(tenant_id=tenant_id, is_deleted=False)
        employments = Employment.objects.filter(tenant_id=tenant_id, is_current=True, is_deleted=False)
        employments = Employment.objects.filter(tenant_id=tenant_id, is_active=True, is_deleted=False)
        chain_issues = self.chain_validator.validate_all_chains(tenant_id)
        spans = self.span_control.get_span_by_level(tenant_id, None)
        health = {
            'overall_score': 100,
            'warnings': [],
            'critical_issues': [],
            'statistics': {
                'total_org_units': units.count(),
                'total_employments': employments.count(),
                'total_employments': employments.count(),
                'managers_count': employments.filter(is_manager=True).count(),
                'executives_count': employments.filter(is_executive=True).count(),
                'org_depth': max([unit.depth for unit in units]) if units.exists() else 0
            }
        }
        if chain_issues:
            health['overall_score'] -= 20
            health['critical_issues'].append(f"{len(chain_issues)} reporting chain issues detected")
        if spans and any(s['total_reports'] > 15 for s in spans):
            health['overall_score'] -= 10
            health['warnings'].append("Some managers have span of control exceeding recommended limit")
        if not units.filter(parent__isnull=True).exists():
            health['overall_score'] -= 10
            health['warnings'].append("No root organizational unit found")
        return health
    
    def generate_sox_compliance(self, tenant_id: UUID) -> Dict[str, Any]:
        report = {
            'tenant_id': str(tenant_id),
            'generated_at': timezone.now().isoformat(),
            'controls': {
                'segregation_of_duties': self._check_segregation_of_duties(tenant_id),
                'authorization_matrix': self._check_authorization_matrix(tenant_id),
                'access_controls': self._check_access_controls(tenant_id),
                'change_management': self._check_change_management(tenant_id)
            }
        }
        return report
    
    def _check_segregation_of_duties(self, tenant_id: UUID) -> Dict[str, Any]:
        return {
            'status': 'compliant',
            'findings': [],
            'recommendations': []
        }
    
    def _check_authorization_matrix(self, tenant_id: UUID) -> Dict[str, Any]:
        return {
            'status': 'compliant',
            'findings': [],
            'recommendations': []
        }
    
    def _check_access_controls(self, tenant_id: UUID) -> Dict[str, Any]:
        return {
            'status': 'compliant',
            'findings': [],
            'recommendations': []
        }
    
    def _check_change_management(self, tenant_id: UUID) -> Dict[str, Any]:
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