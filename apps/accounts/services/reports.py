import csv
import io
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
from django.db.models import Count, Q
from django.utils import timezone
from django.http import HttpResponse
from apps.accounts.models import User, AuditLog, LoginAttempt

logger = logging.getLogger(__name__)

class ReportService:
    def __init__(self):
        pass

    # =========================================================================
    # Data Extractors
    # =========================================================================

    def get_user_directory_data(self, tenant_id: str = None) -> Tuple[List[str], List[List[Any]]]:
        headers = ['Name', 'Email', 'Role', 'Department', 'Manager', 'Status', 'Join Date', 'Last Login']
        qs = User.objects.filter(is_deleted=False).order_by('-created_at')
        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)
        
        data = []
        for u in qs:
            data.append([
                u.get_full_name() or u.username,
                u.email,
                u.role,
                u.department or '',
                u.manager.get_full_name() if u.manager else '',
                'Active' if u.is_active else 'Suspended',
                u.joined_at.strftime('%Y-%m-%d') if u.joined_at else '',
                u.last_login.strftime('%Y-%m-%d %H:%M') if u.last_login else ''
            ])
        return headers, data

    def get_role_distribution_data(self, tenant_id: str = None) -> Tuple[List[str], List[List[Any]]]:
        headers = ['Role Code', 'User Count', 'Percentage']
        qs = User.objects.filter(is_deleted=False)
        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)
            
        total = qs.count() or 1
        distribution = qs.values('role').annotate(count=Count('id')).order_by('-count')
        
        data = []
        for item in distribution:
            percentage = round((item['count'] / total) * 100, 2)
            data.append([
                item['role'],
                item['count'],
                f"{percentage}%"
            ])
        return headers, data

    def get_department_distribution_data(self, tenant_id: str = None) -> Tuple[List[str], List[List[Any]]]:
        headers = ['Department', 'User Count', 'Users']
        qs = User.objects.filter(is_deleted=False)
        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)
            
        distribution = qs.values('department').annotate(count=Count('id')).order_by('-count')
        
        data = []
        for item in distribution:
            dept = item['department'] or 'Unassigned'
            dept_users = qs.filter(department=item['department']).values_list('email', flat=True)
            data.append([
                dept,
                item['count'],
                ", ".join(dept_users)
            ])
        return headers, data

    def get_inactive_users_data(self, tenant_id: str = None, days: int = 30) -> Tuple[List[str], List[List[Any]]]:
        headers = ['Name', 'Email', 'Role', 'Department', 'Last Login', 'Days Inactive']
        cutoff = timezone.now() - timedelta(days=days)
        qs = User.objects.filter(is_active=True, is_deleted=False).filter(
            Q(last_login__lt=cutoff) | Q(last_login__isnull=True)
        ).order_by('last_login')
        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)
            
        data = []
        now = timezone.now()
        for u in qs:
            days_inactive = (now - u.last_login).days if u.last_login else days
            data.append([
                u.get_full_name() or u.username,
                u.email,
                u.role,
                u.department or '',
                u.last_login.strftime('%Y-%m-%d %H:%M') if u.last_login else 'Never',
                days_inactive
            ])
        return headers, data

    def get_recently_added_data(self, tenant_id: str = None, start_date: datetime = None, end_date: datetime = None) -> Tuple[List[str], List[List[Any]]]:
        headers = ['Name', 'Email', 'Role', 'Created Date', 'Created By']
        qs = User.objects.filter(is_deleted=False).order_by('-created_at')
        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)
        if start_date:
            qs = qs.filter(created_at__date__gte=start_date)
        if end_date:
            qs = qs.filter(created_at__date__lte=end_date)
            
        data = []
        for u in qs:
            data.append([
                u.get_full_name() or u.username,
                u.email,
                u.role,
                u.created_at.strftime('%Y-%m-%d %H:%M') if u.created_at else '',
                u.created_by.get_full_name() if getattr(u, 'created_by', None) else 'System'
            ])
        return headers, data

    def get_activity_summary_data(self, tenant_id: str = None, days: int = 30) -> Tuple[List[str], List[List[Any]]]:
        headers = ['Metric', 'Count']
        users = User.objects.filter(is_deleted=False)
        if tenant_id:
            users = users.filter(tenant_id=tenant_id)
            
        total_users = users.count()
        active_users = users.filter(is_active=True).count()
        suspended_users = users.filter(is_active=False).count()
        
        cutoff = timezone.now() - timedelta(days=days)
        new_users = users.filter(created_at__gte=cutoff).count()
        
        data = [
            ['Total Registered Users', total_users],
            ['Active Status Users', active_users],
            ['Suspended Users', suspended_users],
            [f'New Users Added (Last {days} Days)', new_users]
        ]
        return headers, data

    def get_audit_trail_data(self, tenant_id: str = None, start_date: datetime = None, end_date: datetime = None) -> Tuple[List[str], List[List[Any]]]:
        headers = ['Timestamp', 'Actor', 'Action Type', 'Action', 'Target Object', 'IP Address']
        qs = AuditLog.objects.all().order_by('-timestamp')
        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)
        if start_date:
            qs = qs.filter(timestamp__date__gte=start_date)
        if end_date:
            qs = qs.filter(timestamp__date__lte=end_date)
            
        data = []
        for l in qs[:500]:  # Limit output for exports
            data.append([
                l.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                l.user.email if l.user else 'System',
                l.action_type,
                l.action,
                l.object_repr or '',
                l.ip_address or ''
            ])
        return headers, data

    def get_login_activity_data(self, tenant_id: str = None) -> Tuple[List[str], List[List[Any]]]:
        headers = ['User/Identifier', 'Timestamp', 'IP Address', 'User Agent', 'Result', 'Failure Reason']
        qs = LoginAttempt.objects.all().order_by('-timestamp')
        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)
            
        data = []
        for l in qs[:500]:
            data.append([
                l.user.email if l.user else l.identifier,
                l.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                l.ip_address or '',
                l.user_agent[:50] if l.user_agent else '',
                l.result,
                l.failure_reason or ''
            ])
        return headers, data

    def get_password_changes_data(self, tenant_id: str = None) -> Tuple[List[str], List[List[Any]]]:
        headers = ['User', 'Timestamp', 'IP Address', 'Action']
        qs = AuditLog.objects.filter(action__in=['password.changed', 'password.reset_completed']).order_by('-timestamp')
        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)
            
        data = []
        for l in qs[:500]:
            data.append([
                l.user.email if l.user else 'Unknown',
                l.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                l.ip_address or '',
                l.action
            ])
        return headers, data

    def get_role_changes_data(self, tenant_id: str = None) -> Tuple[List[str], List[List[Any]]]:
        headers = ['User', 'Timestamp', 'Changed By', 'Action/Details']
        qs = AuditLog.objects.filter(action='user.role_changed').order_by('-timestamp')
        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)
            
        data = []
        for l in qs[:500]:
            data.append([
                l.object_repr or 'Unknown',
                l.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                l.user.email if l.user else 'System',
                l.action
            ])
        return headers, data

    def get_suspension_log_data(self, tenant_id: str = None) -> Tuple[List[str], List[List[Any]]]:
        headers = ['User', 'Action', 'Performed By', 'Timestamp', 'IP Address']
        qs = AuditLog.objects.filter(action__in=['user.activated', 'user.deactivated']).order_by('-timestamp')
        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)
            
        data = []
        for l in qs[:500]:
            data.append([
                l.object_repr or 'Unknown',
                'Activated' if l.action == 'user.activated' else 'Suspended',
                l.user.email if l.user else 'System',
                l.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                l.ip_address or ''
            ])
        return headers, data

    def get_compliance_summary_data(self, tenant_id: str = None) -> Tuple[List[str], List[List[Any]]]:
        headers = ['User', 'Email', 'MFA Enabled', 'Password Last Changed', 'Last Login', 'Status']
        qs = User.objects.filter(is_deleted=False).order_by('-created_at')
        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)
            
        data = []
        for u in qs:
            mfa_status = 'Enabled' if u.mfa_enabled else 'Disabled'
            pwd_age = u.password_last_changed.strftime('%Y-%m-%d') if u.password_last_changed else 'Never'
            last_login_val = u.last_login.strftime('%Y-%m-%d') if u.last_login else 'Never'
            status_val = 'Compliant' if u.mfa_enabled and u.is_active else 'Non-Compliant'
            data.append([
                u.get_full_name() or u.username,
                u.email,
                mfa_status,
                pwd_age,
                last_login_val,
                status_val
            ])
        return headers, data


    # =========================================================================
    # Report Format Exporter
    # =========================================================================

    def export_report(self, filename: str, title: str, headers: List[str], data: List[List[Any]], format_type: str = 'json') -> HttpResponse:
        if format_type == 'csv':
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="{filename}.csv"'
            writer = csv.writer(response)
            writer.writerow(headers)
            for row in data:
                writer.writerow(row)
            return response
            
        elif format_type == 'xlsx':
            output = io.BytesIO()
            import xlsxwriter
            workbook = xlsxwriter.Workbook(output)
            worksheet = workbook.add_worksheet()
            
            header_format = workbook.add_format({'bold': True, 'bg_color': '#2563EB', 'font_color': 'white'})
            for col_num, header in enumerate(headers):
                worksheet.write(0, col_num, header, header_format)
                
            for row_num, row in enumerate(data, start=1):
                for col_num, cell in enumerate(row):
                    worksheet.write(row_num, col_num, str(cell))
                    
            workbook.close()
            output.seek(0)
            
            response = HttpResponse(output.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = f'attachment; filename="{filename}.xlsx"'
            return response
            
        elif format_type == 'pdf':
            output = io.BytesIO()
            from reportlab.lib.pagesizes import letter
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib import colors
            
            doc = SimpleDocTemplate(output, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
            story = []
            
            styles = getSampleStyleSheet()
            title_style = ParagraphStyle(
                'ReportTitle',
                parent=styles['Heading1'],
                fontName='Helvetica-Bold',
                fontSize=18,
                textColor=colors.HexColor('#2563EB'),
                spaceAfter=20
            )
            story.append(Paragraph(title, title_style))
            story.append(Spacer(1, 10))
            
            table_data = [headers] + [[str(c) for c in r] for r in data]
            page_width = letter[0] - 72
            col_width = page_width / max(len(headers), 1)
            
            t = Table(table_data, colWidths=[col_width] * len(headers))
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2563EB')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
                ('TOPPADDING', (0, 0), (-1, 0), 8),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#F3F4F6'), colors.white]),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E7EB')),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 9),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ]))
            
            story.append(t)
            doc.build(story)
            output.seek(0)
            
            response = HttpResponse(output.read(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{filename}.pdf"'
            return response
            
        else: # default to json response format
            return HttpResponse(str({'title': title, 'headers': headers, 'data': data}), content_type='application/json')
