import io
import logging
from apps.reportplt.services.rendering.base_renderer import BaseDocumentRenderer

logger = logging.getLogger(__name__)

class PDFDocumentRenderer(BaseDocumentRenderer):
    def render(self) -> bytes:
        try:
            from apps.reportplt.services.export.pdf_exporter import PDFExporter
            exporter = PDFExporter()
            return exporter.export_to_bytes(self.data, self.title, self.config)
        except Exception as e:
            logger.warning(f"PDFExporter delegate failed, falling back to simple ReportLab renderer: {e}")
            from reportlab.lib.pagesizes import A4
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib import colors

            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=A4, title=self.title)
            styles = getSampleStyleSheet()
            story = []
            title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], fontSize=16, spaceAfter=20, alignment=1)
            story.append(Paragraph(self.title, title_style))
            story.append(Spacer(1, 10))
            summary_data = self.data.get('summary', {})
            if summary_data:
                story.append(Paragraph("<b>Summary:</b>", styles['Heading2']))
                table_data = [[str(k), str(v)] for k, v in summary_data.items()]
                if table_data:
                    t = Table(table_data)
                    t.setStyle(TableStyle([
                        ('BACKGROUND', (0,0), (-1,0), colors.lightgrey),
                        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
                    ]))
                    story.append(t)
                    story.append(Spacer(1, 15))
            doc.build(story)
            buffer.seek(0)
            return buffer.getvalue()

