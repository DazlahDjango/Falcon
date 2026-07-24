import io
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from apps.reportplt.services.rendering.base_renderer import BaseDocumentRenderer

class PDFDocumentRenderer(BaseDocumentRenderer):
    def render(self) -> bytes:
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
