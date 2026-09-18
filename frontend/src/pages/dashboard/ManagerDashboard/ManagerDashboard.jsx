// frontend/src/pages/dashboard/ManagerDashboard/ManagerDashboard.jsx

import React, { useMemo, useState } from 'react';
import useManagerDashboard from '../../../hooks/kpi/useManagerDashboard';
import OrganizationKPITable from '../../../components/kpi/dashboard/OrganizationKPITable';
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
  ArrowPathIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const ManagerDashboard = () => {
  const {
    loading,
    refreshDashboard,
    user,
    tenant,
    managerScore,
    teamSize,
    teamAvgScore,
    onTrackCount,
    atRiskCount,
    offTrackCount,
    onTrackPercentage,
    atRiskPercentage,
    offTrackPercentage,
    pendingValidations,
    pendingCount,
    missingCount,
    teamMembers,
    myScores,
    redAlerts,
  } = useManagerDashboard({ autoFetch: true });

  const [activeTrendIndex, setActiveTrendIndex] = useState(null);

  // Dynamic user information
  const userName = user?.first_name 
    ? `${user.first_name} ${user.last_name || ''}`.trim() 
    : (user?.username || user?.email?.split('@')[0] || 'Manager');
  const userTitle = user?.job_title || user?.position_title || user?.role || 'Team Lead / Manager';
  const userDepartment = user?.department_name || user?.department?.name || tenant?.name || 'Department / Unit';
  const userInitial = userName ? userName[0].toUpperCase() : 'M';

  // Overall manager health
  const managerHealthLabel = useMemo(() => {
    if (managerScore >= 90) return { text: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' };
    if (managerScore >= 75) return { text: 'Good', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' };
    if (managerScore >= 50) return { text: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' };
    return { text: 'Critical', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' };
  }, [managerScore]);

  // Dynamic Team Trend Points
  const trendPoints = useMemo(() => {
    if (!teamMembers || teamMembers.length === 0) {
      return [];
    }

    const svgWidth = 400;
    const svgHeight = 130;
    const paddingX = 25;
    const paddingY = 15;
    const chartWidth = svgWidth - paddingX * 2;
    const chartHeight = svgHeight - paddingY * 2;

    const n = teamMembers.length;
    const step = n > 1 ? chartWidth / (n - 1) : chartWidth;

    return teamMembers.map((m, i) => {
      const score = Math.max(0, Math.min(100, Number(m.score) || 0));
      const x = paddingX + i * step;
      const y = paddingY + (chartHeight - (score / 100) * chartHeight);
      return { x, y, score, name: m.name || `Member ${i + 1}`, status: m.status };
    });
  }, [teamMembers]);

  const pathD = useMemo(() => {
    if (!trendPoints.length) return '';
    return trendPoints.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`, '');
  }, [trendPoints]);

  const activePoint = activeTrendIndex !== null && trendPoints[activeTrendIndex] 
    ? trendPoints[activeTrendIndex] 
    : trendPoints[trendPoints.length - 1];

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 space-y-6 text-slate-800 font-sans">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-lg shrink-0 shadow-sm">
            {userInitial}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Good Day, {userName}! <span className="inline-block animate-bounce">👋</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {userTitle} • <span className="text-slate-700 font-medium">{userDepartment}</span>
              <span className={`ml-2.5 px-2 py-0.5 rounded text-[10px] font-bold border ${managerHealthLabel.bg} ${managerHealthLabel.color}`}>
                Score: {Math.round(managerScore)}% ({managerHealthLabel.text})
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

      {/* Top 5 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Team Performance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <UserGroupIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Team Performance</p>
            <p className="text-lg font-bold text-slate-900">{Math.round(teamAvgScore)}%</p>
            <p className="text-[10px] text-slate-400 font-semibold">{teamSize} Direct / Led Members</p>
          </div>
        </div>

        {/* On Track */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">On Track</p>
            <p className="text-lg font-bold text-slate-900">{onTrackCount} <span className="text-xs text-slate-400 font-normal">({onTrackPercentage}%)</span></p>
            <p className="text-[10px] text-emerald-600 font-semibold">Meeting Target</p>
          </div>
        </div>

        {/* At Risk */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <ExclamationTriangleIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">At Risk</p>
            <p className="text-lg font-bold text-slate-900">{atRiskCount} <span className="text-xs text-slate-400 font-normal">({atRiskPercentage}%)</span></p>
            <p className="text-[10px] text-amber-600 font-semibold">Near Threshold</p>
          </div>
        </div>

        {/* Off Track */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <XCircleIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Off Track</p>
            <p className="text-lg font-bold text-slate-900">{offTrackCount} <span className="text-xs text-slate-400 font-normal">({offTrackPercentage}%)</span></p>
            <p className="text-[10px] text-rose-500 font-semibold">Needs Attention</p>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <ClockIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Pending Validations</p>
            <p className="text-lg font-bold text-slate-900">{pendingCount}</p>
            <p className="text-[10px] text-purple-600 font-semibold">{missingCount > 0 ? `${missingCount} missing` : 'Requires review'}</p>
          </div>
        </div>
      </div>

      {/* Middle Row (Trend Chart, KPI Health Donut, Approvals List) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Team Performance Breakdown Curve (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Team Members Performance Trajectory</h2>
              <span className="text-[10px] text-slate-400 font-medium">{teamSize} Evaluated</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-2">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-600 inline-block"></span> Member Scores</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-slate-400 border-b border-dashed inline-block"></span> Benchmark (80%)</span>
            </div>

            {/* Custom SVG Line Chart */}
            <div className="mt-6 relative h-44 w-full">
              {trendPoints.length > 0 ? (
                <svg className="w-full h-full overflow-visible" viewBox="0 0 400 130">
                  <line x1="0" y1="25" x2="400" y2="25" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="65" x2="400" y2="65" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="105" x2="400" y2="105" stroke="#f1f5f9" strokeWidth="1" />

                  {/* Benchmark 80% line */}
                  <line x1="0" y1="35" x2="400" y2="35" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />

                  {/* Team Members Score Line */}
                  {pathD && (
                    <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
                  )}

                  {/* Interactive Points */}
                  {trendPoints.map((pt, idx) => (
                    <g key={idx} className="cursor-pointer" onMouseEnter={() => setActiveTrendIndex(idx)}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={activePoint?.name === pt.name ? 6 : 4}
                        fill={pt.score >= 90 ? "#10b981" : pt.score >= 70 ? "#f59e0b" : "#ef4444"}
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="transition-all"
                      />
                    </g>
                  ))}
                </svg>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                  No team member score evaluations available
                </div>
              )}

              {/* Popover Callout */}
              {activePoint && (
                <div className="absolute top-1 right-2 bg-white/95 backdrop-blur-sm border border-slate-200 shadow-md rounded-xl p-2 text-[10px] space-y-0.5 z-10 pointer-events-none">
                  <p className="font-bold text-slate-900">{activePoint.name}</p>
                  <p className="text-slate-600">Score: <span className="font-bold text-blue-600">{Math.round(activePoint.score)}%</span></p>
                  <p className={`font-semibold ${activePoint.score >= 90 ? 'text-emerald-600' : activePoint.score >= 70 ? 'text-amber-600' : 'text-rose-600'}`}>
                    Status: {activePoint.status}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-3">
            {trendPoints.map(pt => <span key={pt.name} className="truncate max-w-[60px]">{pt.name.split(' ')[0]}</span>)}
          </div>
        </div>

        {/* KPI Health Donut (3 cols) */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h2 className="text-sm font-bold text-slate-900">Team KPI Health</h2>

          <div className="flex flex-col items-center justify-center my-3 relative">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500"
                strokeDasharray={`${onTrackPercentage}, 100`}
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold text-slate-900">{onTrackPercentage}%</span>
              <span className="text-[10px] text-slate-400 font-semibold">On Track</span>
            </div>
          </div>

          <div className="space-y-1.5 text-[11px] border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> On Track</span>
              <span className="font-bold text-slate-800">{onTrackCount} ({onTrackPercentage}%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> At Risk</span>
              <span className="font-bold text-slate-800">{atRiskCount} ({atRiskPercentage}%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Off Track</span>
              <span className="font-bold text-slate-800">{offTrackCount} ({offTrackPercentage}%)</span>
            </div>
          </div>
        </div>

        {/* Approvals List (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900">Validations Pending</h2>
              <span className="text-xs text-blue-600 font-semibold">{pendingCount} Items</span>
            </div>

            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
              {pendingValidations.length > 0 ? (
                pendingValidations.map((app, idx) => (
                  <div key={app.id || idx} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/50 transition text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <ClockIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 text-[11px] truncate">{app.kpi_name || app.title || 'Actuals Submission'}</p>
                        <p className="text-[10px] text-slate-400 truncate">by {app.user_name || app.user?.name || 'Team Member'}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-700 rounded-md border border-amber-200 shrink-0 ml-2">
                      Pending
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 flex items-center gap-3 text-xs">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold text-emerald-900 text-[11px]">All Approvals Clear</p>
                    <p className="text-[10px] text-emerald-700 mt-0.5">No pending actual submissions requiring review.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3 mt-3">
            <span>Total Awaiting Action</span>
            <span className="font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{pendingCount}</span>
          </div>
        </div>

      </div>

      {/* Team Overview Table Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Direct & Led Team Overview
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {teamMembers.length} Members
              </span>
            </h2>
            <p className="text-xs text-slate-500">Live reporting lines and team performance indicators</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {teamMembers.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400 font-medium">
                  <th className="py-2.5 px-3">Team Member</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Performance Bar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {teamMembers.map((member, idx) => {
                  const score = Number(member.score) || 0;
                  const isGreen = member.status === 'GREEN' || score >= 90;
                  const isRed = member.status === 'RED' || score < 70;
                  const statusLabel = isGreen ? 'On Track' : isRed ? 'Off Track' : 'At Risk';
                  const initial = member.name ? member.name[0].toUpperCase() : 'U';

                  return (
                    <tr key={member.user_id || idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0 border border-slate-200">
                            {initial}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 text-xs block">{member.name}</span>
                            {member.email && <span className="text-[10px] text-slate-400">{member.email}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900 text-xs">
                        {Math.round(score)}%
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isGreen ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : isRed ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          ● {statusLabel}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isGreen ? 'bg-emerald-500' : isRed ? 'bg-rose-500' : 'bg-amber-500'}`}
                            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No team members assigned under your reporting structure
            </div>
          )}
        </div>
      </div>

      {/* Bottom Grid (My KPIs Overview, Submission Health, Quick Actions, Team Alerts) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* My KPIs Overview */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900">My Scoped KPIs</h3>
            <span className="text-[10px] text-slate-400">{myScores.length} KPIs</span>
          </div>
          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
            {myScores.length > 0 ? (
              myScores.map((kpi, idx) => {
                const score = Number(kpi.score) || 0;
                return (
                  <div key={kpi.kpi_id || idx} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-700 font-medium truncate" title={kpi.kpi_name}>{kpi.kpi_name || 'KPI'}</span>
                      <span className="font-bold text-slate-900">{Math.round(score)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${score >= 90 ? 'bg-emerald-500' : score >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400">No personal KPIs assigned for current period</p>
            )}
          </div>
        </div>

        {/* Submission Compliance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 mb-2">Submission Compliance</h3>
            <div className="my-2">
              <p className="text-2xl font-bold text-slate-900">
                {missingCount === 0 ? '100%' : `${Math.max(0, Math.round(((teamSize - missingCount) / (teamSize || 1)) * 100))}%`}
                <span className="text-xs text-slate-400 font-normal ml-1">On Time</span>
              </p>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
                <div 
                  className={`h-full rounded-full ${missingCount === 0 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                  style={{ width: `${missingCount === 0 ? 100 : Math.max(0, Math.round(((teamSize - missingCount) / (teamSize || 1)) * 100))}%` }} 
                />
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <p className="font-semibold text-slate-800">{missingCount} Missing Submissions</p>
              <p className="text-[10px] text-slate-500">Monthly actuals review cycle active</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-900">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-semibold">
            <button 
              onClick={() => refreshDashboard()}
              className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition flex flex-col items-center gap-1 border border-blue-100"
            >
              <CheckIcon className="w-4 h-4 text-blue-600" />
              <span>Review Submissions</span>
            </button>
            <button className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition flex flex-col items-center gap-1 border border-emerald-100">
              <ChatBubbleLeftEllipsisIcon className="w-4 h-4 text-emerald-600" />
              <span>Provide Feedback</span>
            </button>
            <button className="p-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl transition flex flex-col items-center gap-1 border border-purple-100">
              <PlusIcon className="w-4 h-4 text-purple-600" />
              <span>Cascade Target</span>
            </button>
            <button className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl transition flex flex-col items-center gap-1 border border-amber-100">
              <UserGroupIcon className="w-4 h-4 text-amber-600" />
              <span>Team Alignment</span>
            </button>
          </div>
        </div>

        {/* Team Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900">Team Alerts</h3>
            <span className="text-[10px] text-slate-400">{redAlerts.length} Active</span>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {redAlerts.length > 0 ? (
              redAlerts.map((alt, idx) => (
                <div key={alt.id || idx} className="p-2 rounded-xl border border-rose-100 bg-rose-50/50 flex items-start gap-2 text-xs">
                  <ExclamationCircleIcon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 text-[11px] leading-tight truncate">
                      {alt.title || alt.kpi_name || 'Team member threshold alert'}
                    </p>
                    <p className="text-[10px] text-slate-400">Requires attention</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/40 flex items-center gap-2 text-xs">
                <ShieldCheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="text-emerald-800 text-[11px] font-medium">All team members operating in green / acceptable thresholds.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Organization KPIs Section */}
      <OrganizationKPITable limit={5} />
    </div>
  );
};

export default ManagerDashboard;