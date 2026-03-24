from .base import SoftDeleteManager, TenantAwareQuerySet

class UserPreferenceQuerySet(TenantAwareQuerySet):
    def for_user(self, user_id):
        return self.filter(user_id=user_id)
    def with_notification_channel(self, event_type, channel):
        return self.filter(notification_settings__contains={event_type: [channel]})
    
class UserPreferenceManager(SoftDeleteManager):
    def get_queryset(self):
        return UserPreferenceQuerySet(self.model, using=self._db)
    def get_or_create_preferences(self, user):
        preferences, created = self.get_or_create(
            user=user,
            defaults={'tenant_id': user.tenant_id}
        )
        return preferences
    def update_notification_settings(self, user, event_type, channels):
        preferences = self.get_or_create_preferences(user)
        settings = preferences.notification_settings
        settings[event_type] = channels
        preferences.save(updated_fields=['notification_settings'])
        return preferences
    def get_notification_channels(self, user, event_type):
        preferences = self.get_or_create_preferences(user)
        return preferences.get_notification_channels(event_type)
    def should_notify(self, user, event_type, channel):
        preferences = self.get_or_create_preferences(user)
        return preferences.should_notify(event_type, channel)
    
class TenantPreferenceQuerySet(TenantAwareQuerySet):
    def for_client(self, client_id):
        return self.filter(client_id=client_id)
    def with_feature(self, feature_name):
        return self.filter(features__contains={feature_name: True})
    
class TenantPreferencesManager(SoftDeleteManager):
    def get_queryset(self):
        return TenantPreferenceQuerySet(self.model, using=self._db)
    def get_or_create_preferences(self, client_id):
        preferences, created = self.get_or_create(
            client_id=client_id,
            defaults={'tenant_id': client_id}
        )
        return preferences
    def is_feature_enabled(self, client_id, feature_name):
        preferences = self.get_or_create_preferences(client_id)
        return preferences.is_feature_enabled(feature_name)
    def update_features(self, client_id, features):
        preferences = self.get_or_create_preferences(client_id)
        current_features = preferences.features
        current_features.update(features)
        preferences.features = current_features
        preferences.save(updated_fields=['features'])
    def update_branding(self, client_id, logo_url=None, primary_color=None, secondary_color=None):
        preferences = self.get_or_create_preferences(client_id)
        if logo_url:
            preferences.logo_url = logo_url
        if primary_color:
            preferences.primary_color = primary_color
        if secondary_color:
            preferences.secondary_color = secondary_color
        preferences.save(update_fields=['logo_url', 'primary_color', 'secondary_color'])
        return preferences
    def requires_mfa(self, client_id, role):
        preferences = self.get_or_create_preferences(client_id)
        return preferences.requires_mfa(role)
