(falc) PS C:\Users\Dazlah Administrator\Desktop\Falcon_pms> python scratch/accounts_endpoints.py
================================================================================
LOGGING IN...
================================================================================
✅ Login successful!
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90e...
Headers: {'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzgwNzU3NDA4LCJpYXQiOjE3ODA3NTU2MDksImp0aSI6IjM2NGUyZWU5OTRiNjRkNTE4NDEyZGQ2OGE0MGVmOGZiIiwidXNlcl9pZCI6ImFiZmIwOGVlLTZmMWYtNDIzMS1hOGE2LWUxMjIxNzU4MjViMSIsImVtYWlsIjoibGFiYW5AZ21haWwuY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwidGVuYW50X2lkIjoiMzAyOTU5NDQtN2M4Ni00NThkLWI4Y2ItOTQ1OGJjNjdhYTZiIiwiaXNzIjoiRmFsY29uUE1TIn0.-4233Ug-wKu4Ozg0Kw9JQtmlhYpQDgrNt_kb7QC4ERM', 'X-Tenant-ID': '30295944-7c86-458d-b8cb-9458bc67aa6b', 'Content-Type': 'application/json'}
--------------------------------------------------------------------------------
================================================================================
ACCOUNTS API ENDPOINT TEST
================================================================================
Testing 44 endpoints with 10 workers
--------------------------------------------------------------------------------

📁 TESTING: Authentication
----------------------------------------
  ❌ POST 401 - 4.078s - http://127.0.0.1:8000/api/v1/auth/refresh/
      Response: {"error":"Invalid refresh token"}...
  ❌ GET 405 - 4.142s - http://127.0.0.1:8000/api/v1/auth/logout/
      Response: {"detail":"Method \"GET\" not allowed."}...

📁 TESTING: User Management
----------------------------------------
  ✅ GET 200 - 7.21s - http://127.0.0.1:8000/api/v1/users/me/team/
  ✅ GET 200 - 7.285s - http://127.0.0.1:8000/api/v1/users/me/reporting-chain/
  ✅ GET 200 - 7.354s - http://127.0.0.1:8000/api/v1/users/me/
  ✅ GET 200 - 7.435s - http://127.0.0.1:8000/api/v1/users/?page=1&page_size=10

📁 TESTING: Roles & Permissions
----------------------------------------
  ✅ GET 200 - 5.623s - http://127.0.0.1:8000/api/v1/permissions/
  ✅ GET 200 - 5.701s - http://127.0.0.1:8000/api/v1/roles/assignable/
  ✅ GET 200 - 5.768s - http://127.0.0.1:8000/api/v1/roles/system/
  ✅ GET 200 - 5.835s - http://127.0.0.1:8000/api/v1/roles/

📁 TESTING: MFA (Multi-Factor Authentication)
----------------------------------------
  ✅ GET 200 - 9.8s - http://127.0.0.1:8000/api/v1/mfa/audit-logs/summary/
  ✅ GET 200 - 9.872s - http://127.0.0.1:8000/api/v1/mfa/devices/activity/
  ✅ GET 200 - 9.947s - http://127.0.0.1:8000/api/v1/mfa/audit-logs/
  ✅ GET 200 - 10.059s - http://127.0.0.1:8000/api/v1/mfa/devices/status/
  ✅ GET 200 - 10.13s - http://127.0.0.1:8000/api/v1/mfa/devices/
  ✅ GET 200 - 10.224s - http://127.0.0.1:8000/api/v1/mfa/devices/backup-codes-status/

📁 TESTING: Sessions
----------------------------------------
  ✅ GET 200 - 7.8s - http://127.0.0.1:8000/api/v1/sessions/
  ❌ GET 404 - 7.849s - http://127.0.0.1:8000/api/v1/sessions/current/
      Response: {"error":"No active session found"}...
  ✅ GET 200 - 7.899s - http://127.0.0.1:8000/api/v1/sessions/active/

📁 TESTING: Audit Logs
----------------------------------------
  ✅ GET 200 - 12.055s - http://127.0.0.1:8000/api/v1/audit-logs/security-events/
  ✅ GET 200 - 12.13s - http://127.0.0.1:8000/api/v1/audit-logs/anomaly-detection/
  ✅ GET 200 - 12.213s - http://127.0.0.1:8000/api/v1/audit-logs/user-summary/
  ✅ GET 200 - 12.288s - http://127.0.0.1:8000/api/v1/audit-logs/tenant-summary/
  ✅ GET 200 - 12.359s - http://127.0.0.1:8000/api/v1/audit-logs/

📁 TESTING: System Settings
----------------------------------------
  ✅ GET 200 - 5.187s - http://127.0.0.1:8000/api/v1/system-settings/reset/
  ✅ GET 200 - 5.258s - http://127.0.0.1:8000/api/v1/system-settings/
  ❌ GET 405 - 5.312s - http://127.0.0.1:8000/api/v1/system-settings/sync-policy/
      Response: {"detail":"Method \"GET\" not allowed."}...

📁 TESTING: Security
----------------------------------------
  ✅ GET 200 - 7.359s - http://127.0.0.1:8000/api/v1/security/login-attempts/
  ✅ GET 200 - 7.421s - http://127.0.0.1:8000/api/v1/security/policy/
  ✅ GET 200 - 7.479s - http://127.0.0.1:8000/api/v1/security/lockout-summary/

📁 TESTING: MFA Policy
----------------------------------------
  ✅ GET 200 - 4.682s - http://127.0.0.1:8000/api/v1/security/mfa/policy/
  ✅ GET 200 - 4.743s - http://127.0.0.1:8000/api/v1/security/mfa/users/

📁 TESTING: Admin
----------------------------------------
  ✅ GET 200 - 8.579s - http://127.0.0.1:8000/api/v1/admin/users/stats/
  ✅ GET 200 - 8.636s - http://127.0.0.1:8000/api/v1/admin/tenants/
  ✅ GET 200 - 8.706s - http://127.0.0.1:8000/api/v1/admin/system/
  ✅ GET 200 - 8.764s - http://127.0.0.1:8000/api/v1/admin/system/health/
  ✅ GET 200 - 8.854s - http://127.0.0.1:8000/api/v1/admin/tenants/stats/
  ✅ GET 200 - 8.92s - http://127.0.0.1:8000/api/v1/admin/users/

📁 TESTING: Profiles
----------------------------------------
  ✅ GET 200 - 6.276s - http://127.0.0.1:8000/api/v1/profiles/my/
  ✅ GET 200 - 6.347s - http://127.0.0.1:8000/api/v1/profiles/my/certifications-summary/
  ✅ GET 200 - 6.415s - http://127.0.0.1:8000/api/v1/profiles/my/skills-summary/

📁 TESTING: Preferences
----------------------------------------
  ✅ GET 200 - 4.461s - http://127.0.0.1:8000/api/v1/preferences/tenants/my-tenant/
  ✅ GET 200 - 4.531s - http://127.0.0.1:8000/api/v1/preferences/users/my/

📁 TESTING: Invitations
----------------------------------------
  ✅ GET 200 - 2.063s - http://127.0.0.1:8000/api/v1/auth/invitations/

================================================================================
WRITE OPERATIONS TESTS
================================================================================

📝 Testing POST /users/ (Create User)...
  Status: 201
  ✅ User created: None

📝 Testing PATCH /users/{id}/ (Update User)...
  Status: 404

📝 Testing DELETE /users/{id}/ (Delete User)...
  Status: 404

📝 Testing POST /users/invite/ (Invite User)...
  Status: 400
  ⚠️ Response: {"error":"Unable to send invitation. Please try again."}

📝 Testing POST /mfa/devices/setup-totp/ (Setup TOTP)...
  Status: 201
  ✅ TOTP setup initiated for 'Test Device 1780755707'
      Device ID: 85413ed0-f105-49b9-8dc7-d26def1c07ed

================================================================================
FINAL RESULTS SUMMARY
================================================================================

📊 ENDPOINT SUMMARY:
  ✅ Successful GET requests: 40
  ❌ Failed GET requests: 4
  💥 Errors: 0
  📁 Total endpoints tested: 44

📊 WRITE OPERATIONS SUMMARY:
  📝 POST /users/ (Create): ✅
  📝 PATCH /users/ (Update): N/A
  📝 DELETE /users/ (Delete): N/A
  📝 POST /users/invite/: ⚠️
  📝 POST /mfa/devices/setup-totp/: ✅

⏱️ Total test time: 100.14s

================================================================================
TEST COMPLETE
================================================================================