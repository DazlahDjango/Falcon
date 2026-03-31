"""
Management commands for Accounts app.
Available commands:
- create_superuser_tenant: Create superuser with tenant association
- clean_expired_sessions: Clean up expired user sessions
- rotate_secrets: Rotate JWT secrets and other sensitive keys
- sync_roles: Sync predefined system roles and permissions
- cleanup_audit_logs: Clean up old audit logs
- unlock_accounts: Unlock locked user accounts
- export_users: Export users to CSV/JSON
- send_test_email: Send test email to verify email configuration
- cleanup_blacklist: Clean up expired token blacklist entries
- backup_users: Backup users and related data
- seed_demo_data: Seed demo data for testing
"""

# This file is intentionally left to document available commands.