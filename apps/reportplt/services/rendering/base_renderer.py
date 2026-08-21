from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BaseDocumentRenderer(ABC):
    def __init__(self, title: str, data: Dict[str, Any], config: Optional[Dict[str, Any]] = None):
        self.title = title
        self.data = data
        self.config = config or {}

    @abstractmethod
    def render(self) -> bytes:
        pass

