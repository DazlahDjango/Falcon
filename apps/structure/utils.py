from django.utils import timezone
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from .constants import CACHE_KEY_ORG_TREE, CACHE_KEY_EMPLOYMENT_CURRENT, DEFAULT_MAX_CACHE_TTL_SECONDS, MAX_ORG_DEPTH, LEVEL_ORDER, PARENT_LEVEL_MAP
import hashlib
import json
from decimal import Decimal, ROUND_HALF_UP

def generate_path(parent_path, code, separator='/'):
    if parent_path:
        return f"{parent_path}{separator}{code}"
    return code

def calculate_depth(parent_depth):
    return parent_depth + 1 if parent_depth is not None else 0

def get_path_parts(path, separator='/'):
    return path.split(separator) if path else []

def get_path_depth(path, separator='/'):
    return len(get_path_parts(path, separator))

def compute_snapshot_hash(snapshot_data):
    normalized = json.dumps(snapshot_data, sort_keys=True, default=str)
    return hashlib.sha256(normalized.encode()).hexdigest()

def cache_org_tree(tenant_id, tree_data, ttl=DEFAULT_MAX_CACHE_TTL_SECONDS):
    cache_key = CACHE_KEY_ORG_TREE.format(tenant_id=tenant_id)
    cache.set(cache_key, tree_data, ttl)

def get_cached_org_tree(tenant_id):
    cache_key = CACHE_KEY_ORG_TREE.format(tenant_id=tenant_id)
    return cache.get(cache_key)

def invalidate_tenant_cache(tenant_id, pattern='structure:*'):
    from django.core.cache import caches
    if pattern == '*':
        caches['default'].clear()
    else:
        pass

def cache_current_employment(tenant_id, user_id, employment_data, ttl=DEFAULT_MAX_CACHE_TTL_SECONDS):
    cache_key = CACHE_KEY_EMPLOYMENT_CURRENT.format(tenant_id=tenant_id, user_id=user_id)
    cache.set(cache_key, employment_data, ttl)

def get_cached_current_employment(tenant_id, user_id):
    cache_key = CACHE_KEY_EMPLOYMENT_CURRENT.format(tenant_id=tenant_id, user_id=user_id)
    return cache.get(cache_key)

def format_budget_amount(amount, currency='KES'):
    if amount is None:
        return f"{currency} 0.00"
    return f"{currency} {amount:,.2f}"

def calculate_allocation_percentage(current_total, new_amount, total_budget):
    if total_budget <= 0:
        return 0
    return (current_total + new_amount) / total_budget * 100

def is_hierarchy_valid(parent_id, child_id, get_parent_func):
    if parent_id == child_id:
        return False
    current = get_parent_func(parent_id)
    while current:
        if current.id == child_id:
            return False
        current = get_parent_func(current.id)
    return True

def truncate_path(path, max_length=255, separator='/'):
    if len(path) <= max_length:
        return path
    parts = path.split(separator)
    truncated = parts[-1]
    for part in reversed(parts[:-1]):
        candidate = f"{part}{separator}{truncated}"
        if len(candidate) > max_length:
            break
        truncated = candidate
    return truncated

def safe_decimal(value, default=Decimal('0.00')):
    try:
        return Decimal(str(value)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    except (ValueError, TypeError, Decimal.InvalidOperation):
        return default

def get_current_fiscal_year():
    today = timezone.now().date()
    if today.month >= 7:
        return today.year
    return today.year - 1

def generate_employee_id(prefix, sequence, padding=4):
    return f"{prefix}-{str(sequence).zfill(padding)}"

def extract_tenant_from_request(request):
    if hasattr(request, 'META'):
        tenant_id = request.META.get('HTTP_X_TENANT_ID')
        if tenant_id:
            return tenant_id
    if hasattr(request, 'user') and hasattr(request.user, 'tenant_id'):
        return request.user.tenant_id
    return None

def validate_tenant_access(tenant_id, user_tenant_id):
    if str(tenant_id) != str(user_tenant_id):
        raise ValidationError(_("Access denied: cross-tenant operation not permitted."))
    return True

def format_hierarchy_diff(diff_result):
    if not diff_result:
        return "No changes detected."
    output = []
    if 'values_changed' in diff_result:
        output.append(f"Values changed: {len(diff_result['values_changed'])} items")
    if 'iterable_item_added' in diff_result:
        output.append(f"Items added: {len(diff_result['iterable_item_added'])} items")
    if 'iterable_item_removed' in diff_result:
        output.append(f"Items removed: {len(diff_result['iterable_item_removed'])} items")
    if 'dictionary_item_added' in diff_result:
        output.append(f"Dict items added: {len(diff_result['dictionary_item_added'])} items")
    if 'dictionary_item_removed' in diff_result:
        output.append(f"Dict items removed: {len(diff_result['dictionary_item_removed'])} items")
    return '\n'.join(output)

def chunk_list(input_list, chunk_size=500):
    for i in range(0, len(input_list), chunk_size):
        yield input_list[i:i + chunk_size]

def get_redis_connection():
    """
    Get Redis connection if available, otherwise return None.
    This handles cases where cache backend is not Redis.
    """
    try:
        from django.core.cache import caches
        cache = caches['default']
        # Check if the cache backend has a client attribute with get_client method
        if hasattr(cache, 'client'):
            if hasattr(cache.client, 'get_client'):
                return cache.client.get_client()
            # Some Redis backends expose the client directly
            elif hasattr(cache.client, 'connection_pool'):
                return cache.client
        return None
    except Exception:
        return None

def publish_org_change(tenant_id, change_type, data):
    """
    Publish organization change event to Redis if available.
    If Redis is not available, log the event instead.
    """
    redis_client = get_redis_connection()
    if redis_client:
        try:
            channel = f"org_changes:{tenant_id}"
            message = json.dumps({
                'type': change_type,
                'data': data,
                'timestamp': timezone.now().isoformat(),
            })
            redis_client.publish(channel, message)
        except Exception as e:
            # Log the error but don't crash
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Failed to publish event to Redis: {e}")
    else:
        # Redis not available, log the event
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"EVENT (simulated): tenant={tenant_id}, type={change_type}, data={data}")

def get_level_order(level):
    return LEVEL_ORDER.get(level, 99)

def is_higher_level(level1, level2):
    return get_level_order(level1) < get_level_order(level2)

def is_lower_level(level1, level2):
    return get_level_order(level1) > get_level_order(level2)

def get_org_level_from_depth(depth):
    from apps.structure.enums.org_level import OrgLevel
    level_map = {
        0: OrgLevel.DIVISION,
        1: OrgLevel.DEPARTMENT,
        2: OrgLevel.SECTION,
        3: OrgLevel.UNIT,
    }
    return level_map.get(depth)

def is_valid_org_level(level):
    from apps.structure.enums.org_level import OrgLevel
    return level in [choice[0] for choice in OrgLevel.choices]

def build_path_from_ancestors(ancestors, code):
    path_parts = [a.code for a in ancestors] + [code]
    return '/'.join(path_parts)

def validate_org_structure(tenant_id):
    from apps.structure.models.organizational_unit import OrganizationalUnit
    units = OrganizationalUnit.objects.filter(tenant_id=tenant_id, is_deleted=False)
    for unit in units:
        if unit.parent and unit.parent.level != PARENT_LEVEL_MAP.get(unit.level):
            return False
        if unit.depth != unit.parent.depth + 1 if unit.parent else 0:
            return False
        expected_path = build_path_from_ancestors(unit.get_ancestors(), unit.code)
        if unit.path != expected_path:
            return False
    return True