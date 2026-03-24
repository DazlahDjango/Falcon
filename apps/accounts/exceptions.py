class AccountsException(Exception):
    default_message = 'An error occured in accounts module'
    def __init__(self, message=None, code=None, details=None):
        self.message = message or self.default_message
        self.code = code
        self.details = details or {}
        super().__init__(self.message)

class AuthenticationError(AccountsException):
    default_message = 'Authentication failed'
    code = 'AUTH_001'

class InvalidCredintialsError(AuthenticationError):
    default_message = 'Invalid email or password'
    code = 'AUTH_002'

class AccountLockedError(AuthenticationError):
    default_message = 'Account is locked due to too many failed attempts'
    code = 'AUTH_003'

class AccountInactiveError(AuthenticationError):
    default_message = 'Account is inactive. Please contact administrator'
    code = 'AUTH_004'

class AccountVerifiedError(AuthenticationError):
    default_message = 'Please verify your email address before logging in'
    code = 'AUTH_005'

class MFANotEnabledError(AuthenticationError):
    default_message = 'MFA is not enabled for this account'
    code = 'AUTH_006'

class MFARequiredError(AuthenticationError):
    default_message = 'MFA verification required.'
    code = 'AUTH_007'

class MFAInvalidError(AuthenticationError):
    default_message = 'Invalid MFA code.'
    code = 'AUTH_008'

class MFADeviceLockedError(AuthenticationError):
    default_message = 'MFA device is locked. Please try again later.'
    code = 'AUTH_009'

# Token Exceptions
class TokenError(AuthenticationError):
    default_message = 'Token error'
    code = 'TOKEN_001'

class InvalidTokenError(TokenError):
    default_message = 'Invalid or malformed token.'
    code = 'TOKEN_002'

class ExpiredTokenError(TokenError):
    default_message = 'Token has expired.'
    code = 'TOKEN_003'

class RevokedTokenError(TokenError):
    default_message = 'Token has been revoked.'
    code = 'TOKEN_004'

class MissingTokenError(TokenError):
    default_message = 'Authentication token is required.'
    code = 'TOKEN_005'

# Authorization Exceptions
class AuthorizationError(AccountsException):
    default_message = 'Authorization failed'
    code = 'AUTHZ_001'

class PermissionDeniedError(AuthorizationError):
    default_message = 'You do not have permission to perform this action.'
    code = 'AUTHZ_002'

class RoleAssignmentError(AuthorizationError):
    default_message = 'You do not have permission to assign this role.'
    code = 'AUTHZ_003'

class TenantAccessError(AuthorizationError):
    default_message = 'You do not have access to this tenant.'
    code = 'AUTHZ_004'

class ObjectAccessError(AuthorizationError):
    default_message = 'You do not have access to this object.'
    code = 'AUTHZ_005'

# User exceptions
class UserError(AccountsException):
    default_message = 'User operation failed'
    code = 'USER_001'

class UserNotFoundError(UserError):
    default_message = 'User not found.'
    code = 'USER_002'

class UserAlreadyExistsError(UserError):
    default_message = 'A user with this email already exists.'
    code = 'USER_003'

class UserCreationError(UserError):
    default_message = 'Unable to create user.'
    code = 'USER_004'

class UserUpdateError(UserError):
    default_message = 'Unable to update user.'
    code = 'USER_005'

class UserDeletionError(UserError):
    default_message = 'Unable to delete user.'
    code = 'USER_006'

class InvitationError(UserError):
    default_message = 'Invitation operation failed.'
    code = 'USER_007'

class InvitationExpiredError(InvitationError):
    default_message = 'Invitation has expired.'
    code = 'USER_008'

class InvitationInvalidError(InvitationError):
    default_message = 'Invalid invitation.'
    code = 'USER_009'


# ============================================================================
# Password Exceptions
# ============================================================================

class PasswordError(AccountsException):
    default_message = 'Password operation failed.'
    code = 'PASS_001'

class PasswordWeakError(PasswordError):
    default_message = 'Password does not meet security requirements.'
    code = 'PASS_002'

class PasswordMismatchError(PasswordError):
    default_message = 'Passwords do not match.'
    code = 'PASS_003'

class PasswordReusedError(PasswordError):
    default_message = 'You cannot reuse a previous password.'
    code = 'PASS_004'

class PasswordResetError(PasswordError):
    default_message = 'Unable to reset password.'
    code = 'PASS_005'

# Session Exceptions
class SessionError(AccountsException):
    default_message = 'Session operation failed.'
    code = 'SESSION_001'

class SessionNotFoundError(SessionError):
    default_message = 'Session not found.'
    code = 'SESSION_002'

class SessionExpiredError(SessionError):
    default_message = 'Session has expired.'
    code = 'SESSION_003'

class SessionRevokedError(SessionError):
    default_message = 'Session has been revoked.'
    code = 'SESSION_004'

# Tenant Exceptions
class TenantError(AccountsException):
    default_message = 'Tenant operation failed.'
    code = 'TENANT_001'

class TenantNotFoundError(TenantError):
    default_message = 'Tenant not found.'
    code = 'TENANT_002'

class TenantCreationError(TenantError):
    default_message = 'Unable to create tenant.'
    code = 'TENANT_003'

class TenantUpdateError(TenantError):
    default_message = 'Unable to update tenant.'
    code = 'TENANT_004'

# Rate Limit Exceptions

class RateLimitError(AccountsException):
    default_message = 'Too many requests. Please try again later.'
    code = 'RATE_001'

# Validation Exceptions
class ValidationError(AccountsException):
    default_message = 'Validation error.'
    code = 'VALID_001'

class InvalidDataError(ValidationError):
    default_message = 'Invalid data provided.'
    code = 'VALID_002'

class MissingFieldError(ValidationError):
    default_message = 'Required field is missing.'
    code = 'VALID_003'