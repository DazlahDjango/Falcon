// frontend/src/pages/dashboard/ClientAdminDashboard/ClientAdminDashboard.jsx

import { useAuthContext } from '../../../contexts/accounts/AuthContext';
import { useClientAdminDashboard } from '../../../hooks/dashboard/useClientAdminDashboard';
import {
  UsersIcon,
  ShieldCheckIcon,
  BuildingOffice2Icon,
  ChartBarIcon,
  CalendarIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  UserIcon,
  QuestionMarkCircleIcon,
  ArrowUpIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const ClientAdminDashboard = () => {
  const { user: authUser, currentTenant } = useAuthContext();
  const { dashboardData, loading, refreshDashboard } = useClientAdminDashboard({ autoRefresh: true });

  const rawData = dashboardData || {};
  const user = rawData.user || {
    name: authUser ? `${authUser.first_name || ''} ${authUser.last_name || ''}`.trim() || authUser.email : 'Client Admin',
    title: authUser?.title || 'Client Administrator',
    role: authUser?.role ? authUser.role.replace('_', ' ').toUpperCase() : 'Client Admin',
    tenant_name: currentTenant?.name || authUser?.tenant_name || 'Organization',
    tenant_id: currentTenant?.id || authUser?.tenant_id || '-'
  };

  const summary = rawData.summary_cards || {
    total_users: rawData.total_users ?? 0,
    total_users_change: '-',
    active_users: rawData.active_users ?? 0,
    active_users_percentage: rawData.active_users_percentage ?? 0,
    roles_count: rawData.roles_count ?? 0,
    departments_count: rawData.departments_count ?? 0,
    kpi_frameworks_count: rawData.kpi_frameworks_count ?? 0,
    active_cycle: rawData.active_cycle || 'None Active',
    active_cycle_dates: rawData.active_cycle_dates || '-'
  };

  const userOverview = rawData.user_overview || {
    total_users: summary.total_users || 0,
    active_users: summary.active_users || 0,
    active_percentage: summary.active_users_percentage || 0,
    inactive_users: rawData.inactive_users ?? 0,
    inactive_percentage: 0,
    on_leave_users: 0,
    on_leave_percentage: 0,
    suspended_users: 0,
    suspended_percentage: 0
  };

  const usersByRole = rawData.users_by_role || [];

  const systemUsage = rawData.system_usage || [];

  const userActivity = rawData.recent_user_activity || [];

  const pendingApprovals = rawData.pending_approvals || {
    items: [],
    total_pending: 0
  };

  const orgHealth = rawData.organization_health || [
    { service: 'Database', status: 'Healthy', type: 'success' },
    { service: 'Storage', status: 'Operational', type: 'success' },
    { service: 'Backup', status: 'Operational', type: 'success' },
    { service: 'Email Service', status: 'Operational', type: 'success' },
    { service: 'WebSocket', status: 'Connected', type: 'success' },
    { service: 'API Status', status: 'Healthy', type: 'success' }
  ];

  const subscription = rawData.subscription || {
    plan: currentTenant?.plan || 'Active Plan',
    valid_until: '-'
  };

  const maxRoleCount = Math.max(...usersByRole.map(r => r.count), 1);

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 space-y-6 text-slate-800 font-sans">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Admin Dashboard
          </h1>
          <p className="text-slate-500 text-xs mt-1">Manage your organization and system settings</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400">Last Updated: 2 minutes ago</span>
          <button
            onClick={refreshDashboard}
            className="p-2 text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            title="Refresh Data"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Top 6 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Users */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <UsersIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Total Users</p>
            <p className="text-lg font-bold text-slate-900">{summary.total_users.toLocaleString()}</p>
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
              <ArrowUpIcon className="w-3 h-3" /> {summary.total_users_change}
            </p>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <UsersIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Active Users</p>
            <p className="text-lg font-bold text-slate-900">{summary.active_users.toLocaleString()}</p>
            <p className="text-[10px] text-emerald-600 font-semibold">{summary.active_users_percentage}% of total users</p>
          </div>
        </div>

        {/* Roles */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <ShieldCheckIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Roles</p>
            <p className="text-lg font-bold text-slate-900">{summary.roles_count}</p>
            <p className="text-[10px] text-slate-400 font-semibold">Manage user roles</p>
          </div>
        </div>

        {/* Departments */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <BuildingOffice2Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Departments</p>
            <p className="text-lg font-bold text-slate-900">{summary.departments_count}</p>
            <p className="text-[10px] text-slate-400 font-semibold">3 levels in hierarchy</p>
          </div>
        </div>

        {/* Frameworks */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <ChartBarIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">KPI Frameworks</p>
            <p className="text-lg font-bold text-slate-900">{summary.kpi_frameworks_count}</p>
            <p className="text-[10px] text-slate-400 font-semibold">Active frameworks</p>
          </div>
        </div>

        {/* Active Cycle */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Active Cycle</p>
            <p className="text-base font-bold text-slate-900">{summary.active_cycle}</p>
            <p className="text-[9px] text-emerald-600 font-semibold">{summary.active_cycle_dates}</p>
          </div>
        </div>
      </div>

      {/* Middle Row (User Overview, Users by Role, System Usage) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* User Overview Donut Chart (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">User Overview</h2>
          </div>

          <div className="flex flex-col items-center justify-center my-4 relative">
            <div className="w-36 h-36 rounded-full border-[12px] border-emerald-500 border-t-amber-500 border-r-blue-500 border-b-rose-500 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-bold text-slate-900">{userOverview.total_users.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 font-semibold">Total Users</span>
            </div>
          </div>

          <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Active</span>
              <span className="font-bold text-slate-800">{userOverview.active_users.toLocaleString()} ({userOverview.active_percentage}%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Inactive</span>
              <span className="font-bold text-slate-800">{userOverview.inactive_users} ({userOverview.inactive_percentage}%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> On Leave</span>
              <span className="font-bold text-slate-800">{userOverview.on_leave_users} ({userOverview.on_leave_percentage}%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Suspended</span>
              <span className="font-bold text-slate-800">{userOverview.suspended_users} ({userOverview.suspended_percentage}%)</span>
            </div>
          </div>
          <div className="mt-3 pt-2 text-right">
            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-end gap-1">
              View All Users <ChevronRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Users by Role Horizontal Bar Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Users by Role</h2>
            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</button>
          </div>

          <div className="space-y-3 my-2">
            {usersByRole.map((item) => (
              <div key={item.role} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 font-medium">{item.role}</span>
                  <span className="font-bold text-slate-900">{item.count}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{ width: `${(item.count / maxRoleCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-3">
            <span>0</span>
            <span>200</span>
            <span>400</span>
            <span>600</span>
            <span>800</span>
          </div>
        </div>

        {/* System Usage (This Month) (3 cols) */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900">System Usage (This Month)</h2>
            </div>

            <div className="space-y-3.5">
              {systemUsage.map((item) => (
                <div key={item.metric} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">{item.metric}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{item.value}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center">
                      ↑ {item.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-4 text-right">
            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-end gap-1">
              View Usage Reports <ChevronRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Third Row (Recent User Activity, Pending Approvals, Organization Health) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Recent User Activity Table (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Recent User Activity</h2>
            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All Activity</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] text-slate-400 font-medium">
                  <th className="py-2 px-2">User</th>
                  <th className="py-2 px-2">Action</th>
                  <th className="py-2 px-2">Details</th>
                  <th className="py-2 px-2 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {userActivity.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-2">
                      <p className="font-semibold text-slate-800 text-[11px]">{act.user}</p>
                      <p className="text-[10px] text-slate-400">{act.email}</p>
                    </td>
                    <td className="py-2.5 px-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${act.badge === 'blue' ? 'bg-blue-50 text-blue-600' : act.badge === 'purple' ? 'bg-purple-50 text-purple-600' : act.badge === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                        {act.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-[11px] text-slate-600">{act.details}</td>
                    <td className="py-2.5 px-2 text-[10px] text-slate-400 text-right">{act.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Approvals Widget (3.5 / 4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900">Pending Approvals</h2>
              <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</button>
            </div>

            <div className="space-y-2.5">
              {pendingApprovals.items.map((item) => (
                <div key={item.title} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 text-xs">
                  <span className="text-slate-700 font-medium text-[11px]">{item.title}</span>
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold text-[10px] flex items-center justify-center">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3 mt-3">
            <span>Total Pending</span>
            <span className="font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">{pendingApprovals.total_pending}</span>
          </div>
        </div>

        {/* Organization Health Widget (3 cols) */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900">Organization Health</h2>
              <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View Details</button>
            </div>

            <div className="space-y-2.5 text-xs">
              {orgHealth.map((item) => (
                <div key={item.service} className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">{item.service}</span>
                  <span className={`text-[11px] font-bold flex items-center gap-1 ${item.type === 'warning' ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                    {item.status}
                    {item.type === 'success' && <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />}
                    {item.type === 'warning' && <ExclamationTriangleIcon className="w-3.5 h-3.5 text-amber-600" />}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom 4 Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Subscription Plan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <CreditCardIcon className="w-5 h-5 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900">Subscription Plan</h3>
            </div>
            <p className="text-sm font-bold text-slate-900">{subscription.plan}</p>
            <p className="text-[10px] text-slate-400">Valid until {subscription.valid_until}</p>
          </div>
          <button className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition">
            Manage Subscription
          </button>
        </div>

        {/* Organization Profile */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <BuildingOffice2Icon className="w-5 h-5 text-purple-600" />
              <h3 className="text-xs font-bold text-slate-900">Organization Profile</h3>
            </div>
            <p className="text-sm font-bold text-slate-900">{user.tenant_name}</p>
            <p className="text-[10px] text-slate-400">Financial Services</p>
          </div>
          <button className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition">
            Edit Profile
          </button>
        </div>

        {/* Your Role */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <UserIcon className="w-5 h-5 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-900">Your Role</h3>
            </div>
            <p className="text-sm font-bold text-slate-900">{user.role}</p>
            <p className="text-[10px] text-slate-400">Full administrative access</p>
          </div>
          <button className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition">
            View Permissions
          </button>
        </div>

        {/* Need Help? */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <QuestionMarkCircleIcon className="w-5 h-5 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-900">Need Help?</h3>
            </div>
            <p className="text-xs text-slate-600 font-medium">Get support or view guides</p>
          </div>
          <button className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition">
            Help & Support
          </button>
        </div>

      </div>
    </div>
  );
};

export default ClientAdminDashboard;