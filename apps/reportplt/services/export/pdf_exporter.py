# apps/reportplt/services/export/pdf_exporter.py
import os
import io
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime
from django.utils import timezone
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, A3, letter, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image, KeepTogether
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.charts.linecharts import HorizontalLineChart
from reportlab.graphics.charts.piecharts import Pie
from reportlab.graphics.charts.legends import Legend
from reportlab.lib.fonts import addMapping
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')
from io import BytesIO
import base64
from apps.reportplt.exceptions import ReportExportError
from apps.reportplt.constants import DEFAULT_REPORT_CONFIG

class PDFExporter:
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or DEFAULT_REPORT_CONFIG
        self.styles = getSampleStyleSheet()
        self._register_custom_styles()
        self.page_size = self._get_page_size()

    def _register_custom_styles(self):
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=18,
            textColor=colors.HexColor('#1a1a2e'),
            spaceAfter=20,
            alignment=TA_CENTER
        ))
        self.styles.add(ParagraphStyle(
            name='CustomHeading',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#16213e'),
            spaceAfter=12,
            spaceBefore=12
        ))
        self.styles.add(ParagraphStyle(
            name='CustomBody',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#333333'),
            spaceAfter=6
        ))
        self.styles.add(ParagraphStyle(
            name='CustomFooter',
            parent=self.styles['Normal'],
            fontSize=8,
            textColor=colors.HexColor('#666666'),
            alignment=TA_CENTER
        ))
        self.styles.add(ParagraphStyle(
            name='CustomHeader',
            parent=self.styles['Normal'],
            fontSize=8,
            textColor=colors.HexColor('#666666'),
            alignment=TA_CENTER
        ))

    def _get_page_size(self):
        orientation = self.config.get('orientation', 'portrait')
        page_size = self.config.get('page_size', 'A4')
        sizes = {
            'A4': A4,
            'A3': A3,
            'letter': letter
        }
        size = sizes.get(page_size, A4)
        if orientation == 'landscape':
            return landscape(size)
        return size

    def export(self, data: Dict[str, Any], report_name: str, output_path: Optional[str] = None) -> str:
        try:
            buffer = io.BytesIO()
            doc = SimpleDocTemplate(
                buffer,
                pagesize=self.page_size,
                leftMargin=self.config.get('margins', {}).get('left', 20),
                rightMargin=self.config.get('margins', {}).get('right', 20),
                topMargin=self.config.get('margins', {}).get('top', 25),
                bottomMargin=self.config.get('margins', {}).get('bottom', 25)
            )
            story = []
            if self.config.get('show_timestamp', True):
                self._add_header(story, report_name)
            self._add_title(story, report_name)
            self._add_executive_summary(story, data)
            self._add_kpi_section(story, data)
            self._add_charts_section(story, data)
            self._add_tables_section(story, data)
            self._add_footer(story)
            doc.build(story, onFirstPage=self._add_page_number, onLaterPages=self._add_page_number)
            buffer.seek(0)
            if output_path:
                with default_storage.open(output_path, 'wb') as f:
                    f.write(buffer.getvalue())
                return output_path
            file_name = f"reports/{uuid.uuid4()}.pdf"
            path = default_storage.save(file_name, ContentFile(buffer.getvalue()))
            return path
        except Exception as e:
            raise ReportExportError(f"PDF export failed: {str(e)}")

    def _add_header(self, story: List, report_name: str):
        header_text = f"Generated: {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}"
        story.append(Paragraph(header_text, self.styles['CustomHeader']))
        story.append(Spacer(1, 0.2 * inch))

    def _add_title(self, story: List, report_name: str):
        title = f"<b>{report_name}</b>"
        story.append(Paragraph(title, self.styles['CustomTitle']))
        story.append(Spacer(1, 0.1 * inch))
        story.append(Paragraph("Performance Management Report", self.styles['CustomBody']))
        story.append(Spacer(1, 0.2 * inch))

    def _add_executive_summary(self, story: List, data: Dict):
        summary = data.get('executive_summary')
        if not summary:
            return
        story.append(Paragraph("Executive Summary", self.styles['CustomHeading']))
        story.append(Spacer(1, 0.1 * inch))
        summary_text = summary if isinstance(summary, str) else str(summary)
        story.append(Paragraph(summary_text, self.styles['CustomBody']))
        story.append(Spacer(1, 0.2 * inch))

    def _add_kpi_section(self, story: List, data: Dict):
        kpis = data.get('kpis', [])
        if not kpis:
            return
        story.append(Paragraph("Key Performance Indicators", self.styles['CustomHeading']))
        story.append(Spacer(1, 0.1 * inch))
        table_data = [['KPI', 'Target', 'Actual', 'Progress', 'Status']]
        for kpi in kpis[:20]:
            status = kpi.get('status', '')
            status_color = self._get_status_color(status)
            status_display = f'<font color="{status_color}">● {status}</font>' if status else ''
            table_data.append([
                Paragraph(kpi.get('name', ''), self.styles['CustomBody']),
                Paragraph(str(kpi.get('target', '')), self.styles['CustomBody']),
                Paragraph(str(kpi.get('actual', '')), self.styles['CustomBody']),
                Paragraph(f"{kpi.get('progress', 0)}%", self.styles['CustomBody']),
                Paragraph(status_display, self.styles['CustomBody'])
            ])
        table = Table(table_data, colWidths=[2.5*inch, 1*inch, 1*inch, 1*inch, 1.2*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a1a2e')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f8f9fa')),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#dee2e6'))
        ]))
        story.append(table)
        story.append(Spacer(1, 0.2 * inch))

    def _add_charts_section(self, story: List, data: Dict):
        charts = data.get('charts', [])
        if not charts:
            return
        story.append(Paragraph("Charts & Visualizations", self.styles['CustomHeading']))
        story.append(Spacer(1, 0.1 * inch))
        for chart in charts[:3]:
            chart_type = chart.get('type', 'bar')
            chart_data = chart.get('data', {})
            chart_title = chart.get('title', '')
            if chart_title:
                story.append(Paragraph(chart_title, self.styles['CustomHeading']))
            if chart_type == 'bar':
                img = self._create_bar_chart(chart_data)
            elif chart_type == 'line':
                img = self._create_line_chart(chart_data)
            elif chart_type == 'pie':
                img = self._create_pie_chart(chart_data)
            else:
                continue
            if img:
                story.append(img)
                story.append(Spacer(1, 0.2 * inch))

    def _create_bar_chart(self, data: Dict) -> Optional[Image]:
        try:
            labels = data.get('labels', [])
            values = data.get('values', [])
            if not labels or not values:
                return None
            fig, ax = plt.subplots(figsize=(8, 4))
            colors_list = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
            bars = ax.bar(labels, values, color=colors_list[:len(labels)])
            ax.set_ylim(0, max(values) * 1.2 if values else 1)
            ax.grid(True, axis='y', linestyle='--', alpha=0.3)
            for bar, val in zip(bars, values):
                ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5, str(val), ha='center', va='bottom', fontsize=9)
            buf = BytesIO()
            plt.tight_layout()
            plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
            plt.close()
            buf.seek(0)
            return Image(buf, width=6*inch, height=3*inch)
        except Exception as e:
            return None

    def _create_line_chart(self, data: Dict) -> Optional[Image]:
        try:
            labels = data.get('labels', [])
            values = data.get('values', [])
            if not labels or not values:
                return None
            fig, ax = plt.subplots(figsize=(8, 4))
            ax.plot(labels, values, marker='o', linewidth=2, color='#2563eb', markersize=6)
            ax.fill_between(labels, values, alpha=0.2, color='#2563eb')
            ax.grid(True, linestyle='--', alpha=0.3)
            for i, val in enumerate(values):
                ax.text(i, val + 0.5, str(val), ha='center', va='bottom', fontsize=9)
            buf = BytesIO()
            plt.tight_layout()
            plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
            plt.close()
            buf.seek(0)
            return Image(buf, width=6*inch, height=3*inch)
        except Exception as e:
            return None

    def _create_pie_chart(self, data: Dict) -> Optional[Image]:
        try:
            labels = data.get('labels', [])
            values = data.get('values', [])
            if not labels or not values:
                return None
            fig, ax = plt.subplots(figsize=(6, 4))
            colors_list = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
            wedges, texts, autotexts = ax.pie(
                values,
                labels=labels,
                autopct='%1.1f%%',
                colors=colors_list[:len(labels)],
                startangle=90
            )
            for autotext in autotexts:
                autotext.set_color('white')
                autotext.set_fontsize(10)
                autotext.set_weight('bold')
            buf = BytesIO()
            plt.tight_layout()
            plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
            plt.close()
            buf.seek(0)
            return Image(buf, width=5*inch, height=3.5*inch)
        except Exception as e:
            return None

    def _add_tables_section(self, story: List, data: Dict):
        tables = data.get('tables', [])
        if not tables:
            return
        story.append(Paragraph("Detailed Data Tables", self.styles['CustomHeading']))
        story.append(Spacer(1, 0.1 * inch))
        for table_data in tables[:2]:
            table_title = table_data.get('title', '')
            columns = table_data.get('columns', [])
            rows = table_data.get('rows', [])
            if not columns or not rows:
                continue
            if table_title:
                story.append(Paragraph(table_title, self.styles['CustomBody']))
            col_widths = [2*inch] + [1.2*inch] * (len(columns) - 1)
            table = Table([columns] + rows[:15], colWidths=col_widths)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a1a2e')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 9),
                ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f8f9fa')),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#dee2e6')),
                ('FONTSIZE', (0, 1), (-1, -1), 8),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            story.append(table)
            story.append(Spacer(1, 0.2 * inch))

    def _add_footer(self, story: List):
        story.append(Spacer(1, 0.5 * inch))
        story.append(Paragraph("Confidential - Generated by Falcon PMS", self.styles['CustomFooter']))

    def _add_page_number(self, canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica', 8)
        canvas.setFillColor(colors.HexColor('#666666'))
        page_num = f"Page {doc.page}"
        canvas.drawRightString(doc.pagesize[0] - 30, 15, page_num)
        canvas.restoreState()

    def _get_status_color(self, status: str) -> str:
        status_map = {
            'On Track': '#10b981',
            'At Risk': '#f59e0b',
            'Off Track': '#ef4444',
            'Completed': '#10b981',
            'In Progress': '#2563eb',
            'Pending': '#f59e0b'
        }
        return status_map.get(status, '#333333')

    def export_to_string(self, data: Dict[str, Any], report_name: str) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=self.page_size)
        story = []
        self._add_title(story, report_name)
        self._add_kpi_section(story, data)
        story.append(Spacer(1, 0.2 * inch))
        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()