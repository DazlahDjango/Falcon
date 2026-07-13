from django.contrib import admin
from .models import (
    Organization, OrganizationDomain, OrganizationSchema,
    OrganizationResource, OrganizationConnection, OrganizationMigration
)


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'subscription_tier', 'is_active', 'created_at']
    list_filter = ['subscription_tier', 'is_active', 'is_onboarded', 'status']
    search_fields = ['name', 'slug', 'contact_email']
    readonly_fields = ['id', 'created_at', 'updated_at']
    fieldsets = (
        ('Core Information', {'fields': ('name', 'slug', 'sector')}),
        ('Branding', {'fields': ('logo', 'favicon', 'primary_color', 'secondary_color')}),
        ('Subscription', {'fields': ('subscription_tier',)}),
        ('Status', {'fields': ('status', 'is_active', 'is_onboarded', 'onboarded_at')}),
        ('Contact', {'fields': ('contact_email', 'contact_phone', 'contact_address', 'website')}),
        ('Audit', {'fields': ('id', 'created_at', 'updated_at', 'deleted_at')}),
    )


@admin.register(OrganizationDomain)
class DomainAdmin(admin.ModelAdmin):
    list_display = ['domain', 'organization', 'status', 'is_primary', 'verified_at']
    list_filter = ['status', 'is_primary', 'force_https']
    search_fields = ['domain', 'organization__name']
    readonly_fields = ['verification_token', 'created_at', 'updated_at']


@admin.register(OrganizationSchema)
class SchemaAdmin(admin.ModelAdmin):
    list_display = ['organization', 'schema_name', 'status', 'is_ready', 'size_mb']
    list_filter = ['status', 'is_ready']
    search_fields = ['schema_name', 'organization__name']


@admin.register(OrganizationResource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ['organization', 'resource_type', 'current_value', 'limit_value', 'percentage_used']
    list_filter = ['resource_type']
    search_fields = ['organization__name']

    def percentage_used(self, obj):
        if obj.limit_value > 0:
            return f"{(obj.current_value / obj.limit_value) * 100:.1f}%"
        return 'N/A'
    percentage_used.short_description = 'Usage %'


@admin.register(OrganizationConnection)
class ConnectionAdmin(admin.ModelAdmin):
    list_display = ['connection_id', 'organization', 'status', 'last_used_at', 'created_at']
    list_filter = ['status']
    search_fields = ['connection_id', 'organization__name']


@admin.register(OrganizationMigration)
class MigrationAdmin(admin.ModelAdmin):
    list_display = ['organization', 'migration_name', 'app_name', 'status', 'completed_at']
    list_filter = ['status', 'app_name']
    search_fields = ['migration_name', 'organization__name']