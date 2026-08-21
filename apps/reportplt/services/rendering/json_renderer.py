import json
import logging
from apps.reportplt.services.rendering.base_renderer import BaseDocumentRenderer

logger = logging.getLogger(__name__)

class JSONDocumentRenderer(BaseDocumentRenderer):
    def render(self) -> bytes:
        try:
            from apps.reportplt.services.export.json_exporter import JSONExporter
            exporter = JSONExporter()
            return exporter.export_to_bytes(self.data, self.title, self.config)
        except Exception as e:
            logger.warning(f"JSONExporter delegate failed, falling back to simple JSON renderer: {e}")
            payload = {
                'title': self.title,
                'data': self.data
            }
            return json.dumps(payload, indent=2).encode('utf-8')

