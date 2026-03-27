from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from apps.core.models import Client
from .base import DynamicFieldsModelSerializer, AuditSerializer


class TenantMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id', 'name', 'slug']

class TenantListSerializer(DynamicFieldsModelSerializer, AuditSerializer):
    user_count = serializers.SerializerMethodField()
    class Meta:
        model = Client
        fields = [
            'id', 'name', 'slug', 'domain', 'is_active', 'subscription_plan',
            'user_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    def get_user_count(self, obj):
        from apps.accounts.models import User
        return User.objects.filter(tenant_id=obj.id, is_deleted=False).count()

class TenantDetailSerializer(TenantListSerializer):
    features = serializers.SerializerMethodField()
    class Meta(TenantListSerializer.Meta):
        fields = TenantListSerializer.Meta.fields + ['features', 'settings', 'branding']
    def get_features(self, obj):
        from apps.accounts.models import TenantPreference
        pref = TenantPreference.objects.filter(client_id=obj.id).first()
        return pref.features if pref else {}

class TenantCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['name', 'slug', 'domain', 'subscription_plan', 'settings', 'branding']
    def validate_slug(self, value):
        if Client.objects.filter(slug=value).exists():
            raise serializers.ValidationError(_('A tenant with this slug already exists.'))
        return value

class TenantUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['name', 'domain', 'is_active', 'settings', 'branding']

class TenantSerializer(DynamicFieldsModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']