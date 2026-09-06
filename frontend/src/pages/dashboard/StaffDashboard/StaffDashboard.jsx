// frontend/src/pages/dashboard/StaffDashboard/StaffDashboard.jsx

import React, { useState } from 'react';
import { useStaffDashboard } from '../../../hooks/dashboard/useStaffDashboard';
import OrganizationKPITable from '../../../components/kpi/dashboard/OrganizationKPITable';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon, 
  ClipboardDocumentCheckIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
  BellIcon,
  CalendarIcon,
  UserIcon,
  CheckIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const StaffDashboard = () => {
  const { dashboardData, loading, refreshDashboard } = useStaffDashboard({ autoFetch: true });

  const data = dashboardData || {};
  const user = data.user || {
    first_name: 'Jane',
    full_name: 'Jane Wanjiku',
    title: 'Operations Officer',
    department: 'Operations'
  };

  const summary = data.summary_cards || {
    overall_performance: { score: 85, status: 'green', label: 'On Track', change: '+4.2% vs last month' },
    kpis_on_track: { count: 6, percentage: 75, change: '+1 vs last month' },
    kpis_at_risk: { count: 2, percentage: 25, change: '0 vs last month' },
    kpis_off_track: { count: 0, percentage: 0, change: '-1 vs last month' },
    tasks_completed: { completed: 8, total: 12, percentage: 67, change: '+2 vs last month' }
  };

  const kpiList = data.kpis && data.kpis.length > 0 ? data.kpis : [
    { id: '1', name: 'Customer Onboarding', kpi_type: 'Count', progress: 92, actual: '46', target: '50', status_text: 'On Track', traffic_light: 'green', trend: [65, 70, 72, 80, 85, 92] },
    { id: '2', name: 'Process Efficiency', kpi_type: 'Percentage', progress: 76, actual: '76%', target: '100%', status_text: 'At Risk', traffic_light: 'yellow', trend: [50, 55, 60, 68, 70, 76] },
    { id: '3', name: 'Quality Compliance', kpi_type: 'Percentage', progress: 100, actual: '100%', target: '100%', status_text: 'On Track', traffic_light: 'green', trend: [90, 92, 95, 98, 100, 100] },
    { id: '4', name: 'Cost Savings', kpi_type: 'Amount (KES)', progress: 58, actual: '580K', target: '1M', status_text: 'At Risk', traffic_light: 'yellow', trend: [40, 45, 48, 50, 55, 58] },
    { id: '5', name: 'Training Hours', kpi_type: 'Count', progress: 110, actual: '22', target: '20', status_text: 'On Track', traffic_light: 'green', trend: [10, 12, 15, 18, 20, 22] },
    { id: '6', name: 'Team Collaboration', kpi_type: 'Impact Score', progress: 80, actual: '4.0', target: '5.0', status_text: 'At Risk', traffic_light: 'yellow', trend: [3.0, 3.2, 3.5, 3.8, 3.9, 4.0] }
  ];

  const missionReport = data.mission_report_status || {
    completed_percentage: 85,
    on_time_percentage: 85,
    pending_percentage: 15,
    overdue_percentage: 0
  };

  const recentActivity = data.recent_activity || [
    { id: 'a1', title: 'KPI "Customer Onboarding" updated', timestamp: 'Today, 9:15 AM', type: 'kpi' },
    { id: 'a2', title: 'Task "Prepare Monthly Report" assigned', timestamp: 'Yesterday, 4:30 PM', type: 'task' },
    { id: 'a3', title: 'Supervisor added feedback on KPI', timestamp: 'May 24, 2026', type: 'feedback' },
    { id: 'a4', title: 'Mission Report submitted', timestamp: 'May 20, 2026', type: 'report' }
  ];

  const upcomingReviews = data.upcoming_reviews || {
    title: 'Mid-Year Review',
    date_range: 'Jun 15 - Jun 20, 2026',
    completion_percentage: 50,
    status_label: 'Self Assessment Completed'
  };

  const [tasksList, setTasksList] = useState(data.todays_tasks || [
    { id: 't1', title: 'Prepare Monthly Operations Report', due_time: '10:00 AM', priority: 'High', is_completed: false },
    { id: 't2', title: 'Update KPI: Customer Onboarding', due_time: '11:30 AM', priority: 'Medium', is_completed: false },
    { id: 't3', title: 'Review Process Documentation', due_time: '2:00 PM', priority: 'Medium', is_completed: false },
    { id: 't4', title: 'Team Stand-up Meeting', due_time: '4:00 PM', priority: 'Low', is_completed: false },
    { id: 't5', title: 'Submit Mission Report', due_time: 'Due: Today', priority: 'High', is_completed: false }
  ]);

  const announcements = data.announcements || [
    { id: 'n1', title: 'System Maintenance', content: 'System will be under maintenance on May 31, 2026 from 10:00 PM - 1:00 AM EAT.', date: 'May 28, 2026', type: 'info' },
    { id: 'n2', title: 'Performance Review Reminder', content: 'Mid-year reviews will be open from Jun 15 - Jun 20, 2026.', date: 'May 24, 2026', type: 'success' },
    { id: 'n3', title: 'KPI Submission Deadline', content: 'Please submit all pending KPI data by May 31, 2026.', date: 'May 20, 2026', type: 'warning' }
  ];

  const toggleTask = (taskId) => {
    setTasksList(prev => prev.map(t => t.id === taskId ? { ...t, is_completed: !t.is_completed } : t));
  };

  // Helper for sparklines
  const renderSparkline = (points, colorClass = 'stroke-emerald-500') => {
    if (!points || points.length === 0) return null;
    const max = Math.max(...points, 100);
    const min = Math.min(...points, 0);
    const width = 100;
    const height = 28;

    const pathD = points.map((val, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((val - min) / (max - min || 1)) * height;
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    return (
      <svg className="w-24 h-7 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <path d={pathD} fill="none" className={colorClass} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((val, idx) => {
          const x = (idx / (points.length - 1)) * width;
          const y = height - ((val - min) / (max - min || 1)) * height;
          return <circle key={idx} cx={x} cy={y} r="2.5" className={colorClass.replace('stroke-', 'fill-')} />;
        })}
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 space-y-6 text-slate-800 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Welcome back, {user.first_name || 'Jane'}! <span className="inline-block animate-bounce">👋</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Here's your performance overview and tasks for today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={refreshDashboard}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Top 5 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Overall Performance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="relative w-14 h-14 flex items-center justify-center rounded-full border-4 border-emerald-500 text-emerald-600 font-extrabold text-sm">
            {summary.overall_performance.score}%
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Overall Performance</p>
            <p className="text-lg font-bold text-slate-900">{summary.overall_performance.score}% <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">On Track</span></p>
            <p className="text-xs text-emerald-600 font-medium mt-0.5 flex items-center gap-0.5">
              <ArrowUpIcon className="w-3 h-3" /> {summary.overall_performance.change}
            </p>
          </div>
        </div>

        {/* KPIs On Track */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircleIcon className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">KPIs On Track</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-900">{summary.kpis_on_track.count}</span>
              <span className="text-xs text-slate-500 font-medium">{summary.kpis_on_track.percentage}%</span>
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-0.5 flex items-center gap-0.5">
              <ArrowUpIcon className="w-3 h-3" /> {summary.kpis_on_track.change}
            </p>
          </div>
        </div>

        {/* KPIs At Risk */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <ExclamationTriangleIcon className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">KPIs At Risk</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-900">{summary.kpis_at_risk.count}</span>
              <span className="text-xs text-slate-500 font-medium">{summary.kpis_at_risk.percentage}%</span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-0.5">
              <MinusIcon className="w-3 h-3" /> {summary.kpis_at_risk.change}
            </p>
          </div>
        </div>

        {/* KPIs Off Track */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <XCircleIcon className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">KPIs Off Track</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-900">{summary.kpis_off_track.count}</span>
              <span className="text-xs text-slate-500 font-medium">{summary.kpis_off_track.percentage}%</span>
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-0.5 flex items-center gap-0.5">
              <ArrowDownIcon className="w-3 h-3" /> {summary.kpis_off_track.change}
            </p>
          </div>
        </div>

        {/* Tasks Completed */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <ClipboardDocumentCheckIcon className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Tasks Completed</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-900">{summary.tasks_completed.completed} / {summary.tasks_completed.total}</span>
              <span className="text-xs text-slate-500 font-medium">{summary.tasks_completed.percentage}%</span>
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-0.5 flex items-center gap-0.5">
              <ArrowUpIcon className="w-3 h-3" /> {summary.tasks_completed.change}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid (Left 8 Cols, Right 4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* My KPI Progress Table Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">My KPI Progress</h2>
              <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All KPIs</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-400 font-medium">
                    <th className="py-2.5 px-3">KPI</th>
                    <th className="py-2.5 px-3">Progress</th>
                    <th className="py-2.5 px-3">Actual vs Target</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {kpiList.map((kpi) => {
                    const isGreen = kpi.status_text === 'On Track' || kpi.traffic_light === 'green';
                    const isRed = kpi.status_text === 'Off Track' || kpi.traffic_light === 'red';
                    
                    return (
                      <tr key={kpi.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-3">
                          <p className="font-semibold text-slate-800">{kpi.name}</p>
                          <p className="text-[11px] text-slate-400">{kpi.kpi_type || 'Percentage'}</p>
                        </td>
                        <td className="py-3 px-3 w-36">
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${isGreen ? 'bg-blue-600' : isRed ? 'bg-rose-500' : 'bg-amber-500'}`}
                                style={{ width: `${Math.min(kpi.progress, 100)}%` }}
                              />
                            </div>
                            <span className="font-bold text-slate-700 text-[11px]">{kpi.progress}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700">
                          {kpi.actual} / {kpi.target}
                          <span className="block text-[10px] font-normal text-slate-400">Status: {kpi.status_text}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold inline-block ${
                            isGreen ? 'bg-emerald-50 text-emerald-700' : isRed ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {kpi.status_text}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {renderSparkline(kpi.trend, isGreen ? 'stroke-emerald-500' : 'stroke-amber-500')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Row Cards (Mission Report, Recent Activity, Upcoming Reviews) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Mission Report Status Card */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-900">Mission Report Status</h3>
                  <button className="text-[11px] font-semibold text-blue-600">View All</button>
                </div>
                <div className="flex flex-col items-center justify-center my-4">
                  <div className="relative w-24 h-24 rounded-full border-8 border-emerald-500 border-t-amber-400 flex items-center justify-center">
                    <span className="text-lg font-bold text-slate-900">{missionReport.completed_percentage}%</span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium mt-2">Completed</span>
                </div>
              </div>
              <div className="space-y-1 text-xs border-t border-slate-100 pt-3">
                <div className="flex justify-between text-slate-600">
                  <span>On Time</span>
                  <span className="font-bold text-emerald-600">{missionReport.on_time_percentage}%</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Pending</span>
                  <span className="font-bold text-amber-500">{missionReport.pending_percentage}%</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Overdue</span>
                  <span className="font-bold text-rose-500">{missionReport.overdue_percentage}%</span>
                </div>
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-900">Recent Activity</h3>
                  <button className="text-[11px] font-semibold text-blue-600">View All</button>
                </div>
                <div className="space-y-3 my-2">
                  {recentActivity.map((act) => (
                    <div key={act.id} className="flex items-start gap-2.5 text-xs">
                      <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckIcon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 text-[11px] leading-tight">{act.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{act.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Upcoming Reviews Card */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-900">Upcoming Reviews</h3>
                  <button className="text-[11px] font-semibold text-blue-600">View All</button>
                </div>

                <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-100 my-2 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                    <span>{upcomingReviews.title}</span>
                    <CalendarIcon className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-[11px] text-purple-700">{upcomingReviews.date_range}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-purple-900">
                      <span>{upcomingReviews.completion_percentage}%</span>
                      <span>Self Assessment Completed</span>
                    </div>
                    <div className="w-full bg-purple-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-purple-600 h-full rounded-full" style={{ width: `${upcomingReviews.completion_percentage}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition mt-2">
                Continue Review
              </button>
            </div>

          </div>

        </div>

        {/* Right Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Today's Tasks Widget */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Today's Tasks</h2>
              <button className="text-xs font-semibold text-blue-600">View All</button>
            </div>

            <div className="space-y-3">
              {tasksList.map((t) => (
                <div key={t.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition">
                  <input 
                    type="checkbox"
                    checked={t.is_completed}
                    onChange={() => toggleTask(t.id)}
                    className="mt-1 rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-slate-300"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${t.is_completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {t.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-400">{t.due_time}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        t.priority === 'High' ? 'bg-rose-50 text-rose-600' : t.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {t.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-blue-600">7 tasks pending</span>
            </div>
          </div>

          {/* Announcements Widget */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Announcements</h2>
              <button className="text-xs font-semibold text-blue-600">View All</button>
            </div>

            <div className="space-y-3">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                  <div className="flex items-center gap-2">
                    {ann.type === 'info' && <BellIcon className="w-4 h-4 text-blue-600 shrink-0" />}
                    {ann.type === 'success' && <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {ann.type === 'warning' && <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 shrink-0" />}
                    <h4 className="text-xs font-bold text-slate-900">{ann.title}</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">{ann.content}</p>
                  <p className="text-[10px] text-slate-400">{ann.date}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Organization KPIs Section */}
      <OrganizationKPITable limit={5} />
    </div>
  );
};

export default StaffDashboard;