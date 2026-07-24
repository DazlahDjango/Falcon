from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseDataExtractor(ABC):
    def __init__(self, tenant_id: str, filters: Dict[str, Any] = None):
        self.tenant_id = str(tenant_id)
        self.filters = filters or {}

    @abstractmethod
    def extract(self) -> Dict[str, Any]:
        pass
