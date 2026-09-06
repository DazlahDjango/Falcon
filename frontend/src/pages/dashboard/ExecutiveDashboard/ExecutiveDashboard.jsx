// frontend/src/pages/dashboard/ExecutiveDashboard/ExecutiveDashboard.jsx

import React from 'react';
import { useExecutiveDashboard } from '../../../hooks/dashboard/useExecutiveDashboard';
import OrganizationKPITable from '../../../components/kpi/dashboard/OrganizationKPITable';
import {
  BuildingOffice2Icon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowUpIcon,
  ChartBarIcon,
  DocumentCheckIcon,
  ArrowPathIcon,
  SparklesIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const ExecutiveDashboard = () => {
  const { dashboardData, loading, refreshDashboard } = useExecutiveDashboard({ autoFetch: true });

  const rawData = dashboardData || {};
  const user = rawData.executive_info || {
    name: 'Dr. John Smith',
    title: 'Chief Executive Officer',
    tenant_name: 'ABC Holdings Ltd'
  };

  const summaryText = rawData.executive_summary || {
    text: 'Overall organizational performance is 91% (On Track). Revenue exceeds target by 4%. Operations Department declined 6% this month. 18 executive approvals remain pending. Customer Satisfaction dropped by 3%. Mission Report compliance reached 95%.',
    cta_label: 'View Full Insight'
  };

  const todaysFocus = rawData.todays_focus || [
    { id: 'f1', text: 'Review Operations Performance', completed: true },
    { id: 'f2', text: 'Approve Budget Revision', completed: true },
    { id: 'f3', text: 'Board Strategy Review at 2:00 PM', completed: true }
  ];

  const summary = rawData.summary_cards || {
    organization_score: { score: 91, label: 'Excellent', change: '+2.4% vs last month' },
    strategic_objectives: { on_track: 15, total: 17, completion_percentage: 88, label: 'On Track' },
    departments: { active_count: 12, healthy_count: 10, need_attention_count: 2 },
    staff_performance: { average_achievement_percentage: 89, change: '+3.1% vs last month' },
    reviews_completed: { completed_percentage: 93, status: 'On Schedule', change: '+6% vs last month' },
    mission_reports: { submitted_percentage: 95, change: '+4% vs last month' }
  };

  const trend = rawData.org_performance_trend || {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    actual: [52, 58, 65, 68, 70, 78, 91],
    target: [50, 55, 60, 65, 70, 75, 87, 88, 86, 85, 84, 83]
  };

  const departmentsHeatmap = rawData.department_health_heatmap || [
    { name: 'Finance', score: 98, status: 'On Track' },
    { name: 'HR', score: 72, status: 'At Risk' },
    { name: 'ICT', score: 96, status: 'On Track' },
    { name: 'Sales', score: 98, status: 'On Track' },
    { name: 'Operations', score: 44, status: 'Off Track' },
    { name: 'Procurement', score: 94, status: 'On Track' }
  ];

  const alerts = rawData.executive_alerts || [
    { id: 'e1', title: 'Operations Department below target', timestamp: '2 hours ago', type: 'danger' },
    { id: 'e2', title: '42 KPIs awaiting approval', timestamp: '4 hours ago', type: 'warning' },
    { id: 'e3', title: 'Revenue declined 11% vs last month', timestamp: '5 hours ago', type: 'danger' },
    { id: 'e4', title: 'All reviews completed on schedule', timestamp: 'Yesterday', type: 'success' }
  ];

  const topDepts = rawData.top_performing_departments || [
    { rank: 1, name: 'Finance', score: 98 },
    { rank: 2, name: 'ICT', score: 96 },
    { rank: 3, name: 'Procurement', score: 94 }
  ];

  const reqAttentionDepts = rawData.departments_requiring_attention || [
    { rank: 1, name: 'Operations', score: 41 },
    { rank: 2, name: 'HR', score: 58 },
    { rank: 3, name: 'Marketing', score: 63 }
  ];

  const pendingApprovals = rawData.pending_executive_approvals || {
    items: [
      { title: 'KPI Revision Request', count: 8 },
      { title: 'Annual Budget Revision', count: 6 },
      { title: 'New Division Creation', count: 4 }
    ],
    total_pending: 18
  };

  const reviewCompletion = rawData.review_completion || {
    completed_percentage: 93,
    pending_percentage: 7,
    total_reviews: 1248
  };

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 space-y-6 text-slate-800 font-sans">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-lg shrink-0">
            {user.name ? user.name[0] : 'J'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Good Morning, {user.name || 'Dr. John Smith'} <span className="inline-block animate-bounce">👋</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {user.title || 'Chief Executive Officer'} • <span className="text-slate-700 font-semibold">{user.tenant_name || 'ABC Holdings Ltd'}</span>
            </p>
          </div>
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

      {/* Top Banner Cards Grid (8 cols Executive Intelligence Summary, 4 cols Today's Focus) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Executive Intelligence Summary (8 cols) */}
        <div className="lg:col-span-8 bg-blue-50/70 border border-blue-100 p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <SparklesIcon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-blue-900">Executive Intelligence Summary</h2>
              <p className="text-xs text-blue-950 leading-relaxed font-medium">
                {summaryText.text}
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <button className="px-4 py-2 bg-white hover:bg-blue-50 text-blue-600 text-xs font-semibold rounded-xl border border-blue-200 shadow-sm transition">
              {summaryText.cta_label || 'View Full Insight'}
            </button>
          </div>
        </div>

        {/* Today's Focus (4 cols) */}
        <div className="lg:col-span-4 bg-purple-50/50 border border-purple-100 p-5 rounded-2xl flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-2 text-purple-900 font-bold text-xs">
              <CalendarIcon className="w-4 h-4 text-purple-600" />
              <span>Today's Focus</span>
            </div>
            <div className="space-y-1.5 text-xs text-purple-950">
              {todaysFocus.map((f) => (
                <div key={f.id} className="flex items-center gap-2">
                  <CheckIcon className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span className="text-[11px] font-medium">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <button className="px-3 py-1.5 bg-white hover:bg-purple-50 text-purple-600 text-[11px] font-semibold rounded-lg border border-purple-200 shadow-sm transition">
              View Calendar
            </button>
          </div>
        </div>

      </div>

      {/* 6 Top Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Organization Score */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Organization Score</p>
            <p className="text-lg font-bold text-slate-900">{summary.organization_score.score}%</p>
            <p className="text-[10px] text-slate-400 font-semibold">{summary.organization_score.label}</p>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">↑ {summary.organization_score.change}</p>
          </div>
        </div>

        {/* Strategic Objectives */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ChartBarIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Strategic Objectives</p>
            <p className="text-lg font-bold text-slate-900">{summary.strategic_objectives.on_track} / {summary.strategic_objectives.total}</p>
            <p className="text-[10px] text-slate-400 font-semibold">On Track</p>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">{summary.strategic_objectives.completion_percentage}% completion</p>
          </div>
        </div>

        {/* Departments */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <BuildingOffice2Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Departments</p>
            <p className="text-lg font-bold text-slate-900">{summary.departments.active_count}</p>
            <p className="text-[10px] text-slate-400 font-semibold">Active</p>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{summary.departments.healthy_count} Healthy, <span className="text-rose-500">{summary.departments.need_attention_count} Need Attention</span></p>
          </div>
        </div>

        {/* Staff Performance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <UserGroupIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Staff Performance</p>
            <p className="text-lg font-bold text-slate-900">{summary.staff_performance.average_achievement_percentage}%</p>
            <p className="text-[10px] text-slate-400 font-semibold">Average Achievement</p>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">↑ {summary.staff_performance.change}</p>
          </div>
        </div>

        {/* Reviews Completed */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Reviews Completed</p>
            <p className="text-lg font-bold text-slate-900">{summary.reviews_completed.completed_percentage}%</p>
            <p className="text-[10px] text-slate-400 font-semibold">On Schedule</p>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">↑ {summary.reviews_completed.change}</p>
          </div>
        </div>

        {/* Mission Reports */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <DocumentCheckIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Mission Reports</p>
            <p className="text-lg font-bold text-slate-900">{summary.mission_reports.submitted_percentage}%</p>
            <p className="text-[10px] text-slate-400 font-semibold">Submitted</p>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">↑ {summary.mission_reports.change}</p>
          </div>
        </div>
      </div>

      {/* Middle Row (Organization Performance Trend, Department Health Heatmap, Executive Alerts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Trend Line Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Organization Performance Trend</h2>
            <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-2">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-600 inline-block"></span> Actual Performance</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-slate-400 stroke-dasharray inline-block"></span> Target Performance</span>
            </div>

            {/* Custom SVG Line Chart */}
            <div className="mt-6 relative h-44 w-full">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 400 150">
                <line x1="0" y1="30" x2="400" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="75" x2="400" y2="75" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="120" x2="400" y2="120" stroke="#f1f5f9" strokeWidth="1" />

                {/* Target Line */}
                <path d="M 0 100 L 35 95 L 70 90 L 105 85 L 140 80 L 175 75 L 210 60 L 245 55 L 280 57 L 315 59 L 350 61 L 385 63" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />

                {/* Actual Line */}
                <path d="M 0 95 L 35 85 L 70 75 L 105 70 L 140 65 L 175 50 L 210 30" fill="none" stroke="#2563eb" strokeWidth="3" />

                {/* Active Tooltip point Jul */}
                <circle cx="210" cy="30" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
              </svg>

              {/* Popover Callout */}
              <div className="absolute top-2 left-1/2 bg-white border border-slate-200 shadow-lg rounded-xl p-2.5 text-[10px] space-y-0.5 z-10">
                <p className="font-bold text-slate-900">Jul 2026</p>
                <p className="text-slate-600">Actual: <span className="font-bold text-blue-600">91%</span></p>
                <p className="text-slate-600">Target: <span className="font-bold text-slate-800">87%</span></p>
                <p className="text-emerald-600 font-bold">Variance: +4%</p>
              </div>
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-3">
            {trend.months.map(m => <span key={m}>{m}</span>)}
          </div>
        </div>

        {/* Department Health Heatmap (3 cols) */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-3">Department Health Heatmap</h2>

          <div className="grid grid-cols-3 gap-2">
            {departmentsHeatmap.map((dept) => {
              const isGreen = dept.status === 'On Track';
              const isRed = dept.status === 'Off Track';

              return (
                <div
                  key={dept.name}
                  className={`p-2 rounded-xl border text-center flex flex-col justify-between ${
                    isGreen ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : isRed ? 'bg-rose-50/60 border-rose-200 text-rose-900' : 'bg-amber-50/60 border-amber-200 text-amber-900'
                  }`}
                >
                  <p className="text-[10px] font-semibold truncate">{dept.name}</p>
                  <p className="text-sm font-bold my-1">{dept.score}%</p>
                  <span className={`text-[8px] font-bold px-1 py-0.5 rounded ${
                    isGreen ? 'bg-emerald-100 text-emerald-800' : isRed ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {dept.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Executive Alerts (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-900">Executive Alerts</h2>
              <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</button>
            </div>

            <div className="space-y-2.5">
              {alerts.map((alt) => (
                <div key={alt.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start gap-2 text-xs">
                  {alt.type === 'danger' && <ExclamationTriangleIcon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
                  {alt.type === 'warning' && <ExclamationTriangleIcon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                  {alt.type === 'success' && <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                  <div>
                    <p className="font-semibold text-slate-800 text-[11px] leading-tight">{alt.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{alt.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Row Grid (4 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Top Performing Departments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>🏆</span> Top Performing Departments
            </h3>
            <button className="text-[11px] font-semibold text-blue-600">View All</button>
          </div>
          <div className="space-y-3">
            {topDepts.map((d) => (
              <div key={d.rank} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center">{d.rank}</span>
                  <span className="font-semibold text-slate-800">{d.name}</span>
                </div>
                <span className="font-bold text-emerald-600">{d.score}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Departments Requiring Attention */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <ExclamationTriangleIcon className="w-4 h-4 text-rose-500" /> Departments Requiring Attention
            </h3>
            <button className="text-[11px] font-semibold text-blue-600">View All</button>
          </div>
          <div className="space-y-3">
            {reqAttentionDepts.map((d) => (
              <div key={d.rank} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center">{d.rank}</span>
                  <span className="font-semibold text-slate-800">{d.name}</span>
                </div>
                <span className="font-bold text-rose-500">{d.score}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Executive Approvals */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-900">Pending Executive Approvals</h3>
              <button className="text-[11px] font-semibold text-blue-600">View All</button>
            </div>
            <div className="space-y-2">
              {pendingApprovals.items.map((item) => (
                <div key={item.title} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="text-slate-700 font-medium text-[11px]">{item.title}</span>
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 font-bold text-[10px] flex items-center justify-center">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2">
            <span>Total Pending</span>
            <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{pendingApprovals.total_pending}</span>
          </div>
        </div>

        {/* Review Completion Donut */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-bold text-slate-900">Review Completion</h3>
          <div className="flex flex-col items-center justify-center my-2 relative">
            <div className="w-28 h-28 rounded-full border-8 border-emerald-500 border-r-rose-500 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-bold text-slate-900">{reviewCompletion.completed_percentage}%</span>
              <span className="text-[9px] text-slate-400 font-semibold">Completed</span>
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-2">
            <span>Total Reviews: {reviewCompletion.total_reviews}</span>
          </div>
        </div>

      </div>

      {/* Organization KPIs Section */}
      <OrganizationKPITable limit={5} />
    </div>
  );
};

export default ExecutiveDashboard;