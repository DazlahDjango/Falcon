import logging
from datetime import datetime
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.accounts.api.v1.permissions import IsSuperAdmin, IsClientAdmin
from apps.accounts.services.reports import ReportService

logger = logging.getLogger(__name__)

class ReportViewSet(viewsets.ViewSet):
    """
    Report ViewSet for generating and exporting various system reports.
    Accessible to Client Admins and Super Admins.
    """
    permission_classes = [IsAuthenticated, IsSuperAdmin | IsClientAdmin]

    def perform_content_negotiation(self, request, force=False):
        renderers = self.get_renderers()
        return (renderers[0], renderers[0].media_type)

    def _get_tenant_id(self, request):
        if request.user.is_superuser:
            return request.query_params.get('tenant_id')
        return str(request.user.tenant_id)

    def _get_format(self, request):
        return request.query_params.get('format', 'json').lower()

    def _response_or_export(self, filename: str, title: str, headers: list, data: list, format_type: str):
        if format_type in ['csv', 'xlsx', 'pdf']:
            service = ReportService()
            return service.export_report(filename, title, headers, data, format_type)
        return Response({
            'title': title,
            'headers': headers,
            'data': data
        }, status=status.HTTP_200_OK)

    # 1. User Reports

    @action(detail=False, methods=['get'], url_path='user-directory')
    def user_directory(self, request):
        tenant_id = self._get_tenant_id(request)
        format_type = self._get_format(request)
        service = ReportService()
        headers, data = service.get_user_directory_data(tenant_id)
        return self._response_or_export('user_directory', 'User Directory Report', headers, data, format_type)

    @action(detail=False, methods=['get'], url_path='role-distribution')
    def role_distribution(self, request):
        tenant_id = self._get_tenant_id(request)
        format_type = self._get_format(request)
        service = ReportService()
        headers, data = service.get_role_distribution_data(tenant_id)
        return self._response_or_export('role_distribution', 'User Role Distribution', headers, data, format_type)

    @action(detail=False, methods=['get'], url_path='department-distribution')
    def department_distribution(self, request):
        tenant_id = self._get_tenant_id(request)
        format_type = self._get_format(request)
        service = ReportService()
        headers, data = service.get_department_distribution_data(tenant_id)
        return self._response_or_export('department_distribution', 'User Department Distribution', headers, data, format_type)

    @action(detail=False, methods=['get'], url_path='inactive-users')
    def inactive_users(self, request):
        tenant_id = self._get_tenant_id(request)
        format_type = self._get_format(request)
        days = int(request.query_params.get('days', 30))
        service = ReportService()
        headers, data = service.get_inactive_users_data(tenant_id, days)
        return self._response_or_export('inactive_users', f'Inactive Users Report ({days} Days)', headers, data, format_type)

    @action(detail=False, methods=['get'], url_path='recently-added')
    def recently_added(self, request):
        tenant_id = self._get_tenant_id(request)
        format_type = self._get_format(request)
        
        start_date = None
        end_date = None
        try:
            start_str = request.query_params.get('start_date')
            end_str = request.query_params.get('end_date')
            if start_str:
                start_date = datetime.strptime(start_str, '%Y-%m-%d').date()
            if end_str:
                end_date = datetime.strptime(end_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD'}, status=status.HTTP_400_BAD_REQUEST)
            
        service = ReportService()
        headers, data = service.get_recently_added_data(tenant_id, start_date, end_date)
        return self._response_or_export('recently_added_users', 'Recently Added Users', headers, data, format_type)

    @action(detail=False, methods=['get'], url_path='activity-summary')
    def activity_summary(self, request):
        tenant_id = self._get_tenant_id(request)
        format_type = self._get_format(request)
        days = int(request.query_params.get('days', 30))
        service = ReportService()
        headers, data = service.get_activity_summary_data(tenant_id, days)
        return self._response_or_export('user_activity_summary', 'User Activity Summary', headers, data, format_type)

    # 2. Audit & Compliance Reports

    @action(detail=False, methods=['get'], url_path='audit-trail')
    def audit_trail(self, request):
        tenant_id = self._get_tenant_id(request)
        format_type = self._get_format(request)
        
        start_date = None
        end_date = None
        try:
            start_str = request.query_params.get('start_date')
            end_str = request.query_params.get('end_date')
            if start_str:
                start_date = datetime.strptime(start_str, '%Y-%m-%d').date()
            if end_str:
                end_date = datetime.strptime(end_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD'}, status=status.HTTP_400_BAD_REQUEST)
            
        service = ReportService()
        headers, data = service.get_audit_trail_data(tenant_id, start_date, end_date)
        return self._response_or_export('audit_trail', 'Audit Trail Report', headers, data, format_type)

    @action(detail=False, methods=['get'], url_path='login-activity')
    def login_activity(self, request):
        tenant_id = self._get_tenant_id(request)
        format_type = self._get_format(request)
        service = ReportService()
        headers, data = service.get_login_activity_data(tenant_id)
        return self._response_or_export('login_activity', 'Login Activity Report', headers, data, format_type)

    @action(detail=False, methods=['get'], url_path='password-changes')
    def password_changes(self, request):
        tenant_id = self._get_tenant_id(request)
        format_type = self._get_format(request)
        service = ReportService()
        headers, data = service.get_password_changes_data(tenant_id)
        return self._response_or_export('password_changes', 'Password Changes Report', headers, data, format_type)

    @action(detail=False, methods=['get'], url_path='role-changes')
    def role_changes(self, request):
        tenant_id = self._get_tenant_id(request)
        format_type = self._get_format(request)
        service = ReportService()
        headers, data = service.get_role_changes_data(tenant_id)
        return self._response_or_export('role_changes', 'Role Change History', headers, data, format_type)

    @action(detail=False, methods=['get'], url_path='suspension-log')
    def suspension_log(self, request):
        tenant_id = self._get_tenant_id(request)
        format_type = self._get_format(request)
        service = ReportService()
        headers, data = service.get_suspension_log_data(tenant_id)
        return self._response_or_export('suspension_log', 'Suspension and Activation Log', headers, data, format_type)

    @action(detail=False, methods=['get'], url_path='compliance-summary')
    def compliance_summary(self, request):
        tenant_id = self._get_tenant_id(request)
        format_type = self._get_format(request)
        service = ReportService()
        headers, data = service.get_compliance_summary_data(tenant_id)
        return self._response_or_export('compliance_summary', 'Compliance Summary Report', headers, data, format_type)
