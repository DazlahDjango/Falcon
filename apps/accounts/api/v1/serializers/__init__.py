from .base import BaseSerializer, DynamicFieldsModelSerializer, TenantAwareSerializer, AuditSerializer
from .auth import LoginSerializer, LoginResponseSerializer, LogoutSerializer, RefreshTokenSerializer, MFATokenSerializer, MFASetupSerializer, MFASetupResponseSerializer, MFAResponseSerializer, MFAAuthSerializer
from .user import UserSerializer, UserCreationSerializer, UserDetailSerializer, UserListSerializer, UserMinimalSerializer, UserProfileSerializer, UserUpdateSerializer
from .profile import ProfileSerializer, ProfileUpdateSerializer, ProfilDetailSerializer, ProfileMinimalSerializer, ProfileListSerializer, SkillSerializer, SkillUpdateSerializer, CertificationSerializer, CertificationUpdateSerializer
from .role import RoleSerializer, RoleCreateSerializer, RoleUpdateSerializer, RoleListSerializer, RoleDetailSerializer, RoleMinimalSerializer
from .permission import PermissionSerializer, PermissionListSerializer, PermissionDetailSerializer, PermissionMinimalSerializer
from .session import UserSessionSerializer, UserSessionListSerializer, UserSessionDetailSerializer, SessionBlacklistSerializer

from .mfa import (
    MFADeviceSerializer,
    MFADeviceListSerializer,
    MFADeviceDetailSerializer,
    MFADeviceCreateSerializer,
    MFADeviceUpdateSerializer,
    MFABackupCodeReadSerializer,
    MFABackupCodeVerifySerializer,
    MFABackupCodeGenerateSerializer,
    MFABackupListSerializer,
    MFAAuditLogSerializer,
    MFAAuditLogDetailSerializer,
    MFAVerifyOTPSerializer,
    MFADisableSerializer,
    MFASetPrimarySerializer,
    MFASetupTOTPSerializer,
    MFAVerifySetupSerializer,
    MFADeviceStatusSerializer,
    MFAMethodStatusSerializer,
    MFAMFAStatusSerializer,
    MFAErrorSerializer,
    MFASuccessSerializer,
)

from .preference import UserPreferenceSerializer, UserPreferenceUpdateSerializer, TenantPreferenceUpdateSerializer, TenantPreferenceSerializer
from .audit import AuditLogSerializer, AuditLogDetailSerializer, AuditLogExportSerializer, AuditLogListSerializer
from .password import PasswordChangeSerializer, PasswordResetConfirmSerializer, PasswordResetRequestSerializer
from .registration import UserRegistrationSerializer, TenantRegistrationSerializer, InvitationSerializer, InvitationAcceptSerializer, VerifyEmailSerializer
from .tenant import TenantSerializer, TenantCreateSerializer, TenantDetailSerializer, TenantMinimalSerializer, TenantUpdateSerializer, TenantListSerializer

# REMOVED: ViewSet imports don't belong here!
# from .base import BaseModelViewset, BaseViewset, BaseReadOnlyViewset  # DELETE THIS LINE!

__all__ = [
    # Base Serializers
    'BaseSerializer',
    'DynamicFieldsModelSerializer',
    'TenantAwareSerializer',
    'AuditSerializer',
    
    # Auth Serializers
    'LoginSerializer',
    'LoginResponseSerializer',
    'LogoutSerializer',
    'RefreshTokenSerializer',
    'MFATokenSerializer',
    'MFASetupSerializer',
    'MFASetupResponseSerializer',
    'MFAAuthSerializer',
    'MFAResponseSerializer',
    
    # User Serializers
    'UserSerializer',
    'UserCreationSerializer',
    'UserUpdateSerializer',
    'UserListSerializer',
    'UserDetailSerializer',
    'UserMinimalSerializer',
    'UserProfileSerializer',
    
    # Profile Serializers
    'ProfileSerializer',
    'ProfileUpdateSerializer',
    'ProfileDetailSerializer',
    'ProfileMinimalSerializer',
    'ProfileListSerializer',
    'SkillSerializer',
    'SkillUpdateSerializer',
    'CertificationSerializer',
    'CertificationUpdateSerializer',
    'ProfilDetailSerializer',
    
    # Role Serializers
    'RoleSerializer',
    'RoleCreateSerializer',
    'RoleUpdateSerializer',
    'RoleListSerializer',
    'RoleDetailSerializer',
    'RoleMinimalSerializer',
    
    # Permission Serializers
    'PermissionSerializer',
    'PermissionListSerializer',
    'PermissionDetailSerializer',
    'PermissionMinimalSerializer',
    
    # Session Serializers
    'UserSessionSerializer',
    'UserSessionListSerializer',
    'UserSessionDetailSerializer',
    'SessionBlacklistSerializer',
    
    # MFA Serializers
    'MFADeviceSerializer',
    'MFADeviceListSerializer',
    'MFADeviceDetailSerializer',
    'MFADeviceCreateSerializer',
    'MFADeviceUpdateSerializer',
    'MFABackupCodeReadSerializer',
    'MFABackupCodeVerifySerializer',
    'MFABackupCodeGenerateSerializer',
    'MFABackupListSerializer',
    'MFAAuditLogSerializer',
    'MFAAuditLogDetailSerializer',
    'MFAVerifyOTPSerializer',
    'MFADisableSerializer',
    'MFASetPrimarySerializer',
    'MFASetupTOTPSerializer',
    'MFAVerifySetupSerializer',
    'MFADeviceStatusSerializer',
    'MFAMethodStatusSerializer',
    'MFAMFAStatusSerializer',
    'MFAErrorSerializer',
    'MFASuccessSerializer',
    
    # Preference Serializers
    'UserPreferenceSerializer',
    'UserPreferenceUpdateSerializer',
    'TenantPreferenceSerializer',
    'TenantPreferenceUpdateSerializer',
    
    # Audit Serializers
    'AuditLogSerializer',
    'AuditLogListSerializer',
    'AuditLogDetailSerializer',
    'AuditLogExportSerializer',
    
    # Password Serializers
    'PasswordChangeSerializer',
    'PasswordResetRequestSerializer',
    'PasswordResetConfirmSerializer',
    
    # Registration Serializers
    'UserRegistrationSerializer',
    'TenantRegistrationSerializer',
    'InvitationSerializer',
    'InvitationAcceptSerializer',
    'VerifyEmailSerializer',
    
    # Tenant Serializers
    'TenantSerializer',
    'TenantCreateSerializer',
    'TenantUpdateSerializer',
    'TenantDetailSerializer',
    'TenantMinimalSerializer',
    'TenantListSerializer',
]