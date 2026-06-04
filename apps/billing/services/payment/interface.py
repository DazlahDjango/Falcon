from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, List, Protocol
from dataclasses import dataclass, field
from decimal import Decimal
from uuid import UUID

@dataclass
class TransactionResult:
    success: bool
    reference: str
    amount: int
    currency: str
    status: str
    gateway_response: Dict[str, Any]
    authorization_code: Optional[str] = None
    customer_code: Optional[str] = None

@dataclass
class SubscriptionResult:
    success: bool
    subscription_code: str
    plan_code: str
    customer_code: str
    status: str
    authorization_code: Optional[str] = None

@dataclass
class PlanResult:
    success: bool
    plan_code: str
    plan_id: str
    name: str
    amount: int
    interval: str

class PaymentProviderInterface(ABC):
    @abstractmethod
    def initialize_transaction(self, email: str, amount: int, reference: str, callback_url: Optional[str] = None, metadata: Optional[Dict] = None, channels: Optional[List[str]] = None) -> TransactionResult:
        pass

    @abstractmethod
    def verify_transaction(self, reference: str) -> TransactionResult:
        pass

    @abstractmethod
    def create_subscription(self, customer_code: str, plan_code: str, authorization_code: Optional[str] = None) -> SubscriptionResult:
        pass

    @abstractmethod
    def get_subscription(self, subscription_code: str) -> SubscriptionResult:
        pass

    @abstractmethod
    def cancel_subscription(self, subscription_code: str, token: str) -> SubscriptionResult:
        pass

    @abstractmethod
    def create_plan(self, name: str, amount: int, interval: str, description: Optional[str] = None) -> PlanResult:
        pass

    @abstractmethod
    def get_plan(self, plan_id_or_code: str) -> PlanResult:
        pass

    @abstractmethod
    def create_customer(self, email: str, first_name: Optional[str] = None, last_name: Optional[str] = None, phone: Optional[str] = None) -> Dict[str, Any]:
        pass

    @abstractmethod
    def create_refund(self, transaction_reference: str, amount: Optional[int] = None) -> Dict[str, Any]:
        pass

    @abstractmethod
    def verify_webhook_signature(self, payload: bytes, signature: str) -> bool:
        pass