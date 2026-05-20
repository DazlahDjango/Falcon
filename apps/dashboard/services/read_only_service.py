# apps/dashboard/services/read_only_service.py

from django.utils import timezone
from typing import Dict, Any, Optional
from .base_service import BaseDashboardService
from .cache_service import DashboardCacheService
from apps.dashboard.constants import DashboardType


class ReadOnlyService(BaseDashboardService):
    """
    Service for Read-Only users.
    Can view dashboards but cannot make any changes, edits, or submissions.
    """
    
    def __init__(self, user, tenant_id):
        super().__init__(user, tenant_id)
        self.cache_service = DashboardCacheService(user, tenant_id)
    
    def get_dashboard_data(
        self, 
        period: str = 'current',
        view_type: str = 'executive'
    ) -> Dict[str, Any]:
        """
        Get read-only dashboard data.
        
        Args:
            period: Time period (current, monthly, quarterly, yearly)
            view_type: Type of view ('executive', 'manager', 'staff', 'champion')
        """
        self._validate_dashboard_access(DashboardType.READ_ONLY)
        
        # Check cache
        cached = self.cache_service.get_dashboard_data(self.user_id, DashboardType.READ_ONLY)
        if cached:
            self._audit_log(DashboardType.READ_ONLY, 'cache_hit', {'view_type': view_type})
            return cached
        
        # Delegate to appropriate service based on view_type
        data = self._get_delegated_dashboard_data(period, view_type)
        
        # Add read-only flags
        data = self._add_read_only_flags(data)
        
        result = {
            'dashboard_type': view_type,
            'period': period,
            'read_only': True,
            'can_edit': False,
            'can_submit': False,
            'can_approve': False,
            'can_configure': False,
            'can_export': True,
            'data': data,
            'last_updated': timezone.now().isoformat(),
        }
        
        # Cache the result
        self.cache_service.set_dashboard_data(self.user_id, DashboardType.READ_ONLY, result)
        self._audit_log(DashboardType.READ_ONLY, 'view', {'view_type': view_type})
        
        return result
    
    def _get_delegated_dashboard_data(self, period: str, view_type: str) -> Dict[str, Any]:
        """Get data from appropriate service based on view type."""
        
        if view_type == 'executive':
            from .executive_service import ExecutiveDashboardService
            service = ExecutiveDashboardService(self.user, self.tenant_id)
            return service.get_dashboard_data(self.user_id)
        
        elif view_type == 'manager':
            from .manager_service import ManagerService
            service = ManagerService(self.user, self.tenant_id)
            return service.get_dashboard_data(period=period)
        
        elif view_type == 'staff':
            from .staff_service import StaffService
            service = StaffService(self.user, self.tenant_id)
            return service.get_dashboard_data(period=period)
        
        elif view_type == 'champion':
            from .champion_service import ChampionService
            service = ChampionService(self.user, self.tenant_id)
            return service.get_editable_dashboard(period=period)
        
        else:
            from .staff_service import StaffService
            service = StaffService(self.user, self.tenant_id)
            return service.get_dashboard_data(period=period)
    
    def _add_read_only_flags(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Add read-only flags to all levels of data."""
        
        if not isinstance(data, dict):
            return data
        
        data['read_only'] = True
        
        # Remove any edit/action buttons data
        data.pop('can_edit', None)
        data.pop('can_submit', None)
        data.pop('can_approve', None)
        data.pop('can_configure', None)
        
        # Process KPIs to remove edit actions
        if 'kpis' in data and isinstance(data['kpis'], list):
            for kpi in data['kpis']:
                if isinstance(kpi, dict):
                    kpi['can_edit'] = False
                    kpi['can_submit'] = False
                    if 'actions' in kpi:
                        kpi['actions'] = []
        
        # Process personal_kpis
        if 'personal_kpis' in data and isinstance(data['personal_kpis'], list):
            for kpi in data['personal_kpis']:
                if isinstance(kpi, dict):
                    kpi['can_edit'] = False
                    kpi['can_submit'] = False
        
        # Process team members
        if 'team_members' in data and isinstance(data['team_members'], list):
            for member in data['team_members']:
                if isinstance(member, dict):
                    member['can_drill_down'] = True
                    member['can_approve'] = False
        
        # Process pending submissions/approvals
        if 'pending_submissions' in data and isinstance(data['pending_submissions'], list):
            for submission in data['pending_submissions']:
                if isinstance(submission, dict):
                    submission['can_edit'] = False
        
        if 'pending_approvals' in data:
            data['pending_approvals'] = []
        
        return data
    
    def get_export_data(self, period: str = 'current', view_type: str = 'executive') -> Dict[str, Any]:
        """Get data specifically formatted for export (no read-only flags)."""
        
        data = self._get_delegated_dashboard_data(period, view_type)
        
        return {
            'exported_at': timezone.now().isoformat(),
            'exported_by': self.user.email,
            'dashboard_type': view_type,
            'period': period,
            'data': data,
        }