from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
import django.db.models as models
from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncDate, TruncMonth

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
    """
    
    permission_classes = [IsAuthenticated, CanViewBillingAnalytics]
    throttle_classes = [TieredBillingThrottle]
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get billing summary for the tenant."""
        tenant_id = request.tenant_id
        
        try:
            # Get current subscription
            current_sub = Subscription.objects.filter(
                tenant_id=tenant_id,
                status__in=['active', 'trialing']
            ).order_by('-created_at').first()
            
            # Get invoice summary
            invoices = Invoice.objects.filter(tenant_id=tenant_id)
            total_paid = invoices.filter(status='paid').aggregate(total=Sum('total_amount'))['total'] or 0
            total_outstanding = invoices.filter(status__in=['pending', 'overdue']).aggregate(total=Sum('total_amount'))['total'] or 0
            
            # Get recent transactions
            recent_transactions = Transaction.objects.filter(
                tenant_id=tenant_id
            ).order_by('-created_at')[:5]
            
            summary = {
                'tenant_id': str(tenant_id),
                'has_active_subscription': current_sub is not None,
                'current_plan': {
                    'name': current_sub.plan.name,
                    'plan_type': current_sub.plan.plan_type,
                    'amount': current_sub.amount,
                } if current_sub else None,
                'subscription_status': current_sub.status if current_sub else None,
                'trial_info': {
                    'is_on_trial': current_sub and current_sub.status == 'trialing',
                    'days_remaining': current_sub.trial_days_remaining if current_sub else 0,
                } if current_sub else None,
                'billing_info': {
                    'auto_renew': current_sub.auto_renew if current_sub else False,
                    'next_billing_date': current_sub.current_period_end if current_sub else None,
                } if current_sub else None,
                'recent_transactions': [
                    {
                        'reference': t.reference,
                        'amount': t.amount,
                        'status': t.status,
                        'created_at': t.created_at,
                    }
                    for t in recent_transactions
                ],
                'invoice_summary': {
                    'total_paid': total_paid,
                    'total_outstanding': total_outstanding,
                    'total_invoices': invoices.count(),
                },
                'total_spent': total_paid,
                'total_spent_display': f"KES {total_paid / 100:.2f}",
            }
            
            return Response(summary)
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e), 'traceback': traceback.format_exc()},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def revenue(self, request):
        """Get revenue report for date range."""
        tenant_id = request.tenant_id
        
        try:
            # Get date range from query params
            days = int(request.query_params.get('days', 30))
            end_date = timezone.now().date()
            start_date = end_date - timedelta(days=days)
            
            period = request.query_params.get('period', 'daily')
            
            # Get transactions in date range - FIXED: Use filter instead of for_tenant
            transactions = Transaction.objects.filter(
                tenant_id=tenant_id,
                status='success',
                payment_date__date__gte=start_date,
                payment_date__date__lte=end_date
            )
            
            # Calculate totals
            total_revenue = transactions.aggregate(total=Sum('total_amount'))['total'] or 0
            total_count = transactions.count()
            
            # Get failed transactions count
            failed_count = Transaction.objects.filter(
                tenant_id=tenant_id,
                status='failed',
                created_at__date__gte=start_date,
                created_at__date__lte=end_date
            ).count()
            
            total_all = Transaction.objects.filter(
                tenant_id=tenant_id,
                created_at__date__gte=start_date,
                created_at__date__lte=end_date
            ).count()
            
            success_rate = (total_count / total_all * 100) if total_all > 0 else 0
            
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
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'total_revenue': total_revenue,
                'total_revenue_display': f"KES {total_revenue / 100:.2f}",
                'total_transactions': total_count,
                'successful_transactions': total_count,
                'failed_transactions': failed_count,
                'success_rate': round(success_rate, 2),
                'breakdown': breakdown,
                'currency': 'KES'
            })
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e), 'traceback': traceback.format_exc()},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def subscriptions(self, request):
        """Get subscription analytics."""
        tenant_id = request.tenant_id
        
        try:
            # Get all subscriptions for tenant
            subscriptions = Subscription.objects.filter(tenant_id=tenant_id)
            
            # Active counts
            total_active = subscriptions.filter(status='active').count()
            total_trialing = subscriptions.filter(status='trialing').count()
            total_expired = subscriptions.filter(status='expired').count()
            total_cancelled = subscriptions.filter(status='cancelled').count()
            
            # Breakdown by plan
            by_plan = list(subscriptions.values('plan__name', 'plan__plan_type').annotate(
                count=Count('id')
            ))
            
            # Calculate MRR
            active_subs = subscriptions.filter(status='active')
            monthly_mrr = sum(
                sub.amount for sub in active_subs if sub.billing_interval == 'monthly'
            )
            yearly_mrr = sum(
                sub.amount for sub in active_subs if sub.billing_interval == 'yearly'
            )
            total_mrr = monthly_mrr + (yearly_mrr / 12)
            
            # Recent activity (last 30 days)
            recent_activity = list(subscriptions.filter(
                created_at__gte=timezone.now() - timedelta(days=30)
            ).values('status', 'created_at')[:20])
            
            return Response({
                'total_active': total_active,
                'total_trialing': total_trialing,
                'total_expired': total_expired,
                'total_cancelled': total_cancelled,
                'by_plan': by_plan,
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
                'recent_activity': recent_activity,
                'currency': 'KES'
            })
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e), 'traceback': traceback.format_exc()},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def tax(self, request):
        """Get tax report for the tenant."""
        tenant_id = request.tenant_id
        
        try:
            year = int(request.query_params.get('year', timezone.now().year))
            
            # Get successful transactions for the year
            transactions = Transaction.objects.filter(
                tenant_id=tenant_id,
                status='success',
                payment_date__year=year
            )
            
            total_tax = transactions.aggregate(total=Sum('tax_amount'))['total'] or 0
            
            # Monthly breakdown
            monthly_breakdown = []
            for month in range(1, 13):
                month_transactions = transactions.filter(payment_date__month=month)
                month_tax = month_transactions.aggregate(total=Sum('tax_amount'))['total'] or 0
                month_taxable = month_transactions.aggregate(total=Sum('amount'))['total'] or 0
                
                monthly_breakdown.append({
                    'month': month,
                    'taxable_amount': month_taxable,
                    'tax': month_tax,
                })
            
            return Response({
                'tenant_id': str(tenant_id),
                'year': year,
                'total_tax_collected': total_tax,
                'monthly_breakdown': monthly_breakdown,
                'currency': 'KES',
                'tax_rate': 16,
            })
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e), 'traceback': traceback.format_exc()},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def forecast(self, request):
        """Get revenue forecast."""
        tenant_id = request.tenant_id
        
        try:
            # Get active subscriptions for MRR projection
            subscriptions = Subscription.objects.filter(
                tenant_id=tenant_id,
                status='active'
            )
            
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
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e), 'traceback': traceback.format_exc()},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _get_daily_breakdown(self, transactions, start_date, end_date):
        """Get daily revenue breakdown."""
        try:
            daily = {}
            
            for transaction in transactions:
                if transaction.payment_date:
                    date_key = transaction.payment_date.date().isoformat()
                    if date_key not in daily:
                        daily[date_key] = {'total': 0, 'count': 0}
                    daily[date_key]['total'] += transaction.total_amount
                    daily[date_key]['count'] += 1
            
            return [
                {
                    'date': date,
                    'total': data['total'],
                    'total_display': f"KES {data['total'] / 100:.2f}",
                    'count': data['count']
                }
                for date, data in sorted(daily.items())
            ]
        except Exception as e:
            return []
    
    def _get_weekly_breakdown(self, transactions, start_date, end_date):
        """Get weekly revenue breakdown."""
        try:
            weekly = {}
            
            for transaction in transactions:
                if transaction.payment_date:
                    year, week, _ = transaction.payment_date.isocalendar()
                    week_key = f"{year}-W{week:02d}"
                    
                    if week_key not in weekly:
                        weekly[week_key] = {'total': 0, 'count': 0, 'week': week, 'year': year}
                    weekly[week_key]['total'] += transaction.total_amount
                    weekly[week_key]['count'] += 1
            
            return [
                {
                    'week': f"Week {data['week']}, {data['year']}",
                    'total': data['total'],
                    'total_display': f"KES {data['total'] / 100:.2f}",
                    'count': data['count']
                }
                for week_key, data in sorted(weekly.items())
            ]
        except Exception as e:
            return []
    
    def _get_monthly_breakdown(self, transactions, start_date, end_date):
        """Get monthly revenue breakdown."""
        try:
            monthly = {}
            
            for transaction in transactions:
                if transaction.payment_date:
                    month_key = transaction.payment_date.strftime('%Y-%m')
                    month_name = transaction.payment_date.strftime('%B %Y')
                    
                    if month_key not in monthly:
                        monthly[month_key] = {'total': 0, 'count': 0, 'name': month_name}
                    monthly[month_key]['total'] += transaction.total_amount
                    monthly[month_key]['count'] += 1
            
            return [
                {
                    'month': data['name'],
                    'total': data['total'],
                    'total_display': f"KES {data['total'] / 100:.2f}",
                    'count': data['count']
                }
                for month_key, data in sorted(monthly.items())
            ]
        except Exception as e:
            return []