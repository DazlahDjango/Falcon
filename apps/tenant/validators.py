import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


def validate_organization_id(value):
    if not value:
        raise ValidationError(_("Organization ID cannot be empty."))
    if len(value) > 50:
        raise ValidationError(_("Organization ID cannot exceed 50 characters."))
    if not re.match(r'^org_[a-f0-9]{12}$', value):
        raise ValidationError(_("Organization ID must be in format 'org_' followed by 12 hexadecimal characters."))
    return value


def validate_schema_name(value):
    if not value:
        raise ValidationError(_("Schema name cannot be empty."))
    if len(value) > 63:
        raise ValidationError(_("Schema name cannot exceed 63 characters."))
    if not re.match(r'^[a-zA-Z][a-zA-Z0-9_]*$', value):
        raise ValidationError(_("Schema name must start with a letter and contain only letters, numbers, and underscores."))
    reserved = ['public', 'information_schema', 'pg_catalog', 'pg_temp', 'pg_toast']
    if value.lower() in reserved:
        raise ValidationError(_(f"'{value}' is a reserved schema name."))
    return value


def validate_domain(value):
    if not value:
        raise ValidationError(_("Domain cannot be empty."))
    if len(value) > 255:
        raise ValidationError(_("Domain cannot exceed 255 characters."))
    if not re.match(r'^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$', value):
        raise ValidationError(_("Please enter a valid domain name."))
    reserved = ['localhost', 'falcon.com', 'app.falcon.com', 'api.falcon.com']
    if value.lower() in reserved:
        raise ValidationError(_(f"'{value}' is a reserved domain."))
    return value


def validate_subdomain(value):
    if not value:
        raise ValidationError(_("Subdomain cannot be empty."))
    if len(value) > 63:
        raise ValidationError(_("Subdomain cannot exceed 63 characters."))
    if not re.match(r'^[a-z0-9][a-z0-9-]*[a-z0-9]$', value):
        raise ValidationError(_("Subdomain must contain only lowercase letters, numbers, and hyphens."))
    return value