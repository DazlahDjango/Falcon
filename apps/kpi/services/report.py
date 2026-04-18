import io
from datetime import datetime
from django.db.models import Q, Avg, Count, Sum, F
from django.utils import timezone
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from ..models import KPI, Score, MonthlyActual, AnnualTarget, KPISummary, DepartmentRollup, OrganizationHealth

class ReportGenerator:
    def generate_pdf_report(self, tenant_id, year=None, month=None):
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()
        story = []
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=16,
            spaceAfter=30,
        )
        title = Paragraph("KPI Performance Report", title_style)
        story.append(title)

        # Date range
        if year and month:
            date_str = f"{datetime(year, month, 1).strftime('%B %Y')}"
        else:
            now = timezone.now()
            date_str = f"{now.strftime('%B %Y')}"

        date_para = Paragraph(f"Report Period: {date_str}", styles['Normal'])
        story.append(date_para)
        story.append(Spacer(1, 20))

        # Executive Summary
        self._add_executive_summary(story, styles, tenant_id, year, month)

        # KPI Performance Table
        self._add_kpi_performance_table(story, styles, tenant_id, year, month)

        # Department Summary
        self._add_department_summary(story, styles, tenant_id, year, month)

        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()

    def generate_excel_report(self, tenant_id, year=None, month=None):
        """Generate an Excel performance report"""
        buffer = io.BytesIO()
        wb = Workbook()
        ws = wb.active
        ws.title = "KPI Performance Report"

        # Title
        ws['A1'] = "KPI Performance Report"
        ws['A1'].font = Font(size=16, bold=True)

        if year and month:
            date_str = f"{datetime(year, month, 1).strftime('%B %Y')}"
        else:
            now = timezone.now()
            date_str = f"{now.strftime('%B %Y')}"

        ws['A2'] = f"Report Period: {date_str}"

        # Executive Summary
        self._add_excel_executive_summary(ws, tenant_id, year, month)

        # KPI Details
        self._add_excel_kpi_details(ws, tenant_id, year, month)

        wb.save(buffer)
        buffer.seek(0)
        return buffer.getvalue()

    def _add_executive_summary(self, story, styles, tenant_id, year, month):
        """Add executive summary section to PDF"""
        heading = Paragraph("Executive Summary", styles['Heading2'])
        story.append(heading)

        # Get organization health data
        health = OrganizationHealth.objects.filter(
            tenant_id=tenant_id,
            year=year or timezone.now().year,
            month=month or timezone.now().month
        ).first()

        if health:
            summary_text = f"""
            Overall Health Score: {health.overall_health_score}%<br/>
            KPI Completion Rate: {health.kpi_completion_rate}%<br/>
            Validation Compliance: {health.validation_compliance_rate}%
            """
            summary = Paragraph(summary_text, styles['Normal'])
            story.append(summary)
        else:
            summary = Paragraph("No health data available for the selected period.", styles['Normal'])
            story.append(summary)

        story.append(Spacer(1, 20))

    def _add_kpi_performance_table(self, story, styles, tenant_id, year, month):
        """Add KPI performance table to PDF"""
        heading = Paragraph("KPI Performance Details", styles['Heading2'])
        story.append(heading)

        # Get KPI summary data
        summaries = KPISummary.objects.filter(
            tenant_id=tenant_id,
            year=year or timezone.now().year,
            month=month or timezone.now().month
        ).select_related('kpi')

        if summaries:
            data = [['KPI Name', 'Average Score', 'Green', 'Yellow', 'Red', 'Total Users']]
            for summary in summaries:
                data.append([
                    summary.kpi.name,
                    f"{summary.average_score}%",
                    summary.green_count,
                    summary.yellow_count,
                    summary.red_count,
                    summary.total_users
                ])

            table = Table(data)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 14),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            story.append(table)
        else:
            no_data = Paragraph("No KPI performance data available for the selected period.", styles['Normal'])
            story.append(no_data)

        story.append(Spacer(1, 20))

    def _add_department_summary(self, story, styles, tenant_id, year, month):
        """Add department summary to PDF"""
        heading = Paragraph("Department Performance Summary", styles['Heading2'])
        story.append(heading)

        # Get department rollup data
        rollups = DepartmentRollup.objects.filter(
            tenant_id=tenant_id,
            year=year or timezone.now().year,
            month=month or timezone.now().month
        )

        if rollups:
            data = [['Department', 'Overall Score', 'Green %', 'Yellow %', 'Red %', 'Employees']]
            for rollup in rollups:
                data.append([
                    rollup.department_name,
                    f"{rollup.overall_score}%",
                    f"{rollup.green_percentage}%",
                    f"{rollup.yellow_percentage}%",
                    f"{rollup.red_percentage}%",
                    rollup.employee_count
                ])

            table = Table(data)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 14),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            story.append(table)
        else:
            no_data = Paragraph("No department performance data available for the selected period.", styles['Normal'])
            story.append(no_data)

    def _add_excel_executive_summary(self, ws, tenant_id, year, month):
        """Add executive summary to Excel"""
        ws['A4'] = "Executive Summary"
        ws['A4'].font = Font(size=14, bold=True)

        health = OrganizationHealth.objects.filter(
            tenant_id=tenant_id,
            year=year or timezone.now().year,
            month=month or timezone.now().month
        ).first()

        if health:
            ws['A5'] = f"Overall Health Score: {health.overall_health_score}%"
            ws['A6'] = f"KPI Completion Rate: {health.kpi_completion_rate}%"
            ws['A7'] = f"Validation Compliance: {health.validation_compliance_rate}%"
        else:
            ws['A5'] = "No health data available"

    def _add_excel_kpi_details(self, ws, tenant_id, year, month):
        """Add KPI details to Excel"""
        ws['A9'] = "KPI Performance Details"
        ws['A9'].font = Font(size=14, bold=True)

        # Headers
        headers = ['KPI Name', 'Average Score', 'Green', 'Yellow', 'Red', 'Total Users']
        for col, header in enumerate(headers, 1):
            cell = ws.cell(row=10, column=col, value=header)
            cell.font = Font(bold=True)
            cell.fill = PatternFill(start_color="CCCCCC", end_color="CCCCCC", fill_type="solid")

        # Data
        summaries = KPISummary.objects.filter(
            tenant_id=tenant_id,
            year=year or timezone.now().year,
            month=month or timezone.now().month
        ).select_related('kpi')

        for row, summary in enumerate(summaries, 11):
            ws.cell(row=row, column=1, value=summary.kpi.name)
            ws.cell(row=row, column=2, value=f"{summary.average_score}%")
            ws.cell(row=row, column=3, value=summary.green_count)
            ws.cell(row=row, column=4, value=summary.yellow_count)
            ws.cell(row=row, column=5, value=summary.red_count)
            ws.cell(row=row, column=6, value=summary.total_users)