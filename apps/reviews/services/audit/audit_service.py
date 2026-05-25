import logging
from typing import Any, Dict, Optional
from apps.reviews.models.audit_log import ReviewAuditLog
from apps.reviews.services.settings import ReviewsSettingsService
from apps.reviews.services.security.integrity import IntegrityService

logger = logging.getLogger(__name__)

class ReviewAuditService:
    @classmethod
    def is_enabled(cls) -> bool:
        return ReviewsSettingsService.get_section('security').get('audit_trail_enabled', True)
    @classmethod
    def log(
        cls,
        *,
        model_name: str,
        object_id: str,
        action: str,
        tenant_id=None,
        actor_id=None,
        changes: Optional[Dict[str, Any]] = None,
        instance=None,
        checksum_fields: Optional[list] = None,
        request=None,
    ) -> Optional[ReviewAuditLog]:
        if not cls.is_enabled():
            return None
        checksum_before = ''
        checksum_after = ''
        if instance and checksum_fields:
            checksum_after = IntegrityService.checksum_for_instance(instance, checksum_fields)
        ip_address = None
        user_agent = ''
        if request:
            ip_address = request.META.get('REMOTE_ADDR')
            user_agent = (request.META.get('HTTP_USER_AGENT') or '')[:512]
        try:
            return ReviewAuditLog.objects.create(
                tenant_id=tenant_id,
                model_name=model_name,
                object_id=str(object_id),
                action=action,
                actor_id=actor_id,
                changes=changes or {},
                checksum_before=checksum_before,
                checksum_after=checksum_after,
                ip_address=ip_address,
                user_agent=user_agent,
            )
        except Exception as exc:
            logger.error('Failed to write review audit log: %s', exc)
            return None
