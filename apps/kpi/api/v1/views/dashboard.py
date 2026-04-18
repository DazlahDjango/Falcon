from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from ..serializers import (
    IndividualDashboardSerializer, ManagerDashboardSerializer, ExecutiveDashboardSerializer, ChampionDashboardSerializer
)
from ....services import IndividualDashboard, ManagerDashboard, ExecutiveDashboard, ChampionDashboard
from ..throttles import DashboardThrottle
from apps.accounts.api.v1.permissions import IsManagement, IsSuperAdmin, IsExecutive, IsDashboardChampion
from ..permissions import IsAuthenticatedAndActive, IsManager

class IndividualDashboardView(APIView):
    permission_classes = [IsAuthenticatedAndActive]
    throttle_classes = [DashboardThrottle]
    def get(self, request):
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        if not year or not month:
            now = timezone.now()
            year = year or now.year
            month = month or now.month
        else:
            year = int(year)
            month = int(month)
        dashboard_service = IndividualDashboard()
        dashboard_data = dashboard_service.get_dashboard(
            str(request.user.id),
            year, 
            month
        )
        serializer = IndividualDashboardSerializer(dashboard_data)
        return Response(serializer.data)

class ManagerDashboardView(APIView):
    permission_classes = [IsAuthenticatedAndActive, IsManager]
    throttle_classes = [DashboardThrottle]
    def get(self, request):
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        
        if not year or not month:
            now = timezone.now()
            year = year or now.year
            month = month or now.month
        else:
            year = int(year)
            month = int(month)
        dashboard_service = ManagerDashboard()
        dashboard_data = dashboard_service.get_dashboard(
            str(request.user.id),
            year,
            month
        )
        serializer = ManagerDashboardSerializer(dashboard_data)
        return Response(serializer.data)

class ExecutiveDashboardView(APIView):
    permission_classes = [IsAuthenticatedAndActive, IsExecutive]
    throttle_classes = [DashboardThrottle]
    def get(self, request):
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        if not year or not month:
            now = timezone.now()
            year = year or now.year
            month = month or now.month
        else:
            year = int(year)
            month = int(month)
        dashboard_service = ExecutiveDashboard()
        dashboard_data = dashboard_service.get_dashboard(
            str(request.user.id),
            year,
            month
        )
        serializer = ExecutiveDashboardSerializer(dashboard_data)
        return Response(serializer.data)

class ChampionDashboardView(APIView):
    permission_classes = [IsAuthenticatedAndActive, IsDashboardChampion]
    throttle_classes = [DashboardThrottle]
    def get(self, request):
        """Get champion dashboard data"""
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        if not year or not month:
            now = timezone.now()
            year = year or now.year
            month = month or now.month
        else:
            year = int(year)
            month = int(month)
        dashboard_service = ChampionDashboard()
        dashboard_data = dashboard_service.get_dashboard(
            str(request.user.id),
            year,
            month
        )
        serializer = ChampionDashboardSerializer(dashboard_data)
        return Response(serializer.data)