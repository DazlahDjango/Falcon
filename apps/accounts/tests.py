from django.test import TestCase, RequestFactory
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.accounts.models import TenantPreference
from apps.accounts.services.auth.authentication import AuthenticationService
from apps.accounts.api.v1.permissions import IsPasswordChangeCompleted
from rest_framework.test import APIRequestFactory

User = get_user_model()

class AccountsUserManagementTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.drf_factory = APIRequestFactory()
        
        self.tenant_id = 'c732f915-34d1-489d-8551-3c71bf92a372'
        self.other_tenant_id = 'f050d368-7b2f-42af-817e-d8114ae7ddf5'
        
        self.preference, _ = TenantPreference.objects.get_or_create(
            client_id=self.tenant_id,
            defaults={
                'default_password_mode': 'system_generated',
                'force_password_change_on_first_login': True
            }
        )
        
        self.super_admin = User.objects.create_superuser(
            email='super@admin.com',
            username='superadmin',
            password='Password123!',
            role='super_admin'
        )
        
        self.regular_user = User.objects.create_user(
            email='user@tenant.com',
            username='tenantuser',
            password='Password123!',
            tenant_id=self.tenant_id,
            role='staff'
        )
        
        self.client_admin = User.objects.create_user(
            email='admin@tenant.com',
            username='tenantadmin',
            password='Password123!',
            tenant_id=self.tenant_id,
            role='client_admin'
        )

    def test_tenant_id_required_at_login_for_regular_user(self):
        auth_service = AuthenticationService()
        request = self.factory.post('/api/v1/auth/login')
        from django.contrib.sessions.backends.db import SessionStore
        request.session = SessionStore()
        
        user, result, error = auth_service.authenticate(
            email='user@tenant.com',
            password='Password123!',
            ip_address='127.0.0.1',
            user_agent='TestAgent',
            tenant_id=None,
            request=request
        )
        self.assertNilOrError(user, error, "Organization Tenant ID is required")
        
        user, result, error = auth_service.authenticate(
            email='user@tenant.com',
            password='Password123!',
            ip_address='127.0.0.1',
            user_agent='TestAgent',
            tenant_id=self.other_tenant_id,
            request=request
        )
        self.assertNilOrError(user, error, "Invalid Organization Tenant ID for this user")
        
        user, result, error = auth_service.authenticate(
            email='user@tenant.com',
            password='Password123!',
            ip_address='127.0.0.1',
            user_agent='TestAgent',
            tenant_id=self.tenant_id,
            request=request
        )
        self.assertIsNotNone(user)
        self.assertIsNone(error)

    def test_tenant_id_not_required_for_super_admin(self):
        auth_service = AuthenticationService()
        request = self.factory.post('/api/v1/auth/login')
        from django.contrib.sessions.backends.db import SessionStore
        request.session = SessionStore()
        
        user, result, error = auth_service.authenticate(
            email='super@admin.com',
            password='Password123!',
            ip_address='127.0.0.1',
            user_agent='TestAgent',
            tenant_id=None,
            request=request
        )
        self.assertIsNotNone(user)
        self.assertIsNone(error)

    def test_default_password_mode_system_generated(self):
        from apps.accounts.services.auth.password import PasswordService
        password_service = PasswordService()
        
        new_user = User(
            email='newuser@tenant.com',
            username='newuser',
            tenant_id=self.tenant_id
        )
        
        raw_password, password_change_required, mode = password_service.generate_default_password_for_user(new_user, self.tenant_id)
        self.assertEqual(mode, 'system_generated')
        self.assertTrue(password_change_required)
        self.assertIsNotNone(raw_password)
        self.assertTrue(len(raw_password) >= 8)

    def test_default_password_mode_invite_only(self):
        self.preference.default_password_mode = 'invite_only'
        self.preference.save()
        
        from apps.accounts.services.auth.password import PasswordService
        password_service = PasswordService()
        
        new_user = User(
            email='inviteuser@tenant.com',
            username='inviteuser',
            tenant_id=self.tenant_id
        )
        
        raw_password, password_change_required, mode = password_service.generate_default_password_for_user(new_user, self.tenant_id)
        self.assertEqual(mode, 'invite_only')
        self.assertFalse(password_change_required)
        self.assertIsNone(raw_password)

    def test_password_change_required_permission_blocks_requests(self):
        permission = IsPasswordChangeCompleted()
        
        self.regular_user.password_change_required = False
        request = self.drf_factory.get('/api/v1/kpi/')
        request.user = self.regular_user
        self.assertTrue(permission.has_permission(request, None))
        
        self.regular_user.password_change_required = True
        request_blocked = self.drf_factory.get('/api/v1/kpi/')
        request_blocked.user = self.regular_user
        self.assertFalse(permission.has_permission(request_blocked, None))
        
        request_allowed = self.drf_factory.post('/api/v1/auth/me/change-password/')
        request_allowed.user = self.regular_user
        self.assertTrue(permission.has_permission(request_allowed, None))

    def assertNilOrError(self, user, error, expected_error_msg):
        self.assertIsNone(user)
        self.assertEqual(error, expected_error_msg)

    def test_user_directory_report_json(self):
        from apps.accounts.api.v1.views.reports import ReportViewSet
        view = ReportViewSet.as_view({'get': 'user_directory'})
        request = self.drf_factory.get('/api/v1/reports/user-directory/')
        request.user = self.client_admin
        
        response = view(request)
        self.assertEqual(response.status_code, 200)
        self.assertIn('headers', response.data)
        self.assertIn('data', response.data)
        self.assertEqual(response.data['title'], 'User Directory Report')

    def test_user_directory_report_csv(self):
        from apps.accounts.api.v1.views.reports import ReportViewSet
        view = ReportViewSet.as_view({'get': 'user_directory'})
        request = self.drf_factory.get('/api/v1/reports/user-directory/', {'format': 'csv'})
        request.user = self.client_admin
        
        response = view(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'text/csv')
        self.assertIn('attachment; filename="user_directory.csv"', response['Content-Disposition'])

    def test_user_directory_report_xlsx(self):
        from apps.accounts.api.v1.views.reports import ReportViewSet
        view = ReportViewSet.as_view({'get': 'user_directory'})
        request = self.drf_factory.get('/api/v1/reports/user-directory/', {'format': 'xlsx'})
        request.user = self.client_admin
        
        response = view(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        self.assertIn('attachment; filename="user_directory.xlsx"', response['Content-Disposition'])

    def test_user_directory_report_pdf(self):
        from apps.accounts.api.v1.views.reports import ReportViewSet
        view = ReportViewSet.as_view({'get': 'user_directory'})
        request = self.drf_factory.get('/api/v1/reports/user-directory/', {'format': 'pdf'})
        request.user = self.client_admin
        
        response = view(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/pdf')
        self.assertIn('attachment; filename="user_directory.pdf"', response['Content-Disposition'])

    def test_reports_tenant_scoping(self):
        # Setup another user on different tenant
        other_user = User.objects.create_user(
            email='other@tenant.com',
            username='othertenantuser',
            password='Password123!',
            tenant_id=self.other_tenant_id,
            role='staff'
        )
        
        from apps.accounts.api.v1.views.reports import ReportViewSet
        view = ReportViewSet.as_view({'get': 'user_directory'})
        
        # Client admin report should NOT contain other tenant's user
        request_client = self.drf_factory.get('/api/v1/reports/user-directory/')
        request_client.user = self.client_admin
        response_client = view(request_client)
        emails = [row[1] for row in response_client.data['data']]
        self.assertIn(self.regular_user.email, emails)
        self.assertNotIn(other_user.email, emails)
        
        # Super admin report should contain other tenant's user when specified
        request_super = self.drf_factory.get('/api/v1/reports/user-directory/', {'tenant_id': self.other_tenant_id})
        request_super.user = self.super_admin
        response_super = view(request_super)
        emails_super = [row[1] for row in response_super.data['data']]
        self.assertIn(other_user.email, emails_super)
        self.assertNotIn(self.regular_user.email, emails_super)


