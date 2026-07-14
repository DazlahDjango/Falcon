# calculation.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db.models import Max
from celery.result import AsyncResult
from ....models import Score
from ..serializers import TriggerCalculationSerializer, CalculationStatusSerializer
from ....services import ScoreCalculator, CalculationScheduler
from ....tasks import calculate_period_scores_task
from ..throttles import CalculationThrottle, RecalculationThrottle
from apps.accounts.api.v1.permissions import IsDashboardChampion
from ..permissions import IsAuthenticatedAndActive


class TriggerCalculationView(APIView):
    permission_classes = [IsAuthenticatedAndActive, IsDashboardChampion]
    throttle_classes = [CalculationThrottle]

    def post(self, request):
        serializer = TriggerCalculationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        year = serializer.validated_data['year']
        month = serializer.validated_data['month']
        force = serializer.validated_data.get('force', False)
        
        tenant_id = getattr(request, 'current_tenant_id', None)
        if not tenant_id and hasattr(request.user, 'tenant_id'):
            tenant_id = str(request.user.tenant_id)
        
        # Try Celery, fallback to sync
        try:
            from ....tasks import calculate_period_scores_task
            task = calculate_period_scores_task.delay(
                tenant_id=tenant_id,
                year=year,
                month=month,
                force=force
            )
            return Response({
                'task_id': task.id,
                'status': 'PENDING',
                'message': f'Calculation scheduled for {year}-{month:02d}'
            }, status=status.HTTP_202_ACCEPTED)
        except (ImportError, Exception) as e:
            # Fallback to synchronous calculation
            from ....services import ScoreCalculator
            calculator = ScoreCalculator()
            result = calculator.calculate_period(tenant_id, year, month, force)
            return Response({
                'task_id': None,
                'status': 'COMPLETED',
                'message': f'Calculation completed for {year}-{month:02d}',
                'result': result
            }, status=status.HTTP_200_OK)

    def get(self, request):
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        
        if not year or not month:
            now = timezone.now()
            year = now.year
            month = now.month
        else:
            year = int(year)
            month = int(month)
        
        tenant_id = getattr(request, 'current_tenant_id', None)
        if not tenant_id and hasattr(request.user, 'tenant_id'):
            tenant_id = str(request.user.tenant_id)

        scores_exist = Score.objects.filter(
            tenant_id=tenant_id,
            year=year,
            month=month
        ).exists()
        
        last_calculation = Score.objects.filter(
            tenant_id=tenant_id,
            year=year,
            month=month
        ).aggregate(last=Max('calculated_at'))['last']
        
        return Response({
            'year': year,
            'month': month,
            'calculated': scores_exist,
            'last_calculation': last_calculation
        })


class CalculationStatusView(APIView):
    permission_classes = [IsAuthenticatedAndActive]

    def get(self, request, task_id):
        task = AsyncResult(task_id)
        
        if task.pending:
            status_text = 'PENDING'
        elif task.failed():
            status_text = 'FAILED'
        elif task.successful():
            status_text = 'SUCCESS'
        else:
            status_text = 'PROGRESS'
        
        result_data = {
            'task_id': task_id,
            'status': status_text,
            'result': task.result if task.successful() else None,
            'error': str(task.info) if task.failed() else None,
            'started_at': None,
            'completed_at': None
        }
        
        serializer = CalculationStatusSerializer(result_data)
        return Response(serializer.data)