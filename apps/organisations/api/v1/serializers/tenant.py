"""
Tenant serializers for organisations API
"""

from rest_framework import serializers
from apps.organisations.models import (
    Organisation,
    Plan,
    Subscription,
    OrganisationSettings,
    Branding,
    Domain,
    Contact,
    FeatureFlag,
)


class OrganisationSerializer(serializers.ModelSerializer):
    """Serializer for Organisation model"""
    
    class Meta:
        model = Organisation
        fields = [
            'id',
            'name',
            'slug',
            'subdomain',
            'sector',
            'status',
            'logo',
            'is_active',
            'is_verified',
            'is_demo',
            'registration_number',
            'tax_id',
            'website',
            'contact_email',
            'contact_phone',
            'address',
            'city',
            'country',
            'date_established',
            'employee_count',
            'industry',
            'company_size',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']


class PlanSerializer(serializers.ModelSerializer):
    """Serializer for Plan model"""
    yearly_discount = serializers.SerializerMethodField()
    
    class Meta:
        model = Plan
        fields = [
            'id',
            'name',
            'code',
            'description',
            'price_monthly',
            'price_yearly',
            'yearly_discount',
            'max_users',
            'max_storage_gb',
            'max_api_calls_monthly',
            'max_departments',
            'max_custom_domains',
            'features',
            'display_order',
            'is_active',
            'is_popular',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_yearly_discount(self, obj):
        return obj.get_yearly_discount_percentage()


class SubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for Subscription model"""
    organisation_name = serializers.CharField(source='organisation.name', read_only=True)
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    is_active_subscription = serializers.SerializerMethodField()
    days_until_expiry = serializers.SerializerMethodField()
    days_left_in_trial = serializers.SerializerMethodField()
    
    class Meta:
        model = Subscription
        fields = [
            'id',
            'organisation',
            'organisation_name',
            'plan',
            'plan_name',
            'status',
            'start_date',
            'end_date',
            'trial_end_date',
            'auto_renew',
            'plan_type',
            'is_active',
            'is_active_subscription',
            'days_until_expiry',
            'days_left_in_trial',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_is_active_subscription(self, obj):
        return obj.is_active_subscription()
    
    def get_days_until_expiry(self, obj):
        return obj.days_until_expiry()
    
    def get_days_left_in_trial(self, obj):
        return obj.days_left_in_trial()


class OrganisationSettingsSerializer(serializers.ModelSerializer):
    """Serializer for OrganisationSettings model"""
    
    class Meta:
        model = OrganisationSettings
        fields = [
            'id',
            'organisation',
            'logo',
            'favicon',
            'theme_color',
            'secondary_color',
            'accent_color',
            'timezone',
            'language',
            'currency',
            'date_format',
            'review_cycle',
            'self_assessment_due_days',
            'supervisor_review_due_days',
            'rating_scale',
            'modules_enabled',
            'data_entry_deadline_day',
            'auto_approve_after_days',
            'fiscal_year_start',
            'max_users',
            'is_onboarding_complete',
            'default_kpi_template',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BrandingSerializer(serializers.ModelSerializer):
    """Serializer for Branding model"""
    
    class Meta:
        model = Branding
        fields = [
            'id',
            'organisation',
            'logo',
            'favicon',
            'theme_color',
            'secondary_color',
            'accent_color',
            'custom_css',
            'font_family',
            'is_white_labeled',
            'powered_by_falcon',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class DomainSerializer(serializers.ModelSerializer):
    """Serializer for Domain model"""
    
    class Meta:
        model = Domain
        fields = [
            'id',
            'organisation',
            'domain_name',
            'is_primary',
            'verification_status',
            'verification_token',
            'ssl_status',
            'ssl_expiry_date',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'verification_token', 'created_at', 'updated_at']


class ContactSerializer(serializers.ModelSerializer):
    """Serializer for Contact model"""
    contact_type_display = serializers.CharField(source='get_contact_type_display', read_only=True)
    
    class Meta:
        model = Contact
        fields = [
            'id',
            'organisation',
            'contact_type',
            'contact_type_display',
            'name',
            'email',
            'phone',
            'position',
            'is_primary',
            'receives_notifications',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class FeatureFlagSerializer(serializers.ModelSerializer):
    """Serializer for FeatureFlag model"""
    
    class Meta:
        model = FeatureFlag
        fields = [
            'id',
            'organisation',
            'feature_name',
            'is_enabled',
            'description',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']