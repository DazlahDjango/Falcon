### Management Commands For Admin Operations
1. User Management
- Directory & Single User Profile
# List users (supports --tenant-id, --admin, --role, --status, --search, --limit)
python manage.py manage_user list --limit 10
python manage.py manage_user list --admin careen@falcontech.com --role staff
python manage.py manage_user list --status locked

# View detailed profile of a single user
python manage.py manage_user info --email user@example.com

- User Lifecycle & Status Control
# Create user (inherits tenant from client admin or explicit --tenant-id)
python manage.py manage_user create --email newuser@falcontech.com --role staff --admin careen@falcontech.com

# Activate / Deactivate (single user or tenant-wide)
python manage.py manage_user activate --email user@example.com
python manage.py manage_user deactivate --admin careen@falcontech.com

# Lock / Unlock (single user or tenant-wide)
python manage.py manage_user lock --email user@example.com --hours 24
python manage.py manage_user unlock --email user@example.com
python manage.py manage_user unlock --admin careen@falcontech.com

# Verify / Unverify
python manage.py manage_user verify --email user@example.com
python manage.py manage_user unverify --email user@example.com

# Password & Role Management
python manage.py manage_user set-password --email user@example.com --password "NewSecurePass123!"
python manage.py manage_user set-role --email user@example.com --role supervisor
python manage.py manage_user delete --email user@example.com

# Batch reset passwords across an entire tenant or role
python manage.py manage_user reset-passwords --admin careen@falcontech.com --password "Admin@123" --role staff

- Invitations
# Invite a user (automatically inherits tenant_id from client admin)
python manage.py manage_user invite --email invitee@example.com --role staff --admin careen@falcontech.com

# List pending invitations
python manage.py manage_user list-invitations --admin careen@falcontech.com

# Revoke an invitation
python manage.py manage_user revoke-invitation --invitation-id <token_or_hash> --admin careen@falcontech.com

- Bulk Import & Export
# Import users from CSV (inherits tenant_id from client admin)
python manage.py manage_user import --file accs.csv --admin careen@falcontech.com

# Export users to CSV / JSON
python manage.py manage_user export --output users.csv --format csv --admin careen@falcontech.com
python manage.py manage_user export --output users.json --format json --active-only

2. MFA Management
- Status & Inspection
# User MFA status (devices, policy requirements, failure rate, backup codes count)
python manage.py manage_mfa status --email staff_mfa_tester@falcontech.com

# Tenant MFA summary (total users, % enabled, required roles, policy version)
python manage.py manage_mfa status --admin careen@falcontech.com

# Global system-wide MFA summary
python manage.py manage_mfa status

- Enrollment, Verification & Backup Codes
# Setup / Enroll TOTP device (generates Secret Key, URI, and 10 emergency backup codes)
python manage.py manage_mfa setup --email user@example.com --device-name "Work iPhone"

# Verify OTP code or backup code
python manage.py manage_mfa verify --email user@example.com --otp 495015

# Generate fresh 10 emergency backup codes
python manage.py manage_mfa generate-backup-codes --email user@example.com

- Device Management
# List all registered MFA devices for a user
python manage.py manage_mfa list-devices --email user@example.com

# Set a device as primary
python manage.py manage_mfa set-primary --email user@example.com --device-id <uuid>

# Remove a specific device
python manage.py manage_mfa remove-device --email user@example.com --device-id <uuid>

- Enable, Disable & Reset
# Enable / Disable MFA for a user
python manage.py manage_mfa enable --email user@example.com
python manage.py manage_mfa disable --email user@example.com

# Complete MFA reset (clears all devices and backup codes)
python manage.py manage_mfa reset --email user@example.com
python manage.py manage_mfa reset-tenant --admin careen@falcontech.com

- Tenant MFA Policy & Audit Logs
# Update Tenant MFA required roles
python manage.py manage_mfa set-policy --admin careen@falcontech.com --roles client_admin supervisor staff
python manage.py manage_mfa set-policy --admin careen@falcontech.com --clear

# View security audit logs
python manage.py manage_mfa audit-logs --admin careen@falcontech.com --limit 20

3. Password Management
- Status & Inspection
# User password security status (last changed, must change on login, lock status, history count)
python manage.py manage_password status --email user@example.com

# Tenant password summary (total users, % requiring change, never changed)
python manage.py manage_password status --admin careen@falcontech.com
python manage.py manage_password status --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9

# Global system-wide password security overview
python manage.py manage_password status

- Change & Direct Setting
# Change user password with current password verification
python manage.py manage_password change --email user@example.com --old-password "OldPass123!" --new-password "NewPass456!"

# Directly set new password (bypasses old password, terminates active sessions)
python manage.py manage_password set-password --email user@example.com --password "SecurePass@2026!" --must-change

- Password Reset Workflow
# Request password reset email (dispatches email with reset token)
python manage.py manage_password reset --email user@example.com
python manage.py manage_password reset --email user@example.com --print-token

# Confirm password reset with token
python manage.py manage_password confirm-reset --token <reset_token> --new-password "FreshPass@2026!"

- Admin Force Password Reset
# Force password reset on a specific user
python manage.py manage_password force-reset --email user@example.com
python manage.py manage_password force-reset --email user@example.com --print-token

# Force password reset for all active users in a tenant
python manage.py manage_password force-reset --admin careen@falcontech.com
python manage.py manage_password force-reset --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9

- Bulk Password Reset & Uniform Setup
# Reset all users in a tenant to a known uniform password (e.g. Admin@123)
python manage.py manage_password bulk-reset --admin careen@falcontech.com --password "Admin@123"
python manage.py manage_password bulk-reset --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9 --password "Admin@123"

# Reset all users across the ENTIRE system
python manage.py manage_password bulk-reset --all-system --password "Admin@123"

# Bulk reset specific role with system-generated secure passwords & force change on login
python manage.py manage_password bulk-reset --admin careen@falcontech.com --role staff --mode system_generated --must-change

- Password History & Policy Validation
# Clear 5-password history records (allows reuse of previous passwords)
python manage.py manage_password clear-history --email user@example.com
python manage.py manage_password clear-history --admin careen@falcontech.com

# Validate password strength and reuse against policy
python manage.py manage_password validate --password "MySecretPass123!" --email user@example.com

4. Sessions Management
- Listing & Active Sessions
# List sessions with optional filters (supports --tenant-id, --admin, --status, --device, --ip, --limit)
python manage.py manage_sessions list --limit 20
python manage.py manage_sessions list --email user@example.com
python manage.py manage_sessions list --admin careen@falcontech.com --status active --limit 30
python manage.py manage_sessions list --device mobile --status active

# View active non-expired sessions
python manage.py manage_sessions active --email user@example.com
python manage.py manage_sessions active --admin careen@falcontech.com
python manage.py manage_sessions active --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9
python manage.py manage_sessions active

- Session Details & Inspection
# Retrieve detailed metadata for a specific session UUID (IP, device, browser, OS, location, expiry, alerts)
python manage.py manage_sessions details --session-id <session_uuid>

- Session Termination
# Terminate a single active session by UUID
python manage.py manage_sessions terminate --session-id <session_uuid>

# Terminate all active sessions for a user
python manage.py manage_sessions terminate-all --email user@example.com

# Terminate all active sessions across an entire tenant
python manage.py manage_sessions terminate-all --admin careen@falcontech.com
python manage.py manage_sessions terminate-all --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9

# Terminate all active sessions system-wide
python manage.py manage_sessions terminate-all --all-system

- JWT Blacklist Management
# View active blacklisted JWT token JTIs
python manage.py manage_sessions blacklist --view

# Add a compromised JWT token ID (JTI) to the blacklist
python manage.py manage_sessions blacklist --token-id <token_jti> --user-email user@example.com --reason "Compromised device" --hours 48

- Cleanup & Purge
# Purge old sessions and expired blacklist entries older than X days
python manage.py manage_sessions cleanup --days 30
python manage.py manage_sessions cleanup --days 7 --dry-run

- Analytics & Statistics
# View global session analytics & device breakdown
python manage.py manage_sessions stats

# View tenant session analytics & device breakdown
python manage.py manage_sessions stats --admin careen@falcontech.com
python manage.py manage_sessions stats --tenant-id 275adb1f-8e12-46ee-b394-ea42d41b10c9

5. Permissions & RBAC Management
- Catalog & System Apps Inspection
# List all permissions with category and scope labels
python manage.py manage_permissions list

# Filter permissions by category (e.g. kpi, review, user, structure, report, config, billing)
python manage.py manage_permissions list --category kpi

# List system-restricted permissions (Config, Billing, Tenant - Super Admin Exclusive)
python manage.py manage_permissions list --system-only

- Role Baseline Matrix
# Inspect baseline permissions for all 7 role tiers
python manage.py manage_permissions roles

# Inspect baseline permissions for a specific role
python manage.py manage_permissions roles --role client_admin
python manage.py manage_permissions roles --role staff

- User Permissions Breakdown & Overrides
# Inspect user permissions (Role defaults, Granted overrides, Revoked overrides, Effective permissions)
python manage.py manage_permissions user-info --email user@example.com

# Grant custom permission overrides to a user
python manage.py manage_permissions grant --email user@example.com --perms "create_report,export_kpi_data"

# Super Admin issuing system-level permissions (Config, Billing, Tenant) to Client Admin
python manage.py manage_permissions grant --email careen@falcontech.com --perms "manage_configs,view_billing,manage_tenant" --super-admin-override

# Revoke a default role permission from a user
python manage.py manage_permissions revoke --email user@example.com --perms "create_actual"

# Clear all custom overrides (reset back to clean role baseline)
python manage.py manage_permissions clear --email user@example.com

- Redis Permission Cache Invalidation
# Invalidate permissions cache for a specific user
python manage.py manage_permissions purge-cache --email user@example.com

# Invalidate permissions cache system-wide for all users
python manage.py manage_permissions purge-cache --all



