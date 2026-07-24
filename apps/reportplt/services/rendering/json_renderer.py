import json
from apps.reportplt.services.rendering.base_renderer import BaseDocumentRenderer

class JSONDocumentRenderer(BaseDocumentRenderer):
    def render(self) -> bytes:
        payload = {
            'title': self.title,
            'data': self.data
        }
        return json.dumps(payload, indent=2).encode('utf-8')
