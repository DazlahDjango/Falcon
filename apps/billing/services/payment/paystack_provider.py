import json
import hmac
import hashlib
import logging
from typing import Optional, Dict, Any, List
from django.conf import settings
from django.core.cache import cache
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from .interface import PaymentProviderInterface, TransactionResult, SubscriptionResult, PlanResult

logger = logging.getLogger(__name__)

class PayStackProvider(PaymentProviderInterface):
    def __init__(self):
        self.secret_key = getattr(settings, 'PAYSTACK_SECRET_KEY', None)
        self.public_key = getattr(settings, 'PAYSTACK_PUBLIC_KEY', None)
        self.base_url = getattr(settings, 'PAYSTACK_BASE_URL', 'https://api.paystack.co')
        self.webhook_secret = getattr(settings, 'PAYSTACK_WEBHOOK_SECRET', None)
        if not self.secret_key:
            raise ValueError("PAYSTACK_SECRET_KEY not configured")
        self.session = self._create_session()

    def _create_session(self) -> requests.Session:
        session = requests.Session()
        retry_strategy = Retry(total=3, backoff_factor=1, status_forcelist=[429, 500, 502, 503, 504], allowed_methods=["GET", "POST", "PUT"], raise_on_status=False)
        adapter = HTTPAdapter(max_retries=retry_strategy, pool_connections=20, pool_maxsize=50)
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        session.headers.update({"Authorization": f"Bearer {self.secret_key}", "Content-Type": "application/json", "User-Agent": "Falcon-PMS/2.0"})
        return session

    def _request(self, method: str, endpoint: str, data: Optional[Dict] = None, idempotency_key: Optional[str] = None) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        headers = {}
        if idempotency_key and method.upper() == "POST":
            headers["Idempotency-Key"] = idempotency_key
        try:
            response = self.session.request(method=method, url=url, json=data, headers=headers, timeout=30)
            response_data = response.json()
            if response.status_code == 429:
                raise Exception(f"Rate limited: {response.headers.get('Retry-After', 60)}")
            if response.status_code == 401:
                raise Exception("Invalid secret key")
            if not response_data.get('status'):
                raise Exception(response_data.get('message', 'Unknown error'))
            return response_data.get('data', {})
        except requests.exceptions.Timeout:
            raise Exception("Request timed out")
        except requests.exceptions.ConnectionError as e:
            raise Exception(f"Connection error: {str(e)}")

    def initialize_transaction(self, email: str, amount: int, reference: str, callback_url: Optional[str] = None, metadata: Optional[Dict] = None, channels: Optional[List[str]] = None) -> TransactionResult:
        data = {'email': email, 'amount': amount, 'reference': reference, 'callback_url': callback_url or getattr(settings, 'PAYSTACK_CALLBACK_URL', None)}
        if metadata:
            data['metadata'] = metadata
        if channels:
            data['channels'] = channels
        response = self._request('POST', '/transaction/initialize', data=data)
        return TransactionResult(success=True, reference=reference, amount=amount, currency=getattr(settings, 'BILLING_CURRENCY', 'KES'), status='pending', gateway_response=response, authorization_code=None, customer_code=None)

    def verify_transaction(self, reference: str) -> TransactionResult:
        cache_key = f"paystack_txn_verify_{reference}"
        cached = cache.get(cache_key)
        if cached:
            return TransactionResult(**cached)
        response = self._request('GET', f'/transaction/verify/{reference}')
        result = TransactionResult(success=response.get('status') == 'success', reference=reference, amount=response.get('amount', 0), currency=response.get('currency', 'KES'), status=response.get('status', 'unknown'), gateway_response=response, authorization_code=response.get('authorization', {}).get('authorization_code'), customer_code=response.get('customer', {}).get('customer_code'))
        if result.status == 'success':
            cache.set(cache_key, result.__dict__, 300)
        return result

    def create_subscription(self, customer_code: str, plan_code: str, authorization_code: Optional[str] = None) -> SubscriptionResult:
        data = {'customer': customer_code, 'plan': plan_code}
        if authorization_code:
            data['authorization'] = authorization_code
        response = self._request('POST', '/subscription', data=data)
        return SubscriptionResult(success=True, subscription_code=response.get('subscription_code'), plan_code=plan_code, customer_code=customer_code, authorization_code=authorization_code, status=response.get('status'))

    def get_subscription(self, subscription_code: str) -> SubscriptionResult:
        response = self._request('GET', f'/subscription/{subscription_code}')
        return SubscriptionResult(success=True, subscription_code=subscription_code, plan_code=response.get('plan', {}).get('plan_code'), customer_code=response.get('customer', {}).get('customer_code'), authorization_code=response.get('authorization', {}).get('authorization_code'), status=response.get('status'))

    def cancel_subscription(self, subscription_code: str, token: str) -> SubscriptionResult:
        data = {'code': subscription_code, 'token': token}
        response = self._request('POST', '/subscription/disable', data=data)
        return SubscriptionResult(success=True, subscription_code=subscription_code, plan_code='', customer_code='', authorization_code='', status='cancelled')

    def create_plan(self, name: str, amount: int, interval: str, description: Optional[str] = None) -> PlanResult:
        data = {'name': name, 'amount': amount, 'interval': interval, 'currency': getattr(settings, 'BILLING_CURRENCY', 'KES')}
        if description:
            data['description'] = description
        response = self._request('POST', '/plan', data=data)
        return PlanResult(success=True, plan_code=response.get('plan_code'), plan_id=str(response.get('id')), name=name, amount=amount, interval=interval)

    def get_plan(self, plan_id_or_code: str) -> PlanResult:
        response = self._request('GET', f'/plan/{plan_id_or_code}')
        return PlanResult(success=True, plan_code=response.get('plan_code'), plan_id=str(response.get('id')), name=response.get('name'), amount=response.get('amount'), interval=response.get('interval'))

    def create_customer(self, email: str, first_name: Optional[str] = None, last_name: Optional[str] = None, phone: Optional[str] = None) -> Dict[str, Any]:
        data = {'email': email}
        if first_name:
            data['first_name'] = first_name
        if last_name:
            data['last_name'] = last_name
        if phone:
            data['phone'] = phone
        return self._request('POST', '/customer', data=data)

    def create_refund(self, transaction_reference: str, amount: Optional[int] = None) -> Dict[str, Any]:
        data = {'transaction': transaction_reference}
        if amount:
            data['amount'] = amount
        return self._request('POST', '/refund', data=data)

    def verify_webhook_signature(self, payload: bytes, signature: str) -> bool:
        if not self.webhook_secret:
            return False
        expected = hmac.new(self.webhook_secret.encode('utf-8'), payload, hashlib.sha512).hexdigest()
        return hmac.compare_digest(expected, signature)