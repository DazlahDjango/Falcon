import csv
import io
from apps.reportplt.services.rendering.base_renderer import BaseDocumentRenderer

class CSVDocumentRenderer(BaseDocumentRenderer):
    def render(self) -> bytes:
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([self.title])
        writer.writerow([])
        summary_data = self.data.get('summary', {})
        for k, v in summary_data.items():
            writer.writerow([k, v])
        details = self.data.get('details', []) or self.data.get('matrix', []) or self.data.get('departments', [])
        if details and isinstance(details, list) and len(details) > 0:
            writer.writerow([])
            headers = list(details[0].keys())
            writer.writerow(headers)
            for item in details:
                writer.writerow([item.get(h, '') for h in headers])
        return output.getvalue().encode('utf-8')
