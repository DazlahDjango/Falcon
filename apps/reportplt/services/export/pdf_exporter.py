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
            self._add_hierarchy_tree_section(story, data)
            self._add_cascade_tree_section(story, data)
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

    def _format_label(self, raw_key: str) -> str:
        if not raw_key:
            return ""
        words = raw_key.replace('_', ' ').replace('-', ' ').split()
        return " ".join(w.capitalize() for w in words)

    def _add_header(self, story: List, report_name: str):
        pass

    def _add_title(self, story: List, report_name: str):
        header_table = Table([
            [
                Paragraph("<font size=14 color='#1E3A8A'><b>FALCON PMS</b></font><br/><font size=8 color='#64748B'>Performance. People. Progress.</font>", self.styles['Normal']),
                Paragraph(f"<font size=14 color='#0F172A'><b>{report_name.upper()} REPORT</b></font><br/><font size=9 color='#475569'><b>Executive Summary</b></font>", ParagraphStyle('CenterTitle', parent=self.styles['Normal'], alignment=TA_CENTER)),
                Paragraph(f"<font size=8 color='#475569'><b>Generated On:</b> {timezone.localtime(timezone.now()).strftime('%d %b %Y %H:%M')}<br/><b>Scope:</b> Active Tenants</font>", ParagraphStyle('RightMeta', parent=self.styles['Normal'], alignment=TA_RIGHT))
            ]
        ], colWidths=[2.2*inch, 3.2*inch, 2.0*inch])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('LINEBELOW', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ]))
        story.append(header_table)
        story.append(Spacer(1, 0.15 * inch))

    def _add_executive_summary(self, story: List, data: Dict):
        status_val = data.get('status', 'Completed').upper()
        summary_val = data.get('executive_summary', 'The onboarding and operational processes are tracked successfully.')
        
        status_table = Table([
            [
                Paragraph(f"<font color='#15803D'><b>STATUS: {status_val}</b></font>", self.styles['Normal']),
                Paragraph(f"<font color='#334155'><i>{summary_val}</i></font>", self.styles['Normal'])
            ]
        ], colWidths=[1.8*inch, 5.6*inch])
        status_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#DCFCE7')),
            ('PADDING', (0,0), (-1,-1), 6),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#86EFAC')),
        ]))
        story.append(status_table)
        story.append(Spacer(1, 0.15 * inch))

        metrics = data.get('metrics', {})
        # Filter scalar metrics only for card and summary table display
        scalar_metrics = {k: v for k, v in metrics.items() if not isinstance(v, (dict, list))} if isinstance(metrics, dict) else {}
        if scalar_metrics:
            card_labels = []
            card_values = []
            for k, v in list(scalar_metrics.items())[:4]:
                lbl = self._format_label(k).upper()
                val_str = f"{v}%" if ('rate' in k or 'percent' in k or 'ratio' in k) and not str(v).endswith('%') else str(v)
                card_labels.append(
                    Paragraph(f"<font size=7.5 color='#475569'><b>{lbl}</b></font>", ParagraphStyle('CardLbl', parent=self.styles['Normal'], alignment=TA_CENTER, leading=9))
                )
                card_values.append(
                    Paragraph(f"<font size=15 color='#0F172A'><b>{val_str}</b></font>", ParagraphStyle('CardVal', parent=self.styles['Normal'], alignment=TA_CENTER, leading=17))
                )
            while len(card_labels) < 4:
                card_labels.append(Paragraph("<font size=7.5 color='#475569'><b>METRIC</b></font>", ParagraphStyle('CardLbl', parent=self.styles['Normal'], alignment=TA_CENTER, leading=9)))
                card_values.append(Paragraph("<font size=15 color='#0F172A'><b>0</b></font>", ParagraphStyle('CardVal', parent=self.styles['Normal'], alignment=TA_CENTER, leading=17)))

            cards_table = Table([card_labels, card_values], colWidths=[1.85*inch, 1.85*inch, 1.85*inch, 1.85*inch])
            cards_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (0,1), colors.HexColor('#EFF6FF')),
                ('BACKGROUND', (1,0), (1,1), colors.HexColor('#ECFDF5')),
                ('BACKGROUND', (2,0), (2,1), colors.HexColor('#FEF3C7')),
                ('BACKGROUND', (3,0), (3,1), colors.HexColor('#F3E8FF')),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('VALIGN', (0,0), (-1,0), 'BOTTOM'),
                ('VALIGN', (0,1), (-1,1), 'TOP'),
                ('TOPPADDING', (0,0), (-1,0), 6),
                ('BOTTOMPADDING', (0,0), (-1,0), 2),
                ('TOPPADDING', (0,1), (-1,1), 2),
                ('BOTTOMPADDING', (0,1), (-1,1), 6),
                ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
            ]))
            story.append(cards_table)
            story.append(Spacer(1, 0.15 * inch))

        if scalar_metrics:
            story.append(Paragraph("Key Metrics Summary", self.styles['CustomHeading']))
            story.append(Spacer(1, 0.05 * inch))
            
            table_rows = [[
                Paragraph("<b>Metric Name</b>", ParagraphStyle('HdrLeft', parent=self.styles['Normal'], textColor=colors.white)),
                Paragraph("<b>Value</b>", ParagraphStyle('HdrRight', parent=self.styles['Normal'], textColor=colors.white, alignment=TA_RIGHT))
            ]]
            for k, v in scalar_metrics.items():
                lbl = self._format_label(k)
                val_str = f"{v}%" if ('rate' in k or 'percentage' in k) and not str(v).endswith('%') else str(v)
                table_rows.append([
                    Paragraph(lbl, self.styles['CustomBody']),
                    Paragraph(f"<b>{val_str}</b>", ParagraphStyle('ValRight', parent=self.styles['CustomBody'], alignment=TA_RIGHT))
                ])
            
            metrics_table = Table(table_rows, colWidths=[5.4*inch, 2.0*inch])
            metrics_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E3A8A')),
                ('PADDING', (0, 0), (-1, -1), 6),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#FFFFFF'), colors.HexColor('#F8FAFC')]),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1'))
            ]))
            story.append(metrics_table)
            story.append(Spacer(1, 0.15 * inch))

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
            colors_param = data.get('colors', [])
            if not labels or not values:
                return None

            default_colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

            # Filter out 0 or negative values to prevent overlapping 0.0% labels at 12 o'clock
            filtered_labels = []
            filtered_values = []
            filtered_colors = []

            for i, (lbl, val) in enumerate(zip(labels, values)):
                try:
                    v_float = float(val)
                except (ValueError, TypeError):
                    v_float = 0.0
                if v_float > 0:
                    filtered_labels.append(str(lbl))
                    filtered_values.append(v_float)
                    if colors_param and i < len(colors_param):
                        filtered_colors.append(colors_param[i])
                    else:
                        filtered_colors.append(default_colors[i % len(default_colors)])

            if not filtered_values or sum(filtered_values) == 0:
                return None

            fig, ax = plt.subplots(figsize=(6, 4))
            wedges, texts, autotexts = ax.pie(
                filtered_values,
                labels=filtered_labels,
                autopct='%1.1f%%',
                colors=filtered_colors,
                startangle=90,
                pctdistance=0.6
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

    def _calculate_col_widths(self, columns: List[str], avail_width: float) -> List[float]:
        num_cols = len(columns)
        if num_cols == 0:
            return []
        
        col_names_lower = [c.lower() for c in columns]
        
        # User directory: ['Full Name', 'Email', 'Role', 'Department', 'Status', 'MFA', 'Last Login']
        if 'email' in col_names_lower and 'role' in col_names_lower and num_cols == 7:
            return [
                avail_width * 0.17, # Name
                avail_width * 0.27, # Email
                avail_width * 0.12, # Role
                avail_width * 0.13, # Dept
                avail_width * 0.09, # Status
                avail_width * 0.09, # MFA
                avail_width * 0.13  # Last login
            ]
        # Login attempts: ['Identifier', 'Timestamp', 'IP Address', 'Result', 'Failure Reason']
        elif 'identifier' in col_names_lower and 'ip address' in col_names_lower and num_cols == 5:
            return [
                avail_width * 0.28, # Identifier
                avail_width * 0.20, # Timestamp
                avail_width * 0.18, # IP
                avail_width * 0.14, # Result
                avail_width * 0.20  # Reason
            ]
        # Audit trail: ['Timestamp', 'Actor', 'Action', 'Type', 'Severity', 'IP Address']
        elif 'actor' in col_names_lower and 'severity' in col_names_lower and num_cols == 6:
            return [
                avail_width * 0.17, # Timestamp
                avail_width * 0.22, # Actor
                avail_width * 0.24, # Action
                avail_width * 0.12, # Type
                avail_width * 0.10, # Severity
                avail_width * 0.15  # IP Address
            ]
        # Sessions: ['User Email', 'IP Address', 'Device', 'Browser', 'OS', 'MFA Verified', 'Login Time']
        elif 'device' in col_names_lower and 'browser' in col_names_lower and num_cols == 7:
            return [
                avail_width * 0.26, # Email
                avail_width * 0.15, # IP
                avail_width * 0.11, # Device
                avail_width * 0.11, # Browser
                avail_width * 0.11, # OS
                avail_width * 0.10, # MFA
                avail_width * 0.16  # Login Time
            ]
        # Password hygiene: ['Full Name', 'Email', 'Role', 'Last Changed', 'Days Stale', 'Forced Reset']
        elif 'days stale' in col_names_lower and num_cols == 6:
            return [
                avail_width * 0.20, # Name
                avail_width * 0.28, # Email
                avail_width * 0.14, # Role
                avail_width * 0.14, # Last changed
                avail_width * 0.12, # Days stale
                avail_width * 0.12  # Forced reset
            ]
        # Department Hierarchy: ['Dept Code', 'Department Name', 'Division', 'Manager', 'Sensitivity', 'Sections', 'Headcount']
        elif 'dept code' in col_names_lower and 'department name' in col_names_lower and num_cols == 7:
            return [
                avail_width * 0.10, # Code
                avail_width * 0.22, # Name
                avail_width * 0.16, # Division
                avail_width * 0.18, # Manager
                avail_width * 0.12, # Sensitivity
                avail_width * 0.10, # Sections
                avail_width * 0.12  # Headcount
            ]
        # Divisions: ['Division Code', 'Division Name', 'Division Director', 'Departments', 'Headcount']
        elif 'division code' in col_names_lower and num_cols == 5:
            return [
                avail_width * 0.15, # Code
                avail_width * 0.28, # Name
                avail_width * 0.25, # Director
                avail_width * 0.16, # Departments
                avail_width * 0.16  # Headcount
            ]
        # Sections: ['Section Code', 'Section Name', 'Department', 'Section Lead', 'Units', 'Headcount']
        elif 'section code' in col_names_lower and num_cols == 6:
            return [
                avail_width * 0.14, # Code
                avail_width * 0.24, # Name
                avail_width * 0.20, # Department
                avail_width * 0.20, # Section Lead
                avail_width * 0.10, # Units
                avail_width * 0.12  # Headcount
            ]
        # Units: ['Unit Code', 'Unit Name', 'Section', 'Unit Lead', 'Headcount']
        elif 'unit code' in col_names_lower and num_cols == 5:
            return [
                avail_width * 0.16, # Code
                avail_width * 0.28, # Name
                avail_width * 0.22, # Section
                avail_width * 0.20, # Unit Lead
                avail_width * 0.14  # Headcount
            ]
        # Managerial Span of Control: ['Manager Name', 'Position Title', 'Department', 'Direct Reports', 'Total Reports', 'Executive', 'Span Status']
        elif 'manager name' in col_names_lower and 'span status' in col_names_lower and num_cols == 7:
            return [
                avail_width * 0.18, # Manager Name
                avail_width * 0.18, # Position Title
                avail_width * 0.18, # Department
                avail_width * 0.11, # Direct Reports
                avail_width * 0.11, # Total Reports
                avail_width * 0.10, # Executive
                avail_width * 0.14  # Span Status
            ]
        elif 'position title' in col_names_lower and 'span status' in col_names_lower and num_cols == 6:
            return [
                avail_width * 0.26, # Position Title
                avail_width * 0.22, # Department
                avail_width * 0.13, # Direct Reports
                avail_width * 0.13, # Total Reports
                avail_width * 0.11, # Executive
                avail_width * 0.15  # Span Status
            ]
        # Interim Management: ['Employee', 'Acting Manager', 'Reporting Type', 'Effective From', 'Effective To', 'Remaining', 'Status']
        elif ('acting manager' in col_names_lower or 'acting manager id' in col_names_lower) and num_cols == 7:
            return [
                avail_width * 0.18, # Employee
                avail_width * 0.18, # Acting Manager
                avail_width * 0.13, # Reporting Type
                avail_width * 0.13, # Effective From
                avail_width * 0.13, # Effective To
                avail_width * 0.11, # Remaining
                avail_width * 0.14  # Status
            ]
        # Cost Centers: ['Cost Center Code', 'Cost Center Name', 'Category', 'Budget Amount', 'Depts Allocated']
        elif 'cost center code' in col_names_lower and num_cols == 5:
            return [
                avail_width * 0.16, # Code
                avail_width * 0.30, # Name
                avail_width * 0.18, # Category
                avail_width * 0.20, # Budget Amount
                avail_width * 0.16  # Depts Allocated
            ]
        # Locations: ['Location Code', 'Location Name', 'Type', 'City', 'Country']
        elif 'location code' in col_names_lower and num_cols == 5:
            return [
                avail_width * 0.18, # Code
                avail_width * 0.32, # Name
                avail_width * 0.18, # Type
                avail_width * 0.16, # City
                avail_width * 0.16  # Country
            ]
        # Sensitive Depts: ['Dept Code', 'Department Name', 'Sensitivity Level', 'Department Manager']
        elif ('sensitivity level' in col_names_lower or 'sensitivity' in col_names_lower) and num_cols == 4:
            return [
                avail_width * 0.16, # Code
                avail_width * 0.36, # Name
                avail_width * 0.22, # Sensitivity
                avail_width * 0.26  # Manager
            ]
        return [avail_width / num_cols] * num_cols

    def _add_tables_section(self, story: List, data: Dict):
        tables = data.get('tables', [])
        if not tables:
            return
        story.append(Paragraph("Detailed Data Tables", self.styles['CustomHeading']))
        story.append(Spacer(1, 0.05 * inch))

        tbl_hdr_style = ParagraphStyle(
            'TblHdr',
            parent=self.styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=7.5,
            leading=9.5,
            textColor=colors.white,
            alignment=TA_LEFT
        )
        tbl_body_style = ParagraphStyle(
            'TblBody',
            parent=self.styles['Normal'],
            fontName='Helvetica',
            fontSize=7.0,
            leading=8.5,
            textColor=colors.HexColor('#1e293b'),
            alignment=TA_LEFT
        )

        page_w = self.page_size[0]
        margin_left = self.config.get('margins', {}).get('left', 20)
        margin_right = self.config.get('margins', {}).get('right', 20)
        avail_width = page_w - margin_left - margin_right

        for table_data in tables:
            table_title = table_data.get('title', '')
            columns = table_data.get('columns', [])
            raw_rows = table_data.get('rows', [])
            if not columns or not raw_rows:
                continue
            if table_title:
                story.append(Paragraph(f"<b>{table_title}</b>", self.styles['CustomHeading']))
                story.append(Spacer(1, 0.05 * inch))

            num_cols = len(columns)
            col_widths = self._calculate_col_widths(columns, avail_width)

            hdr_cells = [Paragraph(f"<b>{str(col)}</b>", tbl_hdr_style) for col in columns]
            table_grid = [hdr_cells]

            for row in raw_rows:
                body_cells = []
                for i, cell in enumerate(row):
                    txt = str(cell) if cell is not None else ''
                    body_cells.append(Paragraph(txt, tbl_body_style))
                while len(body_cells) < num_cols:
                    body_cells.append(Paragraph('', tbl_body_style))
                table_grid.append(body_cells[:num_cols])

            table = Table(table_grid, colWidths=col_widths, repeatRows=1)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E3A8A')),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#FFFFFF'), colors.HexColor('#F8FAFC')]),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
                ('TOPPADDING', (0, 0), (-1, -1), 3),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
                ('LEFTPADDING', (0, 0), (-1, -1), 3),
                ('RIGHTPADDING', (0, 0), (-1, -1), 3),
            ]))
            story.append(table)
            story.append(Spacer(1, 0.15 * inch))

    def _add_hierarchy_tree_section(self, story: List, data: Dict):
        hierarchy_tree = data.get('hierarchy_tree') or data.get('raw_data', {}).get('hierarchy_tree', [])
        if not hierarchy_tree:
            return

        story.append(Paragraph("Organizational Hierarchy Tree", self.styles['CustomHeading']))
        story.append(Spacer(1, 0.08 * inch))

        page_w = self.page_size[0]
        margin_left = self.config.get('margins', {}).get('left', 20)
        margin_right = self.config.get('margins', {}).get('right', 20)
        avail_width = page_w - margin_left - margin_right

        div_style = ParagraphStyle(
            'DivStyle',
            parent=self.styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8.5,
            leading=10.5,
            textColor=colors.white
        )
        div_sub_style = ParagraphStyle(
            'DivSubStyle',
            parent=self.styles['Normal'],
            fontName='Helvetica',
            fontSize=7.0,
            leading=9.0,
            textColor=colors.HexColor('#E2E8F0')
        )

        dept_style = ParagraphStyle(
            'DeptStyle',
            parent=self.styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=7.5,
            leading=9.5,
            textColor=colors.HexColor('#1E3A8A')
        )
        dept_sub_style = ParagraphStyle(
            'DeptSubStyle',
            parent=self.styles['Normal'],
            fontName='Helvetica',
            fontSize=6.5,
            leading=8.0,
            textColor=colors.HexColor('#475569')
        )

        sec_style = ParagraphStyle(
            'SecStyle',
            parent=self.styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=7.0,
            leading=9.0,
            textColor=colors.HexColor('#0F766E')
        )
        sec_sub_style = ParagraphStyle(
            'SecSubStyle',
            parent=self.styles['Normal'],
            fontName='Helvetica',
            fontSize=6.5,
            leading=8.0,
            textColor=colors.HexColor('#64748B')
        )

        unit_style = ParagraphStyle(
            'UnitStyle',
            parent=self.styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=6.5,
            leading=8.5,
            textColor=colors.HexColor('#4338CA')
        )
        unit_sub_style = ParagraphStyle(
            'UnitSubStyle',
            parent=self.styles['Normal'],
            fontName='Helvetica',
            fontSize=6.0,
            leading=7.5,
            textColor=colors.HexColor('#64748B')
        )

        empty_sec_style = ParagraphStyle(
            'EmptySecStyle',
            parent=self.styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=6.5,
            leading=8.0,
            textColor=colors.HexColor('#94A3B8')
        )

        for div in hierarchy_tree:
            div_code = div.get('code', '')
            div_name = div.get('name', '')
            div_leader = div.get('leader_display', 'Not Assigned')
            div_users = div.get('user_count', 0)

            div_cell = [
                Paragraph(f"<b>[DIVISION] [{div_code}] {div_name}</b>", div_style),
                Paragraph(f"• Director: {div_leader} &nbsp;&nbsp;|&nbsp;&nbsp; • Total Division Users: <b>{div_users}</b>", div_sub_style)
            ]
            div_table = Table([[div_cell]], colWidths=[avail_width])
            div_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#1E3A8A')),
                ('TOPPADDING', (0,0), (-1,-1), 4),
                ('BOTTOMPADDING', (0,0), (-1,-1), 4),
                ('LEFTPADDING', (0,0), (-1,-1), 8),
                ('RIGHTPADDING', (0,0), (-1,-1), 8),
                ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#1E3A8A')),
            ]))
            story.append(div_table)
            story.append(Spacer(1, 0.02 * inch))

            departments = div.get('departments', [])
            for dept in departments:
                dept_code = dept.get('code', '')
                dept_name = dept.get('name', '')
                dept_leader = dept.get('leader_display', 'Not Assigned')
                dept_users = dept.get('user_count', 0)

                dept_cell = [
                    Paragraph(f"<b>└── [DEPARTMENT] [{dept_code}] {dept_name}</b>", dept_style),
                    Paragraph(f"&nbsp;&nbsp;&nbsp;&nbsp;• Manager: {dept_leader} &nbsp;&nbsp;|&nbsp;&nbsp; • Department Users: <b>{dept_users}</b>", dept_sub_style)
                ]
                dept_table = Table([[dept_cell]], colWidths=[avail_width])
                dept_table.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F1F5F9')),
                    ('LINELEFT', (0,0), (-1,-1), 2.5, colors.HexColor('#2563EB')),
                    ('TOPPADDING', (0,0), (-1,-1), 2.5),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
                    ('LEFTPADDING', (0,0), (-1,-1), 16),
                    ('RIGHTPADDING', (0,0), (-1,-1), 6),
                ]))
                story.append(dept_table)
                story.append(Spacer(1, 0.015 * inch))

                sections = dept.get('sections', [])
                if not sections:
                    empty_cell = [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i>(No Sections in this Department)</i>", empty_sec_style)]
                    empty_table = Table([[empty_cell]], colWidths=[avail_width])
                    empty_table.setStyle(TableStyle([
                        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FFFFFF')),
                        ('TOPPADDING', (0,0), (-1,-1), 1),
                        ('BOTTOMPADDING', (0,0), (-1,-1), 1),
                        ('LEFTPADDING', (0,0), (-1,-1), 22),
                    ]))
                    story.append(empty_table)
                    story.append(Spacer(1, 0.015 * inch))

                for sec in sections:
                    sec_code = sec.get('code', '')
                    sec_name = sec.get('name', '')
                    sec_leader = sec.get('leader_display', 'Not Assigned')
                    sec_users = sec.get('user_count', 0)

                    sec_cell = [
                        Paragraph(f"<b>&nbsp;&nbsp;&nbsp;&nbsp;└── [SECTION] [{sec_code}] {sec_name}</b>", sec_style),
                        Paragraph(f"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;• Section Lead: {sec_leader} &nbsp;&nbsp;|&nbsp;&nbsp; • Section Users: <b>{sec_users}</b>", sec_sub_style)
                    ]
                    sec_table = Table([[sec_cell]], colWidths=[avail_width])
                    sec_table.setStyle(TableStyle([
                        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F0FDFA')),
                        ('LINELEFT', (0,0), (-1,-1), 2, colors.HexColor('#0D9488')),
                        ('TOPPADDING', (0,0), (-1,-1), 2),
                        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
                        ('LEFTPADDING', (0,0), (-1,-1), 28),
                        ('RIGHTPADDING', (0,0), (-1,-1), 6),
                    ]))
                    story.append(sec_table)
                    story.append(Spacer(1, 0.015 * inch))

                    units = sec.get('units', [])
                    for unit in units:
                        unit_code = unit.get('code', '')
                        unit_name = unit.get('name', '')
                        unit_leader = unit.get('leader_display', 'Not Assigned')
                        unit_users = unit.get('user_count', 0)

                        unit_cell = [
                            Paragraph(f"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── <b>[UNIT] [{unit_code}] {unit_name}</b>", unit_style),
                            Paragraph(f"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;• Unit Lead: {unit_leader} &nbsp;&nbsp;|&nbsp;&nbsp; • Unit Users: <b>{unit_users}</b>", unit_sub_style)
                        ]
                        unit_table = Table([[unit_cell]], colWidths=[avail_width])
                        unit_table.setStyle(TableStyle([
                            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
                            ('LINELEFT', (0,0), (-1,-1), 1.5, colors.HexColor('#6366F1')),
                            ('TOPPADDING', (0,0), (-1,-1), 1.5),
                            ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
                            ('LEFTPADDING', (0,0), (-1,-1), 40),
                            ('RIGHTPADDING', (0,0), (-1,-1), 6),
                        ]))
                        story.append(unit_table)
                        story.append(Spacer(1, 0.015 * inch))

            story.append(Spacer(1, 0.08 * inch))

    def _add_cascade_tree_section(self, story: List, data: Dict):
        cascade_trees = data.get('cascade_trees') or data.get('raw_data', {}).get('trees', [])
        if not cascade_trees:
            return

        story.append(Paragraph("Target Cascade Hierarchy Tree", self.styles['CustomHeading']))
        story.append(Spacer(1, 0.08 * inch))

        page_w = self.page_size[0]
        margin_left = self.config.get('margins', {}).get('left', 20)
        margin_right = self.config.get('margins', {}).get('right', 20)
        avail_width = page_w - margin_left - margin_right

        root_style = ParagraphStyle(
            'RootCascadeStyle',
            parent=self.styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8.5,
            leading=10.5,
            textColor=colors.white
        )
        root_sub_style = ParagraphStyle(
            'RootCascadeSubStyle',
            parent=self.styles['Normal'],
            fontName='Helvetica',
            fontSize=7.0,
            leading=9.0,
            textColor=colors.HexColor('#E2E8F0')
        )

        level_styles = {
            'ORGANIZATION': {'bg': '#1E3A8A', 'line': '#1E3A8A', 'hdr_text': '#FFFFFF', 'sub_text': '#E2E8F0', 'pad_left': 8},
            'DIVISION': {'bg': '#EEF2FF', 'line': '#4338CA', 'hdr_text': '#312E81', 'sub_text': '#4338CA', 'pad_left': 16},
            'DEPARTMENT': {'bg': '#F1F5F9', 'line': '#2563EB', 'hdr_text': '#1E3A8A', 'sub_text': '#475569', 'pad_left': 24},
            'SECTION': {'bg': '#F0FDFA', 'line': '#0D9488', 'hdr_text': '#0F766E', 'sub_text': '#0F766E', 'pad_left': 32},
            'UNIT': {'bg': '#FAF5FF', 'line': '#7C3AED', 'hdr_text': '#581C87', 'sub_text': '#6B21A8', 'pad_left': 40},
            'INDIVIDUAL': {'bg': '#F8FAFC', 'line': '#64748B', 'hdr_text': '#0F172A', 'sub_text': '#64748B', 'pad_left': 48},
        }

        def render_node(node: Dict[str, Any], depth: int):
            level = node.get('level', 'ORGANIZATION' if depth == 0 else 'INDIVIDUAL').upper()
            node_name = node.get('node_name', node.get('name', 'Node'))
            lead_name = node.get('user_name') or node.get('lead_name') or node.get('user_email', 'Lead')
            pos_title = node.get('position_title', 'Staff')
            target_val = node.get('target_formatted') or f"KES {node.get('target_value', 0):,.2f}"
            contrib = node.get('contribution_percentage', node.get('contribution', 100.0))

            cfg = level_styles.get(level, level_styles['INDIVIDUAL'])
            indent_left = min(cfg['pad_left'] + (max(depth - 1, 0) * 4), 60)

            if level == 'ORGANIZATION' or depth == 0:
                cell_content = [
                    Paragraph(f"<b>[ORGANIZATION] {node_name} (Lead: {lead_name})</b>", root_style),
                    Paragraph(f"• Target Value: <b>{target_val}</b> &nbsp;&nbsp;|&nbsp;&nbsp; • Executive Lead: <b>{lead_name}</b> ({pos_title})", root_sub_style)
                ]
                root_table = Table([[cell_content]], colWidths=[avail_width])
                root_table.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor(cfg['bg'])),
                    ('TOPPADDING', (0,0), (-1,-1), 4),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 4),
                    ('LEFTPADDING', (0,0), (-1,-1), 8),
                    ('RIGHTPADDING', (0,0), (-1,-1), 8),
                    ('BOX', (0,0), (-1,-1), 1, colors.HexColor(cfg['bg'])),
                ]))
                story.append(root_table)
                story.append(Spacer(1, 0.02 * inch))
            else:
                node_style = ParagraphStyle(
                    f'CascadeNodeStyle_{level}_{depth}',
                    parent=self.styles['Normal'],
                    fontName='Helvetica-Bold',
                    fontSize=7.0,
                    leading=9.0,
                    textColor=colors.HexColor(cfg['hdr_text'])
                )
                node_sub_style = ParagraphStyle(
                    f'CascadeNodeSubStyle_{level}_{depth}',
                    parent=self.styles['Normal'],
                    fontName='Helvetica',
                    fontSize=6.5,
                    leading=8.0,
                    textColor=colors.HexColor(cfg['sub_text'])
                )

                prefix_tree = "&nbsp;" * ((depth - 1) * 3) + "└── "
                if level in ['DIVISION', 'DEPARTMENT', 'SECTION', 'UNIT']:
                    header_line = f"<b>{prefix_tree}[{level}] {node_name} (Lead: {lead_name})</b>"
                    sub_line = f"&nbsp;&nbsp;&nbsp;&nbsp;• Target: <b>{target_val}</b> &nbsp;|&nbsp; • Contrib: <b>{contrib:.2f}%</b> &nbsp;|&nbsp; • Title: {pos_title}"
                else:
                    header_line = f"<b>{prefix_tree}[INDIVIDUAL] {lead_name}</b>"
                    sub_line = f"&nbsp;&nbsp;&nbsp;&nbsp;• Target: <b>{target_val}</b> &nbsp;|&nbsp; • Contrib: <b>{contrib:.2f}%</b> &nbsp;|&nbsp; • Role: {pos_title}"

                cell_content = [
                    Paragraph(header_line, node_style),
                    Paragraph(sub_line, node_sub_style)
                ]
                child_table = Table([[cell_content]], colWidths=[avail_width])
                child_table.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor(cfg['bg'])),
                    ('LINELEFT', (0,0), (-1,-1), 2, colors.HexColor(cfg['line'])),
                    ('TOPPADDING', (0,0), (-1,-1), 2),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 2),
                    ('LEFTPADDING', (0,0), (-1,-1), indent_left),
                    ('RIGHTPADDING', (0,0), (-1,-1), 6),
                ]))
                story.append(child_table)
                story.append(Spacer(1, 0.015 * inch))

            for child in node.get('children', []):
                render_node(child, depth + 1)

        for tree in cascade_trees:
            render_node(tree, 0)
            story.append(Spacer(1, 0.04 * inch))

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

    def export_to_bytes(self, data: Dict[str, Any], report_name: str = "Report", config: Optional[Dict] = None) -> bytes:
        if config:
            self.config.update(config)
        return self.export_to_string(data, report_name)
