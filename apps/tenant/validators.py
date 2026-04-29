import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


def validate_tenant_id(value):
    """Validate tenant ID format: tenant_ followed by 12 hex characters"""
    if not value:
        raise ValidationError(_("Tenant ID cannot be empty."))
    
    if len(value) > 50:
        raise ValidationError(_("Tenant ID cannot exceed 50 characters."))
    
    if not re.match(r'^tenant_[a-f0-9]{12}$', value):
        raise ValidationError(
            _("Tenant ID must be in format 'tenant_' followed by 12 hexadecimal characters.")
        )
    
    return value


def validate_schema_name(value):
    """Validate PostgreSQL schema name format"""
    if not value:
        raise ValidationError(_("Schema name cannot be empty."))
    
    if len(value) > 63:
        raise ValidationError(_("Schema name cannot exceed 63 characters."))
    
    if not re.match(r'^[a-zA-Z][a-zA-Z0-9_]*$', value):
        raise ValidationError(
            _("Schema name must start with a letter and contain only letters, numbers, and underscores.")
        )
    
    # Reserved PostgreSQL schema names
    reserved = ['public', 'information_schema', 'pg_catalog', 'pg_temp', 'pg_toast']
    if value.lower() in reserved:
        raise ValidationError(_(f"'{value}' is a reserved schema name and cannot be used."))
    
    return value


def validate_domain(value):
    """Validate custom domain name format"""
    if not value:
        raise ValidationError(_("Domain cannot be empty."))
    
    if len(value) > 255:
        raise ValidationError(_("Domain cannot exceed 255 characters."))
    
    # Basic domain regex
    if not re.match(r'^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$', value):
        raise ValidationError(_("Please enter a valid domain name (e.g., example.com)."))
    
    # Reserved domains that cannot be used
    reserved = ['localhost', 'falcon.com', 'app.falcon.com', 'api.falcon.com', 'admin.falcon.com']
    if value.lower() in reserved:
        raise ValidationError(_(f"'{value}' is a reserved domain and cannot be used."))
    
    return value


def validate_subdomain(value):
    """Validate subdomain format (for tenant subdomains like acme.falcon.com)"""
    if not value:
        raise ValidationError(_("Subdomain cannot be empty."))
    
    if len(value) > 63:
        raise ValidationError(_("Subdomain cannot exceed 63 characters."))
    
    if not re.match(r'^[a-z0-9][a-z0-9-]*[a-z0-9]$', value):
        raise ValidationError(
            _("Subdomain must contain only lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen.")
        )
    
    return value


def validate_backup_name(value):
    """Validate backup name format"""
    if not value:
        raise ValidationError(_("Backup name cannot be empty."))
    
    if len(value) > 255:
        raise ValidationError(_("Backup name cannot exceed 255 characters."))
    
    if not re.match(r'^[a-zA-Z0-9][a-zA-Z0-9\s\-_\.]*$', value):
        raise ValidationError(
            _("Backup name can only contain letters, numbers, spaces, hyphens, underscores, and dots.")
        )
    
    return value


def validate_connection_string(value):
    """Validate database connection string format"""
    if not value:
        return value
    
    # PostgreSQL connection string pattern
    # postgresql://user:password@host:port/database
    pattern = r'^postgresql://[^:]+:[^@]+@[^:]+:\d+/[^?]+'
    
    if not re.match(pattern, value):
        raise ValidationError(
            _("Connection string must be in format: postgresql://user:password@host:port/database")
        )
    
    return value