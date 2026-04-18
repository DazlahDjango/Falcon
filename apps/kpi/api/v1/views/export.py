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
        """Export KPIs as CSV"""
        format_type = request.query_params.get('format', 'csv')
        from ....services import KPIImportExport
        import_export = KPIImportExport()
        framework_id = request.query_params.get('framework_id')
        if framework_id:
            csv_content = import_export.export_to_csv(framework_id)
        else:
            # Export all KPIs
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
        if not year or not month:
            from django.utils import timezone
            now = timezone.now()
            year = year or now.year
            month = month or now.month
        else:
            year = int(year)
            month = int(month)
        from ....models import Score
        scores = Score.objects.filter(
            tenant_id=request.tenant.id,
            year=year,
            month=month
        ).select_related('kpi', 'user')
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['KPI', 'User', 'Score', 'Actual', 'Target', 'Status'])
        for score in scores:
            traffic_light = getattr(score, 'traffic_light', None)
            status = traffic_light.status if traffic_light else 'UNKNOWN'
            writer.writerow([
                score.kpi.name,
                score.user.email,
                f"{score.score}%",
                score.actual_value,
                score.target_value,
                status
            ])
        response = HttpResponse(output.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="scores_{year}_{month:02d}.csv"'
        return response

class ReportExportView(APIView):
    permission_classes = [IsAuthenticatedAndActive, IsManager]
    throttle_classes = [ExportThrottle]
    def get(self, request):
        report_type = request.query_params.get('type', 'pdf')
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        from ....services import ReportGenerator
        generator = ReportGenerator()
        if report_type == 'pdf':
            pdf_content = generator.generate_pdf_report(
                request.tenant.id,
                year=int(year) if year else None,
                month=int(month) if month else None
            )
            response = HttpResponse(pdf_content, content_type='application/pdf')
            response['Content-Disposition'] = 'attachment; filename="performance_report.pdf"'
            return response
        elif report_type == 'excel':
            excel_content = generator.generate_excel_report(
                request.tenant.id,
                year=int(year) if year else None,
                month=int(month) if month else None
            )
            response = HttpResponse(excel_content, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = 'attachment; filename="performance_report.xlsx"'
            return response
        
        return Response({'error': 'Unsupported format'}, status=status.HTTP_400_BAD_REQUEST)