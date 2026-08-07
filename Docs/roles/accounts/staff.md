# 👨‍💻 Role Mapping: Staff (`staff`)
**Application:** Accounts (`apps/accounts`)  
**Scope:** Single Organization — Regular Organization Employee

---

## 1. 📌 Role Definition & Strategic Purpose
The **Staff** (`staff`) role represents individual employees within an organization. Staff members focus on personal workspace tasks, self-service profile maintenance, skill updates, and personal security management.

### Enterprise Security Alignment (CIA Triad):
- **Confidentiality:** Strictly isolated to own user record (`user_id == request.user.id`). Cannot view other employees' private details.
- **Integrity:** Self-manages personal credentials, skills, certifications, and multi-factor authentication devices.
- **Availability:** Accesses personal workspace continuously with session tracking and step-up verification for sensitive actions.

---

## 2. 🔑 Authentication & Login Flow
1. **Endpoint:** `POST /api/v1/accounts/auth/login/` -> [LoginView](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/api/v1/views/auth.py#L17)
2. **Tenant Check:** Verified against assigned `tenant_id`.
3. **MFA Check:** Prompted for OTP if MFA is enabled or required by tenant policy.
4. **Token Generation:** Issued JWT tokens containing `'role': 'staff'` and `'tenant_id': '<org-uuid>'`.

---

## 3. 🛠️ Action Matrix & Backend Execution Trace

Below is the complete list of actions executed by a Staff member:

| # | Action Name | HTTP Method & API Endpoint | Backend Service / Manager Trace | Purpose & Business Justification |
|---|---|---|---|---|
| 1 | **Staff Login** | `POST /api/v1/accounts/auth/login/` | [AuthenticationService.authenticate](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/auth/authentication.py#L24) | Authenticate to access personal employee workspace. |
| 2 | **Accept Invitation** | `POST /api/v1/accounts/users/accept-invitation/` | [InvitationService.accept_invitation](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/registration/invitation.py#L41) | Validate invitation token, set initial password, and activate new staff account. |
| 3 | **Complete Onboarding** | Service Function | [UserRegistrationService.complete_onboarding](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/registration/user_registration.py#L60) | Flag user as onboarded (`is_onboarded = True`) upon finishing first-time wizard setup. |
| 4 | **View & Update Own Profile** | `GET, PATCH /api/v1/accounts/profiles/my/` | [ProfileService.update_profile](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/profile/profile_manager.py#L23) | View and update personal profile details (contact phone, DOB, bio, address). |
| 5 | **Upload & Delete Personal Avatar** | `POST, DELETE /api/v1/accounts/profiles/{id}/avatar/` | [AvatarService.upload_avatar](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/profile/avatar.py#L28)<br>[AvatarService.delete_avatar](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/profile/avatar.py#L57) | Upload or remove personal profile photo (auto-processed and thumbnail resized). |
| 6 | **Manage Skills Portfolio** | `POST /api/v1/accounts/profiles/{id}/skills/`<br>`PUT, DELETE /api/v1/accounts/profiles/{id}/skills/{name}/` | [ProfileService.add_skill](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/profile/profile_manager.py#L69)<br>[ProfileService.update_skill](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/profile/profile_manager.py#L96) | Add, update proficiency levels, or remove personal technical/professional skills. |
| 7 | **Manage Certifications** | `POST /api/v1/accounts/profiles/{id}/certifications/`<br>`DELETE /api/v1/accounts/profiles/{id}/certifications/{name}/` | [ProfileService.add_certification](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/profile/profile_manager.py#L147) | Log professional accreditations, issuing bodies, credential IDs, and expiry dates. |
| 8 | **View Personal Preferences** | `GET, PATCH /api/v1/accounts/user-preferences/my/` | [PreferenceService.update_user_preferences](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/profile/preferences.py#L20) | Configure items per page, theme preferences, working hours, and notification channels. |
| 9 | **Configure Personal MFA (TOTP)** | `POST /api/v1/accounts/auth/mfa-setup/`<br>`POST /api/v1/accounts/mfa/devices/setup-totp/` | [MFAService.setup_totp](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/auth/mfa.py#L22) | Generate base32 TOTP secret, render QR code provisioning URI, and verify initial code. |
| 10 | **Generate MFA Recovery Codes** | `POST /api/v1/accounts/mfa/devices/generate-backup-codes/` | [MFAService.regenerate_backup_codes](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/auth/mfa.py#L170) | Generate single-use PBKDF2-hashed backup emergency recovery codes. |
| 11 | **Change Password** | `POST /api/v1/accounts/auth/change-password/` | [PasswordService.change_password](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/auth/password.py#L22) | Change account password with strength verification and previous 5 password reuse prevention. |
| 12 | **Step-Up Action Authentication** | `POST /api/v1/accounts/auth/step-up/` | [StepUpAuthenticationService.verify_step_up](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/auth/step_up_service.py#L24) | Re-verify TOTP code before executing high-sensitivity tasks (valid for 300 seconds). |
| 13 | **View Personal Sessions & Logout** | `GET /api/v1/accounts/sessions/active/`<br>`POST /api/v1/accounts/auth/logout/` | [SessionService.get_active_sessions](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/auth/session.py#L49)<br>[AuthenticationService.logout](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/services/auth/authentication.py#L184) | Inspect active devices/browsers and log out from current session or all devices. |
| 14 | **View Personal Reporting Line** | `GET /api/v1/accounts/users/me/reporting-chain/` | [UserManager.get_reporting_chain](file:///c:/Users/Dazlah%20Administrator/Desktop/Forward/Falcon/apps/accounts/managers/user.py#L248) | Inspect assigned manager and upward reporting chain. |

---

## 4. 🔒 Role Privileges Summary
- **Tenant Scope:** Scoped exclusively to personal user record within `tenant_id`.
- **Assignable Roles:** None.
- **Destructive Rights:** None (only personal avatar and personal profile attributes can be cleared).
