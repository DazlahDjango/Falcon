from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from ....models import Subscription, Transaction, Invoice
from ..permissions import IsAuthenticated, IsSuperAdmin, IsClientAdmin

class BillingAnalyticsViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['admin_revenue', 'admin_subscriptions']:
            self.permission_classes = [IsSuperAdmin]
        else:
            self.permission_classes = [IsClientAdmin]
        return super().get_permissions()
    
    @action(detail=False, methods=['get'], url_path='summary')
    def billing_summary(self, request):
        tenant_id = getattr(request, 'tenant_id', None) or (request.user.tenant_id if request.user.is_authenticated else None)
        if request.user.is_superuser or getattr(request.user, 'role', '') == 'super_admin':
            recent_transactions = Transaction.objects.all().order_by('-created_at')[:10]
            invoice_summary = Invoice.objects.aggregate(
                total_paid=Sum('total_amount', filter=Q(status='paid')),
                total_pending=Sum('total_amount', filter=Q(status='pending')),
                total_overdue=Sum('total_amount', filter=Q(status='overdue'))
            )
            total_revenue = Transaction.objects.filter(status='success').aggregate(total=Sum('total_amount'))['total'] or 0
            
            # Global platform stats
            active_subs = Subscription.objects.filter(status='active').count()
            arpu = total_revenue / active_subs if active_subs > 0 else 0
            ltv = arpu * 12  # Simple estimate: ARPU * 12 months
            
            data = {
                'tenant_id': tenant_id,
                'is_admin': True,
                'recent_transactions': list(recent_transactions.values('reference', 'amount', 'status', 'created_at')),
                'invoice_summary': invoice_summary,
                'total_revenue': total_revenue,
                'total_revenue_display': f"KES {total_revenue/100:.2f}",
                'arpu': arpu,
                'ltv': ltv
            }
        else:
            subscription = Subscription.objects.get_current_for_tenant(tenant_id)
            recent_transactions = Transaction.objects.filter(tenant_id=tenant_id).order_by('-created_at')[:10]
            invoice_summary = Invoice.objects.filter(tenant_id=tenant_id).aggregate(total_paid=Sum('total_amount', filter=Q(status='paid')), total_pending=Sum('total_amount', filter=Q(status='pending')), total_overdue=Sum('total_amount', filter=Q(status='overdue')))
            total_spent = Transaction.objects.filter(tenant_id=tenant_id, status='success').aggregate(total=Sum('total_amount'))['total'] or 0
            data = {'tenant_id': tenant_id, 'has_active_subscription': subscription is not None and subscription.is_active, 'current_plan': {'name': subscription.plan.name, 'plan_type': subscription.plan.plan_type} if subscription else None, 'subscription_status': subscription.status if subscription else None, 'trial_info': {'is_on_trial': subscription.is_on_trial, 'days_remaining': subscription.trial_days_remaining} if subscription and subscription.is_on_trial else None, 'billing_info': {'currency': 'KES', 'auto_renew': subscription.auto_renew if subscription else False}, 'recent_transactions': list(recent_transactions.values('reference', 'amount', 'status', 'created_at')), 'invoice_summary': invoice_summary, 'total_spent': total_spent, 'total_spent_display': f"KES {total_spent/100:.2f}"}
        return Response(data)
    
    @action(detail=False, methods=['get'], url_path='revenue')
    def revenue_report(self, request):
        period = request.query_params.get('period', 'month')
        now = timezone.now()
        if period == 'month':
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        elif period == 'quarter':
            quarter_month = ((now.month - 1) // 3) * 3 + 1
            start_date = now.replace(month=quarter_month, day=1, hour=0, minute=0, second=0, microsecond=0)
        elif period == 'year':
            start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            start_date = now - timedelta(days=30)
        
        # Check for tenant_id filtering
        tenant_id = getattr(request, 'tenant_id', None) or (request.user.tenant_id if request.user.is_authenticated else None)
        transactions = Transaction.objects.filter(status='success', payment_date__gte=start_date)
        
        if tenant_id and not (request.user.is_superuser or getattr(request.user, 'role', '') == 'super_admin'):
            transactions = transactions.filter(tenant_id=tenant_id)
            
        total_revenue = transactions.aggregate(total=Sum('total_amount'))['total'] or 0
        total_count = transactions.count()
        
        # Fixed the breakdown logic for different databases
        from django.db import connection
        from django.db.models.functions import TruncDay
        
        daily_breakdown = transactions.annotate(
            date=TruncDay('payment_date')
        ).values('date').annotate(
            total=Sum('total_amount'), 
            count=Count('id')
        ).order_by('-date')
            
        return Response({
            'period': period, 
            'start_date': start_date.date(), 
            'end_date': now.date(), 
            'total_revenue': total_revenue, 
            'total_revenue_display': f"KES {total_revenue/100:.2f}", 
            'total_transactions': total_count, 
            'successful_transactions': total_count, 
            'failed_transactions': 0, 
            'success_rate': 100.0, 
            'breakdown': list(daily_breakdown)
        })
    
    @action(detail=False, methods=['get'], url_path='subscriptions')
    def subscription_analytics(self, request):
        tenant_id = getattr(request, 'tenant_id', None) or (request.user.tenant_id if request.user.is_authenticated else None)
        if request.user.is_superuser or getattr(request.user, 'role', '') == 'super_admin':
            subscriptions = Subscription.objects.all()
        else:
            subscriptions = Subscription.objects.filter(tenant_id=tenant_id)
            
        active = subscriptions.filter(status='active').count()
        trialing = subscriptions.filter(status='trialing').count()
        expired = subscriptions.filter(status='expired').count()
        cancelled = subscriptions.filter(status='cancelled').count()
        by_plan = subscriptions.values('plan__name').annotate(count=Count('id'))
        by_plan_type = subscriptions.filter(status='active').values('plan__plan_type').annotate(count=Count('id'))
        mrr = subscriptions.filter(status='active').aggregate(total=Sum('amount'))['total'] or 0
        return Response({
            'total_active': active,
            'total_trialing': trialing,
            'total_expired': expired,
            'total_cancelled': cancelled,
            'by_plan': list(by_plan),
            'by_plan_type': list(by_plan_type),
            'monthly_recurring_revenue': mrr,
            'monthly_recurring_revenue_display': f"KES {mrr/100:.2f}",
            'yearly_recurring_revenue': 0,
            'yearly_recurring_revenue_display': "KES 0.00",
            'total_mrr': mrr,
            'total_mrr_display': f"KES {mrr/100:.2f}",
            'recent_activity': []
        })
    
    @action(detail=False, methods=['get'], url_path='admin/revenue')
    def admin_revenue(self, request):
        from django.db.models.functions import TruncMonth
        year = request.query_params.get('year', timezone.now().year)
        monthly = Transaction.objects.filter(status='success', payment_date__year=year).annotate(month=TruncMonth('payment_date')).values('month').annotate(revenue=Sum('total_amount'), count=Count('id')).order_by('month')
        total = Transaction.objects.filter(status='success', payment_date__year=year).aggregate(total=Sum('total_amount'))['total'] or 0        
        return Response({'year': year, 'total_revenue': total, 'total_revenue_display': f"KES {total/100:.2f}", 'monthly_breakdown': list(monthly)})
    
    @action(detail=False, methods=['get'], url_path='admin/subscriptions')
    def admin_subscriptions(self, request):
        total_active = Subscription.objects.filter(status='active').count()
        total_trialing = Subscription.objects.filter(status='trialing').count()
        by_plan_type = Subscription.objects.filter(status='active').values('plan__plan_type').annotate(count=Count('id'))
        total_mrr = Subscription.objects.filter(status='active').aggregate(total=Sum('amount'))['total'] or 0
        return Response({'total_active': total_active, 'total_trialing': total_trialing, 'total_expired': Subscription.objects.filter(status='expired').count(), 'total_cancelled': Subscription.objects.filter(status='cancelled').count(), 'by_plan': [], 'by_plan_type': list(by_plan_type), 'monthly_recurring_revenue': total_mrr, 'monthly_recurring_revenue_display': f"KES {total_mrr/100:.2f}", 'yearly_recurring_revenue': 0, 'yearly_recurring_revenue_display': "KES 0.00", 'total_mrr': total_mrr, 'total_mrr_display': f"KES {total_mrr/100:.2f}", 'recent_activity': []})