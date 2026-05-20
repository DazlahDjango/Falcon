# apps/dashboard/services/champion_service.py

from django.utils import timezone
from typing import Dict, Any, Optional, List
from .base_service import BaseDashboardService
from .hierarchy_service import HierarchyService
from .cache_service import DashboardCacheService
from apps.dashboard.constants import DashboardType


class ChampionService(BaseDashboardService):
    """
    Service for Dashboard Champion.
    Can edit dashboards, configure KPIs, adjust targets, and manage what others see.
    """
    
    def __init__(self, user, tenant_id):
        super().__init__(user, tenant_id)
        self.hierarchy_service = HierarchyService(user, tenant_id)
        self.cache_service = DashboardCacheService(user, tenant_id)
    
    def get_editable_dashboard(
        self, 
        target_user_id: Optional[str] = None,
        period: str = 'current'
    ) -> Dict[str, Any]:
        """Get dashboard in edit mode for configuration."""
        self._validate_dashboard_access(DashboardType.CHAMPION)
        
        user_id = target_user_id or self.user_id
        
        # Check cache
        cached = self.cache_service.get_dashboard_data(user_id, DashboardType.CHAMPION)
        if cached:
            return cached
        
        from apps.accounts.models import User
        try:
            target_user = User.objects.get(id=user_id, tenant_id=self.tenant_id, is_active=True)
        except User.DoesNotExist:
            return {'error': f'User {user_id} not found'}
        
        # Get assigned KPIs
        assigned_kpis = self._get_assigned_kpis(user_id, period)
        
        # Get available KPIs (not assigned)
        available_kpis = self._get_available_kpis(user_id)
        
        # Get current dashboard config
        dashboard_config = self._get_dashboard_config(user_id)
        
        result = {
            'target_user': {
                'id': str(target_user.id),
                'name': target_user.get_full_name(),
                'email': target_user.email,
                'role': getattr(target_user, 'role', 'staff'),
                'department': getattr(target_user, 'department', ''),
            },
            'period': period,
            'is_editable': True,
            'assigned_kpis': assigned_kpis,
            'available_kpis': available_kpis,
            'dashboard_config': dashboard_config,
            'last_updated': timezone.now().isoformat(),
        }
        
        # Cache the result
        self.cache_service.set_dashboard_data(user_id, DashboardType.CHAMPION, result)
        self._audit_log(DashboardType.CHAMPION, 'view', {'target_user_id': user_id})
        
        return result
    
    def update_dashboard_config(
        self,
        target_user_id: str,
        config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update dashboard configuration (add/remove KPIs, adjust weights/targets)."""
        self._validate_dashboard_access(DashboardType.CHAMPION)
        
        # Verify target user exists in same tenant
        from apps.accounts.models import User
        try:
            target_user = User.objects.get(id=target_user_id, tenant_id=self.tenant_id, is_active=True)
        except User.DoesNotExist:
            return {'success': False, 'error': f'User {target_user_id} not found'}
        
        # Update KPI assignments if provided
        if 'kpi_assignments' in config:
            self._update_kpi_assignments(target_user_id, config['kpi_assignments'])
        
        # Update weights if provided
        if 'weights' in config:
            self._update_kpi_weights(target_user_id, config['weights'])
        
        # Update targets if provided
        if 'targets' in config:
            self._update_targets(target_user_id, config['targets'], config.get('period'))
        
        # Update dashboard layout/config if provided
        if 'layout' in config:
            self._update_dashboard_layout(target_user_id, config['layout'])
        
        # Invalidate all caches for this user
        self.cache_service.invalidate_user_dashboards(target_user_id)
        
        # Also invalidate supervisor/manager caches
        self._invalidate_supervisor_caches(target_user_id)
        
        self._audit_log(DashboardType.CHAMPION, 'config_update', {
            'target_user_id': target_user_id,
            'changes': list(config.keys())
        })
        
        return {
            'success': True,
            'message': 'Dashboard configuration updated successfully',
            'target_user_id': target_user_id
        }
    
    def _get_assigned_kpis(self, user_id: str, period: str) -> List[Dict]:
        """Get KPIs assigned to user."""
        from apps.kpi.models import KPI, MonthlyActual, Target
        
        kpis = KPI.objects.filter(
            tenant_id=self.tenant_id,
            owner_id=user_id,
            is_active=True
        )
        
        result = []
        for kpi in kpis:
            actual = MonthlyActual.objects.filter(
                tenant_id=self.tenant_id,
                kpi_id=kpi.id,
                year=timezone.now().year,
                month=timezone.now().month
            ).first()
            
            # Get custom target if exists
            target = Target.objects.filter(
                tenant_id=self.tenant_id,
                kpi=kpi,
                user_id=user_id,
                period=period
            ).first()
            
            result.append({
                'id': str(kpi.id),
                'name': kpi.name,
                'description': getattr(kpi, 'description', ''),
                'target': float(target.value) if target else (float(kpi.target) if kpi.target else None),
                'actual': float(actual.actual_value) if actual and actual.actual_value else None,
                'weight': getattr(kpi, 'weight', 1),
                'is_active': kpi.is_active,
                'category': getattr(kpi, 'category', ''),
            })
        
        return result
    
    def _get_available_kpis(self, user_id: str) -> List[Dict]:
        """Get KPIs available for assignment to user."""
        from apps.kpi.models import KPI
        
        assigned_ids = KPI.objects.filter(
            tenant_id=self.tenant_id,
            owner_id=user_id
        ).values_list('id', flat=True)
        
        available_kpis = KPI.objects.filter(
            tenant_id=self.tenant_id,
            is_active=True
        ).exclude(id__in=assigned_ids)[:50]
        
        return [
            {
                'id': str(kpi.id),
                'name': kpi.name,
                'description': getattr(kpi, 'description', ''),
                'target': float(kpi.target) if kpi.target else None,
                'category': getattr(kpi, 'category', ''),
            }
            for kpi in available_kpis
        ]
    
    def _get_dashboard_config(self, user_id: str) -> Dict:
        """Get user's dashboard configuration."""
        from apps.dashboard.models import DashboardConfig
        
        try:
            config = DashboardConfig.objects.get(
                tenant_id=self.tenant_id,
                user_id=user_id
            )
            return {
                'layout': config.layout if hasattr(config, 'layout') else {},
                'filters': config.filters if hasattr(config, 'filters') else {},
                'widgets': config.widgets if hasattr(config, 'widgets') else [],
            }
        except DashboardConfig.DoesNotExist:
            return {'layout': {}, 'filters': {}, 'widgets': []}
    
    def _update_kpi_assignments(self, user_id: str, assignments: List[Dict]) -> None:
        """Update KPI assignments for a user."""
        from apps.kpi.models import KPI
        
        for assignment in assignments:
            kpi_id = assignment.get('kpi_id')
            action = assignment.get('action')
            
            if action == 'add':
                KPI.objects.filter(id=kpi_id, tenant_id=self.tenant_id).update(
                    owner_id=user_id,
                    updated_at=timezone.now()
                )
            elif action == 'remove':
                KPI.objects.filter(id=kpi_id, tenant_id=self.tenant_id, owner_id=user_id).update(
                    owner_id=None
                )
    
    def _update_kpi_weights(self, user_id: str, weights: Dict[str, int]) -> None:
        """Update KPI weights."""
        from apps.kpi.models import KPI
        
        for kpi_id, weight in weights.items():
            KPI.objects.filter(
                id=kpi_id, 
                tenant_id=self.tenant_id, 
                owner_id=user_id
            ).update(weight=weight)
    
    def _update_targets(self, user_id: str, targets: Dict[str, float], period: str = None) -> None:
        """Update KPI targets."""
        from apps.kpi.models import KPI, Target
        
        period = period or 'current'
        
        for kpi_id, target_value in targets.items():
            kpi = KPI.objects.get(id=kpi_id, tenant_id=self.tenant_id)
            
            Target.objects.update_or_create(
                tenant_id=self.tenant_id,
                kpi=kpi,
                user_id=user_id,
                period=period,
                defaults={
                    'value': target_value,
                    'updated_at': timezone.now(),
                    'updated_by_id': self.user_id,
                }
            )
    
    def _update_dashboard_layout(self, user_id: str, layout: Dict) -> None:
        """Update dashboard layout configuration."""
        from apps.dashboard.models import DashboardConfig
        
        config, created = DashboardConfig.objects.update_or_create(
            tenant_id=self.tenant_id,
            user_id=user_id,
            defaults={
                'layout': layout,
                'updated_at': timezone.now(),
            }
        )
    
    def _invalidate_supervisor_caches(self, user_id: str) -> None:
        """Invalidate caches for all supervisors of this user."""
        try:
            from apps.accounts.models import User
            user = User.objects.get(id=user_id, tenant_id=self.tenant_id)
            
            if user.manager_id:
                self.cache_service.invalidate_user_dashboards(str(user.manager_id))
        except Exception:
            pass