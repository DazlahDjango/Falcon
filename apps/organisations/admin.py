"""
Django admin configuration for organisations app
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Organisation,
    Plan,
    Subscription,
    OrganisationSettings,
    Branding,
    Domain,
    Department,
    Team,
    Position,
    Hierarchy,
    Contact,
    FeatureFlag,
)


@admin.register(Organisation)
class OrganisationAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'sector', 'status', 'is_active', 'created_at']
    list_filter = ['sector', 'status', 'is_active', 'is_verified']
    search_fields = ['name', 'slug', 'contact_email', 'registration_number']
    readonly_fields = ['id', 'created_at', 'updated_at', 'suspended_at']
    prepopulated_fields = {'slug': ('name',)}
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'subdomain', 'sector', 'status', 'logo')
        }),
        ('Contact Information', {
            'fields': ('contact_email', 'contact_phone', 'website', 'address', 'city', 'country')
        }),
        ('Legal & Registration', {
            'fields': ('registration_number', 'tax_id', 'date_established', 'employee_count')
        }),
        ('Classification', {
            'fields': ('industry', 'company_size')
        }),
        ('Status', {
            'fields': ('is_active', 'is_verified', 'is_demo', 'suspended_at')
        }),
        ('Internal Notes', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'price_monthly', 'price_yearly', 'is_active', 'is_popular']
    list_filter = ['is_active', 'is_popular']
    search_fields = ['name', 'code']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['organisation', 'plan', 'status', 'start_date', 'end_date', 'auto_renew']
    list_filter = ['status', 'auto_renew']
    search_fields = ['organisation__name', 'stripe_customer_id']
    readonly_fields = ['id', 'created_at', 'updated_at', 'cancelled_at']
    
    fieldsets = (
        ('Subscription Details', {
            'fields': ('organisation', 'plan', 'status', 'plan_type')
        }),
        ('Dates', {
            'fields': ('start_date', 'end_date', 'trial_end_date', 'cancelled_at')
        }),
        ('Settings', {
            'fields': ('auto_renew', 'is_active')
        }),
        ('Billing Integration', {
            'fields': ('stripe_customer_id', 'stripe_subscription_id', 'paypal_subscription_id'),
            'classes': ('collapse',)
        }),
    )


@admin.register(OrganisationSettings)
class OrganisationSettingsAdmin(admin.ModelAdmin):
    list_display = ['organisation', 'timezone', 'language', 'currency', 'is_onboarding_complete']
    search_fields = ['organisation__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Branding', {
            'fields': ('theme_color', 'secondary_color', 'accent_color', 'logo', 'favicon')
        }),
        ('Localization', {
            'fields': ('timezone', 'language', 'currency', 'date_format')
        }),
        ('Review Cycles', {
            'fields': ('review_cycle', 'self_assessment_due_days', 'supervisor_review_due_days')
        }),
        ('Modules', {
            'fields': ('modules_enabled', 'rating_scale')
        }),
        ('Data Validation', {
            'fields': ('data_entry_deadline_day', 'auto_approve_after_days')
        }),
        ('Defaults', {
            'fields': ('fiscal_year_start', 'max_users', 'is_onboarding_complete', 'default_kpi_template')
        }),
    )


@admin.register(Branding)
class BrandingAdmin(admin.ModelAdmin):
    list_display = ['organisation', 'theme_color', 'secondary_color', 'is_white_labeled']
    list_filter = ['is_white_labeled', 'powered_by_falcon']
    search_fields = ['organisation__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Organisation', {
            'fields': ('organisation',)
        }),
        ('Visual Identity', {
            'fields': ('logo', 'favicon', 'font_family')
        }),
        ('Brand Colors', {
            'fields': ('theme_color', 'secondary_color', 'accent_color'),
            'description': 'Enter hex color codes (e.g., #3B82F6)'
        }),
        ('White Labeling', {
            'fields': ('is_white_labeled', 'powered_by_falcon', 'custom_css'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_logo_preview(self, obj):
        """Display logo preview in admin"""
        if obj.logo:
            return format_html('<img src="{}" width="50" height="50" />', obj.logo.url)
        return "No logo"
    get_logo_preview.short_description = 'Logo Preview'


@admin.register(Domain)
class DomainAdmin(admin.ModelAdmin):
    list_display = ['domain_name', 'organisation', 'is_primary']
    list_filter = ['is_primary']
    search_fields = ['domain_name', 'organisation__name']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'organisation', 'parent', 'manager']
    list_filter = ['organisation']
    search_fields = ['name', 'organisation__name']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ['name', 'department', 'team_lead']
    list_filter = ['department']
    search_fields = ['name', 'department__name', 'team_lead__email']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Team Details', {
            'fields': ('name', 'department', 'team_lead')
        }),
        ('Description', {
            'fields': ('description',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = ['title', 'department', 'code', 'is_management']
    list_filter = ['department', 'is_management']
    search_fields = ['title', 'code', 'department__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Position Details', {
            'fields': ('title', 'code', 'department', 'is_management')
        }),
        ('Job Description', {
            'fields': ('job_description',),
            'classes': ('collapse',)
        }),
        ('Reporting Structure', {
            'fields': ('reports_to',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Hierarchy)
class HierarchyAdmin(admin.ModelAdmin):
    list_display = ['employee', 'supervisor', 'level', 'organisation']
    list_filter = ['organisation', 'level']
    search_fields = ['employee__email', 'supervisor__email', 'organisation__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Reporting Relationship', {
            'fields': ('organisation', 'employee', 'supervisor', 'level')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ['name', 'organisation', 'contact_type', 'email', 'is_primary']
    list_filter = ['organisation', 'contact_type', 'is_primary']
    search_fields = ['name', 'email', 'organisation__name']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(FeatureFlag)
class FeatureFlagAdmin(admin.ModelAdmin):
    list_display = ['feature_name', 'organisation', 'is_enabled']
    list_filter = ['organisation', 'is_enabled']
    search_fields = ['feature_name', 'organisation__name']
    readonly_fields = ['id', 'created_at', 'updated_at']