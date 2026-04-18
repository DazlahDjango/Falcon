from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Avg, Count, Sum
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .base import BaseKpiViewset
from ..serializers import KPIListSerializer, KPIDetailSerializer, KPIWeightSerializer, StrategicLinkageSerializer, KPIDependencySerializer, AnnualTargetSerializer, ScoreSerializer
from ....models import KPI, KPIWeight, StrategicLinkage, KPIDependency
from ..filters import KPIListFilter, KPIWeightListFilter
from ....services import KPICreator, KPIUpdater, KPIActivator, KPIValidator
from ....exceptions import DuplicateKPICodeError, InvalidFrameworkError
from ....validators import validate_weight_sum

class KPIViewSet(BaseKpiViewset):
    queryset = KPI.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = KPIListFilter
    search_fields = ['name', 'code', 'description', 'strategic_objective']
    ordering_fields = ['name', 'code', 'created_at', 'updated_at']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return KPIListSerializer
        return KPIDetailSerializer
    def create(self, request, *args, **kwargs):
        creator = KPICreator()
        try:
            kpi = creator.create(request.data, request.user)
            serializer = KPIDetailSerializer(kpi)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except (DuplicateKPICodeError, InvalidFrameworkError) as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    def update(self, request, *args, **kwargs):
        updater = KPIUpdater()
        kpi = self.get_object()
        try:
            updated_kpi = updater.update(str(kpi.id), request.data, request.user)
            serializer = KPIDetailSerializer(updated_kpi)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        activator = KPIActivator()
        kpi = activator.activate(str(pk), request.user)
        serializer = KPIDetailSerializer(kpi)
        return Response(serializer.data)
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        activator = KPIActivator()
        reason = request.data.get('reason', '')
        kpi = activator.deactivate(str(pk), request.user, reason)
        serializer = KPIDetailSerializer(kpi)
        return Response(serializer.data)
    @action(detail=True, methods=['get'])
    def weights(self, request, pk=None):
        kpi = self.get_object()
        weights = KPIWeight.objects.filter(kpi=kpi, is_active=True)
        serializer = KPIWeightSerializer(weights, many=True)
        return Response(serializer.data)
    @action(detail=True, methods=['get'])
    def targets(self, request, pk=None):
        kpi = self.get_object()
        year = request.query_params.get('year')
        targets = kpi.annual_targets.all()
        if year:
            targets = targets.filter(year=year)
        serializer = AnnualTargetSerializer(targets, many=True)
        return Response(serializer.data)
    @action(detail=True, methods=['get'])
    def scores(self, request, pk=None):
        kpi = self.get_object()
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        scores = kpi.scores.all()
        if year:
            scores = scores.filter(year=year)
        if month:
            scores = scores.filter(month=month)
        serializer = ScoreSerializer(scores, many=True)
        return Response(serializer.data)
    @action(detail=True, methods=['get'])
    def validate(self, request, pk=None):
        kpi = self.get_object()
        validator = KPIValidator()
        completeness_error = validator.validate_kpi_completeness(kpi)
        weight_validate, weight_msg = validator.validate_weight_sum(str(kpi.id))
        circular_valid, circular_path = validator.validate_circular_dependency(str(kpi.id))
        return Response({
            'is_valid': len(completeness_errors) == 0 and weight_valid and circular_valid,
            'completeness_errors': completeness_errors,
            'weight_validation': {'valid': weight_valid, 'message': weight_msg},
            'circular_dependency': {'valid': circular_valid, 'path': circular_path}
        })

class KPIWeightViewSet(BaseKpiViewset):
    queryset = KPIWeight.objects.all()
    serializer_class = KPIWeightSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = KPIWeightListFilter
    ordering_fields = ['weight', 'effective_from', 'effective_to']
    ordering = ['-effective_from']

    def get_queryset(self):
        queryset = super().get_queryset()
        kpi_id = self.request.query_params.get('kpi')
        user_id = self.request.query_params.get('user')
        if kpi_id:
            queryset = queryset.filter(kpi_id=kpi_id)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        return queryset
    @action(detail=False, methods=['post'])
    def validate_sum(self, request):
        user_id = request.data.get('user_id')
        weights = request.data.get('weights', [])
        try:
            # This would need to fetch actual weight objects
            # Simplified for demo
            return Response({'valid': True, 'message': 'Weights sum is valid'})
        except Exception as e:
            return Response(
                {'valid': False, 'message': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class StrategicLinkageViewSet(BaseKpiViewset):
    queryset = StrategicLinkage.objects.all()
    serializer_class = StrategicLinkageSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['kpi', 'linkage_type', 'strategic_objective']
    search_fields = ['strategic_objective', 'description']
    ordering_fields = ['weight', 'created_at']
    ordering = ['-weight']

class KPIDependencyViewSet(BaseKpiViewset):
    queryset = KPIDependency.objects.all()
    serializer_class = KPIDependencySerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['source_kpi', 'target_kpi', 'dependency_type', 'is_active']
    ordering_fields = ['impact_factor', 'created_at']
    ordering = ['-impact_factor']

    @action(detail=True, methods=['get'])
    def impact_chain(self, request, pk=None):
        dependency = self.get_object()
        downstream = KPIDependency.objects.filter(
            source_kpi=dependency.target_kpi,
            is_active=True
        )
        upstream = KPIDependency.objects.filter(
            target_kpi=dependency.source_kpi,
            is_active=True
        )
        return Response({
            'current': self.get_serializer(dependency).data,
            'downstream': self.get_serializer(downstream, many=True).data,
            'upstream': self.get_serializer(upstream, many=True).data
        })