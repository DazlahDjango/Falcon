// frontend/src/pages/dashboard/ManagerDashboard/ManagerDashboard.jsx

import React from 'react';
import { useManagerDashboard } from '../../../hooks/dashboard/useManagerDashboard';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon, 
  ClockIcon,
  ArrowUpIcon,
  UserGroupIcon,
  CheckIcon,
  ChatBubbleLeftEllipsisIcon,
  PlusIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const ManagerDashboard = () => {
  const { dashboardData, loading, refreshDashboard } = useManagerDashboard({ autoFetch: true });

  const rawData = dashboardData || {};
  const user = rawData.user || {
    first_name: 'David',
    name: 'David Mwangi',
    title: 'Head of Operations',
    department: 'Operations Department',
    role: 'Manager'
  };

  const summary = rawData.team_performance_summary || {
    average_achievement: 78,
    change: '+4.5% vs last month',
    on_track_count: 7,
    on_track_percentage: 58,
    at_risk_count: 3,
    at_risk_percentage: 25,
    off_track_count: 2,
    off_track_percentage: 17,
    pending_approvals_count: 8
  };

  const trend = rawData.team_performance_trend || {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    actual: [55, 60, 68, 72, 75, 78, 82],
    target: [50, 55, 60, 65, 70, 75, 80, 85, 84, 83, 82, 80]
  };

  const kpiHealth = rawData.kpi_health || {
    healthy_percentage: 72,
    on_track_percentage: 58,
    at_risk_percentage: 25,
    off_track_percentage: 17
  };

  const approvals = rawData.approvals_list || [
    { id: 'a1', title: 'Monthly KPI Submission', user_name: 'John Kamau', status: 'Pending' },
    { id: 'a2', title: 'KPI Revision Request', user_name: 'Mary Wanjiku', status: 'Pending' },
    { id: 'a3', title: 'Mission Report', user_name: 'Peter Otieno', status: 'Pending' },
    { id: 'a4', title: 'KPI Submission', user_name: 'Susan Akinyi', status: 'Pending' },
    { id: 'a5', title: 'Task Completion', user_name: 'Brian Onyingo', status: 'Pending' }
  ];

  const teamMembers = rawData.team_overview || [
    { id: 't1', name: 'John Kamau', role: 'Operations Manager', score: 92, status: 'On Track', tasks_completed: '5/6', mission_report: 'Submitted', online_status: 'Online' },
    { id: 't2', name: 'Mary Wanjiku', role: 'Senior Coordinator', score: 68, status: 'At Risk', tasks_completed: '3/6', mission_report: 'Pending', online_status: 'Online' },
    { id: 't3', name: 'Peter Otieno', role: 'Operations Officer', score: 45, status: 'Off Track', tasks_completed: '2/6', mission_report: 'Pending', online_status: 'Offline' },
    { id: 't4', name: 'Susan Akinyi', role: 'Logistics Coordinator', score: 75, status: 'At Risk', tasks_completed: '4/6', mission_report: 'Submitted', online_status: 'Online' },
    { id: 't5', name: 'Brian Onyingo', role: 'Field Supervisor', score: 88, status: 'On Track', tasks_completed: '5/6', mission_report: 'Submitted', online_status: 'Online' },
    { id: 't6', name: 'James Maina', role: 'Operations Assistant', score: 56, status: 'At Risk', tasks_completed: '3/6', mission_report: 'Pending', online_status: 'Offline' }
  ];

  const myKPIs = rawData.my_kpis_overview || [
    { name: 'Operations Efficiency', score: 85, status: 'On Track' },
    { name: 'Cost Management', score: 72, status: 'At Risk' },
    { name: 'Team Productivity', score: 90, status: 'On Track' },
    { name: 'Quality Compliance', score: 60, status: 'At Risk' },
    { name: 'Process Improvement', score: 75, status: 'At Risk' }
  ];

  const myTasks = rawData.my_tasks || [
    { id: 'k1', title: 'Review Vendor Performance', due: 'Due: Today', priority: 'High' },
    { id: 'k2', title: 'Operations Report', due: 'Due: Tomorrow', priority: 'Medium' },
    { id: 'k3', title: 'Team Meeting', due: 'Due: May 26', priority: 'Low' },
    { id: 'k4', title: 'Process Improvement Plan', due: 'Due: May 30', priority: 'Low' }
  ];

  const missionStatus = rawData.mission_report_status || {
    completed_percentage: 80,
    latest_month: 'May 2026',
    next_deadline: 'Jun 5, 2026'
  };

  const teamAlerts = rawData.my_team_alerts || [
    { id: 'al1', title: '2 team members are off track', subtitle: '2 members', type: 'danger' },
    { id: 'al2', title: '3 KPI submissions pending approval', subtitle: '3 submissions', type: 'warning' },
    { id: 'al3', title: '2 mission reports pending', subtitle: '2 reports', type: 'warning' },
    { id: 'al4', title: 'Team tasks on track', subtitle: '75% completed', type: 'success' }
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 space-y-6 text-slate-800 font-sans">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-lg shrink-0">
            {user.first_name ? user.first_name[0] : 'D'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Good Morning, {user.first_name || 'David'}! <span className="inline-block animate-bounce">👋</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {user.title || 'Head of Operations'} • <span className="text-slate-700 font-medium">{user.department || 'Operations Department'}</span>
              <span className="ml-2.5 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {user.role || 'Manager'}
              </span>
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

      {/* Top 5 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Team Performance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <UserGroupIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Team Performance</p>
            <p className="text-lg font-bold text-slate-900">{summary.average_achievement}%</p>
            <p className="text-[10px] text-slate-400 font-semibold">Average Achievement</p>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-0.5">
              <ArrowUpIcon className="w-3 h-3" /> {summary.change}
            </p>
          </div>
        </div>

        {/* On Track */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">On Track</p>
            <p className="text-lg font-bold text-slate-900">{summary.on_track_count} <span className="text-xs text-slate-400 font-normal">({summary.on_track_percentage}%)</span></p>
          </div>
        </div>

        {/* At Risk */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <ExclamationTriangleIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">At Risk</p>
            <p className="text-lg font-bold text-slate-900">{summary.at_risk_count} <span className="text-xs text-slate-400 font-normal">({summary.at_risk_percentage}%)</span></p>
          </div>
        </div>

        {/* Off Track */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <XCircleIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Off Track</p>
            <p className="text-lg font-bold text-slate-900">{summary.off_track_count} <span className="text-xs text-slate-400 font-normal">({summary.off_track_percentage}%)</span></p>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ClockIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Pending Approvals</p>
            <p className="text-lg font-bold text-slate-900">{summary.pending_approvals_count}</p>
            <p className="text-[10px] text-slate-400 font-semibold">Submissions</p>
            <p className="text-[10px] text-blue-600 font-semibold mt-0.5">Requires your review</p>
          </div>
        </div>
      </div>

      {/* Middle Row (Trend Chart, KPI Health Donut, Approvals List) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Team Performance Trend Line Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Team Performance Trend</h2>
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
                <path d="M 0 100 L 35 95 L 70 88 L 105 80 L 140 75 L 175 70 L 210 60 L 245 52 L 280 55 L 315 57 L 350 60 L 385 62" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />

                {/* Actual Line */}
                <path d="M 0 95 L 35 88 L 70 78 L 105 72 L 140 68 L 175 62 L 210 55" fill="none" stroke="#2563eb" strokeWidth="3" />

                {/* Active Tooltip point Jul */}
                <circle cx="210" cy="55" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
              </svg>

              {/* Popover Callout */}
              <div className="absolute top-2 left-1/2 bg-white border border-slate-200 shadow-lg rounded-xl p-2.5 text-[10px] space-y-0.5 z-10">
                <p className="font-bold text-slate-900">Jul 2026</p>
                <p className="text-slate-600">Actual: <span className="font-bold text-blue-600">78%</span></p>
                <p className="text-slate-600">Target: <span className="font-bold text-slate-800">80%</span></p>
                <p className="text-rose-500 font-bold">Variance: -2%</p>
              </div>
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-3">
            {trend.months.map(m => <span key={m}>{m}</span>)}
          </div>
        </div>

        {/* KPI Health Donut (3 cols) */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h2 className="text-sm font-bold text-slate-900">KPI Health</h2>

          <div className="flex flex-col items-center justify-center my-3 relative">
            <div className="w-36 h-36 rounded-full border-[12px] border-emerald-500 border-t-amber-500 border-r-rose-500 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold text-slate-900">{kpiHealth.healthy_percentage}%</span>
              <span className="text-[10px] text-slate-400 font-semibold">Healthy</span>
            </div>
          </div>

          <div className="space-y-1.5 text-[11px] border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> On Track</span>
              <span className="font-bold text-slate-800">{kpiHealth.on_track_percentage}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> At Risk</span>
              <span className="font-bold text-slate-800">{kpiHealth.at_risk_percentage}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Off Track</span>
              <span className="font-bold text-slate-800">{kpiHealth.off_track_percentage}%</span>
            </div>
          </div>
        </div>

        {/* Approvals List (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900">Approvals</h2>
              <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</button>
            </div>

            <div className="space-y-3">
              {approvals.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/50 transition text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <ClockIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-[11px]">{app.title}</p>
                      <p className="text-[10px] text-slate-400">by {app.user_name}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-600 rounded-md border border-blue-100">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3 mt-3">
            <span>Total Pending</span>
            <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">8</span>
          </div>
        </div>

      </div>

      {/* Team Overview Table Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Team Overview</h2>
          <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400 font-medium">
                <th className="py-2.5 px-3">Team Member</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Performance</th>
                <th className="py-2.5 px-3">KPI Health</th>
                <th className="py-2.5 px-3">Tasks</th>
                <th className="py-2.5 px-3">Mission Report</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {teamMembers.map((member) => {
                const isGreen = member.status === 'On Track';
                const isRed = member.status === 'Off Track';

                return (
                  <tr key={member.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-xs shrink-0">
                          {member.name[0]}
                        </div>
                        <span className="font-semibold text-slate-800 text-xs">{member.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">{member.role}</td>
                    <td className="py-3 px-3 font-bold text-slate-900 text-xs">
                      <div className="flex items-center gap-2">
                        <span>{member.score}%</span>
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isGreen ? 'bg-emerald-500' : isRed ? 'bg-rose-500' : 'bg-amber-500'}`}
                            style={{ width: `${member.score}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isGreen ? 'bg-emerald-50 text-emerald-700' : isRed ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        ● {member.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700 text-xs">{member.tasks_completed}</td>
                    <td className="py-3 px-3">
                      <span className={`text-[11px] font-medium ${member.mission_report === 'Submitted' ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {member.mission_report}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="flex items-center gap-1 text-[11px] text-slate-500">
                        <span className={`w-2 h-2 rounded-full ${member.online_status === 'Online' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                        {member.online_status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 text-slate-400">
                        <button className="p-1 hover:text-blue-600 transition"><EyeIcon className="w-4 h-4" /></button>
                        <button className="p-1 hover:text-blue-600 transition"><PencilIcon className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Grid (My KPIs Overview, My Tasks, Mission Report Status, Quick Actions, My Team Alerts) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">

        {/* My KPIs Overview */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900">My KPIs Overview</h3>
            <button className="text-[11px] font-semibold text-blue-600">View All</button>
          </div>
          <div className="space-y-2.5">
            {myKPIs.map((kpi) => (
              <div key={kpi.name} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-600 font-medium truncate">{kpi.name}</span>
                  <span className="font-bold text-slate-900">{kpi.score}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${kpi.status === 'On Track' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${kpi.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900">My Tasks</h3>
            <button className="text-[11px] font-semibold text-blue-600">View All</button>
          </div>
          <div className="space-y-2">
            {myTasks.map((t) => (
              <div key={t.id} className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-800 text-[11px]">{t.title}</p>
                  <p className="text-[10px] text-slate-400">{t.due}</p>
                </div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  t.priority === 'High' ? 'bg-rose-50 text-rose-600' : t.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  {t.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mission Report Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-900">Mission Report Status</h3>
              <button className="text-[11px] font-semibold text-blue-600">View All</button>
            </div>
            <div className="my-3">
              <p className="text-2xl font-bold text-slate-900">{missionStatus.completed_percentage}% <span className="text-xs text-slate-400 font-normal">Completed</span></p>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${missionStatus.completed_percentage}%` }} />
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-[11px] flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold text-emerald-900">Latest: {missionStatus.latest_month}</p>
              <p className="text-[10px] text-emerald-700">Next Deadline: {missionStatus.next_deadline}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-900">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-semibold">
            <button className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition flex flex-col items-center gap-1">
              <CheckIcon className="w-4 h-4 text-blue-600" />
              <span>Approve Submissions</span>
            </button>
            <button className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition flex flex-col items-center gap-1">
              <ChatBubbleLeftEllipsisIcon className="w-4 h-4 text-emerald-600" />
              <span>Give Feedback</span>
            </button>
            <button className="p-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl transition flex flex-col items-center gap-1">
              <PlusIcon className="w-4 h-4 text-purple-600" />
              <span>Assign Task</span>
            </button>
            <button className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl transition flex flex-col items-center gap-1">
              <UserGroupIcon className="w-4 h-4 text-amber-600" />
              <span>Team Meeting</span>
            </button>
          </div>
        </div>

        {/* My Team Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900">My Team Alerts</h3>
            <button className="text-[11px] font-semibold text-blue-600">View All</button>
          </div>
          <div className="space-y-2">
            {teamAlerts.map((alt) => (
              <div key={alt.id} className="p-2 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start gap-2 text-xs">
                {alt.type === 'danger' && <ExclamationTriangleIcon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
                {alt.type === 'warning' && <ExclamationTriangleIcon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                {alt.type === 'success' && <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                <div>
                  <p className="font-semibold text-slate-800 text-[11px] leading-tight">{alt.title}</p>
                  <p className="text-[10px] text-slate-400">{alt.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ManagerDashboard;