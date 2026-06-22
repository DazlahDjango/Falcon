from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Avg, Count, Q
from django.utils import timezone
from ..permissions import IsAuthenticatedAndActive, IsExecutive
from ....models import Score, TrafficLight, AggregatedScore

class AnalyticsInsightsView(APIView):
    permission_classes = [IsAuthenticatedAndActive, IsExecutive]
    def get(self, request):
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        if not year or not month:
            now = timezone.now()
            year = int(year) if year else now.year
            month = int(month) if month else now.month
        else:
            year = int(year)
            month = int(month)

        # FIX: Use current_tenant_id instead of request.tenant.id
        tenant_id = getattr(request, 'current_tenant_id', None)
        if not tenant_id and hasattr(request.user, 'tenant_id'):
            tenant_id = str(request.user.tenant_id)

        current_scores = Score.objects.filter(
            tenant_id=tenant_id,
            year=year,
            month=month
        )

        # Get previous period
        prev_year = year
        prev_month = month - 1
        if prev_month < 1:
            prev_month = 12
            prev_year = year - 1

        prev_scores = Score.objects.filter(
            tenant_id=tenant_id,
            year=prev_year,
            month=prev_month
        )

        current_stats = current_scores.aggregate(
            avg_score=Avg('score'),
            total_kpis=Count('id'),
            green=Count('id', filter=Q(score__gte=90)),
            yellow=Count('id', filter=Q(score__gte=50, score__lt=90)),
            red=Count('id', filter=Q(score__lt=50))
        )

        prev_stats = prev_scores.aggregate(
            avg_score=Avg('score'),
            total_kpis=Count('id')
        )

        trend = 'stable'
        if current_stats['avg_score'] and prev_stats['avg_score']:
            if current_stats['avg_score'] > prev_stats['avg_score'] + 2:
                trend = 'improving'
            elif current_stats['avg_score'] < prev_stats['avg_score'] - 2:
                trend = 'declining'

        department_scores = AggregatedScore.objects.filter(
            level='DEPARTMENT',
            tenant_id=tenant_id,
            year=year,
            month=month
        ).order_by('-aggregated_score')[:5]

        worst_departments = AggregatedScore.objects.filter(
            level='DEPARTMENT',
            tenant_id=tenant_id,
            year=year,
            month=month
        ).order_by('aggregated_score')[:5]

        red_alerts = TrafficLight.objects.filter(
            score__tenant_id=tenant_id,
            score__year=year,
            score__month=month,
            status='RED',
            consecutive_red_count__gte=2
        ).select_related('score__kpi', 'score__user')

        total_kpis = current_stats['total_kpis'] or 1
        green_pct = (current_stats['green'] / total_kpis * 100) if total_kpis > 0 else 0
        red_pct = (current_stats['red'] / total_kpis * 100) if total_kpis > 0 else 0
        change = 0
        if current_stats['avg_score'] and prev_stats['avg_score']:
            change = current_stats['avg_score'] - prev_stats['avg_score']

        return Response({
            'period': f"{year}-{month:02d}",
            'overview': {
                'average_score': float(current_stats['avg_score']) if current_stats['avg_score'] else 0,
                'total_kpis': current_stats['total_kpis'],
                'distribution': {
                    'green': current_stats['green'],
                    'yellow': current_stats['yellow'],
                    'red': current_stats['red']
                },
                'green_percentage': round(green_pct, 2),
                'red_percentage': round(red_pct, 2)
            },
            'trend': {
                'direction': trend,
                'previous_score': float(prev_stats['avg_score']) if prev_stats['avg_score'] else 0,
                'current_score': float(current_stats['avg_score']) if current_stats['avg_score'] else 0,
                'change': round(float(change), 2)
            },
            'top_departments': [
                {'name': d.entity_name, 'score': float(d.aggregated_score)}
                for d in department_scores
            ],
            'areas_for_improvement': [
                {'name': d.entity_name, 'score': float(d.aggregated_score)}
                for d in worst_departments
            ],
            'red_alerts': [
                {
                    'kpi': alert.score.kpi.name,
                    'user': alert.score.user.email,
                    'consecutive_months': alert.consecutive_red_count,
                    'score': float(alert.score_value)
                }
                for alert in red_alerts[:10]
            ]
        })


class RiskPredictionsView(APIView):
    permission_classes = [IsAuthenticatedAndActive, IsExecutive]

    def get(self, request):
        from ....engine.traffic_light import RiskPredictor
        predictor = RiskPredictor()
        now = timezone.now()

        # FIX: Use current_tenant_id instead of request.tenant.id
        tenant_id = getattr(request, 'current_tenant_id', None)
        if not tenant_id and hasattr(request.user, 'tenant_id'):
            tenant_id = str(request.user.tenant_id)

        scores = Score.objects.filter(
            tenant_id=tenant_id,
            year__gte=now.year - 1
        ).order_by('user', 'kpi', 'year', 'month')

        predictions = {}
        from collections import defaultdict
        user_kpi_scores = defaultdict(list)

        for score in scores:
            key = f"{score.user_id}:{score.kpi_id}"
            user_kpi_scores[key].append(float(score.score))

        for key, score_list in user_kpi_scores.items():
            if len(score_list) >= 3:
                prediction = predictor.predict_risk(None, None, score_list)
                if prediction.get('risk_level') == 'HIGH':
                    predictions[key] = prediction

        return Response({
            'high_risk_count': len(predictions),
            'predictions': predictions,
            'recommendations': [
                'Schedule immediate performance review for high-risk KPIs',
                'Provide additional resources for underperforming areas',
                'Consider adjusting targets for consistently underperforming KPIs'
            ]
        })