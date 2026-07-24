from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseDocumentRenderer(ABC):
    def __init__(self, title: str, data: Dict[str, Any]):
        self.title = title
        self.data = data

    @abstractmethod
    def render(self) -> bytes:
        pass
