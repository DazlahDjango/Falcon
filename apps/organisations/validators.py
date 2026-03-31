"""
Validators for organisations app
"""

import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


def validate_subdomain(value):
    """
    Validate subdomain format
    - Only lowercase letters, numbers, and hyphens
    - Cannot start or end with hyphen
    - Cannot have consecutive hyphens
    """
    if not value:
        raise ValidationError(_('Subdomain cannot be empty'))
    
    # Check length
    if len(value) < 3:
        raise ValidationError(_('Subdomain must be at least 3 characters long'))
    
    if len(value) > 63:
        raise ValidationError(_('Subdomain cannot exceed 63 characters'))
    
    # Check pattern: lowercase letters, numbers, hyphens
    pattern = r'^[a-z0-9]([a-z0-9-]*[a-z0-9])?$'
    if not re.match(pattern, value):
        raise ValidationError(
            _('Subdomain can only contain lowercase letters, numbers, and hyphens. '
              'Cannot start or end with a hyphen.')
        )
    
    # Check for consecutive hyphens
    if '--' in value:
        raise ValidationError(_('Subdomain cannot contain consecutive hyphens'))


def validate_domain_name(value):
    """
    Validate domain name format
    """
    if not value:
        raise ValidationError(_('Domain name cannot be empty'))
    
    # Simple domain validation
    pattern = r'^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$'
    if not re.match(pattern, value):
        raise ValidationError(_('Invalid domain name format'))
    
    # Check length
    if len(value) > 253:
        raise ValidationError(_('Domain name cannot exceed 253 characters'))


def validate_organisation_slug(value):
    """
    Validate organisation slug for URLs
    """
    if not value:
        raise ValidationError(_('Slug cannot be empty'))
    
    pattern = r'^[a-z0-9]+(-[a-z0-9]+)*$'
    if not re.match(pattern, value):
        raise ValidationError(
            _('Slug can only contain lowercase letters, numbers, and hyphens. '
              'Must start and end with a letter or number.')
        )