# billing/utils/idempotency.py
"""
Idempotency utilities for preventing duplicate operations.
"""
import hashlib
import uuid
from django.core.cache import cache
from django.utils import timezone


def generate_idempotency_key(prefix: str = '', *args, **kwargs) -> str:
    """Generate a unique idempotency key."""
    # Combine all arguments into a string
    key_parts = [prefix]
    key_parts.extend(str(arg) for arg in args)
    key_parts.extend(f"{k}={v}" for k, v in sorted(kwargs.items()))
    
    combined = '|'.join(key_parts)
    
    # Create hash
    hash_obj = hashlib.sha256(combined.encode())
    return f"idem_{hash_obj.hexdigest()[:32]}"


def validate_idempotency_key(key: str, timeout: int = 3600) -> bool:
    """
    Validate and mark idempotency key as used.
    
    Returns:
        bool: True if key is new (not used before), False if already used
    """
    cache_key = f"idempotency:{key}"
    
    # Check if key exists
    if cache.get(cache_key):
        return False
    
    # Store key with expiry
    cache.set(cache_key, timezone.now().isoformat(), timeout)
    return True


def generate_transaction_id(prefix: str = 'TXN') -> str:
    """Generate a unique transaction ID."""
    timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
    unique_part = str(uuid.uuid4().hex)[:8].upper()
    return f"{prefix}-{timestamp}-{unique_part}"