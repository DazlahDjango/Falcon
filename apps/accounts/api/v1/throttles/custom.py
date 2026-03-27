from .base import UserRateThrottle, AnonRateThrottle

class SensitiveEndpointThrottle(UserRateThrottle):
    scope = 'sensitive'

class AdminEndpointThrottle(UserRateThrottle):
    scope = 'admin'

class BulkOperationThrottle(UserRateThrottle):
    scope = 'bulk'
    rate = '5/hour'


class ReportGenerationThrottle(UserRateThrottle):
    scope = 'report'
    rate = '10/hour'

class UserCreationThrottle(AnonRateThrottle):
    scope = 'user_creation'

class ProfileUpdateThrottle(UserRateThrottle):
    scope = 'profile_update'
    rate = '30/hour'


class InvitationSendThrottle(UserRateThrottle):
    scope = 'invitation'
    rate = '20/hour'