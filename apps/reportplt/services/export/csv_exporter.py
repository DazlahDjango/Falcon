# apps/reportplt/services/export/csv_exporter.py
import csv
import io
import uuid
from typing import Dict, Any, List, Optional
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from apps.reportplt.exceptions import ReportExportError

class CSVExporter:
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}
        self.delimiter = self.config.get('delimiter', ',')
        self.quotechar = self.config.get('quotechar', '"')
        self.encoding = self.config.get('encoding', 'utf-8')

    def export(self, data: Dict[str, Any], report_name: str, output_path: Optional[str] = None) -> str:
        try:
            content = self._generate_csv(data)
            if output_path:
                with default_storage.open(output_path, 'wb') as f:
                    f.write(content)
                return output_path
            file_name = f"reports/{uuid.uuid4()}.csv"
            path = default_storage.save(file_name, ContentFile(content))
            return path
        except Exception as e:
            raise ReportExportError(f"CSV export failed: {str(e)}")

    def _generate_csv(self, data: Dict) -> bytes:
        output = io.StringIO()
        writer = csv.writer(output, delimiter=self.delimiter, quotechar=self.quotechar, quoting=csv.QUOTE_MINIMAL)
        
        if 'title' in data:
            writer.writerow([data['title']])
            writer.writerow([])
            
        summary = data.get('summary')
        if isinstance(summary, dict) and summary:
            for k, v in summary.items():
                writer.writerow([k, v])
            writer.writerow([])

        kpis = data.get('kpis', [])
        if kpis:
            headers = ['KPI', 'Target', 'Actual', 'Progress', 'Status']
            writer.writerow(headers)
            for kpi in kpis:
                writer.writerow([
                    kpi.get('name', ''),
                    kpi.get('target', ''),
                    kpi.get('actual', ''),
                    kpi.get('progress', ''),
                    kpi.get('status', '')
                ])
        tables = data.get('tables', [])
        if tables:
            writer.writerow([])
            table_data = tables[0]
            columns = table_data.get('columns', [])
            rows = table_data.get('rows', [])
            if columns:
                writer.writerow(columns)
            for row in rows:
                writer.writerow(row)
                
        details = data.get('details', [])
        if details and isinstance(details, list) and len(details) > 0 and isinstance(details[0], dict):
            writer.writerow([])
            headers = list(details[0].keys())
            writer.writerow(headers)
            for item in details:
                writer.writerow([item.get(h, '') for h in headers])

        return output.getvalue().encode(self.encoding)


    def export_kpis_only(self, kpis: List[Dict]) -> bytes:
        output = io.StringIO()
        writer = csv.writer(output, delimiter=self.delimiter, quotechar=self.quotechar)
        writer.writerow(['KPI', 'Target', 'Actual', 'Progress', 'Status'])
        for kpi in kpis:
            writer.writerow([
                kpi.get('name', ''),
                kpi.get('target', ''),
                kpi.get('actual', ''),
                kpi.get('progress', ''),
                kpi.get('status', '')
            ])
        return output.getvalue().encode(self.encoding)

    def export_table(self, columns: List[str], rows: List[List]) -> bytes:
        output = io.StringIO()
        writer = csv.writer(output, delimiter=self.delimiter, quotechar=self.quotechar)
        writer.writerow(columns)
        for row in rows:
            writer.writerow(row)
        return output.getvalue().encode(self.encoding)

    def export_to_bytes(self, data: Dict[str, Any], report_name: str = "Report", config: Optional[Dict] = None) -> bytes:
        if config:
            self.config.update(config)
        return self._generate_csv(data)