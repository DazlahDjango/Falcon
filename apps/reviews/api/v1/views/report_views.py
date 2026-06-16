from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db import models
from apps.reviews.models import ReviewCycle, FinalRating, PIP
from apps.reviews.services.reporting.review_summary_service import ReviewSummaryService
from apps.reviews.services.reporting.pip_report_service import PIPReportService
from apps.reviews.services.reporting.calibration_report_service import CalibrationReportService
from apps.reviews.api.v1.serializers import RatingDistributionSerializer
from .base_views import BaseActionViewSet
from apps.accounts.constants import UserRoles

class ReportViewSet(BaseActionViewSet):
    def get_permissions(self):
        # Only allow supervisors, executives, client admins, and super admins
        # But let BaseActionViewSet handle base permissions first
        return super().get_permissions()
    
    def get_params(self, request):
        if request.method == 'GET':
            return request.query_params
        return request.data
        
    @action(detail=False, methods=['get', 'post'], url_path='employee-summary')
    def employee_summary(self, request):
        from apps.accounts.models import User
        params = self.get_params(request)
        employee_id = params.get('employee_id')
        cycle_id = params.get('cycle_id')
        if not employee_id or not cycle_id:
            return Response({'error': 'employee_id and cycle_id required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            employee = User.objects.get(id=employee_id)
            cycle = ReviewCycle.objects.get(id=cycle_id)
            if request.user.role not in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN] and request.user != employee.manager:
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            summary = ReviewSummaryService.get_employee_summary(employee, cycle)
            return Response(summary)
        except (User.DoesNotExist, ReviewCycle.DoesNotExist) as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
            
    @action(detail=False, methods=['get', 'post'], url_path='team-summary')
    def team_summary(self, request):
        from apps.accounts.models import User
        params = self.get_params(request)
        manager_id = params.get('manager_id')
        cycle_id = params.get('cycle_id')
        if not manager_id or not cycle_id:
            return Response({'error': 'manager_id and cycle_id required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            manager = User.objects.get(id=manager_id)
            cycle = ReviewCycle.objects.get(id=cycle_id)
            if request.user.role not in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN] and request.user != manager:
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            summary = ReviewSummaryService.get_team_summary(manager, cycle)
            return Response(summary)
        except (User.DoesNotExist, ReviewCycle.DoesNotExist) as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
            
    @action(detail=False, methods=['get', 'post'], url_path='cycle-stats')
    def cycle_stats(self, request):
        params = self.get_params(request)
        cycle_id = params.get('cycle_id')
        if not cycle_id:
            # If no cycle_id, return stats for latest completed cycle or empty if none
            cycle = ReviewCycle.objects.filter(tenant_id=request.user.tenant_id, status='completed').order_by('-end_date').first()
            if not cycle:
                return Response({'total_employees': 0, 'total_ratings': 0})
        else:
            try:
                cycle = ReviewCycle.objects.get(id=cycle_id)
            except ReviewCycle.DoesNotExist:
                return Response({'error': 'Cycle not found'}, status=status.HTTP_404_NOT_FOUND)
        
        ratings = FinalRating.objects.filter(review_cycle=cycle, final_score__isnull=False)
        scores = [float(r.final_score) for r in ratings if r.final_score]
        return Response({
            'cycle_id': str(cycle.id), 
            'cycle_name': cycle.name, 
            'total_employees': cycle.get_participating_employees().count() if hasattr(cycle, 'get_participating_employees') else 0, 
            'total_ratings': len(scores), 
            'average_score': round(sum(scores) / len(scores), 2) if scores else None, 
            'min_score': min(scores) if scores else None, 
            'max_score': max(scores) if scores else None, 
            'promotions': ratings.filter(promotion_recommended=True).count(), 
            'pips': ratings.filter(pip_recommended=True).count()
        })
        
    @action(detail=False, methods=['get', 'post'], url_path='pip-summary')
    def pip_summary(self, request):
        from apps.tenant.models import Client
        try:
            tenant = Client.objects.get(id=request.user.tenant_id)
            report = PIPReportService.get_organization_pip_summary(tenant)
            return Response(report)
        except Client.DoesNotExist:
            return Response({'error': 'Tenant not found'}, status=status.HTTP_404_NOT_FOUND)
        
    @action(detail=False, methods=['get', 'post'], url_path='calibration-summary')
    def calibration_summary(self, request):
        params = self.get_params(request)
        cycle_id = params.get('cycle_id')
        if not cycle_id:
            cycle = ReviewCycle.objects.filter(tenant_id=request.user.tenant_id, status='completed').order_by('-end_date').first()
            if not cycle:
                return Response({'total_sessions': 0})
        else:
            try:
                cycle = ReviewCycle.objects.get(id=cycle_id)
            except ReviewCycle.DoesNotExist:
                return Response({'error': 'Cycle not found'}, status=status.HTTP_404_NOT_FOUND)
                
        report = CalibrationReportService.get_cycle_calibration_summary(cycle)
        return Response(report)
        
    @action(detail=False, methods=['get', 'post'], url_path='rating-distribution')
    def rating_distribution(self, request):
        params = self.get_params(request)
        cycle_id = params.get('cycle_id')
        if not cycle_id:
            cycle = ReviewCycle.objects.filter(tenant_id=request.user.tenant_id, status='completed').order_by('-end_date').first()
            if not cycle:
                return Response({'total_ratings': 0, 'distribution': []})
        else:
            try:
                cycle = ReviewCycle.objects.get(id=cycle_id)
            except ReviewCycle.DoesNotExist:
                return Response({'error': 'Cycle not found'}, status=status.HTTP_404_NOT_FOUND)
        
        ratings = FinalRating.objects.filter(review_cycle=cycle, final_rating_label__isnull=False)
        dist = {}
        for r in ratings:
            label = r.final_rating_label
            if label not in dist:
                dist[label] = {'count': 0, 'percentage': 0, 'color': r.final_rating_color}
            dist[label]['count'] += 1
        total = len(ratings)
        for label in dist:
            dist[label]['percentage'] = round((dist[label]['count'] / total) * 100, 1) if total > 0 else 0
        dist_list = [{'rating_label': k, 'count': v['count'], 'percentage': v['percentage'], 'color': v['color']} for k, v in dist.items()]
        return Response({'cycle_id': str(cycle.id), 'cycle_name': cycle.name, 'total_ratings': total, 'distribution': RatingDistributionSerializer(dist_list, many=True).data})
        
    @action(detail=False, methods=['get', 'post'], url_path='export')
    def export(self, request):
        params = self.get_params(request)
        report_type = params.get('report_type', 'ratings')
        cycle_id = params.get('cycle_id')
        if not cycle_id:
            cycle = ReviewCycle.objects.filter(tenant_id=request.user.tenant_id, status='completed').order_by('-end_date').first()
            if not cycle:
                return Response({'error': 'No completed cycles found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            try:
                cycle = ReviewCycle.objects.get(id=cycle_id)
            except ReviewCycle.DoesNotExist:
                return Response({'error': 'Cycle not found'}, status=status.HTTP_404_NOT_FOUND)
                
        if report_type == 'ratings':
            ratings = FinalRating.objects.filter(review_cycle=cycle)
            data = [{'Employee': r.employee.get_full_name(), 'Email': r.employee.email, 'Final Score': float(r.final_score) if r.final_score else None, 'Rating': r.final_rating_label, 'Promotion': 'Yes' if r.promotion_recommended else 'No', 'PIP': 'Yes' if r.pip_recommended else 'No'} for r in ratings]
        elif report_type == 'pips':
            pips = PIP.objects.filter(review_cycle=cycle)
            data = [{'Employee': p.employee.get_full_name(), 'Title': p.title, 'Severity': p.get_severity_display(), 'Status': p.get_status_display(), 'Start Date': p.start_date, 'End Date': p.end_date, 'Outcome': p.get_outcome_display() if p.outcome else 'In Progress'} for p in pips]
        else:
            return Response({'error': f'Unknown report_type: {report_type}'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'cycle_name': cycle.name, 'report_type': report_type, 'total': len(data), 'data': data})