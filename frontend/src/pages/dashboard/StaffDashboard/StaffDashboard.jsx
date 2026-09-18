// frontend/src/pages/dashboard/StaffDashboard/StaffDashboard.jsx

import React, { useMemo } from 'react';
import useIndividualDashboard from '../../../hooks/kpi/useIndividualDashboard';
import OrganizationKPITable from '../../../components/kpi/dashboard/OrganizationKPITable';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon, 
  ClipboardDocumentCheckIcon, 
  ArrowPathIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const StaffDashboard = () => {
  const {
    loading,
    refreshDashboard,
    user,
    tenant,
    overallScore,
    kpiList,
    totalKpis,
    onTrackCount,
    atRiskCount,
    offTrackCount,
    onTrackPercentage,
    atRiskPercentage,
    offTrackPercentage,
    recentActivity,
    myRedAlerts,
  } = useIndividualDashboard({ autoFetch: true });

  // Dynamic user details
  const userName = user?.first_name 
    ? `${user.first_name} ${user.last_name || ''}`.trim() 
    : (user?.username || user?.email?.split('@')[0] || 'Staff Member');
  const userTitle = user?.job_title || user?.position_title || user?.role || 'Staff / Individual Contributor';
  const userDepartment = user?.department_name || user?.department?.name || tenant?.name || 'Department';
  const userInitial = userName ? userName[0].toUpperCase() : 'S';

  // Overall health assessment
  const healthLabel = useMemo(() => {
    if (overallScore >= 90) return { text: 'On Track', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' };
    if (overallScore >= 70) return { text: 'At Risk', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' };
    return { text: 'Off Track', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' };
  }, [overallScore]);

  // Sparkline helper
  const renderSparkline = (score, colorClass = 'stroke-emerald-500') => {
    const s = Math.max(0, Math.min(100, Number(score) || 0));
    const width = 80;
    const height = 24;
    const y = height - (s / 100) * height;

    return (
      <svg className="w-20 h-6 overflow-visible inline-block" viewBox={`0 0 ${width} ${height}`}>
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#f1f5f9" strokeWidth="1" />
        <path d={`M 0 ${height - 5} L ${width / 2} ${(height + y) / 2} L ${width} ${y}`} fill="none" className={colorClass} strokeWidth="2" strokeLinecap="round" />
        <circle cx={width} cy={y} r="3" className={colorClass.replace('stroke-', 'fill-')} />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 space-y-6 text-slate-800 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-lg shrink-0 shadow-sm">
            {userInitial}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Welcome back, {userName}! <span className="inline-block animate-bounce">👋</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {userTitle} • <span className="text-slate-700 font-medium">{userDepartment}</span>
              <span className={`ml-2.5 px-2 py-0.5 rounded text-[10px] font-bold border ${healthLabel.bg} ${healthLabel.color}`}>
                Score: {Math.round(overallScore)}% ({healthLabel.text})
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => refreshDashboard()}
            className="p-2 text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-lg border border-slate-200 transition flex items-center gap-1.5 text-xs font-semibold"
            title="Refresh Data"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Top 5 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Overall Performance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base shrink-0">
            {Math.round(overallScore)}%
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Overall Performance</p>
            <p className="text-lg font-bold text-slate-900">{Math.round(overallScore)}%</p>
            <p className={`text-[10px] font-semibold ${healthLabel.color}`}>{healthLabel.text}</p>
          </div>
        </div>

        {/* KPIs On Track */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">KPIs On Track</p>
            <p className="text-lg font-bold text-slate-900">{onTrackCount} <span className="text-xs text-slate-400 font-normal">({onTrackPercentage}%)</span></p>
            <p className="text-[10px] text-emerald-600 font-semibold">Meeting Target</p>
          </div>
        </div>

        {/* KPIs At Risk */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <ExclamationTriangleIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">KPIs At Risk</p>
            <p className="text-lg font-bold text-slate-900">{atRiskCount} <span className="text-xs text-slate-400 font-normal">({atRiskPercentage}%)</span></p>
            <p className="text-[10px] text-amber-600 font-semibold">Near Threshold</p>
          </div>
        </div>

        {/* KPIs Off Track */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <XCircleIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">KPIs Off Track</p>
            <p className="text-lg font-bold text-slate-900">{offTrackCount} <span className="text-xs text-slate-400 font-normal">({offTrackPercentage}%)</span></p>
            <p className="text-[10px] text-rose-500 font-semibold">Needs Attention</p>
          </div>
        </div>

        {/* Total Scoped KPIs */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <ClipboardDocumentCheckIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Assigned KPIs</p>
            <p className="text-lg font-bold text-slate-900">{totalKpis}</p>
            <p className="text-[10px] text-purple-600 font-semibold">Active Cycle</p>
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
              <div>
                <h2 className="text-base font-bold text-slate-900">My Assigned KPIs</h2>
                <p className="text-xs text-slate-500">Personal performance indicators and target achievements</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {kpiList.length} Total
              </span>
            </div>

            <div className="overflow-x-auto">
              {kpiList.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs text-slate-400 font-medium">
                      <th className="py-2.5 px-3">KPI Indicator</th>
                      <th className="py-2.5 px-3">Progress</th>
                      <th className="py-2.5 px-3">Actual vs Target</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {kpiList.map((kpi, idx) => {
                      const score = Number(kpi.score) || 0;
                      const isGreen = kpi.status === 'GREEN' || score >= 90;
                      const isRed = kpi.status === 'RED' || score < 70;
                      const statusText = isGreen ? 'On Track' : isRed ? 'Off Track' : 'At Risk';
                      const actualStr = kpi.actual_value != null ? String(kpi.actual_value) : '-';
                      const targetStr = kpi.target_value != null ? String(kpi.target_value) : '-';
                      
                      return (
                        <tr key={kpi.kpi_id || kpi.id || idx} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-3">
                            <p className="font-semibold text-slate-800">{kpi.kpi_name || kpi.name}</p>
                          </td>
                          <td className="py-3 px-3 w-36">
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${isGreen ? 'bg-emerald-500' : isRed ? 'bg-rose-500' : 'bg-amber-500'}`}
                                  style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                                />
                              </div>
                              <span className="font-bold text-slate-700 text-[11px]">{Math.round(score)}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-700">
                            {actualStr} / {targetStr}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isGreen ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : isRed ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              ● {statusText}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            {renderSparkline(score, isGreen ? 'stroke-emerald-500' : isRed ? 'stroke-rose-500' : 'stroke-amber-500')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No personal KPIs assigned for the current period
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Recent Activity / Submissions */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Recent Actuals Activity</h2>
            </div>

            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((act, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start gap-2.5 text-xs">
                    <CalendarIcon className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 text-[11px] truncate">{act.kpi}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Month {act.month} • Actual: <span className="font-bold text-slate-700">{act.actual}</span> • Status: <span className="font-semibold text-blue-600">{act.status}</span>
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  No recent submissions recorded
                </div>
              )}
            </div>
          </div>

          {/* Personal Performance Alerts */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Personal Alerts</h2>
              <span className="text-xs text-slate-400">{myRedAlerts.length} Active</span>
            </div>

            <div className="space-y-2.5">
              {myRedAlerts.length > 0 ? (
                myRedAlerts.map((alt, idx) => (
                  <div key={alt.id || idx} className="p-2.5 rounded-xl border border-rose-100 bg-rose-50/50 flex items-start gap-2 text-xs">
                    <ExclamationCircleIcon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 text-[11px] truncate">
                        {alt.title || alt.kpi_name || 'KPI requires actual submission or improvement'}
                      </p>
                      <p className="text-[10px] text-slate-400">Action required</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40 flex items-center gap-2.5 text-xs">
                  <ShieldCheckIcon className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold text-emerald-900 text-[11px]">All Goals In Good Standing</p>
                    <p className="text-[10px] text-emerald-700 mt-0.5">No critical alerts for your assigned KPIs.</p>
                  </div>
                </div>
              )}
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