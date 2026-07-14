from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from decimal import Decimal
from django.db.models import Q, Avg, Count, Sum
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .base import BaseKpiViewset
from ..serializers import (
    KPIListSerializer, KPIDetailSerializer, KPIWeightSerializer,
    StrategicLinkageSerializer, KPIDependencySerializer,
    AnnualTargetSerializer, ScoreSerializer
)
from ....models import KPI, KPIWeight, StrategicLinkage, KPIDependency
from ..filters import KPIListFilter, KPIWeightListFilter
from ....services import KPICreator, KPIUpdater, KPIActivator, KPIValidator
from ....exceptions import DuplicateKPICodeError


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

    def _clean_kpi_data(self, data, request):
        if hasattr(data, 'copy'):
            cleaned = data.copy()
        else:
            cleaned = dict(data)

        mappings = {
            'tenantId': 'tenant_id',
            'categoryId': 'category_id',
            'kpiType': 'kpi_type',
            'calculationLogic': 'calculation_logic',
            'measureType': 'measure_type',
            'decimalPlaces': 'decimal_places',
            'targetMin': 'target_min',
            'targetMax': 'target_max',
            'ownerId': 'owner_id',
            'departmentId': 'department_id',
            'strategicObjective': 'strategic_objective',
            'isActive': 'is_active',
        }
        for camel, snake in mappings.items():
            if camel in cleaned and snake not in cleaned:
                cleaned[snake] = cleaned[camel]

        if not cleaned.get('tenant_id'):
            if getattr(request, 'current_tenant_id', None):
                cleaned['tenant_id'] = request.current_tenant_id
            elif hasattr(request.user, 'tenant_id') and request.user.tenant_id:
                cleaned['tenant_id'] = request.user.tenant_id

        nullable_fields = [
            'category_id', 'target_min','target_max', 'owner_id', 'department_id', 'decimal_places',
        ]
        for field in nullable_fields:
            if field in cleaned and cleaned[field] == '':
                cleaned[field] = None

        if cleaned.get('decimal_places') is not None and cleaned['decimal_places'] != '':
            try:
                cleaned['decimal_places'] = int(cleaned['decimal_places'])
            except (ValueError, TypeError):
                pass

        for field in ['target_min', 'target_max']:
            if cleaned.get(field) is not None and cleaned[field] != '':
                try:
                    cleaned[field] = Decimal(str(cleaned[field]))
                except Exception:
                    pass

        return cleaned

    def create(self, request, *args, **kwargs):
        creator = KPICreator()
        try:
            cleaned_data = self._clean_kpi_data(request.data, request)
            kpi = creator.create(cleaned_data, request.user)
            serializer = KPIDetailSerializer(kpi)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except DuplicateKPICodeError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def update(self, request, *args, **kwargs):
        updater = KPIUpdater()
        kpi = self.get_object()
        try:
            cleaned_data = self._clean_kpi_data(request.data, request)
            updated_kpi = updater.update(str(kpi.id), cleaned_data, request.user)
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
        completeness_errors = validator.validate_kpi_completeness(kpi)
        weight_valid, weight_msg = validator.validate_weight_sum(str(kpi.id))
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
        weights_data = request.data.get('weights')

        try:
            if weights_data is not None:
                total = sum(Decimal(str(w)) for w in weights_data)
            else:
                if not user_id:
                    return Response(
                        {'valid': False, 'message': 'user_id is required if weights are not provided'},
                        status=400
                    )
                total = KPIWeight.objects.filter(
                    user_id=user_id,
                    is_active=True
                ).aggregate(total=Sum('weight'))['total'] or 0

            is_valid = abs(total - 100) <= 0.01
            return Response({
                'valid': is_valid,
                'total': float(total),
                'message': 'Weights sum is valid' if is_valid else f'Weights sum to {total}%, must be 100%'
            })
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