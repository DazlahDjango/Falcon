from django.utils import timezone
from django.db import models
from .base import DashboardBaseManager

class TenantOverviewSnapshotManager(DashboardBaseManager):
    def get_latest_snapshot(self, client_id, tenant_id):
        return self.for_tenant(tenant_id).filter(
            client_id=client_id
        ).order_by('-snapshot_date').first()
    
    def get_all_tenant_summaries(self, tenant_id):
        from django.db.models import Subquery, OuterRef
        latest_date = self.for_tenant(tenant_id).filter(
            client_id=OuterRef('client_id')
        ).values('client_id').annotate(
            latest=models.Max('snapshot_date')
        ).values('latest')
        return self.for_tenant(tenant_id).filter(
            snapshot_date=Subquery(latest_date)
        ).order_by('client_name')
    
    def get_stale_snapshots(self, tenant_id, stale_days=1):
        cutoff = timezone.now().date() - timezone.timedelta(days=stale_days)
        return self.for_tenant(tenant_id).filter(
            snapshot_date__lt=cutoff,
            is_stale=True
        )
    
    def create_or_update_snapshot(self, tenant_id, client_id, client_name, metrics):
        today = timezone.now().date()
        
        snapshot, created = self.update_or_create(
            client_id=client_id,
            tenant_id=tenant_id,
            snapshot_date=today,
            defaults={
                'client_name': client_name,
                'subscription_status': metrics.get('subscription_status', 'unknown'),
                'subscription_plan': metrics.get('subscription_plan', ''),
                'subscription_expires_at': metrics.get('subscription_expires_at'),
                'total_users': metrics.get('total_users', 0),
                'active_users': metrics.get('active_users', 0),
                'total_kpis': metrics.get('total_kpis', 0),
                'kpi_green_count': metrics.get('kpi_green_count', 0),
                'kpi_yellow_count': metrics.get('kpi_yellow_count', 0),
                'kpi_red_count': metrics.get('kpi_red_count', 0),
                'avg_individual_score': metrics.get('avg_individual_score'),
                'avg_department_score': metrics.get('avg_department_score'),
                'data_submission_rate': metrics.get('data_submission_rate'),
                'review_completion_rate': metrics.get('review_completion_rate'),
                'last_active_at': metrics.get('last_active_at'),
                'total_logins_30d': metrics.get('total_logins_30d', 0),
                'is_stale': False
            }
        )
        return snapshot
    
    def mark_as_stale(self, client_id, tenant_id):
        self.filter(client_id=client_id, tenant_id=tenant_id).update(is_stale=True)