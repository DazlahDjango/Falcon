from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
import django.db.models as models
from ....models import Subscription, Transaction, Invoice
from ....services.billing.tax import TaxCalculator
from ....services.audit.logger import audit_logger
from ..serializers import (
    BillingSummarySerializer,
    RevenueReportSerializer,
    SubscriptionAnalyticsSerializer,
)
from ..permissions import CanViewBillingAnalytics
from ..throttles import TieredBillingThrottle
from ..filters import BillingAnalyticsFilter


class BillingAnalyticsViewSet(viewsets.GenericViewSet):
    """
    Billing Analytics ViewSet for reports and metrics.
    
    Actions:
    - summary: Get tenant billing summary
    - revenue: Get revenue report
    - subscriptions: Get subscription analytics
    - tax: Get tax report
    - forecast: Get revenue forecast
    """
    
    permission_classes = [IsAuthenticated, CanViewBillingAnalytics]
    throttle_classes = [TieredBillingThrottle]
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get billing summary for the tenant."""
        tenant_id = request.tenant_id
        
        from ....utils import get_tenant_billing_summary
        
        summary = get_tenant_billing_summary(tenant_id)
        
        # Add formatted displays
        summary['total_spent_display'] = f"{summary.get('billing_info', {}).get('currency', 'KES')} {summary.get('total_spent', 0) / 100:.2f}"
        
        return Response(summary)
    
    @action(detail=False, methods=['get'])
    def revenue(self, request):
        """Get revenue report for date range."""
        tenant_id = request.tenant_id
        
        # Get date range from query params
        days = int(request.query_params.get('days', 30))
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        period = request.query_params.get('period', 'daily')
        
        # Get transactions in date range
        transactions = Transaction.objects.for_tenant(tenant_id).filter(
            status='success',
            payment_date__date__gte=start_date,
            payment_date__date__lte=end_date
        )
        
        # Calculate totals
        total_revenue = transactions.aggregate(total=models.Sum('total_amount'))['total'] or 0
        total_count = transactions.count()
        
        # Build breakdown based on period
        if period == 'daily':
            breakdown = self._get_daily_breakdown(transactions, start_date, end_date)
        elif period == 'weekly':
            breakdown = self._get_weekly_breakdown(transactions, start_date, end_date)
        elif period == 'monthly':
            breakdown = self._get_monthly_breakdown(transactions, start_date, end_date)
        else:
            breakdown = []
        
        return Response({
            'period': period,
            'start_date': start_date,
            'end_date': end_date,
            'total_revenue': total_revenue,
            'total_revenue_display': f"KES {total_revenue / 100:.2f}",
            'total_transactions': total_count,
            'successful_transactions': transactions.count(),
            'failed_transactions': Transaction.objects.for_tenant(tenant_id).filter(
                status='failed',
                created_at__date__gte=start_date,
                created_at__date__lte=end_date
            ).count(),
            'success_rate': (transactions.count() / Transaction.objects.for_tenant(tenant_id).filter(
                created_at__date__gte=start_date,
                created_at__date__lte=end_date
            ).count() * 100) if transactions.count() > 0 else 0,
            'breakdown': breakdown,
            'currency': 'KES'
        })
    
    @action(detail=False, methods=['get'])
    def subscriptions(self, request):
        """Get subscription analytics."""
        tenant_id = request.tenant_id
        
        # Get all subscriptions for tenant
        subscriptions = Subscription.objects.for_tenant(tenant_id)
        
        # Active counts
        total_active = subscriptions.filter(status='active').count()
        total_trialing = subscriptions.filter(status='trialing').count()
        total_expired = subscriptions.filter(status='expired').count()
        total_cancelled = subscriptions.filter(status='cancelled').count()
        
        # Breakdown by plan
        from django.db.models import Count
        by_plan = subscriptions.values('plan__name', 'plan__plan_type').annotate(
            count=Count('id')
        )
        
        # MRR calculation
        from ....services.subscription.lifecycle import SubscriptionLifecycleService
        lifecycle = SubscriptionLifecycleService()
        
        monthly_mrr = lifecycle._get_monthly_recurring_revenue(tenant_id)
        yearly_mrr = lifecycle._get_yearly_recurring_revenue(tenant_id)
        total_mrr = monthly_mrr + (yearly_mrr / 12)
        
        # Recent activity (last 30 days)
        recent_activity = subscriptions.filter(
            created_at__gte=timezone.now() - timedelta(days=30)
        ).values('status', 'created_at')[:20]
        
        return Response({
            'total_active': total_active,
            'total_trialing': total_trialing,
            'total_expired': total_expired,
            'total_cancelled': total_cancelled,
            'by_plan': list(by_plan),
            'by_plan_type': {
                'trial': subscriptions.filter(plan__plan_type='trial').count(),
                'basic': subscriptions.filter(plan__plan_type='basic').count(),
                'professional': subscriptions.filter(plan__plan_type='professional').count(),
                'enterprise': subscriptions.filter(plan__plan_type='enterprise').count(),
            },
            'monthly_recurring_revenue': monthly_mrr,
            'monthly_recurring_revenue_display': f"KES {monthly_mrr / 100:.2f}",
            'yearly_recurring_revenue': yearly_mrr,
            'yearly_recurring_revenue_display': f"KES {yearly_mrr / 100:.2f}",
            'total_mrr': int(total_mrr),
            'total_mrr_display': f"KES {total_mrr / 100:.2f}",
            'recent_activity': list(recent_activity),
            'currency': 'KES'
        })
    
    @action(detail=False, methods=['get'])
    def tax(self, request):
        """Get tax report for the tenant."""
        tenant_id = request.tenant_id
        year = int(request.query_params.get('year', timezone.now().year))
        
        tax_calculator = TaxCalculator()
        tax_summary = tax_calculator.get_tax_summary(tenant_id, year)
        
        return Response(tax_summary)
    
    @action(detail=False, methods=['get'])
    def forecast(self, request):
        """Get revenue forecast."""
        tenant_id = request.tenant_id
        
        # Get active subscriptions for MRR projection
        subscriptions = Subscription.objects.for_tenant(tenant_id).active()
        
        monthly_mrr = sum(sub.amount for sub in subscriptions if sub.billing_interval == 'monthly')
        yearly_mrr = sum(sub.amount for sub in subscriptions if sub.billing_interval == 'yearly')
        total_mrr = monthly_mrr + (yearly_mrr / 12)
        
        # Forecast for next 3, 6, 12 months
        forecast_3_months = int(total_mrr * 3)
        forecast_6_months = int(total_mrr * 6)
        forecast_12_months = int(total_mrr * 12)
        
        return Response({
            'current_mrr': total_mrr,
            'current_mrr_display': f"KES {total_mrr / 100:.2f}",
            'forecast_3_months': forecast_3_months,
            'forecast_3_months_display': f"KES {forecast_3_months / 100:.2f}",
            'forecast_6_months': forecast_6_months,
            'forecast_6_months_display': f"KES {forecast_6_months / 100:.2f}",
            'forecast_12_months': forecast_12_months,
            'forecast_12_months_display': f"KES {forecast_12_months / 100:.2f}",
            'assumptions': {
                'no_churn_rate': 'Assumes no subscription changes',
                'mrr_calculation': f'Based on {subscriptions.count()} active subscriptions'
            }
        })
    
    def _get_daily_breakdown(self, transactions, start_date, end_date):
        """Get daily revenue breakdown."""
        from django.db.models import Sum, DateField
        from django.db.models.functions import TruncDate
        
        daily = transactions.annotate(
            date=TruncDate('payment_date')
        ).values('date').annotate(
            total=Sum('total_amount'),
            count=models.Count('id')
        ).order_by('date')
        
        return [
            {
                'date': item['date'],
                'total': item['total'],
                'total_display': f"KES {item['total'] / 100:.2f}",
                'count': item['count']
            }
            for item in daily
        ]
    
    def _get_weekly_breakdown(self, transactions, start_date, end_date):
        """Get weekly revenue breakdown."""
        weekly = {}
        
        for transaction in transactions:
            week_number = transaction.payment_date.isocalendar()[1]
            week_key = f"Week {week_number}"
            
            if week_key not in weekly:
                weekly[week_key] = {'total': 0, 'count': 0}
            
            weekly[week_key]['total'] += transaction.total_amount
            weekly[week_key]['count'] += 1
        
        return [
            {
                'week': week,
                'total': data['total'],
                'total_display': f"KES {data['total'] / 100:.2f}",
                'count': data['count']
            }
            for week, data in weekly.items()
        ]
    
    def _get_monthly_breakdown(self, transactions, start_date, end_date):
        """Get monthly revenue breakdown."""
        from django.db.models import Sum
        from django.db.models.functions import TruncMonth
        
        monthly = transactions.annotate(
            month=TruncMonth('payment_date')
        ).values('month').annotate(
            total=Sum('total_amount'),
            count=models.Count('id')
        ).order_by('month')
        
        return [
            {
                'month': item['month'].strftime('%B %Y'),
                'total': item['total'],
                'total_display': f"KES {item['total'] / 100:.2f}",
                'count': item['count']
            }
            for item in monthly
        ]
