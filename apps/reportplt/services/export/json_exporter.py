# apps/reportplt/services/export/json_exporter.py
import json
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.utils import timezone
from apps.reportplt.exceptions import ReportExportError

class JSONExporter:
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}
        self.indent = self.config.get('indent', 2)
        self.sort_keys = self.config.get('sort_keys', False)
        self.ensure_ascii = self.config.get('ensure_ascii', False)

    def export(self, data: Dict[str, Any], report_name: str, output_path: Optional[str] = None) -> str:
        try:
            json_data = self._prepare_json(data, report_name)
            content = json.dumps(json_data, indent=self.indent, sort_keys=self.sort_keys, ensure_ascii=self.ensure_ascii, default=str)
            content_bytes = content.encode('utf-8')
            if output_path:
                with default_storage.open(output_path, 'wb') as f:
                    f.write(content_bytes)
                return output_path
            file_name = f"reports/{uuid.uuid4()}.json"
            path = default_storage.save(file_name, ContentFile(content_bytes))
            return path
        except Exception as e:
            raise ReportExportError(f"JSON export failed: {str(e)}")

    def _prepare_json(self, data: Dict, report_name: str) -> Dict:
        return {
            'report_name': report_name,
            'generated_at': timezone.now().isoformat(),
            'version': '1.0',
            'summary': {
                'total_kpis': len(data.get('kpis', [])),
                'status': data.get('status', 'completed'),
                'executive_summary': data.get('executive_summary', '')
            },
            'kpis': data.get('kpis', []),
            'metrics': data.get('metrics', {}),
            'charts': data.get('charts', []),
            'tables': data.get('tables', [])
        }

    def export_kpis(self, kpis: List[Dict]) -> str:
        content = json.dumps(kpis, indent=self.indent, sort_keys=self.sort_keys, ensure_ascii=self.ensure_ascii, default=str)
        return content

    def export_metrics(self, metrics: Dict) -> str:
        content = json.dumps(metrics, indent=self.indent, sort_keys=self.sort_keys, ensure_ascii=self.ensure_ascii, default=str)
        return content

    def export_to_dict(self, data: Dict[str, Any], report_name: str) -> Dict:
        return self._prepare_json(data, report_name)

    def export_to_bytes(self, data: Dict[str, Any], report_name: str = "Report", config: Optional[Dict] = None) -> bytes:
        if config:
            self.config.update(config)
        json_data = self._prepare_json(data, report_name)
        content = json.dumps(json_data, indent=self.indent, sort_keys=self.sort_keys, ensure_ascii=self.ensure_ascii, default=str)
        return content.encode('utf-8')