from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
import csv
import io
from ..permissions import IsAuthenticatedAndActive, IsManager
from ..throttles import ExportThrottle


class KPIExportView(APIView):
    permission_classes = [IsAuthenticatedAndActive, IsManager]
    throttle_classes = [ExportThrottle]

    def get(self, request):
        format_type = request.query_params.get('format', 'csv')
        from ....services import KPIImportExport
        import_export = KPIImportExport()
        framework_id = request.query_params.get('framework_id')
        
        if framework_id:
            csv_content = import_export.export_to_csv(framework_id, str(request.tenant.id))
        else:
            from ....models import KPI
            kpis = KPI.objects.filter(tenant_id=request.tenant.id)
            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerow(['Code', 'Name', 'Type', 'Unit', 'Is Active'])
            for kpi in kpis:
                writer.writerow([kpi.code, kpi.name, kpi.kpi_type, kpi.unit, kpi.is_active])
            csv_content = output.getvalue()
        
        response = HttpResponse(csv_content, content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="kpis_export.csv"'
        return response


class ScoreExportView(APIView):
    permission_classes = [IsAuthenticatedAndActive, IsManager]
    throttle_classes = [ExportThrottle]

    def get(self, request):
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        
        from django.utils import timezone
        now = timezone.now()
        y = int(year) if year else now.year
        m = int(month) if month else now.month
        
        from ....models import Score
        scores = Score.objects.filter(
            tenant_id=request.tenant.id,
            year=y,
            month=m
        ).select_related('kpi', 'user')
        
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['KPI', 'User', 'Score', 'Actual', 'Target', 'Status'])
        
        for score in scores:
            traffic_light = score.traffic_lights.first() if hasattr(score, 'traffic_lights') else None
            status_value = traffic_light.status if traffic_light else 'UNKNOWN'
            writer.writerow([
                score.kpi.name,
                score.user.email,
                f"{score.score}%",
                score.actual_value,
                score.target_value,
                status_value
            ])
        
        response = HttpResponse(output.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="scores_{y}_{m:02d}.csv"'
        return response


class ReportExportView(APIView):
    permission_classes = [IsAuthenticatedAndActive, IsManager]
    throttle_classes = [ExportThrottle]

    def get(self, request):
        from ....services import ReportGenerator
        from ....services.report_catalog import PHASE_D_REPORT_REGISTRY

        report_type = request.query_params.get('type', 'pdf')
        report_name = request.query_params.get('report', 'performance')
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        
        y = int(year) if year else None
        m = int(month) if month else None
        tenant_id = str(request.tenant.id)
        user_tenant_id = str(request.user.tenant_id)
        
        generator = ReportGenerator()

        if report_type == 'pdf':
            pdf_content = generator.generate_pdf_report(tenant_id, user_tenant_id, year=y, month=m)
            response = HttpResponse(pdf_content, content_type='application/pdf')
            response['Content-Disposition'] = 'attachment; filename="performance_report.pdf"'
            return response
        
        if report_type in ('excel', 'xlsx'):
            excel_content = generator.generate_excel_report(tenant_id, user_tenant_id, year=y, month=m)
            response = HttpResponse(
                excel_content,
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            )
            response['Content-Disposition'] = 'attachment; filename="performance_report.xlsx"'
            return response
        
        if report_type == 'csv':
            if report_name not in PHASE_D_REPORT_REGISTRY:
                return Response(
                    {'error': f'Unknown report: {report_name}'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            if report_name == 'kpi_summaries':
                from ....services.analytics import get_kpi_summaries
                data = get_kpi_summaries(tenant_id, y or timezone.now().year, m or timezone.now().month)
                output = io.StringIO()
                writer = csv.writer(output)
                if data:
                    writer.writerow(data[0].keys())
                    for row in data:
                        writer.writerow(row.values())
                csv_content = output.getvalue()
            else:
                csv_content = generator.generate_csv_report(tenant_id, user_tenant_id, report_name, year=y, month=m)
            
            filename = f'{report_name}_{y or "all"}_{m or "all"}.csv'
            response = HttpResponse(csv_content, content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response

        return Response(
            {
                'error': 'Unsupported format',
                'supported_formats': ['pdf', 'excel', 'csv'],
                'supported_reports': list(PHASE_D_REPORT_REGISTRY.keys()),
            },
            status=status.HTTP_400_BAD_REQUEST,
        )