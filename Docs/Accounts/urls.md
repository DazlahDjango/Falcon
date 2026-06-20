(falc) PS C:\Users\Dazlah Administrator\Desktop\Falcon_pms> python manage.py show_urls | Select-String "accounts"
{"time": "2026-06-06 16:53:53,846", "level": "INFO", "module": "apps", "message": "AXES: BEGIN version 8.3.1, blocking by combination of username and ip_address and user_agent"}
C:\Users\Dazlah Administrator\Desktop\Falcon_pms\falc\Lib\site-packages\django\db\backends\utils.py:98: RuntimeWarning: Accessing the database during app initialization is discouraged. To fix this warning, avoid executing queries in AppConfig.ready() or when your app modules are imported.
  warnings.warn(self.APPS_NOT_READY_WARNING_MSG, category=RuntimeWarning)
{"time": "2026-06-06 16:53:55,346", "level": "INFO", "module": "connection_cleanup", "message": "Connection cleanup scheduler started"}
{"time": "2026-06-06 16:53:55,670", "level": "INFO", "module": "apps", "message": "Dashboard critical caches warmed"}

/admin/accounts/auditlog/       django.contrib.admin.options.changelist_view    admin:accounts_auditlog_changelist
/admin/accounts/auditlog/<path:object_id>/      django.views.generic.base.RedirectView
/admin/accounts/auditlog/<path:object_id>/change/       django.contrib.admin.options.change_view
admin:accounts_auditlog_change
/admin/accounts/auditlog/<path:object_id>/delete/       django.contrib.admin.options.delete_view
admin:accounts_auditlog_delete
/admin/accounts/auditlog/<path:object_id>/history/      django.contrib.admin.options.history_view
admin:accounts_auditlog_history
/admin/accounts/auditlog/add/   django.contrib.admin.options.add_view   admin:accounts_auditlog_add
/admin/accounts/loginattempt/   django.contrib.admin.options.changelist_view    admin:accounts_loginattempt_changelist
/admin/accounts/loginattempt/<path:object_id>/  django.views.generic.base.RedirectView
/admin/accounts/loginattempt/<path:object_id>/change/   django.contrib.admin.options.change_view
admin:accounts_loginattempt_change
/admin/accounts/loginattempt/<path:object_id>/delete/   django.contrib.admin.options.delete_view
admin:accounts_loginattempt_delete
/admin/accounts/loginattempt/<path:object_id>/history/  django.contrib.admin.options.history_view
admin:accounts_loginattempt_history
/admin/accounts/loginattempt/add/       django.contrib.admin.options.add_view   admin:accounts_loginattempt_add
/admin/accounts/mfaauditlog/    django.contrib.admin.options.changelist_view    admin:accounts_mfaauditlog_changelist
/admin/accounts/mfaauditlog/<path:object_id>/   django.views.generic.base.RedirectView
/admin/accounts/mfaauditlog/<path:object_id>/change/    django.contrib.admin.options.change_view
admin:accounts_mfaauditlog_change
/admin/accounts/mfaauditlog/<path:object_id>/delete/    django.contrib.admin.options.delete_view
admin:accounts_mfaauditlog_delete
/admin/accounts/mfaauditlog/<path:object_id>/history/   django.contrib.admin.options.history_view
admin:accounts_mfaauditlog_history
/admin/accounts/mfaauditlog/add/        django.contrib.admin.options.add_view   admin:accounts_mfaauditlog_add
/admin/accounts/mfabackupcode/  django.contrib.admin.options.changelist_view    admin:accounts_mfabackupcode_changelist
/admin/accounts/mfabackupcode/<path:object_id>/ django.views.generic.base.RedirectView
/admin/accounts/mfabackupcode/<path:object_id>/change/  django.contrib.admin.options.change_view
admin:accounts_mfabackupcode_change
/admin/accounts/mfabackupcode/<path:object_id>/delete/  django.contrib.admin.options.delete_view
admin:accounts_mfabackupcode_delete
/admin/accounts/mfabackupcode/<path:object_id>/history/ django.contrib.admin.options.history_view
admin:accounts_mfabackupcode_history
/admin/accounts/mfabackupcode/add/      django.contrib.admin.options.add_view   admin:accounts_mfabackupcode_add
/admin/accounts/mfadevice/      django.contrib.admin.options.changelist_view    admin:accounts_mfadevice_changelist
/admin/accounts/mfadevice/<path:object_id>/     django.views.generic.base.RedirectView
/admin/accounts/mfadevice/<path:object_id>/change/      django.contrib.admin.options.change_view
admin:accounts_mfadevice_change
/admin/accounts/mfadevice/<path:object_id>/delete/      django.contrib.admin.options.delete_view
admin:accounts_mfadevice_delete
/admin/accounts/mfadevice/<path:object_id>/history/     django.contrib.admin.options.history_view
admin:accounts_mfadevice_history
/admin/accounts/mfadevice/add/  django.contrib.admin.options.add_view   admin:accounts_mfadevice_add
/admin/accounts/permission/     django.contrib.admin.options.changelist_view    admin:accounts_permission_changelist
/admin/accounts/permission/<path:object_id>/    django.views.generic.base.RedirectView
/admin/accounts/permission/<path:object_id>/change/     django.contrib.admin.options.change_view
admin:accounts_permission_change
/admin/accounts/permission/<path:object_id>/delete/     django.contrib.admin.options.delete_view
admin:accounts_permission_delete
/admin/accounts/permission/<path:object_id>/history/    django.contrib.admin.options.history_view
admin:accounts_permission_history
/admin/accounts/permission/add/ django.contrib.admin.options.add_view   admin:accounts_permission_add
/admin/accounts/profile/        django.contrib.admin.options.changelist_view    admin:accounts_profile_changelist
/admin/accounts/profile/<path:object_id>/       django.views.generic.base.RedirectView
/admin/accounts/profile/<path:object_id>/change/        django.contrib.admin.options.change_view        admin:accounts_profile_change
/admin/accounts/profile/<path:object_id>/delete/        django.contrib.admin.options.delete_view        admin:accounts_profile_delete
/admin/accounts/profile/<path:object_id>/history/       django.contrib.admin.options.history_view
admin:accounts_profile_history
/admin/accounts/profile/add/    django.contrib.admin.options.add_view   admin:accounts_profile_add
/admin/accounts/role/   django.contrib.admin.options.changelist_view    admin:accounts_role_changelist
/admin/accounts/role/<path:object_id>/  django.views.generic.base.RedirectView
/admin/accounts/role/<path:object_id>/change/   django.contrib.admin.options.change_view        admin:accounts_role_change
/admin/accounts/role/<path:object_id>/delete/   django.contrib.admin.options.delete_view        admin:accounts_role_delete
/admin/accounts/role/<path:object_id>/history/  django.contrib.admin.options.history_view       admin:accounts_role_history
/admin/accounts/role/add/       django.contrib.admin.options.add_view   admin:accounts_role_add
/admin/accounts/sessionblacklist/       django.contrib.admin.options.changelist_view
admin:accounts_sessionblacklist_changelist
/admin/accounts/sessionblacklist/<path:object_id>/      django.views.generic.base.RedirectView
/admin/accounts/sessionblacklist/<path:object_id>/change/       django.contrib.admin.options.change_view
admin:accounts_sessionblacklist_change
/admin/accounts/sessionblacklist/<path:object_id>/delete/       django.contrib.admin.options.delete_view
admin:accounts_sessionblacklist_delete
/admin/accounts/sessionblacklist/<path:object_id>/history/      django.contrib.admin.options.history_view
admin:accounts_sessionblacklist_history
/admin/accounts/sessionblacklist/add/   django.contrib.admin.options.add_view   admin:accounts_sessionblacklist_add
/admin/accounts/tenantpreference/       django.contrib.admin.options.changelist_view
admin:accounts_tenantpreference_changelist
/admin/accounts/tenantpreference/<path:object_id>/      django.views.generic.base.RedirectView
/admin/accounts/tenantpreference/<path:object_id>/change/       django.contrib.admin.options.change_view
admin:accounts_tenantpreference_change
/admin/accounts/tenantpreference/<path:object_id>/delete/       django.contrib.admin.options.delete_view
admin:accounts_tenantpreference_delete
/admin/accounts/tenantpreference/<path:object_id>/history/      django.contrib.admin.options.history_view
admin:accounts_tenantpreference_history
/admin/accounts/tenantpreference/add/   django.contrib.admin.options.add_view   admin:accounts_tenantpreference_add
/admin/accounts/user/   django.contrib.admin.options.changelist_view    admin:accounts_user_changelist
/admin/accounts/user/<id>/password/     django.contrib.auth.admin.user_change_password  admin:auth_user_password_change
/admin/accounts/user/<path:object_id>/  django.views.generic.base.RedirectView
/admin/accounts/user/<path:object_id>/change/   django.contrib.admin.options.change_view        admin:accounts_user_change
/admin/accounts/user/<path:object_id>/delete/   django.contrib.admin.options.delete_view        admin:accounts_user_delete
/admin/accounts/user/<path:object_id>/history/  django.contrib.admin.options.history_view       admin:accounts_user_history
/admin/accounts/user/add/       django.contrib.auth.admin.add_view      admin:accounts_user_add
/admin/accounts/userpreference/ django.contrib.admin.options.changelist_view    admin:accounts_userpreference_changelist
/admin/accounts/userpreference/<path:object_id>/        django.views.generic.base.RedirectView
/admin/accounts/userpreference/<path:object_id>/change/ django.contrib.admin.options.change_view
admin:accounts_userpreference_change
/admin/accounts/userpreference/<path:object_id>/delete/ django.contrib.admin.options.delete_view
admin:accounts_userpreference_delete
/admin/accounts/userpreference/<path:object_id>/history/        django.contrib.admin.options.history_view
admin:accounts_userpreference_history
/admin/accounts/userpreference/add/     django.contrib.admin.options.add_view   admin:accounts_userpreference_add
/admin/accounts/usersession/    django.contrib.admin.options.changelist_view    admin:accounts_usersession_changelist
/admin/accounts/usersession/<path:object_id>/   django.views.generic.base.RedirectView
/admin/accounts/usersession/<path:object_id>/change/    django.contrib.admin.options.change_view
admin:accounts_usersession_change
/admin/accounts/usersession/<path:object_id>/delete/    django.contrib.admin.options.delete_view
admin:accounts_usersession_delete
/admin/accounts/usersession/<path:object_id>/history/   django.contrib.admin.options.history_view
admin:accounts_usersession_history
/admin/accounts/usersession/add/        django.contrib.admin.options.add_view   admin:accounts_usersession_add
/api/v1/admin/mfa/devices/<uuid:user_id>/       apps.accounts.api.v1.views.admin_mfa_views.AdminMfaDeviceClearView
admin-mfa-devices-clear
/api/v1/admin/mfa/devices/<uuid:user_id>/<uuid:device_id>/
apps.accounts.api.v1.views.admin_mfa_views.AdminMfaDeviceClearView      admin-mfa-device-clear
/api/v1/admin/mfa/reset/<uuid:user_id>/ apps.accounts.api.v1.views.admin_mfa_views.AdminMfaResetView    admin-mfa-reset
/api/v1/admin/mfa/status/<uuid:user_id>/        apps.accounts.api.v1.views.admin_mfa_views.AdminMFAStatusView   admin-mfa-status
/api/v1/admin/permissions/      apps.accounts.api.v1.views.admin.AdminPermissionViewSet admin-permission-list
/api/v1/admin/permissions/<pk>/ apps.accounts.api.v1.views.admin.AdminPermissionViewSet admin-permission-detail
/api/v1/admin/permissions/<pk>/\.<format>/      apps.accounts.api.v1.views.admin.AdminPermissionViewSet
admin-permission-detail
/api/v1/admin/permissions/<pk>/hard-delete/     apps.accounts.api.v1.views.admin.AdminPermissionViewSet
admin-permission-hard-delete
/api/v1/admin/permissions/<pk>/hard-delete/\.<format>/  apps.accounts.api.v1.views.admin.AdminPermissionViewSet
admin-permission-hard-delete
/api/v1/admin/permissions/<pk>/restore/ apps.accounts.api.v1.views.admin.AdminPermissionViewSet
admin-permission-restore
/api/v1/admin/permissions/<pk>/restore/\.<format>/      apps.accounts.api.v1.views.admin.AdminPermissionViewSet
admin-permission-restore
/api/v1/admin/permissions/\.<format>/   apps.accounts.api.v1.views.admin.AdminPermissionViewSet admin-permission-list
/api/v1/admin/permissions/init-permissions/     apps.accounts.api.v1.views.admin.AdminPermissionViewSet
admin-permission-init-permissions
/api/v1/admin/permissions/init-permissions/\.<format>/  apps.accounts.api.v1.views.admin.AdminPermissionViewSet
admin-permission-init-permissions
/api/v1/admin/roles/    apps.accounts.api.v1.views.admin.AdminRoleViewSet       admin-role-list
/api/v1/admin/roles/<pk>/       apps.accounts.api.v1.views.admin.AdminRoleViewSet       admin-role-detail
/api/v1/admin/roles/<pk>/\.<format>/    apps.accounts.api.v1.views.admin.AdminRoleViewSet       admin-role-detail
/api/v1/admin/roles/<pk>/hard-delete/   apps.accounts.api.v1.views.admin.AdminRoleViewSet       admin-role-hard-delete
/api/v1/admin/roles/<pk>/hard-delete/\.<format>/        apps.accounts.api.v1.views.admin.AdminRoleViewSet
admin-role-hard-delete
/api/v1/admin/roles/<pk>/restore/       apps.accounts.api.v1.views.admin.AdminRoleViewSet       admin-role-restore
/api/v1/admin/roles/<pk>/restore/\.<format>/    apps.accounts.api.v1.views.admin.AdminRoleViewSet       admin-role-restore
/api/v1/admin/roles/\.<format>/ apps.accounts.api.v1.views.admin.AdminRoleViewSet       admin-role-list
/api/v1/admin/roles/init-system-roles/  apps.accounts.api.v1.views.admin.AdminRoleViewSet       admin-role-init-system-roles
/api/v1/admin/roles/init-system-roles/\.<format>/       apps.accounts.api.v1.views.admin.AdminRoleViewSet
admin-role-init-system-roles
/api/v1/admin/system/   apps.accounts.api.v1.views.admin.AdminSystemView        admin-system
/api/v1/admin/system/clear-cache/       apps.accounts.api.v1.views.admin.AdminSystemView        admin-clear-cache
/api/v1/admin/system/health/    apps.accounts.api.v1.views.admin.AdminSystemView        admin-system-health
/api/v1/admin/tenants/  apps.accounts.api.v1.views.admin.AdminTenantViewSet     admin-tenant-list
/api/v1/admin/tenants/<pk>/     apps.accounts.api.v1.views.admin.AdminTenantViewSet     admin-tenant-detail
/api/v1/admin/tenants/<pk>/\.<format>/  apps.accounts.api.v1.views.admin.AdminTenantViewSet     admin-tenant-detail
/api/v1/admin/tenants/<pk>/activate/    apps.accounts.api.v1.views.admin.AdminTenantViewSet     admin-tenant-activate
/api/v1/admin/tenants/<pk>/activate/\.<format>/ apps.accounts.api.v1.views.admin.AdminTenantViewSet
admin-tenant-activate
/api/v1/admin/tenants/<pk>/hard-delete/ apps.accounts.api.v1.views.admin.AdminTenantViewSet     admin-tenant-hard-delete
/api/v1/admin/tenants/<pk>/hard-delete/\.<format>/      apps.accounts.api.v1.views.admin.AdminTenantViewSet
admin-tenant-hard-delete
/api/v1/admin/tenants/<pk>/restore/     apps.accounts.api.v1.views.admin.AdminTenantViewSet     admin-tenant-restore
/api/v1/admin/tenants/<pk>/restore/\.<format>/  apps.accounts.api.v1.views.admin.AdminTenantViewSet     admin-tenant-restore
/api/v1/admin/tenants/<pk>/suspend/     apps.accounts.api.v1.views.admin.AdminTenantViewSet     admin-tenant-suspend
/api/v1/admin/tenants/<pk>/suspend/\.<format>/  apps.accounts.api.v1.views.admin.AdminTenantViewSet     admin-tenant-suspend
/api/v1/admin/tenants/\.<format>/       apps.accounts.api.v1.views.admin.AdminTenantViewSet     admin-tenant-list
/api/v1/admin/tenants/create-with-admin/        apps.accounts.api.v1.views.admin.AdminTenantViewSet
admin-tenant-create-with-admin
/api/v1/admin/tenants/create-with-admin/\.<format>/     apps.accounts.api.v1.views.admin.AdminTenantViewSet
admin-tenant-create-with-admin
/api/v1/admin/tenants/stats/    apps.accounts.api.v1.views.admin.AdminTenantViewSet     admin-tenant-stats
/api/v1/admin/tenants/stats/\.<format>/ apps.accounts.api.v1.views.admin.AdminTenantViewSet     admin-tenant-stats
/api/v1/admin/users/    apps.accounts.api.v1.views.admin.AdminUserViewSet       admin-user-list
/api/v1/admin/users/<pk>/       apps.accounts.api.v1.views.admin.AdminUserViewSet       admin-user-detail
/api/v1/admin/users/<pk>/\.<format>/    apps.accounts.api.v1.views.admin.AdminUserViewSet       admin-user-detail
/api/v1/admin/users/<pk>/force-password-reset/  apps.accounts.api.v1.views.admin.AdminUserViewSet
admin-user-force-password-reset
/api/v1/admin/users/<pk>/force-password-reset/\.<format>/       apps.accounts.api.v1.views.admin.AdminUserViewSet
admin-user-force-password-reset
/api/v1/admin/users/<pk>/hard-delete/   apps.accounts.api.v1.views.admin.AdminUserViewSet       admin-user-hard-delete
/api/v1/admin/users/<pk>/hard-delete/\.<format>/        apps.accounts.api.v1.views.admin.AdminUserViewSet
admin-user-hard-delete
/api/v1/admin/users/<pk>/impersonate/   apps.accounts.api.v1.views.admin.AdminUserViewSet       admin-user-impersonate
/api/v1/admin/users/<pk>/impersonate/\.<format>/        apps.accounts.api.v1.views.admin.AdminUserViewSet
admin-user-impersonate
/api/v1/admin/users/<pk>/restore/       apps.accounts.api.v1.views.admin.AdminUserViewSet       admin-user-restore
/api/v1/admin/users/<pk>/restore/\.<format>/    apps.accounts.api.v1.views.admin.AdminUserViewSet       admin-user-restore
/api/v1/admin/users/\.<format>/ apps.accounts.api.v1.views.admin.AdminUserViewSet       admin-user-list
/api/v1/admin/users/stats/      apps.accounts.api.v1.views.admin.AdminUserViewSet       admin-user-stats
/api/v1/admin/users/stats/\.<format>/   apps.accounts.api.v1.views.admin.AdminUserViewSet       admin-user-stats
/api/v1/audit-logs/     apps.accounts.api.v1.views.audit.AuditLogViewSet        audit-log-list
/api/v1/audit-logs/<pk>/        apps.accounts.api.v1.views.audit.AuditLogViewSet        audit-log-detail
/api/v1/audit-logs/<pk>/\.<format>/     apps.accounts.api.v1.views.audit.AuditLogViewSet        audit-log-detail
/api/v1/audit-logs/\.<format>/  apps.accounts.api.v1.views.audit.AuditLogViewSet        audit-log-list
/api/v1/audit-logs/anomaly-detection/   apps.accounts.api.v1.views.audit.AuditLogViewSet        audit-log-anomaly-detection
/api/v1/audit-logs/anomaly-detection/\.<format>/        apps.accounts.api.v1.views.audit.AuditLogViewSet
audit-log-anomaly-detection
/api/v1/audit-logs/compliance-report/   apps.accounts.api.v1.views.audit.AuditLogViewSet        audit-log-compliance-report
/api/v1/audit-logs/compliance-report/\.<format>/        apps.accounts.api.v1.views.audit.AuditLogViewSet
audit-log-compliance-report
/api/v1/audit-logs/export/      apps.accounts.api.v1.views.audit.AuditLogViewSet        audit-log-export
/api/v1/audit-logs/export/\.<format>/   apps.accounts.api.v1.views.audit.AuditLogViewSet        audit-log-export
/api/v1/audit-logs/object-history/      apps.accounts.api.v1.views.audit.AuditLogViewSet        audit-log-object-history
/api/v1/audit-logs/object-history/\.<format>/   apps.accounts.api.v1.views.audit.AuditLogViewSet        audit-log-object-history
/api/v1/audit-logs/security-events/     apps.accounts.api.v1.views.audit.AuditLogViewSet        audit-log-security-events
/api/v1/audit-logs/security-events/\.<format>/  apps.accounts.api.v1.views.audit.AuditLogViewSet
audit-log-security-events
/api/v1/audit-logs/tenant-summary/      apps.accounts.api.v1.views.audit.AuditLogViewSet        audit-log-tenant-summary
/api/v1/audit-logs/tenant-summary/\.<format>/   apps.accounts.api.v1.views.audit.AuditLogViewSet        audit-log-tenant-summary
/api/v1/audit-logs/user-summary/        apps.accounts.api.v1.views.audit.AuditLogViewSet        audit-log-user-summary
/api/v1/audit-logs/user-summary/\.<format>/     apps.accounts.api.v1.views.audit.AuditLogViewSet        audit-log-user-summary
/api/v1/audit-logs/user/<user_id>/      apps.accounts.api.v1.views.audit.AuditLogViewSet        audit-log-user-activity
/api/v1/audit-logs/user/<user_id>/\.<format>/   apps.accounts.api.v1.views.audit.AuditLogViewSet        audit-log-user-activity
/api/v1/auth/invitation/accept/ apps.accounts.api.v1.views.user.InvitationAcceptView    accept-invitation
/api/v1/auth/invitations/       apps.accounts.api.v1.views.user.UserInvitationsView     invitations
/api/v1/auth/login/     apps.accounts.api.v1.views.auth.AuthViewSet     auth-login
/api/v1/auth/login/     apps.accounts.api.v1.views.auth.LoginView       login
/api/v1/auth/login/\.<format>/  apps.accounts.api.v1.views.auth.AuthViewSet     auth-login
/api/v1/auth/logout/    apps.accounts.api.v1.views.auth.AuthViewSet     auth-logout
/api/v1/auth/logout/    apps.accounts.api.v1.views.auth.LogoutView      logout
/api/v1/auth/logout/\.<format>/ apps.accounts.api.v1.views.auth.AuthViewSet     auth-logout
/api/v1/auth/me/        apps.accounts.api.v1.views.user.CurrentUserView current-user
/api/v1/auth/me/change-password/        apps.accounts.api.v1.views.user.UserChangePasswordView  change-password
/api/v1/auth/mfa-backup-codes/  apps.accounts.api.v1.views.auth.AuthViewSet     auth-get-backup-codes
/api/v1/auth/mfa-backup-codes/  apps.accounts.api.v1.views.auth.AuthViewSet     auth-mfa-backup-codes
/api/v1/auth/mfa-backup-codes/\.<format>/       apps.accounts.api.v1.views.auth.AuthViewSet     auth-get-backup-codes
/api/v1/auth/mfa-backup-codes/\.<format>/       apps.accounts.api.v1.views.auth.AuthViewSet     auth-mfa-backup-codes
/api/v1/auth/mfa-devices/       apps.accounts.api.v1.views.auth.AuthViewSet     auth-mfa-devices
/api/v1/auth/mfa-devices/\.<format>/    apps.accounts.api.v1.views.auth.AuthViewSet     auth-mfa-devices
/api/v1/auth/mfa-setup/ apps.accounts.api.v1.views.auth.AuthViewSet     auth-mfa-setup
/api/v1/auth/mfa-setup/\.<format>/      apps.accounts.api.v1.views.auth.AuthViewSet     auth-mfa-setup
/api/v1/auth/mfa-verify/        apps.accounts.api.v1.views.auth.AuthViewSet     auth-mfa-verify
/api/v1/auth/mfa-verify/\.<format>/     apps.accounts.api.v1.views.auth.AuthViewSet     auth-mfa-verify
/api/v1/auth/refresh/   apps.accounts.api.v1.views.auth.AuthViewSet     auth-refresh
/api/v1/auth/refresh/   apps.accounts.api.v1.views.auth.RefreshTokenView        token-refresh
/api/v1/auth/refresh/\.<format>/        apps.accounts.api.v1.views.auth.AuthViewSet     auth-refresh
/api/v1/auth/step-up/verify/    apps.accounts.api.v1.views.step_up_views.StepUpVerifyView       step-up-verify
/api/v1/health/ apps.accounts.urls.health_check health
/api/v1/mfa/audit-logs/ apps.accounts.api.v1.views.mfa.MFAAuditLogViewSet       mfa-audit-log-list
/api/v1/mfa/audit-logs/<pk>/    apps.accounts.api.v1.views.mfa.MFAAuditLogViewSet       mfa-audit-log-detail
/api/v1/mfa/audit-logs/<pk>/\.<format>/ apps.accounts.api.v1.views.mfa.MFAAuditLogViewSet       mfa-audit-log-detail
/api/v1/mfa/audit-logs/\.<format>/      apps.accounts.api.v1.views.mfa.MFAAuditLogViewSet       mfa-audit-log-list
/api/v1/mfa/audit-logs/summary/ apps.accounts.api.v1.views.mfa.MFAAuditLogViewSet       mfa-audit-log-summary
/api/v1/mfa/audit-logs/summary/\.<format>/      apps.accounts.api.v1.views.mfa.MFAAuditLogViewSet       mfa-audit-log-summary
/api/v1/mfa/devices/    apps.accounts.api.v1.views.mfa.MFADeviceViewSet mfa-device-list
/api/v1/mfa/devices/<pk>/       apps.accounts.api.v1.views.mfa.MFADeviceViewSet mfa-device-detail
/api/v1/mfa/devices/<pk>/\.<format>/    apps.accounts.api.v1.views.mfa.MFADeviceViewSet mfa-device-detail
/api/v1/mfa/devices/<pk>/hard-delete/   apps.accounts.api.v1.views.mfa.MFADeviceViewSet mfa-device-hard-delete
/api/v1/mfa/devices/<pk>/hard-delete/\.<format>/        apps.accounts.api.v1.views.mfa.MFADeviceViewSet mfa-device-hard-delete
/api/v1/mfa/devices/<pk>/restore/       apps.accounts.api.v1.views.mfa.MFADeviceViewSet mfa-device-restore
/api/v1/mfa/devices/<pk>/restore/\.<format>/    apps.accounts.api.v1.views.mfa.MFADeviceViewSet mfa-device-restore
/api/v1/mfa/devices/<pk>/set-primary/   apps.accounts.api.v1.views.mfa.MFADeviceViewSet mfa-device-set-primary
/api/v1/mfa/devices/<pk>/set-primary/\.<format>/        apps.accounts.api.v1.views.mfa.MFADeviceViewSet mfa-device-set-primary
/api/v1/mfa/devices/<pk>/verify/        apps.accounts.api.v1.views.mfa.MFADeviceViewSet mfa-device-verify-device
/api/v1/mfa/devices/<pk>/verify/\.<format>/     apps.accounts.api.v1.views.mfa.MFADeviceViewSet mfa-device-verify-device
/api/v1/mfa/devices/\.<format>/ apps.accounts.api.v1.views.mfa.MFADeviceViewSet mfa-device-list
/api/v1/mfa/devices/activity/   apps.accounts.api.v1.views.mfa.MFADeviceViewSet mfa-device-recent-activity
/api/v1/mfa/devices/activity/\.<format>/        apps.accounts.api.v1.views.mfa.MFADeviceViewSet mfa-device-recent-activity
/api/v1/mfa/devices/backup-codes-status/        apps.accounts.api.v1.views.mfa.MFADeviceViewSet mfa-device-backup-codes-status
/api/v1/mfa/devices/backup-codes-status/\.<format>/     apps.accounts.api.v1.views.mfa.MFADeviceViewSet
mfa-device-backup-codes-status
/api/v1/mfa/devices/disable/    apps.accounts.api.v1.views.mfa.MFADeviceViewSet mfa-device-disable-mfa
/api/v1/mfa/devices/disable/\.<format>/ apps.accounts.api.v1.views.mfa.MFADeviceViewSet mfa-device-disable-mfa
/api/v1/mfa/devices/failure-rate/       apps.accounts.api.v1.views.mfa.MFADeviceViewSet mfa-device-failure-rate
/api/v1/mfa/devices/failure-rate/\.<format>/    apps.accounts.api.v1.views.mfa.MFADeviceViewSet mfa-device-failure-rate
/api/v1/mfa/devices/generate-backup-codes/      apps.accounts.api.v1.views.mfa.MFADeviceViewSet
mfa-device-generate-backup-codes
/api/v1/mfa/devices/generate-backup-codes/\.<format>/   apps.accounts.api.v1.views.mfa.MFADeviceViewSet
mfa-device-generate-backup-codes
/api/v1/mfa/devices/setup-totp/ apps.accounts.api.v1.views.mfa.MFADeviceViewSet mfa-device-setup-totp
/api/v1/mfa/devices/setup-totp/\.<format>/      apps.accounts.api.v1.views.mfa.MFADeviceViewSet mfa-device-setup-totp
/api/v1/mfa/devices/status/     apps.accounts.api.v1.views.mfa.MFADeviceViewSet mfa-device-mfa-status
/api/v1/mfa/devices/status/\.<format>/  apps.accounts.api.v1.views.mfa.MFADeviceViewSet mfa-device-mfa-status
/api/v1/mfa/devices/verify-backup/      apps.accounts.api.v1.views.mfa.MFADeviceViewSet mfa-device-verify-backup-code
/api/v1/mfa/devices/verify-backup/\.<format>/   apps.accounts.api.v1.views.mfa.MFADeviceViewSet
mfa-device-verify-backup-code
/api/v1/mfa/devices/verify-totp-setup/  apps.accounts.api.v1.views.mfa.MFADeviceViewSet mfa-device-verify-totp-setup
/api/v1/mfa/devices/verify-totp-setup/\.<format>/       apps.accounts.api.v1.views.mfa.MFADeviceViewSet
mfa-device-verify-totp-setup
/api/v1/permissions/    apps.accounts.api.v1.views.permission.PermissionViewSet permission-list
/api/v1/permissions/<pk>/       apps.accounts.api.v1.views.permission.PermissionViewSet permission-detail
/api/v1/permissions/<pk>/\.<format>/    apps.accounts.api.v1.views.permission.PermissionViewSet permission-detail
/api/v1/permissions/<pk>/hard-delete/   apps.accounts.api.v1.views.permission.PermissionViewSet permission-hard-delete
/api/v1/permissions/<pk>/hard-delete/\.<format>/        apps.accounts.api.v1.views.permission.PermissionViewSet
permission-hard-delete
/api/v1/permissions/<pk>/restore/       apps.accounts.api.v1.views.permission.PermissionViewSet permission-restore
/api/v1/permissions/<pk>/restore/\.<format>/    apps.accounts.api.v1.views.permission.PermissionViewSet permission-restore
/api/v1/permissions/\.<format>/ apps.accounts.api.v1.views.permission.PermissionViewSet permission-list
/api/v1/permissions/by-category/<category>/     apps.accounts.api.v1.views.permission.PermissionViewSet
permission-by-category
/api/v1/permissions/by-category/<category>/\.<format>/  apps.accounts.api.v1.views.permission.PermissionViewSet
permission-by-category
/api/v1/permissions/by-level/<level>/   apps.accounts.api.v1.views.permission.PermissionViewSet permission-by-level
/api/v1/permissions/by-level/<level>/\.<format>/        apps.accounts.api.v1.views.permission.PermissionViewSet
permission-by-level
/api/v1/preferences/tenants/    apps.accounts.api.v1.views.preference.TenantPreferenceViewSet   tenant-preference-list
/api/v1/preferences/tenants/<pk>/       apps.accounts.api.v1.views.preference.TenantPreferenceViewSet
tenant-preference-detail
/api/v1/preferences/tenants/<pk>/\.<format>/    apps.accounts.api.v1.views.preference.TenantPreferenceViewSet
tenant-preference-detail
/api/v1/preferences/tenants/<pk>/hard-delete/   apps.accounts.api.v1.views.preference.TenantPreferenceViewSet
tenant-preference-hard-delete
/api/v1/preferences/tenants/<pk>/hard-delete/\.<format>/        apps.accounts.api.v1.views.preference.TenantPreferenceViewSet
tenant-preference-hard-delete
/api/v1/preferences/tenants/<pk>/restore/       apps.accounts.api.v1.views.preference.TenantPreferenceViewSet
tenant-preference-restore
/api/v1/preferences/tenants/<pk>/restore/\.<format>/    apps.accounts.api.v1.views.preference.TenantPreferenceViewSet
tenant-preference-restore
/api/v1/preferences/tenants/\.<format>/ apps.accounts.api.v1.views.preference.TenantPreferenceViewSet
tenant-preference-list
/api/v1/preferences/tenants/my-tenant/  apps.accounts.api.v1.views.preference.TenantPreferenceViewSet
tenant-preference-my-tenant-preferences
/api/v1/preferences/tenants/my-tenant/  apps.accounts.api.v1.views.preference.TenantPreferenceViewSet
tenant-preference-update-my-tenant-preferences
/api/v1/preferences/tenants/my-tenant/\.<format>/       apps.accounts.api.v1.views.preference.TenantPreferenceViewSet
tenant-preference-my-tenant-preferences
/api/v1/preferences/tenants/my-tenant/\.<format>/       apps.accounts.api.v1.views.preference.TenantPreferenceViewSet
tenant-preference-update-my-tenant-preferences
/api/v1/preferences/tenants/my-tenant/branding/ apps.accounts.api.v1.views.preference.TenantPreferenceViewSet
tenant-preference-update-branding
/api/v1/preferences/tenants/my-tenant/branding/\.<format>/
apps.accounts.api.v1.views.preference.TenantPreferenceViewSet   tenant-preference-update-branding
/api/v1/preferences/users/      apps.accounts.api.v1.views.preference.UserPreferenceViewSet     user-preference-list
/api/v1/preferences/users/<pk>/ apps.accounts.api.v1.views.preference.UserPreferenceViewSet     user-preference-detail
/api/v1/preferences/users/<pk>/\.<format>/      apps.accounts.api.v1.views.preference.UserPreferenceViewSet
user-preference-detail
/api/v1/preferences/users/<pk>/hard-delete/     apps.accounts.api.v1.views.preference.UserPreferenceViewSet
user-preference-hard-delete
/api/v1/preferences/users/<pk>/hard-delete/\.<format>/  apps.accounts.api.v1.views.preference.UserPreferenceViewSet
user-preference-hard-delete
/api/v1/preferences/users/<pk>/restore/ apps.accounts.api.v1.views.preference.UserPreferenceViewSet
user-preference-restore
/api/v1/preferences/users/<pk>/restore/\.<format>/      apps.accounts.api.v1.views.preference.UserPreferenceViewSet
user-preference-restore
/api/v1/preferences/users/\.<format>/   apps.accounts.api.v1.views.preference.UserPreferenceViewSet     user-preference-list
/api/v1/preferences/users/my/   apps.accounts.api.v1.views.preference.UserPreferenceViewSet
user-preference-my-preferences
/api/v1/preferences/users/my/   apps.accounts.api.v1.views.preference.UserPreferenceViewSet
user-preference-update-my-preferences
/api/v1/preferences/users/my/\.<format>/        apps.accounts.api.v1.views.preference.UserPreferenceViewSet
user-preference-my-preferences
/api/v1/preferences/users/my/\.<format>/        apps.accounts.api.v1.views.preference.UserPreferenceViewSet
user-preference-update-my-preferences
/api/v1/preferences/users/notifications/        apps.accounts.api.v1.views.preference.UserPreferenceViewSet
user-preference-update-notifications
/api/v1/preferences/users/notifications/\.<format>/     apps.accounts.api.v1.views.preference.UserPreferenceViewSet
user-preference-update-notifications
/api/v1/profiles/       apps.accounts.api.v1.views.profiles.ProfileViewSet      profile-list
/api/v1/profiles/<id>/  apps.accounts.api.v1.views.profiles.ProfileViewSet      profile-detail
/api/v1/profiles/<id>/\.<format>/       apps.accounts.api.v1.views.profiles.ProfileViewSet      profile-detail
/api/v1/profiles/<id>/avatar/   apps.accounts.api.v1.views.profiles.ProfileViewSet      profile-delete-avatar
/api/v1/profiles/<id>/avatar/   apps.accounts.api.v1.views.profiles.ProfileViewSet      profile-upload-avatar
/api/v1/profiles/<id>/avatar/\.<format>/        apps.accounts.api.v1.views.profiles.ProfileViewSet      profile-delete-avatar
/api/v1/profiles/<id>/avatar/\.<format>/        apps.accounts.api.v1.views.profiles.ProfileViewSet      profile-upload-avatar
/api/v1/profiles/<id>/certifications-summary/   apps.accounts.api.v1.views.profiles.ProfileViewSet
profile-certifications-summary
/api/v1/profiles/<id>/certifications-summary/\.<format>/        apps.accounts.api.v1.views.profiles.ProfileViewSet
profile-certifications-summary
/api/v1/profiles/<id>/certifications/   apps.accounts.api.v1.views.profiles.ProfileViewSet      profile-add-certification
/api/v1/profiles/<id>/certifications/<cert_name>/       apps.accounts.api.v1.views.profiles.ProfileViewSet
profile-remove-certification
/api/v1/profiles/<id>/certifications/<cert_name>/\.<format>/    apps.accounts.api.v1.views.profiles.ProfileViewSet
profile-remove-certification
/api/v1/profiles/<id>/certifications/\.<format>/        apps.accounts.api.v1.views.profiles.ProfileViewSet
profile-add-certification
/api/v1/profiles/<id>/hard-delete/      apps.accounts.api.v1.views.profiles.ProfileViewSet      profile-hard-delete
/api/v1/profiles/<id>/hard-delete/\.<format>/   apps.accounts.api.v1.views.profiles.ProfileViewSet      profile-hard-delete
/api/v1/profiles/<id>/restore/  apps.accounts.api.v1.views.profiles.ProfileViewSet      profile-restore
/api/v1/profiles/<id>/restore/\.<format>/       apps.accounts.api.v1.views.profiles.ProfileViewSet      profile-restore
/api/v1/profiles/<id>/skills-summary/   apps.accounts.api.v1.views.profiles.ProfileViewSet      profile-skills-summary
/api/v1/profiles/<id>/skills-summary/\.<format>/        apps.accounts.api.v1.views.profiles.ProfileViewSet
profile-skills-summary
/api/v1/profiles/<id>/skills/   apps.accounts.api.v1.views.profiles.ProfileViewSet      profile-add-skill
/api/v1/profiles/<id>/skills/<skill_name>/      apps.accounts.api.v1.views.profiles.ProfileViewSet      profile-remove-skill
/api/v1/profiles/<id>/skills/<skill_name>/      apps.accounts.api.v1.views.profiles.ProfileViewSet      profile-update-skill
/api/v1/profiles/<id>/skills/<skill_name>/\.<format>/   apps.accounts.api.v1.views.profiles.ProfileViewSet
profile-remove-skill
/api/v1/profiles/<id>/skills/<skill_name>/\.<format>/   apps.accounts.api.v1.views.profiles.ProfileViewSet
profile-update-skill
/api/v1/profiles/<id>/skills/\.<format>/        apps.accounts.api.v1.views.profiles.ProfileViewSet      profile-add-skill
/api/v1/profiles/\.<format>/    apps.accounts.api.v1.views.profiles.ProfileViewSet      profile-list
/api/v1/profiles/my/    apps.accounts.api.v1.views.profiles.ProfileViewSet      profile-my-profile
/api/v1/profiles/my/    apps.accounts.api.v1.views.profiles.ProfileViewSet      profile-update-my-profile
/api/v1/profiles/my/\.<format>/ apps.accounts.api.v1.views.profiles.ProfileViewSet      profile-my-profile
/api/v1/profiles/my/\.<format>/ apps.accounts.api.v1.views.profiles.ProfileViewSet      profile-update-my-profile
/api/v1/profiles/my/certifications-summary/     apps.accounts.api.v1.views.profiles.ProfileViewSet
profile-my-certifications-summary
/api/v1/profiles/my/certifications-summary/\.<format>/  apps.accounts.api.v1.views.profiles.ProfileViewSet
profile-my-certifications-summary
/api/v1/profiles/my/skills-summary/     apps.accounts.api.v1.views.profiles.ProfileViewSet      profile-my-skills-summary
/api/v1/profiles/my/skills-summary/\.<format>/  apps.accounts.api.v1.views.profiles.ProfileViewSet
profile-my-skills-summary
/api/v1/roles/  apps.accounts.api.v1.views.roles.RoleViewSet    role-list
/api/v1/roles/<pk>/     apps.accounts.api.v1.views.roles.RoleViewSet    role-detail
/api/v1/roles/<pk>/\.<format>/  apps.accounts.api.v1.views.roles.RoleViewSet    role-detail
/api/v1/roles/<pk>/hard-delete/ apps.accounts.api.v1.views.roles.RoleViewSet    role-hard-delete
/api/v1/roles/<pk>/hard-delete/\.<format>/      apps.accounts.api.v1.views.roles.RoleViewSet    role-hard-delete
/api/v1/roles/<pk>/permissions/ apps.accounts.api.v1.views.roles.RoleViewSet    role-assign-permissions
/api/v1/roles/<pk>/permissions/ apps.accounts.api.v1.views.roles.RoleViewSet    role-role-permissions
/api/v1/roles/<pk>/permissions/\.<format>/      apps.accounts.api.v1.views.roles.RoleViewSet    role-assign-permissions
/api/v1/roles/<pk>/permissions/\.<format>/      apps.accounts.api.v1.views.roles.RoleViewSet    role-role-permissions
/api/v1/roles/<pk>/restore/     apps.accounts.api.v1.views.roles.RoleViewSet    role-restore
/api/v1/roles/<pk>/restore/\.<format>/  apps.accounts.api.v1.views.roles.RoleViewSet    role-restore
/api/v1/roles/\.<format>/       apps.accounts.api.v1.views.roles.RoleViewSet    role-list
/api/v1/roles/assignable/       apps.accounts.api.v1.views.roles.RoleViewSet    role-assignable-roles
/api/v1/roles/assignable/\.<format>/    apps.accounts.api.v1.views.roles.RoleViewSet    role-assignable-roles
/api/v1/roles/system/   apps.accounts.api.v1.views.roles.RoleViewSet    role-system-roles
/api/v1/roles/system/\.<format>/        apps.accounts.api.v1.views.roles.RoleViewSet    role-system-roles
/api/v1/security/lockout-summary/       apps.accounts.api.v1.views.security_views.LockoutSummaryView    lockout-summary
/api/v1/security/login-attempts/        apps.accounts.api.v1.views.security_views.LoginAttemptViewSet   login-attempt-list
/api/v1/security/login-attempts/<pk>/   apps.accounts.api.v1.views.security_views.LoginAttemptViewSet
login-attempt-detail
/api/v1/security/login-attempts/<pk>/\.<format>/        apps.accounts.api.v1.views.security_views.LoginAttemptViewSet
login-attempt-detail
/api/v1/security/login-attempts/\.<format>/     apps.accounts.api.v1.views.security_views.LoginAttemptViewSet
login-attempt-list
/api/v1/security/mfa/policy/    apps.accounts.api.v1.views.system_settings_views.TenantMFAPolicyView    tenant-mfa-policy
/api/v1/security/mfa/users/     apps.accounts.api.v1.views.system_settings_views.UserMFAPolicyView      user-mfa-policy-list
/api/v1/security/mfa/users/<uuid:user_id>/      apps.accounts.api.v1.views.system_settings_views.UserMFAPolicyView
user-mfa-policy-detail
/api/v1/security/mfa/users/<uuid:user_id>/status/       apps.accounts.api.v1.views.system_settings_views.UserMFAStatusView
user-mfa-status
/api/v1/security/policy/        apps.accounts.api.v1.views.security_views.TenantPolicyView      tenant-security-policy
/api/v1/sessions/       apps.accounts.api.v1.views.session.SessionViewSet       session-list
/api/v1/sessions/<pk>/  apps.accounts.api.v1.views.session.SessionViewSet       session-detail
/api/v1/sessions/<pk>/\.<format>/       apps.accounts.api.v1.views.session.SessionViewSet       session-detail
/api/v1/sessions/<pk>/terminate/        apps.accounts.api.v1.views.session.SessionViewSet       session-terminate
/api/v1/sessions/<pk>/terminate/\.<format>/     apps.accounts.api.v1.views.session.SessionViewSet       session-terminate
/api/v1/sessions/\.<format>/    apps.accounts.api.v1.views.session.SessionViewSet       session-list
/api/v1/sessions/active/        apps.accounts.api.v1.views.session.SessionViewSet       session-active-sessions
/api/v1/sessions/active/\.<format>/     apps.accounts.api.v1.views.session.SessionViewSet       session-active-sessions
/api/v1/sessions/current/       apps.accounts.api.v1.views.session.SessionViewSet       session-current-session
/api/v1/sessions/current/\.<format>/    apps.accounts.api.v1.views.session.SessionViewSet       session-current-session
/api/v1/sessions/tenant-active/ apps.accounts.api.v1.views.session.SessionViewSet       session-tenant-active
/api/v1/sessions/tenant-active/\.<format>/      apps.accounts.api.v1.views.session.SessionViewSet       session-tenant-active
/api/v1/sessions/terminate-all/ apps.accounts.api.v1.views.session.SessionViewSet       session-terminate-all
/api/v1/sessions/terminate-all/\.<format>/      apps.accounts.api.v1.views.session.SessionViewSet       session-terminate-all
/api/v1/system-settings/        apps.accounts.api.v1.views.system_settings_views.AccountsSystemSettingsView
accounts-system-settings
/api/v1/system-settings/reset/  apps.accounts.api.v1.views.system_settings_views.AccountsSystemSettingsView
accounts-system-settings-reset
/api/v1/system-settings/sync-policy/    apps.accounts.api.v1.views.system_settings_views.AccountsSyncPolicyView
accounts-sync-policy
/api/v1/users/  apps.accounts.api.v1.views.user.UserViewSet     user-list
/api/v1/users/<pk>/     apps.accounts.api.v1.views.user.UserViewSet     user-detail
/api/v1/users/<pk>/\.<format>/  apps.accounts.api.v1.views.user.UserViewSet     user-detail
/api/v1/users/<pk>/activate/    apps.accounts.api.v1.views.user.UserViewSet     user-activate
/api/v1/users/<pk>/activate/\.<format>/ apps.accounts.api.v1.views.user.UserViewSet     user-activate
/api/v1/users/<pk>/assign-role/ apps.accounts.api.v1.views.user.UserViewSet     user-assign-role
/api/v1/users/<pk>/assign-role/\.<format>/      apps.accounts.api.v1.views.user.UserViewSet     user-assign-role
/api/v1/users/<pk>/change-password/     apps.accounts.api.v1.views.user.UserViewSet     user-change-password
/api/v1/users/<pk>/change-password/\.<format>/  apps.accounts.api.v1.views.user.UserViewSet     user-change-password
/api/v1/users/<pk>/deactivate/  apps.accounts.api.v1.views.user.UserViewSet     user-deactivate
/api/v1/users/<pk>/deactivate/\.<format>/       apps.accounts.api.v1.views.user.UserViewSet     user-deactivate
/api/v1/users/<pk>/hard-delete/ apps.accounts.api.v1.views.user.UserViewSet     user-hard-delete
/api/v1/users/<pk>/hard-delete/\.<format>/      apps.accounts.api.v1.views.user.UserViewSet     user-hard-delete
/api/v1/users/<pk>/reporting-chain/     apps.accounts.api.v1.views.user.UserViewSet     user-reporting-chain
/api/v1/users/<pk>/reporting-chain/\.<format>/  apps.accounts.api.v1.views.user.UserViewSet     user-reporting-chain
/api/v1/users/<pk>/restore/     apps.accounts.api.v1.views.user.UserViewSet     user-restore
/api/v1/users/<pk>/restore/\.<format>/  apps.accounts.api.v1.views.user.UserViewSet     user-restore
/api/v1/users/<pk>/team/        apps.accounts.api.v1.views.user.UserViewSet     user-team
/api/v1/users/<pk>/team/\.<format>/     apps.accounts.api.v1.views.user.UserViewSet     user-team
/api/v1/users/<pk>/unlock/      apps.accounts.api.v1.views.user.UserViewSet     user-unlock
/api/v1/users/<pk>/unlock/\.<format>/   apps.accounts.api.v1.views.user.UserViewSet     user-unlock
/api/v1/users/<user_pk>/mfa-devices/    apps.accounts.api.v1.views.mfa.MFADeviceViewSet user-mfa-devices-list
/api/v1/users/<user_pk>/mfa-devices/<pk>/       apps.accounts.api.v1.views.mfa.MFADeviceViewSet user-mfa-devices-detail
/api/v1/users/<user_pk>/mfa-devices/<pk>/\.<format>/    apps.accounts.api.v1.views.mfa.MFADeviceViewSet
user-mfa-devices-detail
/api/v1/users/<user_pk>/mfa-devices/<pk>/hard-delete/   apps.accounts.api.v1.views.mfa.MFADeviceViewSet
user-mfa-devices-hard-delete
/api/v1/users/<user_pk>/mfa-devices/<pk>/hard-delete/\.<format>/        apps.accounts.api.v1.views.mfa.MFADeviceViewSet

user-mfa-devices-hard-delete
/api/v1/users/<user_pk>/mfa-devices/<pk>/restore/       apps.accounts.api.v1.views.mfa.MFADeviceViewSet
user-mfa-devices-restore
/api/v1/users/<user_pk>/mfa-devices/<pk>/restore/\.<format>/    apps.accounts.api.v1.views.mfa.MFADeviceViewSet
user-mfa-devices-restore
/api/v1/users/<user_pk>/mfa-devices/<pk>/set-primary/   apps.accounts.api.v1.views.mfa.MFADeviceViewSet
user-mfa-devices-set-primary
/api/v1/users/<user_pk>/mfa-devices/<pk>/set-primary/\.<format>/        apps.accounts.api.v1.views.mfa.MFADeviceViewSet

user-mfa-devices-set-primary
/api/v1/users/<user_pk>/mfa-devices/<pk>/verify/        apps.accounts.api.v1.views.mfa.MFADeviceViewSet
user-mfa-devices-verify-device
/api/v1/users/<user_pk>/mfa-devices/<pk>/verify/\.<format>/     apps.accounts.api.v1.views.mfa.MFADeviceViewSet
user-mfa-devices-verify-device
/api/v1/users/<user_pk>/mfa-devices/\.<format>/ apps.accounts.api.v1.views.mfa.MFADeviceViewSet user-mfa-devices-list
/api/v1/users/<user_pk>/mfa-devices/activity/   apps.accounts.api.v1.views.mfa.MFADeviceViewSet
user-mfa-devices-recent-activity
/api/v1/users/<user_pk>/mfa-devices/activity/\.<format>/        apps.accounts.api.v1.views.mfa.MFADeviceViewSet
user-mfa-devices-recent-activity
/api/v1/users/<user_pk>/mfa-devices/backup-codes-status/        apps.accounts.api.v1.views.mfa.MFADeviceViewSet
user-mfa-devices-backup-codes-status
/api/v1/users/<user_pk>/mfa-devices/backup-codes-status/\.<format>/     apps.accounts.api.v1.views.mfa.MFADeviceViewSet

user-mfa-devices-backup-codes-status
/api/v1/users/<user_pk>/mfa-devices/disable/    apps.accounts.api.v1.views.mfa.MFADeviceViewSet
user-mfa-devices-disable-mfa
/api/v1/users/<user_pk>/mfa-devices/disable/\.<format>/ apps.accounts.api.v1.views.mfa.MFADeviceViewSet
user-mfa-devices-disable-mfa
/api/v1/users/<user_pk>/mfa-devices/failure-rate/       apps.accounts.api.v1.views.mfa.MFADeviceViewSet
user-mfa-devices-failure-rate
/api/v1/users/<user_pk>/mfa-devices/failure-rate/\.<format>/    apps.accounts.api.v1.views.mfa.MFADeviceViewSet
user-mfa-devices-failure-rate
/api/v1/users/<user_pk>/mfa-devices/generate-backup-codes/      apps.accounts.api.v1.views.mfa.MFADeviceViewSet
user-mfa-devices-generate-backup-codes
/api/v1/users/<user_pk>/mfa-devices/generate-backup-codes/\.<format>/   apps.accounts.api.v1.views.mfa.MFADeviceViewSet

user-mfa-devices-generate-backup-codes
/api/v1/users/<user_pk>/mfa-devices/setup-totp/ apps.accounts.api.v1.views.mfa.MFADeviceViewSet
user-mfa-devices-setup-totp
/api/v1/users/<user_pk>/mfa-devices/setup-totp/\.<format>/      apps.accounts.api.v1.views.mfa.MFADeviceViewSet
user-mfa-devices-setup-totp
/api/v1/users/<user_pk>/mfa-devices/status/     apps.accounts.api.v1.views.mfa.MFADeviceViewSet user-mfa-devices-mfa-status
/api/v1/users/<user_pk>/mfa-devices/status/\.<format>/  apps.accounts.api.v1.views.mfa.MFADeviceViewSet
user-mfa-devices-mfa-status
/api/v1/users/<user_pk>/mfa-devices/verify-backup/      apps.accounts.api.v1.views.mfa.MFADeviceViewSet
user-mfa-devices-verify-backup-code
/api/v1/users/<user_pk>/mfa-devices/verify-backup/\.<format>/   apps.accounts.api.v1.views.mfa.MFADeviceViewSet
user-mfa-devices-verify-backup-code
/api/v1/users/<user_pk>/mfa-devices/verify-totp-setup/  apps.accounts.api.v1.views.mfa.MFADeviceViewSet
user-mfa-devices-verify-totp-setup
/api/v1/users/<user_pk>/mfa-devices/verify-totp-setup/\.<format>/       apps.accounts.api.v1.views.mfa.MFADeviceViewSet

user-mfa-devices-verify-totp-setup
/api/v1/users/<user_pk>/preferences/    apps.accounts.api.v1.views.preference.UserPreferenceViewSet     user-preferences-list
/api/v1/users/<user_pk>/preferences/<pk>/       apps.accounts.api.v1.views.preference.UserPreferenceViewSet
user-preferences-detail
/api/v1/users/<user_pk>/preferences/<pk>/\.<format>/    apps.accounts.api.v1.views.preference.UserPreferenceViewSet
user-preferences-detail
/api/v1/users/<user_pk>/preferences/<pk>/hard-delete/   apps.accounts.api.v1.views.preference.UserPreferenceViewSet
user-preferences-hard-delete
/api/v1/users/<user_pk>/preferences/<pk>/hard-delete/\.<format>/
apps.accounts.api.v1.views.preference.UserPreferenceViewSet     user-preferences-hard-delete
/api/v1/users/<user_pk>/preferences/<pk>/restore/       apps.accounts.api.v1.views.preference.UserPreferenceViewSet
user-preferences-restore
/api/v1/users/<user_pk>/preferences/<pk>/restore/\.<format>/
apps.accounts.api.v1.views.preference.UserPreferenceViewSet     user-preferences-restore
/api/v1/users/<user_pk>/preferences/\.<format>/ apps.accounts.api.v1.views.preference.UserPreferenceViewSet
user-preferences-list
/api/v1/users/<user_pk>/preferences/my/ apps.accounts.api.v1.views.preference.UserPreferenceViewSet
user-preferences-my-preferences
/api/v1/users/<user_pk>/preferences/my/ apps.accounts.api.v1.views.preference.UserPreferenceViewSet
user-preferences-update-my-preferences
/api/v1/users/<user_pk>/preferences/my/\.<format>/      apps.accounts.api.v1.views.preference.UserPreferenceViewSet
user-preferences-my-preferences
/api/v1/users/<user_pk>/preferences/my/\.<format>/      apps.accounts.api.v1.views.preference.UserPreferenceViewSet
user-preferences-update-my-preferences
/api/v1/users/<user_pk>/preferences/notifications/      apps.accounts.api.v1.views.preference.UserPreferenceViewSet
user-preferences-update-notifications
/api/v1/users/<user_pk>/preferences/notifications/\.<format>/
apps.accounts.api.v1.views.preference.UserPreferenceViewSet     user-preferences-update-notifications
/api/v1/users/<user_pk>/profile/        apps.accounts.api.v1.views.profiles.ProfileViewSet      user-profile-list
/api/v1/users/<user_pk>/profile/<id>/   apps.accounts.api.v1.views.profiles.ProfileViewSet      user-profile-detail
/api/v1/users/<user_pk>/profile/<id>/\.<format>/        apps.accounts.api.v1.views.profiles.ProfileViewSet      user-profile-detail
/api/v1/users/<user_pk>/profile/<id>/avatar/    apps.accounts.api.v1.views.profiles.ProfileViewSet
user-profile-delete-avatar
/api/v1/users/<user_pk>/profile/<id>/avatar/    apps.accounts.api.v1.views.profiles.ProfileViewSet
user-profile-upload-avatar
/api/v1/users/<user_pk>/profile/<id>/avatar/\.<format>/ apps.accounts.api.v1.views.profiles.ProfileViewSet
user-profile-delete-avatar
/api/v1/users/<user_pk>/profile/<id>/avatar/\.<format>/ apps.accounts.api.v1.views.profiles.ProfileViewSet
user-profile-upload-avatar
/api/v1/users/<user_pk>/profile/<id>/certifications-summary/    apps.accounts.api.v1.views.profiles.ProfileViewSet
user-profile-certifications-summary
/api/v1/users/<user_pk>/profile/<id>/certifications-summary/\.<format>/
apps.accounts.api.v1.views.profiles.ProfileViewSet      user-profile-certifications-summary
/api/v1/users/<user_pk>/profile/<id>/certifications/    apps.accounts.api.v1.views.profiles.ProfileViewSet
user-profile-add-certification
/api/v1/users/<user_pk>/profile/<id>/certifications/<cert_name>/        apps.accounts.api.v1.views.profiles.ProfileViewSet
user-profile-remove-certification
/api/v1/users/<user_pk>/profile/<id>/certifications/<cert_name>/\.<format>/
apps.accounts.api.v1.views.profiles.ProfileViewSet      user-profile-remove-certification
/api/v1/users/<user_pk>/profile/<id>/certifications/\.<format>/ apps.accounts.api.v1.views.profiles.ProfileViewSet
user-profile-add-certification
/api/v1/users/<user_pk>/profile/<id>/hard-delete/       apps.accounts.api.v1.views.profiles.ProfileViewSet
user-profile-hard-delete
/api/v1/users/<user_pk>/profile/<id>/hard-delete/\.<format>/    apps.accounts.api.v1.views.profiles.ProfileViewSet
user-profile-hard-delete
/api/v1/users/<user_pk>/profile/<id>/restore/   apps.accounts.api.v1.views.profiles.ProfileViewSet      user-profile-restore
/api/v1/users/<user_pk>/profile/<id>/restore/\.<format>/        apps.accounts.api.v1.views.profiles.ProfileViewSet
user-profile-restore
/api/v1/users/<user_pk>/profile/<id>/skills-summary/    apps.accounts.api.v1.views.profiles.ProfileViewSet
user-profile-skills-summary
/api/v1/users/<user_pk>/profile/<id>/skills-summary/\.<format>/ apps.accounts.api.v1.views.profiles.ProfileViewSet
user-profile-skills-summary
/api/v1/users/<user_pk>/profile/<id>/skills/    apps.accounts.api.v1.views.profiles.ProfileViewSet      user-profile-add-skill
/api/v1/users/<user_pk>/profile/<id>/skills/<skill_name>/       apps.accounts.api.v1.views.profiles.ProfileViewSet
user-profile-remove-skill
/api/v1/users/<user_pk>/profile/<id>/skills/<skill_name>/       apps.accounts.api.v1.views.profiles.ProfileViewSet
user-profile-update-skill
/api/v1/users/<user_pk>/profile/<id>/skills/<skill_name>/\.<format>/
apps.accounts.api.v1.views.profiles.ProfileViewSet      user-profile-remove-skill
/api/v1/users/<user_pk>/profile/<id>/skills/<skill_name>/\.<format>/
apps.accounts.api.v1.views.profiles.ProfileViewSet      user-profile-update-skill
/api/v1/users/<user_pk>/profile/<id>/skills/\.<format>/ apps.accounts.api.v1.views.profiles.ProfileViewSet
user-profile-add-skill
/api/v1/users/<user_pk>/profile/\.<format>/     apps.accounts.api.v1.views.profiles.ProfileViewSet      user-profile-list
/api/v1/users/<user_pk>/profile/my/     apps.accounts.api.v1.views.profiles.ProfileViewSet      user-profile-my-profile
/api/v1/users/<user_pk>/profile/my/     apps.accounts.api.v1.views.profiles.ProfileViewSet      user-profile-update-my-profile
/api/v1/users/<user_pk>/profile/my/\.<format>/  apps.accounts.api.v1.views.profiles.ProfileViewSet
user-profile-my-profile
/api/v1/users/<user_pk>/profile/my/\.<format>/  apps.accounts.api.v1.views.profiles.ProfileViewSet
user-profile-update-my-profile
/api/v1/users/<user_pk>/profile/my/certifications-summary/      apps.accounts.api.v1.views.profiles.ProfileViewSet
user-profile-my-certifications-summary
/api/v1/users/<user_pk>/profile/my/certifications-summary/\.<format>/
apps.accounts.api.v1.views.profiles.ProfileViewSet      user-profile-my-certifications-summary
/api/v1/users/<user_pk>/profile/my/skills-summary/      apps.accounts.api.v1.views.profiles.ProfileViewSet
user-profile-my-skills-summary
/api/v1/users/<user_pk>/profile/my/skills-summary/\.<format>/   apps.accounts.api.v1.views.profiles.ProfileViewSet
user-profile-my-skills-summary
/api/v1/users/<user_pk>/sessions/       apps.accounts.api.v1.views.session.SessionViewSet       user-sessions-list
/api/v1/users/<user_pk>/sessions/<pk>/  apps.accounts.api.v1.views.session.SessionViewSet       user-sessions-detail
/api/v1/users/<user_pk>/sessions/<pk>/\.<format>/       apps.accounts.api.v1.views.session.SessionViewSet
user-sessions-detail
/api/v1/users/<user_pk>/sessions/<pk>/terminate/        apps.accounts.api.v1.views.session.SessionViewSet
user-sessions-terminate
/api/v1/users/<user_pk>/sessions/<pk>/terminate/\.<format>/     apps.accounts.api.v1.views.session.SessionViewSet
user-sessions-terminate
/api/v1/users/<user_pk>/sessions/\.<format>/    apps.accounts.api.v1.views.session.SessionViewSet       user-sessions-list
/api/v1/users/<user_pk>/sessions/active/        apps.accounts.api.v1.views.session.SessionViewSet
user-sessions-active-sessions
/api/v1/users/<user_pk>/sessions/active/\.<format>/     apps.accounts.api.v1.views.session.SessionViewSet
user-sessions-active-sessions
/api/v1/users/<user_pk>/sessions/current/       apps.accounts.api.v1.views.session.SessionViewSet
user-sessions-current-session
/api/v1/users/<user_pk>/sessions/current/\.<format>/    apps.accounts.api.v1.views.session.SessionViewSet
user-sessions-current-session
/api/v1/users/<user_pk>/sessions/tenant-active/ apps.accounts.api.v1.views.session.SessionViewSet
user-sessions-tenant-active
/api/v1/users/<user_pk>/sessions/tenant-active/\.<format>/      apps.accounts.api.v1.views.session.SessionViewSet
user-sessions-tenant-active
/api/v1/users/<user_pk>/sessions/terminate-all/ apps.accounts.api.v1.views.session.SessionViewSet
user-sessions-terminate-all
/api/v1/users/<user_pk>/sessions/terminate-all/\.<format>/      apps.accounts.api.v1.views.session.SessionViewSet
user-sessions-terminate-all
/api/v1/users/\.<format>/       apps.accounts.api.v1.views.user.UserViewSet     user-list
/api/v1/users/invite/   apps.accounts.api.v1.views.user.UserViewSet     user-invite
/api/v1/users/invite/\.<format>/        apps.accounts.api.v1.views.user.UserViewSet     user-invite
/api/v1/users/me/       apps.accounts.api.v1.views.user.UserViewSet     user-me
/api/v1/users/me/\.<format>/    apps.accounts.api.v1.views.user.UserViewSet     user-me
/api/v1/users/me/reporting-chain/       apps.accounts.api.v1.views.user.UserViewSet     user-my-reporting-chain
/api/v1/users/me/reporting-chain/\.<format>/    apps.accounts.api.v1.views.user.UserViewSet     user-my-reporting-chain
/api/v1/users/me/team/  apps.accounts.api.v1.views.user.UserViewSet     user-my-team
/api/v1/users/me/team/\.<format>/       apps.accounts.api.v1.views.user.UserViewSet     user-my-team
