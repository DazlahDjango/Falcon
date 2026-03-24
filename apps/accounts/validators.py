import re
from typing import List, Tuple
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.utils.deconstruct import deconstructible
from .constants import DEFAULT_PASSWORD_MIN_LENGTH

# Password Validators
@deconstructible
class UppercaseValidator:
    code = 'password_no_upper'
    def validate(self, password, user=None):
        if not re.search(r'[A-Z]', password):
            raise ValidationError(
                _('Password must contain at least one uppercase letter.'),
                code=self.code
            )
    def get_help_text(self):
        return _('Your password must contain at least one uppercase letter.')

@deconstructible
class LowercaseValidator:
    code = 'password_no_lower'
    def validate(self, password, user=None):
        if not re.search(r'[a-z]', password):
            raise ValidationError(
                _('Password must contain at least one lowercase letter.'),
                code=self.code
            )
    def get_help_text(self):
        return _('Your password must contain at least one lowercase letter.')

@deconstructible
class NumberValidator:
    code = 'password_no_number'
    def validate(self, password, user=None):
        if not re.search(r'[0-9]', password):
            raise ValidationError(
                _('Password must contain at least one number.'),
                code=self.code
            )
    def get_help_text(self):
        return _('Your password must contain at least one number.')

@deconstructible
class SpecialCharacterValidator:
    code = 'password_no_special'
    special_chars = r'!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?'
    def validate(self, password, user=None):
        if not re.search(rf'[{re.escape(self.special_chars)}]', password):
            raise ValidationError(
                _('Password must contain at least one special character.'),
                code=self.code
            )
    def get_help_text(self):
        return _('Your password must contain at least one special character.')

@deconstructible
class MinimumLengthValidator:
    code = 'password_too_short'
    def __init__(self, min_length=DEFAULT_PASSWORD_MIN_LENGTH):
        self.min_length = min_length
    def validate(self, password, user=None):
        if len(password) < self.min_length:
            raise ValidationError(
                _(f'Password must be at least {self.min_length} characters long.'),
                code=self.code
            )
    def get_help_text(self):
        return _(f'Your password must be at least {self.min_length} characters long.')

@deconstructible
class CommonPasswordValidator:
    code = 'password_too_common'
    COMMON_PASSWORDS = {
        'password', '123456', '12345678', 'qwerty', 'abc123',
        'monkey', 'letmein', 'dragon', 'baseball', 'football',
        'admin', 'welcome', 'login', 'password123', 'admin123'
    }
    def validate(self, password, user=None):
        if password.lower() in self.COMMON_PASSWORDS:
            raise ValidationError(
                _('Password is too common. Please choose a more secure password.'),
                code=self.code
            )
    def get_help_text(self):
        return _('Your password cannot be a common password.')

# Email Validators
@deconstructible
class DomainAllowedValidator:
    code = 'email_domain_not_allowed'
    def __init__(self, allowed_domains=None, blocked_domains=None):
        self.allowed_domains = allowed_domains or []
        self.blocked_domains = blocked_domains or ['tempmail.com', '10minutemail.com']
    
    def validate(self, email, user=None):
        domain = email.split('@')[-1].lower()
        if self.allowed_domains and domain not in self.allowed_domains:
            raise ValidationError(
                _('Email domain is not allowed.'),
                code=self.code
            )
        if domain in self.blocked_domains:
            raise ValidationError(
                _('Email domain is not allowed.'),
                code=self.code
            )
    def get_help_text(self):
        return _('Email must be from an allowed domain.')

# Phone Validators
# ============================================================================

@deconstructible
class PhoneNumberValidator:
    """Validate phone number format."""
    code = 'invalid_phone'
    
    def __init__(self, country_code=None):
        self.country_code = country_code
    
    def validate(self, phone, user=None):
        # Basic phone validation - E.164 format or local
        pattern = r'^\+?[1-9]\d{1,14}$'
        if not re.match(pattern, phone.replace(' ', '').replace('-', '')):
            raise ValidationError(
                _('Invalid phone number format.'),
                code=self.code
            )
    
    def get_help_text(self):
        return _('Enter a valid phone number (E.164 format recommended).')


# ============================================================================
# Username Validators
# ============================================================================

@deconstructible
class UsernameValidator:
    """Validate username format."""
    code = 'invalid_username'
    
    def __init__(self, min_length=3, max_length=150):
        self.min_length = min_length
        self.max_length = max_length
    
    def validate(self, username, user=None):
        if len(username) < self.min_length:
            raise ValidationError(
                _(f'Username must be at least {self.min_length} characters long.'),
                code=self.code
            )
        
        if len(username) > self.max_length:
            raise ValidationError(
                _(f'Username cannot exceed {self.max_length} characters.'),
                code=self.code
            )
        
        if not re.match(r'^[\w.@+-]+\Z', username):
            raise ValidationError(
                _('Username can only contain letters, numbers, and @/./+/-/_ characters.'),
                code=self.code
            )
    
    def get_help_text(self):
        return _('Username can only contain letters, numbers, and @/./+/-/_ characters.')


# ============================================================================
# Role Validators
# ============================================================================

@deconstructible
class RoleAssignmentValidator:
    """Validate role assignment permissions."""
    code = 'role_assignment_denied'
    
    def __init__(self, assigner_role):
        self.assigner_role = assigner_role
    
    def validate(self, target_role, user=None):
        from .constants import UserRoles
        
        if self.assigner_role == UserRoles.SUPER_ADMIN:
            return
        
        if self.assigner_role == UserRoles.CLIENT_ADMIN:
            if target_role == UserRoles.SUPER_ADMIN:
                raise ValidationError(
                    _('Cannot assign Super Admin role.'),
                    code=self.code
                )
            return
        
        if self.assigner_role == UserRoles.EXECUTIVE:
            if target_role not in [UserRoles.EXECUTIVE, UserRoles.SUPERVISOR, UserRoles.DASHBOARD_CHAMPION, UserRoles.STAFF, UserRoles.READ_ONLY]:
                raise ValidationError(
                    _('You cannot assign this role.'),
                    code=self.code
                )
            return
        
        if self.assigner_role == UserRoles.SUPERVISOR:
            if target_role not in [UserRoles.STAFF, UserRoles.READ_ONLY]:
                raise ValidationError(
                    _('You can only assign Staff or Read Only roles.'),
                    code=self.code
                )
            return
        
        raise ValidationError(
            _('You do not have permission to assign roles.'),
            code=self.code
        )
    
    def get_help_text(self):
        return _('Role assignment is restricted based on your permissions.')


# ============================================================================
# Utility Functions
# ============================================================================

def validate_password_strength(password: str) -> Tuple[bool, List[str]]:
    """
    Validate password against all security requirements.
    Returns (is_valid, errors).
    """
    errors = []
    
    validators = [
        MinimumLengthValidator(),
        UppercaseValidator(),
        LowercaseValidator(),
        NumberValidator(),
        SpecialCharacterValidator(),
        CommonPasswordValidator(),
    ]
    
    for validator in validators:
        try:
            validator.validate(password)
        except ValidationError as e:
            errors.extend(e.messages)
    
    return len(errors) == 0, errors


def validate_email_domain(email: str, allowed_domains: List[str] = None) -> Tuple[bool, str]:
    """
    Validate email domain against allowed/blocked list.
    Returns (is_valid, error_message).
    """
    try:
        validator = DomainAllowedValidator(allowed_domains=allowed_domains)
        validator.validate(email)
        return True, ''
    except ValidationError as e:
        return False, e.messages[0] if e.messages else 'Invalid email domain.'


def validate_phone_number(phone: str) -> Tuple[bool, str]:
    """
    Validate phone number format.
    Returns (is_valid, error_message).
    """
    try:
        validator = PhoneNumberValidator()
        validator.validate(phone)
        return True, ''
    except ValidationError as e:
        return False, e.messages[0] if e.messages else 'Invalid phone number.'


def validate_username(username: str) -> Tuple[bool, str]:
    """
    Validate username format.
    Returns (is_valid, error_message).
    """
    try:
        validator = UsernameValidator()
        validator.validate(username)
        return True, ''
    except ValidationError as e:
        return False, e.messages[0] if e.messages else 'Invalid username.'