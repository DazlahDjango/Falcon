# apps/reportplt/services/export/excel_exporter.py - FIXED VERSION

import io
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.chart import BarChart, LineChart, PieChart, Reference
from openpyxl.chart.series import Series  # FIXED: Changed from DataSeries to Series
from openpyxl.chart.label import DataLabelList
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from apps.reportplt.exceptions import ReportExportError

class ExcelExporter:
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}
        self.wb = Workbook()
        self._setup_styles()

    def _setup_styles(self):
        self.header_font = Font(name='Arial', size=11, bold=True, color='FFFFFF')
        self.header_fill = PatternFill(start_color='1a1a2e', end_color='1a1a2e', fill_type='solid')
        self.header_alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
        self.cell_font = Font(name='Arial', size=10)
        self.cell_alignment = Alignment(horizontal='center', vertical='center')
        self.border = Border(
            left=Side(style='thin', color='CCCCCC'),
            right=Side(style='thin', color='CCCCCC'),
            top=Side(style='thin', color='CCCCCC'),
            bottom=Side(style='thin', color='CCCCCC')
        )

    def export(self, data: Dict[str, Any], report_name: str, output_path: Optional[str] = None) -> str:
        try:
            self.wb.remove(self.wb.active)
            self._create_summary_sheet(data, report_name)
            self._create_kpi_sheet(data)
            self._create_chart_sheet(data)
            self._create_data_sheet(data)
            buffer = io.BytesIO()
            self.wb.save(buffer)
            buffer.seek(0)
            if output_path:
                with default_storage.open(output_path, 'wb') as f:
                    f.write(buffer.getvalue())
                return output_path
            file_name = f"reports/{uuid.uuid4()}.xlsx"
            path = default_storage.save(file_name, ContentFile(buffer.getvalue()))
            return path
        except Exception as e:
            raise ReportExportError(f"Excel export failed: {str(e)}")

    def _create_summary_sheet(self, data: Dict, report_name: str):
        ws = self.wb.create_sheet("Summary")
        ws['A1'] = report_name
        ws['A1'].font = Font(name='Arial', size=16, bold=True)
        ws.merge_cells('A1:D1')
        ws['A3'] = "Generated:"
        ws['B3'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        ws['A4'] = "Status:"
        ws['B4'] = data.get('status', 'Completed')
        ws['A6'] = "Key Metrics"
        ws['A6'].font = Font(name='Arial', size=12, bold=True)
        metrics = data.get('metrics', {})
        row = 8
        for key, value in metrics.items():
            ws[f'A{row}'] = key
            ws[f'B{row}'] = value
            row += 1
        summary = data.get('executive_summary', '')
        if summary:
            ws['A10'] = "Executive Summary"
            ws['A10'].font = Font(name='Arial', size=12, bold=True)
            ws.merge_cells(f'A10:D10')
            ws[f'A12'] = summary
            ws.merge_cells(f'A12:D15')
            ws[f'A12'].alignment = Alignment(wrap_text=True)
        for col in ['A', 'B', 'C', 'D']:
            ws.column_dimensions[col].width = 20

    def _create_kpi_sheet(self, data: Dict):
        ws = self.wb.create_sheet("KPIs")
        headers = ['KPI', 'Target', 'Actual', 'Progress', 'Status']
        for col, header in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col, value=header)
            cell.font = self.header_font
            cell.fill = self.header_fill
            cell.alignment = self.header_alignment
            cell.border = self.border
        kpis = data.get('kpis', [])
        for row_idx, kpi in enumerate(kpis, 2):
            ws.cell(row=row_idx, column=1, value=kpi.get('name', '')).alignment = Alignment(horizontal='left')
            ws.cell(row=row_idx, column=2, value=kpi.get('target', 0))
            ws.cell(row=row_idx, column=3, value=kpi.get('actual', 0))
            ws.cell(row=row_idx, column=4, value=kpi.get('progress', 0))
            status_cell = ws.cell(row=row_idx, column=5, value=kpi.get('status', ''))
            status_colors = {'On Track': '92D050', 'At Risk': 'FFC000', 'Off Track': 'FF0000'}
            status_cell.fill = PatternFill(start_color=status_colors.get(kpi.get('status', ''), 'FFFFFF'), fill_type='solid')
        for col in range(1, 6):
            ws.column_dimensions[get_column_letter(col)].width = 20

    def _create_chart_sheet(self, data: Dict):
        ws = self.wb.create_sheet("Charts")
        charts = data.get('charts', [])
        if not charts:
            ws['A1'] = "No charts available"
            return
        chart_data = charts[0].get('data', {})
        labels = chart_data.get('labels', [])
        values = chart_data.get('values', [])
        if not labels or not values:
            ws['A1'] = "No chart data available"
            return
        ws.cell(row=1, column=1, value="Labels")
        ws.cell(row=1, column=2, value="Values")
        for idx, (label, value) in enumerate(zip(labels, values), 2):
            ws.cell(row=idx, column=1, value=label)
            ws.cell(row=idx, column=2, value=value)
        chart = BarChart()
        chart.title = charts[0].get('title', 'Performance Chart')
        chart.x_axis.title = "Categories"
        chart.y_axis.title = "Values"
        data_ref = Reference(ws, min_col=2, min_row=1, max_row=len(values)+1)
        labels_ref = Reference(ws, min_col=1, min_row=2, max_row=len(values)+1)
        chart.add_data(data_ref, titles_from_data=True)
        chart.set_categories(labels_ref)
        chart.height = 10
        chart.width = 15
        ws.add_chart(chart, "D1")

    def _create_data_sheet(self, data: Dict):
        ws = self.wb.create_sheet("Raw Data")
        tables = data.get('tables', [])
        if not tables:
            ws['A1'] = "No detailed data available"
            return
        table_data = tables[0]
        columns = table_data.get('columns', [])
        rows = table_data.get('rows', [])
        if not columns or not rows:
            ws['A1'] = "No detailed data available"
            return
        for col, header in enumerate(columns, 1):
            cell = ws.cell(row=1, column=col, value=header)
            cell.font = self.header_font
            cell.fill = self.header_fill
            cell.alignment = self.header_alignment
            cell.border = self.border
        for row_idx, row in enumerate(rows[:1000], 2):
            for col_idx, value in enumerate(row, 1):
                cell = ws.cell(row=row_idx, column=col_idx, value=value)
                cell.border = self.border
        for col in range(1, len(columns) + 1):
            ws.column_dimensions[get_column_letter(col)].width = 15

    def export_to_bytes(self, data: Dict[str, Any], report_name: str) -> bytes:
        self.export(data, report_name)
        buffer = io.BytesIO()
        self.wb.save(buffer)
        buffer.seek(0)
        return buffer.getvalue()