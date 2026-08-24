// frontend/src/pages/dashboard/SuperAdminDashboard/SuperAdminDashboard.jsx

import React from 'react';
import { useSuperAdminDashboard } from '../../../hooks/dashboard/useSuperAdminDashboard';
import {
  BuildingOffice2Icon,
  UsersIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  ServerIcon,
  ArrowUpIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  CircleStackIcon,
  PlusIcon,
  DocumentCheckIcon,
  ChevronRightIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

import { useAuthContext } from '../../../contexts/accounts/AuthContext';

const SuperAdminDashboard = () => {
  const { user: authUser } = useAuthContext();
  const { dashboardData, loading, refreshDashboard } = useSuperAdminDashboard({ autoRefresh: true });

  const rawData = dashboardData || {};
  const user = rawData.user || {
    name: authUser ? `${authUser.first_name || ''} ${authUser.last_name || ''}`.trim() || authUser.email : 'Platform Administrator',
    title: authUser?.title || 'Super Administrator',
    role: authUser?.role ? authUser.role.replace('_', ' ').toUpperCase() : 'Super Admin'
  };

  const overview = rawData.platform_overview || {
    total_tenants: rawData.total_tenants ?? 0,
    total_tenants_change: '-',
    total_users: rawData.total_users ?? 0,
    total_users_change: '-',
    platform_health: rawData.platform_health || '100%',
    mrr: rawData.mrr || '$0',
    mrr_change: '-',
    active_subscriptions: rawData.active_subscriptions ?? 0,
    trial_tenants: rawData.trial_tenants ?? 0,
    platform_submissions_30d: rawData.platform_submissions_30d ?? '0'
  };

  const growthTrend = rawData.platform_growth_trend || {
    months: [],
    tenants: [],
    users: []
  };

  const subscriptionsBreakdown = rawData.subscriptions_breakdown || [];

  const systemHealth = rawData.system_health || [
    { service: 'Multi-Tenant Isolation Engine', status: 'Operational', type: 'success' },
    { service: 'Global PostgreSQL Cluster', status: 'Healthy', type: 'success' },
    { service: 'Redis Cache Grid', status: 'Connected', type: 'success' },
    { service: 'Celery Background Workers', status: 'Healthy', type: 'success' },
    { service: 'Email Dispatch Service', status: 'Operational', type: 'success' },
    { service: 'S3 Asset Storage', status: 'Operational', type: 'success' }
  ];

  const tenants = rawData.tenant_summaries || [];

  const alerts = rawData.subscription_alerts || [];

  const maxSubCount = Math.max(...subscriptionsBreakdown.map(s => s.count), 1);

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 space-y-6 text-slate-800 font-sans">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Super Admin Control Center
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              Platform Overview
            </span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">Global multi-tenant system oversight and platform analytics</p>
        </div>
        <div className="flex items-center gap-3">
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
        {/* Total Tenants */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <BuildingOffice2Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Total Tenants</p>
            <p className="text-lg font-bold text-slate-900">{overview.total_tenants}</p>
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
              <ArrowUpIcon className="w-3 h-3" /> {overview.total_tenants_change}
            </p>
          </div>
        </div>

        {/* Total Platform Users */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <UsersIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Platform Users</p>
            <p className="text-lg font-bold text-slate-900">{overview.total_users.toLocaleString()}</p>
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
              <ArrowUpIcon className="w-3 h-3" /> {overview.total_users_change}
            </p>
          </div>
        </div>

        {/* Platform Health */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ServerIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Platform Health</p>
            <p className="text-lg font-bold text-slate-900">{overview.platform_health}</p>
            <p className="text-[10px] text-emerald-600 font-semibold">Operational</p>
          </div>
        </div>

        {/* MRR */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <CreditCardIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Monthly Revenue (MRR)</p>
            <p className="text-lg font-bold text-slate-900">{overview.mrr}</p>
            <p className="text-[10px] text-emerald-600 font-semibold">{overview.mrr_change}</p>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <ShieldCheckIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Subscriptions</p>
            <p className="text-lg font-bold text-slate-900">{overview.active_subscriptions} Active</p>
            <p className="text-[10px] text-slate-400 font-semibold">{overview.trial_tenants} in Trial period</p>
          </div>
        </div>

        {/* Platform Submissions */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <DocumentCheckIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Submissions (30d)</p>
            <p className="text-lg font-bold text-slate-900">{overview.platform_submissions_30d}</p>
            <p className="text-[10px] text-slate-400 font-semibold">System throughput</p>
          </div>
        </div>
      </div>

      {/* Middle Row (Platform Growth Trend, Subscriptions Breakdown, System Health) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Platform Growth Trend (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Platform Growth & User Expansion</h2>
            <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-2">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-purple-600 inline-block"></span> Total Tenants</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500 inline-block"></span> Total Platform Users</span>
            </div>

            {/* Custom SVG Growth Chart */}
            <div className="mt-6 relative h-44 w-full">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 400 150">
                <line x1="0" y1="30" x2="400" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="75" x2="400" y2="75" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="120" x2="400" y2="120" stroke="#f1f5f9" strokeWidth="1" />

                {/* Users Path */}
                <path d="M 0 110 L 60 95 L 120 85 L 180 75 L 240 60 L 300 45 L 360 30" fill="none" stroke="#2563eb" strokeWidth="3" />

                {/* Tenants Path */}
                <path d="M 0 130 L 60 120 L 120 115 L 180 105 L 240 95 L 300 80 L 360 65" fill="none" stroke="#9333ea" strokeWidth="3" />

                <circle cx="360" cy="30" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                <circle cx="360" cy="65" r="5" fill="#9333ea" stroke="#ffffff" strokeWidth="2" />
              </svg>

              <div className="absolute top-2 right-4 bg-white border border-slate-200 shadow-md rounded-xl p-2 text-[10px] space-y-0.5 z-10">
                <p className="font-bold text-slate-900">Jul 2026</p>
                <p className="text-purple-600 font-bold">Tenants: 48 (+4)</p>
                <p className="text-blue-600 font-bold">Users: 18,420</p>
              </div>
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-3">
            {growthTrend.months.map(m => <span key={m}>{m}</span>)}
          </div>
        </div>

        {/* Subscriptions Breakdown (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Tenant Subscriptions</h2>
            <button className="text-xs font-semibold text-purple-600 hover:text-purple-700">Manage Billing</button>
          </div>

          <div className="space-y-3 my-2">
            {subscriptionsBreakdown.map((item) => (
              <div key={item.plan} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 font-medium">{item.plan}</span>
                  <span className="font-bold text-slate-900">{item.count}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-600 h-full rounded-full transition-all"
                    style={{ width: `${(item.count / maxSubCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-3">
            <span>0</span>
            <span>10</span>
            <span>20</span>
            <span>30</span>
          </div>
        </div>

        {/* Global Infrastructure System Health (3 cols) */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900">System Infrastructure</h2>
            </div>

            <div className="space-y-2.5 text-xs">
              {systemHealth.map((item) => (
                <div key={item.service} className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium truncate">{item.service}</span>
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 shrink-0">
                    {item.status} <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-4 text-right">
            <button className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center justify-end gap-1">
              Infrastructure Status <ChevronRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Third Row (Tenant Organizations Table & Subscription Alerts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Tenant Organizations Overview Table (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Tenant Organizations</h2>
            <button className="text-xs font-semibold text-purple-600 hover:text-purple-700">View All Tenants</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] text-slate-400 font-medium">
                  <th className="py-2.5 px-3">Organization</th>
                  <th className="py-2.5 px-3">Plan</th>
                  <th className="py-2.5 px-3">Users</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Health Score</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {tenants.map((ten) => (
                  <tr key={ten.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-800">{ten.name}</p>
                      <p className="text-[10px] text-slate-400">Expires: {ten.expiry_date}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium text-[11px]">{ten.plan}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{ten.users.toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ten.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        ● {ten.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-600">{ten.health_score}</td>
                    <td className="py-3 px-3 text-right">
                      <button className="p-1 hover:text-purple-600 transition" title="View Tenant Overview">
                        <EyeIcon className="w-4 h-4 text-slate-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subscription & System Alerts Queue (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900">Subscription & Platform Alerts</h2>
              <button className="text-xs font-semibold text-purple-600 hover:text-purple-700">View All</button>
            </div>

            <div className="space-y-3">
              {alerts.map((alt) => (
                <div key={alt.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start gap-2.5 text-xs">
                  {alt.severity === 'critical' && <ExclamationTriangleIcon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
                  {alt.severity === 'warning' && <ExclamationTriangleIcon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                  {alt.severity === 'info' && <CheckCircleIcon className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-[11px] leading-tight">{alt.tenant}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">{alt.alert}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{alt.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom 4 Control Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Global System Settings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <AdjustmentsHorizontalIcon className="w-5 h-5 text-purple-600" />
              <h3 className="text-xs font-bold text-slate-900">Global System Settings</h3>
            </div>
            <p className="text-xs text-slate-600 font-medium">Platform policies & security rules</p>
          </div>
          <button className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition">
            Platform Settings
          </button>
        </div>

        {/* Database & Storage */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <CircleStackIcon className="w-5 h-5 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900">Database & Storage Manager</h3>
            </div>
            <p className="text-xs text-slate-600 font-medium">Cross-tenant quotas & backup logs</p>
          </div>
          <button className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition">
            Manage Storage
          </button>
        </div>

        {/* Provision New Tenant */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <PlusIcon className="w-5 h-5 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-900">Tenant Provisioning</h3>
            </div>
            <p className="text-xs text-slate-600 font-medium">Onboard new tenant organization</p>
          </div>
          <button className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition">
            Provision Tenant
          </button>
        </div>

        {/* Platform Audit Logs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <ShieldCheckIcon className="w-5 h-5 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-900">Platform Audit Logs</h3>
            </div>
            <p className="text-xs text-slate-600 font-medium">Global security & system events</p>
          </div>
          <button className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition">
            View Audit Trail
          </button>
        </div>

      </div>
    </div>
  );
};

export default SuperAdminDashboard;