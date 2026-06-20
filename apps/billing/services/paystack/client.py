import json
import logging
from typing import Dict, Any, Optional, List
from django.conf import settings
from django.core.cache import cache
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from ...exceptions import APIError, AuthenticationError, RateLimitError, PaymentInitializationError, PaymentVerificationError
from ...utils import generate_transaction_reference

logger = logging.getLogger(__name__)

class PayStackClient:
    def __init__(self):
        self.secret_key = getattr(settings, 'PAYSTACK_SECRET_KEY', None)
        self.public_key = getattr(settings, 'PAYSTACK_PUBLIC_KEY', None)
        self.base_url = getattr(settings, 'PAYSTACK_BASE_URL', 'https://api.paystack.co')
        if not self.secret_key:
            logger.error("PayStack secret key not configured")
            raise AuthenticationError("PayStack secret key not configured")
        self.session = self._create_session()

    def _create_session(self) -> requests.Session:
        session = requests.Session()
        retry_strategy = Retry(total=3, backoff_factor=1, status_forcelist=[429, 500, 502, 503, 504], allowed_methods=["GET", "POST", "PUT"], raise_on_status=False)
        adapter = HTTPAdapter(max_retries=retry_strategy, pool_connections=10, pool_maxsize=20)
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        session.headers.update({"Authorization": f"Bearer {self.secret_key}", "Content-Type": "application/json", "User-Agent": "Falcon-PMS/1.0"})
        return session

    def _request(self, method: str, endpoint: str, data: Optional[Dict] = None, idempotency_key: Optional[str] = None) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        headers = {}
        if idempotency_key and method.upper() == "POST":
            headers["Idempotency-Key"] = idempotency_key
        try:
            logger.info(f"PayStack API {method} {endpoint} - Request")
            response = self.session.request(method=method, url=url, json=data, headers=headers, timeout=30)
            logger.info(f"PayStack API {method} {endpoint} - Status: {response.status_code}")
            try:
                response_data = response.json()
            except json.JSONDecodeError:
                logger.error(f"Invalid JSON response from PayStack: {response.text[:200]}")
                raise APIError(f"Invalid response from PayStack: {response.status_code}")
            if response.status_code == 429:
                retry_after = response.headers.get('Retry-After', 60)
                logger.warning(f"Rate limited by PayStack. Retry after {retry_after}s")
                raise RateLimitError(f"Rate limited. Retry after {retry_after} seconds")
            if response.status_code == 401:
                logger.error("PayStack authentication failed - invalid secret key")
                raise AuthenticationError("Invalid PayStack secret key")
            if not response_data.get('status'):
                error_message = response_data.get('message', 'Unknown error')
                logger.error(f"PayStack API error: {error_message}")
                raise APIError(f"PayStack error: {error_message}", status_code=response.status_code, paystack_error=response_data)
            return response_data.get('data', {})
        except requests.exceptions.Timeout:
            logger.error(f"PayStack API timeout: {method} {endpoint}")
            raise APIError("Request to PayStack timed out after 30 seconds")
        except requests.exceptions.ConnectionError as e:
            logger.error(f"PayStack connection error: {str(e)}")
            raise APIError(f"Could not connect to PayStack: {str(e)}")
        except (APIError, AuthenticationError, RateLimitError):
            raise
        except Exception as e:
            logger.exception(f"Unexpected error in PayStack API call: {str(e)}")
            raise APIError(f"Unexpected error communicating with PayStack: {str(e)}")

    def initialize_transaction(self, email: str, amount: int, reference: Optional[str] = None, callback_url: Optional[str] = None, metadata: Optional[Dict] = None, channels: Optional[List[str]] = None) -> Dict[str, Any]:
        if not reference:
            reference = generate_transaction_reference('PAY')
        data = {'email': email, 'amount': amount, 'reference': reference, 'callback_url': callback_url or getattr(settings, 'PAYSTACK_CALLBACK_URL', None)}
        if metadata:
            data['metadata'] = metadata
        if channels:
            data['channels'] = channels
        try:
            response = self._request('POST', '/transaction/initialize', data=data)
            logger.info(f"Transaction initialized: {reference}")
            return response
        except Exception as e:
            logger.error(f"Failed to initialize transaction {reference}: {str(e)}")
            raise PaymentInitializationError(f"Failed to initialize payment: {str(e)}")

    def verify_transaction(self, reference: str) -> Dict[str, Any]:
        cache_key = f"paystack_txn_verify_{reference}"
        cached_response = cache.get(cache_key)
        if cached_response:
            logger.info(f"Returning cached verification for {reference}")
            return cached_response
        try:
            response = self._request('GET', f'/transaction/verify/{reference}')
            if response.get('status') == 'success':
                cache.set(cache_key, response, 300)
            return response
        except Exception as e:
            logger.error(f"Failed to verify transaction {reference}: {str(e)}")
            raise PaymentVerificationError(f"Failed to verify payment: {str(e)}")

    def get_transaction(self, transaction_id: str) -> Dict[str, Any]:
        return self._request('GET', f'/transaction/{transaction_id}')

    def create_subscription(self, customer_code: str, plan_code: str, authorization_code: Optional[str] = None) -> Dict[str, Any]:
        data = {'customer': customer_code, 'plan': plan_code}
        if authorization_code:
            data['authorization'] = authorization_code
        return self._request('POST', '/subscription', data=data)

    def list_subscriptions(self, per_page: int = 50, page: int = 1) -> Dict[str, Any]:
        return self._request('GET', f'/subscription?perPage={per_page}&page={page}')

    def get_subscription(self, subscription_code: str) -> Dict[str, Any]:
        return self._request('GET', f'/subscription/{subscription_code}')

    def enable_subscription(self, subscription_code: str, token: str) -> Dict[str, Any]:
        data = {'code': subscription_code, 'token': token}
        return self._request('POST', '/subscription/enable', data=data)

    def disable_subscription(self, subscription_code: str, token: str) -> Dict[str, Any]:
        data = {'code': subscription_code, 'token': token}
        return self._request('POST', '/subscription/disable', data=data)

    def create_plan(self, name: str, amount: int, interval: str, description: Optional[str] = None) -> Dict[str, Any]:
        data = {'name': name, 'amount': amount, 'interval': interval, 'currency': getattr(settings, 'BILLING_CURRENCY', 'KES')}
        if description:
            data['description'] = description
        return self._request('POST', '/plan', data=data)

    def list_plans(self, per_page: int = 50, page: int = 1) -> Dict[str, Any]:
        return self._request('GET', f'/plan?perPage={per_page}&page={page}')

    def get_plan(self, plan_id_or_code: str) -> Dict[str, Any]:
        return self._request('GET', f'/plan/{plan_id_or_code}')

    def create_customer(self, email: str, first_name: Optional[str] = None, last_name: Optional[str] = None, phone: Optional[str] = None) -> Dict[str, Any]:
        data = {'email': email}
        if first_name:
            data['first_name'] = first_name
        if last_name:
            data['last_name'] = last_name
        if phone:
            data['phone'] = phone
        return self._request('POST', '/customer', data=data)

    def get_customer(self, email_or_code: str) -> Dict[str, Any]:
        return self._request('GET', f'/customer/{email_or_code}')

    def list_customers(self, per_page: int = 50, page: int = 1) -> Dict[str, Any]:
        return self._request('GET', f'/customer?perPage={per_page}&page={page}')

    def create_refund(self, transaction_reference: str, amount: Optional[int] = None, currency: Optional[str] = None) -> Dict[str, Any]:
        data = {'transaction': transaction_reference}
        if amount:
            data['amount'] = amount
        if currency:
            data['currency'] = currency
        return self._request('POST', '/refund', data=data)

    def list_refunds(self, per_page: int = 50, page: int = 1) -> Dict[str, Any]:
        return self._request('GET', f'/refund?perPage={per_page}&page={page}')

    def get_banks(self, currency: str = 'NGN') -> List[Dict]:
        response = self._request('GET', f'/bank?currency={currency}')
        return response if isinstance(response, list) else []

    def resolve_account_number(self, account_number: str, bank_code: str) -> Dict[str, Any]:
        data = {'account_number': account_number, 'bank_code': bank_code}
        return self._request('POST', '/bank/resolve', data=data)

    def check_balance(self) -> Dict[str, Any]:
        return self._request('GET', '/balance')