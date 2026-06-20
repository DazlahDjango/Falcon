from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Avg, Count, Q, Min, Max
from .base import ReadOnlyKPIViewset
from ..serializers import ScoreSerializer, AggregatedScoreSerializer, TrafficLightSerializer
from ....models import Score, AggregatedScore, TrafficLight
from ..filters import ScoreListFilter, AggregatedScoreListFilter

class ScoreViewSet(ReadOnlyKPIViewset):
    queryset = Score.objects.all()
    serializer_class = ScoreSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ScoreListFilter
    search_fields = ['kpi__name', 'kpi__code', 'user__email']
    ordering_fields = ['score', 'year', 'month', 'calculated_at']
    ordering = ['-year', '-month', '-score']

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.select_related('kpi', 'user')

    @action(detail=False, methods=['get'])
    def my_scores(self, request):
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        scores = self.get_queryset().filter(user=request.user)
        if year:
            scores = scores.filter(year=year)
        if month:
            scores = scores.filter(month=month)
        serializer = self.get_serializer(scores, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def team_scores(self, request):
        manager_id = request.user.id
        direct_reports = request.user.get_direct_reports().values_list('id', flat=True)
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        scores = self.get_queryset().filter(user_id__in=direct_reports)
        if year:
            scores = scores.filter(year=year)
        if month:
            scores = scores.filter(month=month)
        serializer = self.get_serializer(scores, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        queryset = self.get_queryset()
        if year:
            queryset = queryset.filter(year=year)
        if month:
            queryset = queryset.filter(month=month)

        stats = queryset.aggregate(
            avg_score=Avg('score'),
            min_score=Min('score'),
            max_score=Max('score'),
            total_count=Count('id'),
            green_count=Count('id', filter=Q(score__gte=90)),
            yellow_count=Count('id', filter=Q(score__gte=50, score__lt=90)),
            red_count=Count('id', filter=Q(score__lt=50))
        )

        return Response({
            'avg_score': float(stats['avg_score']) if stats['avg_score'] else 0,
            'min_score': float(stats['min_score']) if stats['min_score'] else 0,
            'max_score': float(stats['max_score']) if stats['max_score'] else 0,
            'total_count': stats['total_count'],
            'green_count': stats['green_count'],
            'yellow_count': stats['yellow_count'],
            'red_count': stats['red_count']
        })


class AggregatedScoreViewSet(ReadOnlyKPIViewset):
    queryset = AggregatedScore.objects.all()
    serializer_class = AggregatedScoreSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = AggregatedScoreListFilter
    search_fields = ['entity_name']
    ordering_fields = ['aggregated_score', 'year', 'month']
    ordering = ['-year', '-month', '-aggregated_score']

    def get_queryset(self):
        queryset = super().get_queryset()
        tenant_id = getattr(self.request, 'current_tenant_id', None)
        if tenant_id:
            return queryset.filter(tenant_id=tenant_id)
        return queryset

    @action(detail=False, methods=['get'])
    def organization(self, request):
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        scores = self.get_queryset().filter(level='ORGANIZATION')
        if year:
            scores = scores.filter(year=year)
        if month:
            scores = scores.filter(month=month)
        serializer = self.get_serializer(scores, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def departments(self, request):
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        scores = self.get_queryset().filter(level='DEPARTMENT')
        if year:
            scores = scores.filter(year=year)
        if month:
            scores = scores.filter(month=month)
        serializer = self.get_serializer(scores, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def ranking(self, request):
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        scores = self.get_queryset().filter(level='DEPARTMENT')
        if year:
            scores = scores.filter(year=year)
        if month:
            scores = scores.filter(month=month)
        scores = scores.order_by('-aggregated_score')
        serializer = self.get_serializer(scores, many=True)
        return Response(serializer.data)


class TrafficLightViewSet(ReadOnlyKPIViewset):
    queryset = TrafficLight.objects.all()
    serializer_class = TrafficLightSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['score__kpi__name', 'score__user__email']
    ordering_fields = ['score_value', 'consecutive_red_count', 'calculated_at']
    ordering = ['-calculated_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.select_related('score__kpi', 'score__user')

    @action(detail=False, methods=['get'])
    def red_alerts(self, request):
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        red_alerts = self.get_queryset().filter(
            status='RED',
            consecutive_red_count__gte=2
        )
        if year:
            red_alerts = red_alerts.filter(score__year=year)
        if month:
            red_alerts = red_alerts.filter(score__month=month)
        serializer = self.get_serializer(red_alerts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_red_alerts(self, request):
        red_alerts = self.get_queryset().filter(
            status='RED',
            score__user=request.user,
            consecutive_red_count__gte=2
        )
        serializer = self.get_serializer(red_alerts, many=True)
        return Response(serializer.data)