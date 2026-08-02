// frontend/src/pages/dashboard/ReadOnlyDashboard/ReadOnlyDashboard.jsx

import React from 'react';
import { useReadOnlyDashboard } from '../../../hooks/dashboard/useReadOnlyDashboard';
import {
  BuildingOffice2Icon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowUpIcon,
  ChartBarIcon,
  DocumentCheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const ReadOnlyDashboard = () => {
  const { dashboardData, loading, refreshDashboard } = useReadOnlyDashboard({ autoFetch: true });

  const rawData = dashboardData || {};
  const user = rawData.user || {
    name: 'James Investor',
    role: 'Read-Only User',
    tenant_name: 'ABC Holdings Ltd'
  };

  const summary = rawData.summary_cards || {
    overall_performance: { score: 91, status: 'On Track', change: '+2.4% vs last month' },
    strategic_objectives: { on_track: 15, total: 17, completion_percentage: 88 },
    departments: { active_count: 12, healthy_count: 10, need_attention_count: 2 },
    kpi_achievement: { average_achievement_percentage: 89, change: '+3.1% vs last month' },
    mission_reports: { submitted_percentage: 95, change: '+4% vs last month' },
    reviews_completed: { completed_percentage: 93, change: '+6% vs last month' }
  };

  const trend = rawData.org_performance_trend || {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    actual: [52, 58, 65, 68, 70, 78, 91],
    target: [50, 55, 60, 65, 70, 75, 87, 88, 86, 85, 84, 83]
  };

  const departments = rawData.department_performance || [
    { name: 'Finance', score: 98, status: 'On Track' },
    { name: 'ICT', score: 96, status: 'On Track' },
    { name: 'Sales', score: 98, status: 'On Track' },
    { name: 'Procurement', score: 94, status: 'On Track' },
    { name: 'HR', score: 72, status: 'At Risk' },
    { name: 'Operations', score: 44, status: 'Off Track' },
    { name: 'Marketing', score: 61, status: 'At Risk' },
    { name: 'Logistics', score: 85, status: 'On Track' }
  ];

  const perfByStatus = rawData.performance_by_status || {
    on_track: 74,
    at_risk: 18,
    off_track: 8,
    average_score: 89,
    total_kpis: 1248
  };

  const objectives = rawData.strategic_objectives || [
    { name: 'Grow Revenue', progress: 92, status: 'On Track' },
    { name: 'Customer Satisfaction', progress: 86, status: 'On Track' },
    { name: 'Digital Transformation', progress: 58, status: 'At Risk' },
    { name: 'ESG Compliance', progress: 92, status: 'On Track' },
    { name: 'Innovation & Growth', progress: 74, status: 'At Risk' }
  ];

  const missionSummary = rawData.mission_report_summary || { submitted: 95, pending: 5, overdue: 0 };
  const reviewCompletion = rawData.review_completion || { completed: 93, pending: 7 };

  const highlights = rawData.recent_highlights || [
    { id: 'h1', title: 'Revenue exceeded target by 4% this month', timestamp: '2 hours ago', type: 'success' },
    { id: 'h2', title: 'Operations department below target', timestamp: '4 hours ago', type: 'warning' },
    { id: 'h3', title: '94% of staff completed self-assessments', timestamp: '1 day ago', type: 'success' },
    { id: 'h4', title: 'Q2 Strategic Review completed', timestamp: '2 days ago', type: 'info' }
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 space-y-6 text-slate-800 font-sans">
      {/* Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <BuildingOffice2Icon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Welcome, {user.name}
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Read-Only Access
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">You are viewing performance data for <span className="font-semibold text-slate-700">{user.tenant_name}</span></p>
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

      {/* 6 Top Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Overall Performance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Overall Performance</p>
            <p className="text-lg font-bold text-slate-900">{summary.overall_performance.score}%</p>
            <p className="text-[10px] text-emerald-600 font-semibold">↑ {summary.overall_performance.change}</p>
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
            <p className="text-[10px] text-emerald-600 font-semibold">{summary.strategic_objectives.completion_percentage}% completion</p>
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
            <p className="text-[10px] text-slate-500 font-semibold">{summary.departments.healthy_count} Healthy, <span className="text-rose-500">{summary.departments.need_attention_count} Need Attention</span></p>
          </div>
        </div>

        {/* KPI Achievement */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">KPI Achievement</p>
            <p className="text-lg font-bold text-slate-900">{summary.kpi_achievement.average_achievement_percentage}%</p>
            <p className="text-[10px] text-emerald-600 font-semibold">↑ {summary.kpi_achievement.change}</p>
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
            <p className="text-[10px] text-emerald-600 font-semibold">↑ {summary.mission_reports.change}</p>
          </div>
        </div>

        {/* Reviews Completed */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Reviews Completed</p>
            <p className="text-lg font-bold text-slate-900">{summary.reviews_completed.completed_percentage}%</p>
            <p className="text-[10px] text-emerald-600 font-semibold">↑ {summary.reviews_completed.change}</p>
          </div>
        </div>
      </div>

      {/* Middle Row (Organization Trend, Department Heatmap, Performance Status) */}
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
                {/* Background Grid Lines */}
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

        {/* Department Performance Overview (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Department Performance Overview</h2>

          <div className="grid grid-cols-4 gap-2.5">
            {departments.map((dept) => {
              const isGreen = dept.status === 'On Track';
              const isRed = dept.status === 'Off Track';

              return (
                <div
                  key={dept.name}
                  className={`p-2.5 rounded-xl border text-center flex flex-col justify-between transition ${isGreen ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : isRed ? 'bg-rose-50/60 border-rose-200 text-rose-900' : 'bg-amber-50/60 border-amber-200 text-amber-900'
                    }`}
                >
                  <p className="text-[11px] font-medium truncate">{dept.name}</p>
                  <p className="text-base font-bold my-1">{dept.score}%</p>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isGreen ? 'bg-emerald-100 text-emerald-800' : isRed ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                    {dept.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance by Status Donut (3 cols) */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-2">Performance by Status</h2>

            <div className="flex flex-col items-center justify-center my-4">
              <div className="relative w-32 h-32 rounded-full border-[10px] border-emerald-500 border-t-amber-400 border-r-rose-500 flex flex-col items-center justify-center">
                <span className="text-xl font-extrabold text-slate-900">{perfByStatus.average_score}%</span>
                <span className="text-[10px] text-slate-400 font-semibold">Average</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-xs border-t border-slate-100 pt-3">
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> On Track</span>
              <span className="font-bold text-slate-900">{perfByStatus.on_track}%</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"></span> At Risk</span>
              <span className="font-bold text-slate-900">{perfByStatus.at_risk}%</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Off Track</span>
              <span className="font-bold text-slate-900">{perfByStatus.off_track}%</span>
            </div>
            <p className="text-[10px] text-slate-400 text-right mt-2 font-medium">Total KPIs: {perfByStatus.total_kpis}</p>
          </div>
        </div>

      </div>

      {/* Bottom Grid Row (4 Cards Across) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Strategic Objectives Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900">Strategic Objectives Progress</h3>
            <button className="text-[10px] font-semibold text-blue-600">View All</button>
          </div>

          <div className="space-y-3">
            {objectives.map((obj) => (
              <div key={obj.name} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{obj.name}</span>
                  <span>{obj.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${obj.status === 'On Track' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${obj.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mission Report Summary */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900">Mission Report Summary</h3>
            <button className="text-[10px] font-semibold text-blue-600">View All</button>
          </div>

          <div className="flex flex-col items-center justify-center my-3">
            <div className="relative w-24 h-24 rounded-full border-8 border-emerald-500 border-t-amber-400 flex flex-col items-center justify-center">
              <span className="text-base font-extrabold text-slate-900">{missionSummary.submitted}%</span>
              <span className="text-[9px] text-slate-400 font-medium">Submitted</span>
            </div>
          </div>

          <div className="space-y-1 text-xs border-t border-slate-100 pt-3">
            <div className="flex justify-between text-slate-600">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Submitted</span>
              <span className="font-bold text-slate-900">{missionSummary.submitted}%</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Pending</span>
              <span className="font-bold text-slate-900">{missionSummary.pending}%</span>
            </div>
          </div>
        </div>

        {/* Review Completion */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900">Review Completion</h3>
            <button className="text-[10px] font-semibold text-blue-600">View All</button>
          </div>

          <div className="flex flex-col items-center justify-center my-3">
            <div className="relative w-24 h-24 rounded-full border-8 border-emerald-500 border-t-rose-400 flex flex-col items-center justify-center">
              <span className="text-base font-extrabold text-slate-900">{reviewCompletion.completed}%</span>
              <span className="text-[9px] text-slate-400 font-medium">Completed</span>
            </div>
          </div>

          <div className="space-y-1 text-xs border-t border-slate-100 pt-3">
            <div className="flex justify-between text-slate-600">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Completed</span>
              <span className="font-bold text-slate-900">{reviewCompletion.completed}%</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400"></span> Pending</span>
              <span className="font-bold text-slate-900">{reviewCompletion.pending}%</span>
            </div>
          </div>
        </div>

        {/* Recent Highlights */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900">Recent Highlights</h3>
            <button className="text-[10px] font-semibold text-blue-600">View All</button>
          </div>

          <div className="space-y-3">
            {highlights.map((hl) => (
              <div key={hl.id} className="flex items-start gap-2.5 text-xs">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${hl.type === 'success' ? 'bg-emerald-100 text-emerald-700' : hl.type === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                  <CheckCircleIcon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-medium text-slate-800 text-[11px] leading-tight">{hl.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{hl.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReadOnlyDashboard;