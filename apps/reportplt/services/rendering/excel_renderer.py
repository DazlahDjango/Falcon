import io
from openpyxl import Workbook
from apps.reportplt.services.rendering.base_renderer import BaseDocumentRenderer

class ExcelDocumentRenderer(BaseDocumentRenderer):
    def render(self) -> bytes:
        buffer = io.BytesIO()
        wb = Workbook()
        ws = wb.active
        ws.title = "Report Summary"
        ws.append([self.title])
        ws.append([])
        summary_data = self.data.get('summary', {})
        for k, v in summary_data.items():
            ws.append([str(k), str(v)])
        details = self.data.get('details', []) or self.data.get('matrix', []) or self.data.get('departments', [])
        if details and isinstance(details, list) and len(details) > 0:
            ws_details = wb.create_sheet("Details")
            headers = list(details[0].keys())
            ws_details.append(headers)
            for row in details:
                ws_details.append([str(row.get(h, '')) for h in headers])
        wb.save(buffer)
        buffer.seek(0)
        return buffer.getvalue()
