from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Avg, Count, Q
from ..permissions import IsAuthenticatedAndActive, IsExecutive
from ....models import Score, TrafficLight, AggregatedScore

class AnalyticsInsightsView(APIView):
    permission_classes = [IsAuthenticatedAndActive, IsExecutive]
    def get(self, request):
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        from django.utils import timezone
        if not year or not month:
            now = timezone.now()
            year = year or now.year
            month = month or now.month
        else:
            year = int(year)
            month = int(month)
        current_scores = Score.objects.filter(
            tenant_id=request.tenant.id,
            year=year,
            month=month
        )
        from ....utils import get_previous_period
        prev_year, prev_month = get_previous_period(year, month)
        prev_scores = Score.objects.filter(
            tenant_id=request.tenant.id,
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
            tenant_id=request.tenant.id,
            year=year,
            month=month
        ).order_by('-aggregated_score')[:5]
        worst_departments = AggregatedScore.objects.filter(
            level='DEPARTMENT',
            tenant_id=request.tenant.id,
            year=year,
            month=month
        ).order_by('aggregated_score')[:5]
        red_alerts = TrafficLight.objects.filter(
            score__tenant_id=request.tenant.id,
            score__year=year,
            score__month=month,
            status='RED',
            consecutive_red_count__gte=2
        ).select_related('score__kpi', 'score__user')
        return Response({
            'period': f"{year}-{month:02d}",
            'overview': {
                'average_score': current_stats['avg_score'],
                'total_kpis': current_stats['total_kpis'],
                'distribution': {
                    'green': current_stats['green'],
                    'yellow': current_stats['yellow'],
                    'red': current_stats['red']
                },
                'green_percentage': (current_stats['green'] / current_stats['total_kpis'] * 100) if current_stats['total_kpis'] > 0 else 0,
                'red_percentage': (current_stats['red'] / current_stats['total_kpis'] * 100) if current_stats['total_kpis'] > 0 else 0
            },
            'trend': {
                'direction': trend,
                'previous_score': prev_stats['avg_score'],
                'current_score': current_stats['avg_score'],
                'change': (current_stats['avg_score'] - prev_stats['avg_score']) if current_stats['avg_score'] and prev_stats['avg_score'] else 0
            },
            'top_departments': [
                {'name': d.entity_name, 'score': d.aggregated_score}
                for d in department_scores
            ],
            'areas_for_improvement': [
                {'name': d.entity_name, 'score': d.aggregated_score}
                for d in worst_departments
            ],
            'red_alerts': [
                {
                    'kpi': alert.score.kpi.name,
                    'user': alert.score.user.email,
                    'consecutive_months': alert.consecutive_red_count,
                    'score': alert.score_value
                }
                for alert in red_alerts[:10]
            ]
        })

class RiskPredictionsView(APIView):
    permission_classes = [IsAuthenticatedAndActive, IsExecutive]
    def get(self, request):
        """Get risk predictions for KPIs"""
        from ....engine.traffic_light import RiskPredictor
        predictor = RiskPredictor()
        from django.utils import timezone
        now = timezone.now()
        scores = Score.objects.filter(
            tenant_id=request.tenant.id,
            year__gte=now.year - 1
        ).order_by('user', 'kpi', 'year', 'month')
        predictions = {}
        from collections import defaultdict
        user_kpi_scores = defaultdict(list)
        for score in scores:
            key = f"{score.user_id}:{score.kpi_id}"
            user_kpi_scores[key].append(score.score)
        for key, score_list in user_kpi_scores.items():
            if len(score_list) >= 3:  # Need at least 3 data points
                prediction = predictor.predict_risk(None, None, score_list)
                if prediction['risk_level'] == 'HIGH':
                    user_id, kpi_id = key.split(':')
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