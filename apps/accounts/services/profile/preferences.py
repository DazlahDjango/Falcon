import logging
from typing import Optional, Dict, Any, List, Tuple
from django.conf import settings
from apps.accounts.models import UserPreference, TenantPreference
from apps.accounts.services.audit.logger import AuditService
logger = logging.getLogger(__name__)

class PreferenceService:
    def __init__(self):
        self.audit_service = AuditService()
    
    def get_user_preferences(self, user) -> UserPreference:
        preferences, _ = UserPreference.objects.get_or_create(
            user=user,
            defaults={'tenant_id': user.tenant_id}
        )
        return preferences
    
    def update_user_preferences(self, user, data: Dict[str, Any], request=None) -> Tuple[bool, str]:
        try:
            preferences = self.get_user_preferences(user)
            allowed_fields = [
                'items_per_page', 'default_dashboard', 'collapsed_sidebar',
                'public_profile', 'show_email', 'show_phone',
                'work_start_time', 'work_end_time', 'working_days'
            ]
            for field in allowed_fields:
                if field in data:
                    setattr(preferences, field, data[field])
            # Update notification
            if 'notification_settings' in data:
                current = preferences.notification_settings or {}
                current.update(data['notification_settings'])
                preferences.notification_settings = current
            if 'dashboard_preferences' in data:
                current = preferences.dashboard_preferences or {}
                current.update(data['dashboard_preferences'])
                preferences.dashboard_preferences = current
            preferences.save()
            self.audit_service.log(
                user=user, action='preferences.updated', action_type='update',
                request=request, severity='info'
            )
            return True, 'Preferences updated successfully'
        except Exception as e:
            logger.error(f"Update user preferences error: {str(e)}")
            return False, 'Unable to update preferences'
        
    def update_notification_settings(self, user, event_type: str, channels: List[str], request=None) -> Tuple[bool, str]:
        try:
            preferences = self.get_user_preferences(user)
            settings = preferences.notification_settings or {}
            settings['event_type'] = channels
            preferences.notification_settings = settings
            preferences.save(update_fields=['notification_settings'])
            self.audit_service.log(
                user=user, action='preferences.notifications_updated', action_type='update',
                request=request, severity='info',
                metadata={'event_type': event_type, 'channels': channels}
            )
            return True, 'Notification settings updated'
        except Exception as e:
            logger.error(f"Update notification settings error: {str()}")
            return False, 'Unable to update notifications settings'
        
    def get_notification_channels(self, user, event_type: str) -> List[str]:
        preferences = self.get_user_preferences(user)
        return preferences.get_notification_channel(event_type)
    
    def should_notify(self, user, event_type: str, channel: str) -> bool:
        preferences = self.get_user_preferences(user)
        return preferences.should_notify(event_type, channel)
    
    def get_tenant_preferences(self, client_id: str) -> TenantPreference:
        preferences, _ = TenantPreference.objects.get_or_create(
            client_id=client_id,
            defaults={'tenant_id': client_id}
        )
        return preferences
    
    def update_tenant_preferences(self, client_id: str, data: Dict[str, Any], user=None, request=None) -> Tuple[bool, str]:
        try:
            preferences = self.get_tenant_preferences(client_id)
            allowed_fields = [
                'logo_url', 'favicon_url', 'primary_color', 'secondary_color',
                'default_language', 'available_languages', 'default_timezone',
                'audit_log_retention_days', 'session_retention_days',
                'api_rate_limit', 'webhook_url', 'mfa_required_roles'
            ]
            for field in allowed_fields:
                if field in data:
                    setattr(preferences, field, data[field])
            if 'features' in data:
                current = preferences.features or {}
                current.update(data['features'])
                preferences.features = current
            if 'review_cycles' in data:
                current = preferences.review_cycles or {}
                current.update(data['review_cycles'])
                preferences.review_cycles = current
            preferences.save()
            if user:
                self.audit_service.log(
                    user=user, action='tenant.preferences_updated', action_type='update',
                    request=request, severity='info',
                    metadata={'client_id': client_id}
                )
            return True, 'Tenant preferences updated.'
        except Exception as e:
            logger.error(f"Update tenant preferences error: {str(e)}")
            return False, 'Unable to update tenant preferences.'
    
    def update_branding(self, client_id: str, logo_url: str = None, favicon_url: str = None, primary_color: str = None, secondary_color: str = None, user=None, request=None) -> Tuple[bool, str]:
        try:
            preferences = self.get_tenant_preferences(client_id)
            if logo_url:
                preferences.logo_url = logo_url
            if favicon_url:
                preferences.favicon_url = favicon_url
            if primary_color:
                preferences.primary_color = primary_color
            if secondary_color:
                preferences.secondary_color = secondary_color
            preferences.save(update_fields=['logo_url', 'favicon_url', 'primary_color', 'secondary_color'])
            if user:
                self.audit_service.log(
                    user=user, action='tenant.branding_updated', action_type='update',
                    request=request, severity='info',
                    metadata={'client_id': client_id}
                )
            return True, 'Branding updated successfully.'
        except Exception as e:
            logger.error(f"Update branding error: {str(e)}")
            return False, 'Unable to update branding.'
    
    def is_feature_enabled(self, client_id: str, feature_name: str) -> bool:
        preferences = self.get_tenant_preferences(client_id)
        return preferences.is_feature_enabled(feature_name)
    
    def requires_mfa(self, client_id: str, role: str) -> bool:
        preferences = self.get_tenant_preferences(client_id)
        return preferences.requires_mfa(role)