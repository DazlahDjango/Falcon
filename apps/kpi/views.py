from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def kpi_overview(request):
    """Stub for KPI overview data"""
    return Response({
        'total': 0,
        'on_track': 0,
        'at_risk': 0,
        'off_track': 0,
        'results': []
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def performance_trend(request):
    """Stub for KPI performance trend data"""
    return Response([])
