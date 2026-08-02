# apps/reportplt/services/extraction/production/accounts_extractor.py
import logging
from typing import Dict, Any, List, Optional
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta

from apps.accounts.models import (
    User, LoginAttempt, AuditLog,
    MFADevice, MFABackupCode, MFAAuditLog,
    UserSession, Role, Permission,
    TenantPreference
)

logger = logging.getLogger(__name__)


class AccountsUserDirectoryExtractor:
    """Extracts the full user roster by role, department, and login status."""

    def __init__(self, tenant_id=None, filters=None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self):
        qs = User.objects.filter(is_deleted=False)
        if self.tenant_id:
            qs = qs.filter(tenant_id=self.tenant_id)

        total_users = qs.count()
        active_users = qs.filter(is_active=True).count()
        suspended_users = qs.filter(is_active=False).count()
        verified_users = qs.filter(is_verified=True).count()
        role_distribution = list(qs.values('role').annotate(count=Count('id')).order_by('-count'))
        dept_distribution = list(qs.values('department').annotate(count=Count('id')).order_by('-count')[:20])
        cutoff_30 = timezone.now() - timedelta(days=30)
        new_users_30d = qs.filter(created_at__gte=cutoff_30).count()
        never_logged_in = qs.filter(last_login__isnull=True).count()

        user_rows = []
        for u in qs.select_related('manager').order_by('-created_at')[:200]:
            joined = None
            if hasattr(u, 'joined_at') and u.joined_at:
                joined = u.joined_at.isoformat()
            elif u.created_at:
                joined = u.created_at.isoformat()
            user_rows.append({
                'id': str(u.id),
                'full_name': u.get_full_name() or u.username,
                'email': u.email,
                'role': u.role,
                'department': u.department or '',
                'manager_name': u.manager.get_full_name() if u.manager else '',
                'is_active': u.is_active,
                'is_verified': u.is_verified,
                'mfa_enabled': u.mfa_enabled,
                'last_login': u.last_login.isoformat() if u.last_login else None,
                'joined_at': joined,
            })

        return {
            'summary': {
                'total_users': total_users,
                'active_users': active_users,
                'suspended_users': suspended_users,
                'verified_users': verified_users,
                'new_users_30d': new_users_30d,
                'never_logged_in': never_logged_in,
                'role_distribution': role_distribution,
                'department_distribution': dept_distribution,
            },
            'users': user_rows,
        }


class AccountsLoginSecurityExtractor:
    """Extracts login attempt data: successes, failures, lockouts, brute-force IPs."""

    def __init__(self, tenant_id=None, filters=None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self):
        days = int(self.filters.get('days', 30))
        cutoff = timezone.now() - timedelta(days=days)
        qs = LoginAttempt.objects.filter(timestamp__gte=cutoff)
        if self.tenant_id:
            qs = qs.filter(tenant_id=self.tenant_id)

        total_attempts = qs.count()
        successes = qs.filter(result='success').count()
        failures = qs.filter(result='failure').count()
        lockouts = qs.filter(result='locked').count()
        success_rate = round((successes / total_attempts * 100), 2) if total_attempts else 0.0
        failure_reasons = list(qs.filter(result='failure').values('failure_reason').annotate(count=Count('id')).order_by('-count'))
        suspicious_ips = list(qs.filter(result__in=['failure', 'locked']).values('ip_address').annotate(count=Count('id')).order_by('-count')[:10])

        recent_rows = []
        for a in qs.select_related('user').order_by('-timestamp')[:100]:
            recent_rows.append({
                'identifier': a.user.email if a.user else a.identifier,
                'timestamp': a.timestamp.isoformat(),
                'ip_address': a.ip_address or '',
                'user_agent': (a.user_agent[:80] if a.user_agent else ''),
                'result': a.result,
                'failure_reason': a.failure_reason or '',
            })

        return {
            'summary': {
                'period_days': days,
                'total_attempts': total_attempts,
                'successes': successes,
                'failures': failures,
                'lockouts': lockouts,
                'success_rate': success_rate,
                'failure_reasons': failure_reasons,
                'suspicious_ips': suspicious_ips,
            },
            'recent_attempts': recent_rows,
        }


class AccountsMFAComplianceExtractor:
    """Extracts MFA adoption rates, unprotected users, backup code status, and device types."""

    def __init__(self, tenant_id=None, filters=None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self):
        users = User.objects.filter(is_deleted=False, is_active=True)
        if self.tenant_id:
            users = users.filter(tenant_id=self.tenant_id)

        total_users = users.count()
        mfa_enabled = users.filter(mfa_enabled=True).count()
        mfa_required = users.filter(mfa_required=True).count()
        non_mfa_users = total_users - mfa_enabled
        mfa_adoption_rate = round((mfa_enabled / total_users * 100), 2) if total_users else 0.0

        devices_qs = MFADevice.objects.filter(is_active=True, is_deleted=False)
        if self.tenant_id:
            devices_qs = devices_qs.filter(tenant_id=self.tenant_id)

        device_types = list(devices_qs.values('device_type').annotate(count=Count('id')).order_by('-count'))
        locked_devices = devices_qs.filter(locked_until__gt=timezone.now()).count()
        verified_devices = devices_qs.filter(is_verified=True).count()

        at_risk_users = []
        for u in users.filter(mfa_enabled=False, mfa_required=True)[:50]:
            at_risk_users.append({'id': str(u.id), 'email': u.email, 'full_name': u.get_full_name() or u.username, 'role': u.role})

        mfa_user_ids = list(users.filter(mfa_enabled=True).values_list('id', flat=True))
        low_backup_count = MFABackupCode.objects.filter(
            user_id__in=mfa_user_ids, is_used=False, expires_at__gt=timezone.now()
        ).values('user_id').annotate(remaining=Count('id')).filter(remaining__lte=3).count()

        role_mfa = list(users.values('role').annotate(total=Count('id'), mfa_on=Count('id', filter=Q(mfa_enabled=True))).order_by('role'))
        for r in role_mfa:
            r['mfa_adoption_pct'] = round(r['mfa_on'] / r['total'] * 100, 2) if r['total'] else 0.0

        return {
            'summary': {
                'total_active_users': total_users,
                'mfa_enabled_count': mfa_enabled,
                'mfa_required_count': mfa_required,
                'non_mfa_users': non_mfa_users,
                'mfa_adoption_rate': mfa_adoption_rate,
                'total_devices': devices_qs.count(),
                'verified_devices': verified_devices,
                'locked_devices': locked_devices,
                'device_types': device_types,
                'users_low_backup_codes': low_backup_count,
            },
            'at_risk_users': at_risk_users,
            'role_mfa_breakdown': role_mfa,
        }


class AccountsAuditTrailExtractor:
    """Extracts accounts AuditLog trail with action-type breakdowns and severity distribution."""

    def __init__(self, tenant_id=None, filters=None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self):
        days = int(self.filters.get('days', 30))
        cutoff = timezone.now() - timedelta(days=days)
        qs = AuditLog.objects.filter(timestamp__gte=cutoff)
        if self.tenant_id:
            qs = qs.filter(tenant_id=self.tenant_id)

        total_actions = qs.count()
        unique_actors = qs.values('user_id').distinct().count()
        action_breakdown = list(qs.values('action_type').annotate(count=Count('id')).order_by('-count'))
        severity_breakdown = list(qs.values('severity').annotate(count=Count('id')).order_by('-count'))
        top_actions = list(qs.values('action').annotate(count=Count('id')).order_by('-count')[:10])
        top_actors = list(qs.values('user__email', 'user__first_name', 'user__last_name').annotate(count=Count('id')).order_by('-count')[:10])
        security_event_count = qs.filter(Q(severity__in=['warning', 'error', 'critical']) | Q(action_type='security')).count()

        recent_entries = []
        for log in qs.select_related('user').order_by('-timestamp')[:100]:
            recent_entries.append({
                'timestamp': log.timestamp.isoformat(),
                'actor': log.user.email if log.user else 'System',
                'action': log.action,
                'action_type': log.action_type,
                'severity': log.severity,
                'object_repr': log.object_repr or '',
                'ip_address': log.ip_address or '',
            })

        return {
            'summary': {
                'period_days': days,
                'total_actions': total_actions,
                'unique_actors': unique_actors,
                'security_event_count': security_event_count,
                'action_breakdown': action_breakdown,
                'severity_breakdown': severity_breakdown,
                'top_actions': top_actions,
                'top_actors': top_actors,
            },
            'recent_entries': recent_entries,
        }


class AccountsRolePermissionAuditExtractor:
    """Audits all roles, permission coverage, and per-role user distribution."""

    def __init__(self, tenant_id=None, filters=None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self):
        users = User.objects.filter(is_deleted=False)
        if self.tenant_id:
            users = users.filter(tenant_id=self.tenant_id)

        role_dist = list(users.values('role').annotate(
            user_count=Count('id'),
            active_count=Count('id', filter=Q(is_active=True)),
            mfa_count=Count('id', filter=Q(mfa_enabled=True)),
        ).order_by('-user_count'))

        all_roles = Role.objects.filter(is_deleted=False).select_related('parent')
        role_rows = []
        for role in all_roles:
            try:
                perms = list(role.get_all_permissions()) if hasattr(role, 'get_all_permissions') else []
            except Exception:
                perms = []
            role_rows.append({
                'code': role.code,
                'name': getattr(role, 'name', role.code),
                'is_system': role.is_system,
                'is_assignable': role.is_assignable,
                'parent_code': role.parent.code if role.parent else None,
                'permission_count': len(perms),
            })

        total_permissions = Permission.objects.filter(is_active=True).count()
        perm_by_category = list(Permission.objects.filter(is_active=True).values('category').annotate(count=Count('id')).order_by('-count'))
        perm_by_level = list(Permission.objects.filter(is_active=True).values('level').annotate(count=Count('id')).order_by('-count'))

        role_change_logs = AuditLog.objects.filter(action='user.role_assigned')
        if self.tenant_id:
            role_change_logs = role_change_logs.filter(tenant_id=self.tenant_id)
        role_changes_30d = role_change_logs.filter(timestamp__gte=timezone.now() - timedelta(days=30)).count()

        return {
            'summary': {
                'total_roles_defined': all_roles.count(),
                'total_system_permissions': total_permissions,
                'role_distribution': role_dist,
                'permissions_by_category': perm_by_category,
                'permissions_by_level': perm_by_level,
                'role_changes_last_30d': role_changes_30d,
            },
            'roles': role_rows,
        }


class AccountsSessionActivityExtractor:
    """Audits active sessions by device type, browser, OS, and concurrent usage."""

    def __init__(self, tenant_id=None, filters=None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self):
        now = timezone.now()
        qs = UserSession.objects.filter(status='active', expires_at__gt=now)
        if self.tenant_id:
            qs = qs.filter(tenant_id=self.tenant_id)

        total_active = qs.count()
        mfa_verified_sessions = qs.filter(mfa_verified=True).count()
        trusted_device_sessions = qs.filter(is_trusted_device=True).count()
        device_breakdown = list(qs.values('device_type').annotate(count=Count('id')).order_by('-count'))
        browser_breakdown = list(qs.values('browser').annotate(count=Count('id')).order_by('-count')[:10])
        os_breakdown = list(qs.values('os').annotate(count=Count('id')).order_by('-count')[:10])
        multi_session_users = list(qs.values('user__email', 'user__first_name', 'user__last_name').annotate(session_count=Count('id')).filter(session_count__gt=1).order_by('-session_count')[:20])

        recent_sessions = []
        for s in qs.select_related('user').order_by('-login_time')[:50]:
            recent_sessions.append({
                'id': str(s.id),
                'user_email': s.user.email if s.user else '',
                'ip_address': s.ip_address,
                'device_type': s.device_type,
                'browser': s.browser,
                'os': s.os,
                'login_time': s.login_time.isoformat() if s.login_time else None,
                'last_activity': s.last_activity.isoformat() if s.last_activity else None,
                'mfa_verified': s.mfa_verified,
                'is_trusted_device': s.is_trusted_device,
                'expires_at': s.expires_at.isoformat() if s.expires_at else None,
            })

        return {
            'summary': {
                'total_active_sessions': total_active,
                'mfa_verified_sessions': mfa_verified_sessions,
                'trusted_device_sessions': trusted_device_sessions,
                'device_breakdown': device_breakdown,
                'browser_breakdown': browser_breakdown,
                'os_breakdown': os_breakdown,
                'users_with_multi_sessions': len(multi_session_users),
            },
            'multi_session_users': multi_session_users,
            'recent_sessions': recent_sessions,
        }


class AccountsPasswordHygieneExtractor:
    """Audits password age, forced-change users, never-changed passwords, and reset activity."""

    def __init__(self, tenant_id=None, filters=None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self):
        users = User.objects.filter(is_deleted=False, is_active=True)
        if self.tenant_id:
            users = users.filter(tenant_id=self.tenant_id)

        total = users.count()
        change_required = users.filter(password_change_required=True).count()
        never_changed = users.filter(password_last_changed__isnull=True).count()
        now = timezone.now()
        cutoff_30 = now - timedelta(days=30)
        cutoff_60 = now - timedelta(days=60)
        cutoff_90 = now - timedelta(days=90)

        fresh_0_30 = users.filter(password_last_changed__gte=cutoff_30).count()
        stale_30_60 = users.filter(password_last_changed__gte=cutoff_60, password_last_changed__lt=cutoff_30).count()
        stale_60_90 = users.filter(password_last_changed__gte=cutoff_90, password_last_changed__lt=cutoff_60).count()
        overdue_90_plus = users.filter(Q(password_last_changed__lt=cutoff_90) | Q(password_last_changed__isnull=True)).count()

        pwd_events_qs = AuditLog.objects.filter(action__in=['password.changed', 'password.reset_completed', 'password.reset_requested'])
        if self.tenant_id:
            pwd_events_qs = pwd_events_qs.filter(tenant_id=self.tenant_id)
        pwd_changes_30d = pwd_events_qs.filter(timestamp__gte=cutoff_30).count()
        pwd_resets_30d = pwd_events_qs.filter(action='password.reset_requested', timestamp__gte=cutoff_30).count()

        overdue_users = []
        for u in users.filter(Q(password_last_changed__lt=cutoff_90) | Q(password_last_changed__isnull=True)).order_by('password_last_changed')[:50]:
            days_stale = (now - u.password_last_changed).days if u.password_last_changed else None
            overdue_users.append({
                'id': str(u.id),
                'email': u.email,
                'full_name': u.get_full_name() or u.username,
                'role': u.role,
                'password_last_changed': u.password_last_changed.isoformat() if u.password_last_changed else None,
                'days_since_change': days_stale,
                'change_required': u.password_change_required,
            })

        return {
            'summary': {
                'total_active_users': total,
                'change_required_count': change_required,
                'never_changed_count': never_changed,
                'pwd_changes_30d': pwd_changes_30d,
                'pwd_resets_30d': pwd_resets_30d,
                'age_buckets': {
                    '0_to_30_days': fresh_0_30,
                    '30_to_60_days': stale_30_60,
                    '60_to_90_days': stale_60_90,
                    'over_90_days': overdue_90_plus,
                },
            },
            'overdue_users': overdue_users,
        }


class AccountsSecurityAnomaliesExtractor:
    """Detects outliers in user activity, after-hours access, and brute-force IPs."""

    def __init__(self, tenant_id=None, filters=None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self):
        days = int(self.filters.get('days', 30))
        cutoff = timezone.now() - timedelta(days=days)
        audit_qs = AuditLog.objects.filter(timestamp__gte=cutoff)
        login_qs = LoginAttempt.objects.filter(timestamp__gte=cutoff)
        if self.tenant_id:
            audit_qs = audit_qs.filter(tenant_id=self.tenant_id)
            login_qs = login_qs.filter(tenant_id=self.tenant_id)

        user_counts = list(audit_qs.values('user__email').annotate(count=Count('id')))
        if user_counts:
            values = [u['count'] for u in user_counts]
            avg = sum(values) / len(values)
            std = (sum((v - avg) ** 2 for v in values) / len(values)) ** 0.5
            threshold = avg + (2 * std)
            anomalous_users = [u for u in user_counts if u['count'] > threshold]
        else:
            avg, std, threshold, anomalous_users = 0, 0, 0, []

        ip_failures = list(login_qs.filter(result__in=['failure', 'locked']).values('ip_address').annotate(count=Count('id')).filter(count__gte=10).order_by('-count')[:20])

        critical_events = list(audit_qs.filter(severity__in=['error', 'critical']).select_related('user').order_by('-timestamp')[:30])
        critical_rows = [{'timestamp': e.timestamp.isoformat(), 'actor': e.user.email if e.user else 'System', 'action': e.action, 'severity': e.severity, 'ip_address': e.ip_address or ''} for e in critical_events]

        try:
            after_hours_count = audit_qs.extra(where=["extract(hour from timestamp) < 7 OR extract(hour from timestamp) > 19"]).count()
        except Exception:
            after_hours_count = 0

        perm_denied_count = audit_qs.filter(action='permission.denied').count()

        return {
            'summary': {
                'period_days': days,
                'avg_actions_per_user': round(avg, 2),
                'anomaly_std': round(std, 2),
                'anomaly_threshold': round(threshold, 2),
                'anomalous_users_count': len(anomalous_users),
                'brute_force_ips': len(ip_failures),
                'critical_events_count': len(critical_rows),
                'after_hours_access_count': after_hours_count,
                'permission_denied_count': perm_denied_count,
            },
            'anomalous_users': anomalous_users,
            'brute_force_ips': ip_failures,
            'critical_events': critical_rows,
        }


class AccountsUnifiedExtractor:
    """Master Unified Extractor orchestrating all accounts real-data extractions."""

    def __init__(self, tenant_id=None, filters=None):
        self.tenant_id = tenant_id
        self.filters = filters or {}
        self.user_directory_extractor = AccountsUserDirectoryExtractor(tenant_id, filters)
        self.login_security_extractor = AccountsLoginSecurityExtractor(tenant_id, filters)
        self.mfa_extractor = AccountsMFAComplianceExtractor(tenant_id, filters)
        self.audit_extractor = AccountsAuditTrailExtractor(tenant_id, filters)
        self.role_permission_extractor = AccountsRolePermissionAuditExtractor(tenant_id, filters)
        self.session_extractor = AccountsSessionActivityExtractor(tenant_id, filters)
        self.password_extractor = AccountsPasswordHygieneExtractor(tenant_id, filters)
        self.anomaly_extractor = AccountsSecurityAnomaliesExtractor(tenant_id, filters)

    def extract(self):
        user_data = self.user_directory_extractor.extract()
        login_data = self.login_security_extractor.extract()
        mfa_data = self.mfa_extractor.extract()
        audit_data = self.audit_extractor.extract()
        role_data = self.role_permission_extractor.extract()
        session_data = self.session_extractor.extract()
        password_data = self.password_extractor.extract()
        anomaly_data = self.anomaly_extractor.extract()

        us = user_data['summary']
        ls = login_data['summary']
        ms = mfa_data['summary']
        ss = session_data['summary']
        ps = password_data['summary']
        ans = anomaly_data['summary']
        aus = audit_data['summary']

        return {
            'source': 'accounts',
            'extracted_at': timezone.now().isoformat(),
            'user_directory': user_data,
            'login_security': login_data,
            'mfa_compliance': mfa_data,
            'audit_trail': audit_data,
            'role_permission': role_data,
            'session_activity': session_data,
            'password_hygiene': password_data,
            'security_anomalies': anomaly_data,
            'summary': {
                'total_users': us.get('total_users', 0),
                'active_users': us.get('active_users', 0),
                'suspended_users': us.get('suspended_users', 0),
                'new_users_30d': us.get('new_users_30d', 0),
                'mfa_enabled_count': ms.get('mfa_enabled_count', 0),
                'mfa_adoption_rate': ms.get('mfa_adoption_rate', 0.0),
                'non_mfa_users': ms.get('non_mfa_users', 0),
                'total_active_sessions': ss.get('total_active_sessions', 0),
                'mfa_verified_sessions': ss.get('mfa_verified_sessions', 0),
                'login_total_attempts': ls.get('total_attempts', 0),
                'login_success_rate': ls.get('success_rate', 0.0),
                'login_lockouts': ls.get('lockouts', 0),
                'passwords_change_required': ps.get('change_required_count', 0),
                'passwords_overdue_90d': ps.get('age_buckets', {}).get('over_90_days', 0),
                'total_audit_events': aus.get('total_actions', 0),
                'security_events': aus.get('security_event_count', 0),
                'anomalous_users': ans.get('anomalous_users_count', 0),
                'brute_force_ips': ans.get('brute_force_ips', 0),
                'critical_events': ans.get('critical_events_count', 0),
            }
        }


AccountsDataExtractor = AccountsUnifiedExtractor
