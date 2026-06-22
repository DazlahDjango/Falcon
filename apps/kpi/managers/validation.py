from django.db.models import Q, Count
from django.utils import timezone
from .base import TenantAwareManager

class ValidationRecordManager(TenantAwareManager):
    def approved(self):
        return self.filter(status='APPROVED')

    def rejected(self):
        return self.filter(status='REJECTED')

    def escalated(self):
        return self.filter(status='ESCALATED')

    def by_validator(self, validator_id):
        return self.filter(validated_by_id=validator_id)

    def by_actual(self, actual_id):
        return self.filter(actual_id=actual_id)

    def pending_review(self, manager_id):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            manager = User.objects.get(id=manager_id)
            direct_reports = manager.get_direct_reports().values_list('id', flat=True)
        except User.DoesNotExist:
            direct_reports = []
        return self.filter(actual__user_id__in=direct_reports, status='PENDING')

    def get_rate(self, user_id, start_date=None, end_date=None):
        queryset = self.filter(validated_by_id=user_id)
        if start_date:
            queryset = queryset.filter(validated_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(validated_at__lte=end_date)
        total = queryset.count()
        approved = queryset.filter(status='APPROVED').count()
        return {
            'total': total,
            'approved': approved,
            'rejected': total - approved,
            'approval_rate': (approved / total * 100) if total > 0 else 0
        }


class EscalationManager(TenantAwareManager):
    def pending(self):
        return self.filter(status='PENDING')

    def reviewing(self):
        return self.filter(status='REVIEWING')

    def resolved(self):
        return self.filter(status='RESOLVED')

    def closed(self):
        return self.filter(status='CLOSED')

    def to_user(self, user_id):
        return self.filter(escalated_to_id=user_id)

    def from_user(self, user_id):
        return self.filter(escalated_by_id=user_id)

    def overdue(self, days=7):
        cutoff = timezone.now() - timezone.timedelta(days=days)
        return self.filter(status='PENDING', escalated_at__lte=cutoff)

    def get_summary(self, tenant_id):
        return self.filter(tenant_id=tenant_id).aggregate(
            total=Count('id'),
            pending=Count('id', filter=Q(status='PENDING')),
            reviewing=Count('id', filter=Q(status='REVIEWING')),
            resolved=Count('id', filter=Q(status='RESOLVED')),
            closed=Count('id', filter=Q(status='CLOSED')),
        )