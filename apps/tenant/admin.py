from django.contrib import admin
from .models import (Client, CustomDomain, TenantBackup,
                     TenantSchema, TenantResource, ConnectionPool, TenantMigration,)


@admin.register(Client)
class TenantAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug',
                    'subscription_plan', 'is_active', 'created_at']
    list_filter = ['subscription_plan', 'is_active', 'is_verified']
    search_fields = ['name', 'slug', 'domain', 'contact_email']
    readonly_fields = ['id', 'created_at', 'updated_at']
    fieldsets = (
        ('Core Information', {'fields': ('name', 'slug', 'domain')}),
        ('Branding', {'fields': ('logo', 'favicon',
         'primary_color', 'secondary_color')}),
        ('Subscription', {
         'fields': ('subscription_plan', 'subscription_expires_at')}),
        ('Status', {'fields': ('is_active', 'is_verified')}),
        ('Contact', {'fields': ('contact_email',
         'contact_phone', 'address', 'city', 'country')}),
        ('Audit', {'fields': ('id', 'created_at', 'updated_at', 'deleted_at')}),
    )


@admin.register(CustomDomain)
class DomainAdmin(admin.ModelAdmin):
    list_display = ['domain', 'tenant', 'status', 'is_primary', 'verified_at']
    list_filter = ['status', 'is_primary', 'force_https']
    search_fields = ['domain', 'tenant__name']
    readonly_fields = ['verification_token', 'created_at', 'updated_at']


@admin.register(TenantBackup)
class BackupAdmin(admin.ModelAdmin):
    list_display = ['tenant', 'backup_type',
                    'status', 'file_size_mb', 'created_at']
    list_filter = ['status', 'backup_type']
    search_fields = ['tenant__name']
    readonly_fields = ['started_at', 'completed_at', 'created_at']


@admin.register(TenantSchema)
class SchemaAdmin(admin.ModelAdmin):
    list_display = ['tenant', 'schema_name', 'status', 'is_ready', 'size_mb']
    list_filter = ['status', 'is_ready']
    search_fields = ['schema_name', 'tenant__name']


@admin.register(TenantResource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ['tenant', 'resource_type',
                    'current_value', 'limit_value', 'percentage_used']
    list_filter = ['resource_type']
    search_fields = ['tenant__name']

    def percentage_used(self, obj):
        if obj.limit_value > 0:
            return f"{(obj.current_value / obj.limit_value) * 100:.1f}%"
        return 'N/A'
    percentage_used.short_description = 'Usage %'


@admin.register(ConnectionPool)
class ConnectionAdmin(admin.ModelAdmin):
    list_display = ['connection_id', 'tenant',
                    'status', 'last_used_at', 'created_at']
    list_filter = ['status']
    search_fields = ['connection_id', 'tenant__name']


@admin.register(TenantMigration)
class MigrationAdmin(admin.ModelAdmin):
    list_display = ['tenant', 'migration_name',
                    'app_name', 'status', 'completed_at']
    list_filter = ['status', 'app_name']
    search_fields = ['migration_name', 'tenant__name']
