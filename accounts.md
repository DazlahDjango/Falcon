# User Management — Role Requirements
# Super Admin (System-Wide)

1. User Management (Across All Tenants)
Capability	Description
View all users	See every user across all tenants with filtering by organization, role, status, etc.
Create users in any tenant	Create users in any organization. Must specify the tenant_id. Can assign any role.
Bulk import users	Import users into any tenant from CSV/Excel. Useful for onboarding large clients.
Bulk export users	Export users from any tenant for reporting, auditing, or migration support.
Assign any role	Can assign super_admin, client_admin, dashboard_champion, executive, supervisor, staff, read_only to any user.
Suspend/activate users	Suspend or reactivate any user in any tenant.
Hard delete users	Permanently delete a user (soft delete is default, hard delete for GDPR/erasure requests).
Reset user passwords	Force password reset for any user.
Unlock user accounts	Unlock accounts that have been locked due to failed login attempts.
Modify user details	Change any user's details: name, email, department, job title, employee ID, manager, etc.
View user audit trail	See all actions performed on a user (who changed what, when).
2. Client Admin Management
Capability	Description
Assign client admin	Designate the single Client Admin for an organization. Only one per tenant.
Replace client admin	If the Client Admin leaves or needs to be changed, Super Admin can assign a new one and optionally suspend the old one.
Override client admin actions	Revert changes made by Client Admin (roles, manager assignments, suspensions, etc.) using audit trail.
Reactivate suspended client admin	If a Client Admin accidentally suspends themselves, Super Admin can reactivate.
3. Support & Troubleshooting
Impersonate users (with consent)	Log in as any user (with proper authorization and audit trail) to troubleshoot issues.
Export system reports	Generate reports on user activity, adoption rates, compliance, etc.
4. Security & Compliance
Configure system-wide MFA policies	Set MFA requirements per role or globally.
Manage password policies	Configure password complexity, expiry periods, and history requirements.

## NOTE:
Restrictions
None — Super Admin has full system access. However, all actions must be logged with full audit trails for accountability.
More thing:
Super admin doesn't need the tenant id to login but the other users need the tenant ID(And I mean all the other users need the tenant id), 

# Client Admin (Tenant-Scoped)
1. User Management (Within Their Tenant Only)
Capability	Description
View all users in tenant	See all users in their organization with filtering by department, role, status, etc.
Create individual users	Create new users with roles: dashboard_champion, executive, supervisor, staff, read_only
Bulk import users	Import users from CSV/Excel during migration from old systems.
Bulk export users	Export all users for reporting or integration with HR systems.
Bulk updates	Update user details in bulk (e.g., change department for all users in a team).
Assign manager	Set the manager field for any user (must be from same tenant).
Edit user details	Modify: first name, last name, email, phone, department, job title, employee ID etc.
Suspend/activate users	Suspend users who leave the organization; reactivate if they return.
Reset user passwords	Force password reset for any user.
Unlock user accounts	Unlock accounts locked due to failed login attempts.
View user activity	See user status, last login, account creation date, etc.
Soft delete users	Mark users as deleted (soft delete). Data is retained for audit/history.

2. Password Management for Users(NOTE: This should be in tenant based not overal system, only their tenants)
Capability	Description
Set default password on creation	When creating a user, Client Admin can set a default password (or use a system-generated strong password, or use email, employee id etc)(and the format will be used to all users not everytime they create new users they ahev to set the passwod).
Force password change at first login	Users must change their password on first login (whether default was set by admin or system-generated).
Send welcome email with credentials	Optionally send the user an email with their login credentials and a link to set their password.
Reset password on demand	Force a password reset for any user at any time.
View password policy	See system password requirements (complexity, length, etc.) to guide users.

3.  Security & Compliance (Within Tenant)
Capability	Description
View tenant audit logs	See all user management actions performed within their tenant.
Enforce MFA for users	Require specific users or roles to enable MFA (if system allows).
Monitor suspicious activity	View failed login attempts and locked accounts within their tenant.
Export compliance reports	Generate reports for internal audits or donor requirements.

5. Reporting & Monitoring
Capability	Description
View adoption metrics	See which users have logged in, changed passwords, completed onboarding, etc.
Generate user reports	Create reports on user distribution by department, role, status, etc.
Track data submission	Monitor which users have submitted their monthly KPIs (compliance tracking).
Export user data	Export user lists in CSV, Excel, or PDF formats.

# NOTE(Client admin)
Restrictions (Strictly Enforced)
Restriction	Reason
❌ Cannot create another Client Admin	Only Super Admin can assign this role. Ensures Falcon has a single point of contact.
❌ Cannot create a Super Admin	Super Admin is system-wide — not a tenant-level role.
❌ Cannot assign super_admin or client_admin roles	These roles are reserved for Super Admin only.
❌ Cannot view users from other tenants	Data isolation is enforced by the IsolationEnforcer and database router.
❌ Cannot hard delete users	Only soft delete. Hard delete requires Super Admin (and proper audit/justification).
❌ Cannot modify a user's tenant_id	Tenant ID is editable=False and cannot be changed.
❌ Cannot modify their own role or permissions	Prevents self-elevation or accidental demotion.
❌ Cannot bypass MFA/security policies	Security policies are enforced system-wide.
❌ Cannot change email to one already in use	Email must be unique across the entire system (not just tenant).



Another NOTE:
For Bulk Imports Specifically:
When Client Admin imports 100+ users from their old system:

Client Admin uploads CSV with user data

The system creates all user accounts with:

is_active = True

is_verified = False (not yet verified)

password = unusable (no password set yet)

The system automatically sends each user a welcome/invitation email

Each email contains a unique, time-limited link (e.g., 48 hours)

User clicks link, sets their own password, and logs in

If the link expires, the user can request a new one via "Forgot Password"


Password Management — Default Password Approach
Now, to address your question about default passwords. Let me think through a secure approach:

Issue You Raised:
In Maseno's case, admission number is both username and password

Someone else could log in before the real user and change details

Security risk — eavesdropping, data theft, etc.

My Recommendation:
Option 1: System-Generated Strong Password (Recommended)

When a Client Admin creates a user:

The system generates a strong, random password (e.g., xK9#mP2$vN5@qR8)

The system sends the user a welcome email containing:

Their login email

A temporary password

A link to set their own password (or a mandatory password change on first login)

The password is one-time use only — after first login, they must change it

The system does not store the generated password in plaintext — it's hashed immediately

Option 2: Client-Provided Default Password (With Limitations)

If Client Admin wants to set a custom default password:

Client Admin can set a default password during user creation

The password must meet complexity requirements (length, special characters, etc.)

The user is forced to change it on first login

The Client Admin is warned about security risks if the password is weak

Option 3: No Default Password — Invite-Only Flow

Instead of setting a password:

Client Admin creates the user with email only

System sends an invitation email with a secure, time-limited link

User clicks the link and sets their own password directly

Link expires after 24-48 hours for security

Which option do you prefer here(I'd go for 1 and 3)


Remember those actions like activate, verifying, impersonating etc(though some existis)
Remeber we're upgrading, 10/10 enterprise level upgrading, please make me proud