from .base import BaseThrottle, AnonRateThrottle, UserRateThrottle

class LoginRateThrottle(AnonRateThrottle):
    scope = 'login'

class RegisterRateThrottle(AnonRateThrottle):
    scope = 'register'

class PasswordResetRateThrottle(AnonRateThrottle):
    scope = 'password_reset'

class EmailVerificationThrottle(AnonRateThrottle):
    scope = 'email_verification'
    rate = '2/hour'

class SessionRefreshThrottle(UserRateThrottle):
    scope = 'session_refresh'
    rate = '10/minute'


class MFARateThrottle(UserRateThrottle):
    rate = '5/minute'
    scope = 'mfa'

class MFAEnrollmentThrottle(UserRateThrottle):
    scope = 'mfa_enrollment'
    rate = '3/hour'


class MFABackupCodeThrottle(UserRateThrottle):
    scope = 'mfa_backup'
    rate = '10/hour'