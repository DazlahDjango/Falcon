// frontend/src/pages/dashboard/ExecutiveDashboard/ExecutiveDashboard.jsx

import React, { useMemo, useState } from 'react';
import useExecutiveDashboard from '../../../hooks/kpi/useExecutiveDashboard';
import OrganizationKPITable from '../../../components/kpi/dashboard/OrganizationKPITable';
import {
  BuildingOffice2Icon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  SparklesIcon,
  CalendarIcon,
  CheckIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentCheckIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const ExecutiveDashboard = () => {
  const {
    loading,
    refreshDashboard,
    user,
    tenant,
    overallHealth,
    kpiCompletionRate,
    validationCompliance,
    totalKpis,
    activeEmployees,
    greenCount,
    yellowCount,
    redCount,
    departmentRankings,
    topPerforming,
    attentionRequired,
    trendData,
    redAlerts,
    entityTypeLabel,
  } = useExecutiveDashboard({ autoFetch: true });

  const [activeTrendIndex, setActiveTrendIndex] = useState(null);

  // Dynamic user details
  const userName = user?.first_name 
    ? `${user.first_name} ${user.last_name || ''}`.trim() 
    : (user?.username || user?.email?.split('@')[0] || 'Executive');
  const userTitle = user?.job_title || user?.role || 'Executive Leadership';
  const tenantName = tenant?.name || user?.tenant_name || 'Organization';
  const userInitial = userName ? userName[0].toUpperCase() : 'E';

  // Overall health assessment
  const healthLabel = useMemo(() => {
    if (overallHealth >= 90) return { text: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' };
    if (overallHealth >= 75) return { text: 'Good', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' };
    if (overallHealth >= 50) return { text: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' };
    return { text: 'Critical', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' };
  }, [overallHealth]);

  // Dynamic Executive Intelligence summary text
  const intelligenceSummary = useMemo(() => {
    const parts = [];
    parts.push(`Overall organizational performance is currently at ${Math.round(overallHealth)}% (${healthLabel.text}).`);
    
    if (greenCount > 0 || redCount > 0) {
      parts.push(`${greenCount} KPIs are on track, while ${redCount} require immediate leadership attention.`);
    }

    if (kpiCompletionRate > 0) {
      parts.push(`Target completion rate is ${Math.round(kpiCompletionRate)}% with ${Math.round(validationCompliance)}% validation compliance.`);
    }

    if (attentionRequired.length > 0 && attentionRequired[0].department) {
      parts.push(`${attentionRequired[0].department} recorded the lowest performance score (${Math.round(attentionRequired[0].score)}%).`);
    } else if (topPerforming.length > 0 && topPerforming[0].department) {
      parts.push(`${topPerforming[0].department} leads the organization at ${Math.round(topPerforming[0].score)}%.`);
    }

    return parts.join(' ');
  }, [overallHealth, healthLabel.text, greenCount, redCount, kpiCompletionRate, validationCompliance, attentionRequired, topPerforming]);

  // Dynamic SVG Path Calculation for Trend Chart
  const { pathD, targetPathD, points, targetPoints } = useMemo(() => {
    if (!trendData || trendData.length === 0) {
      return { pathD: '', targetPathD: '', points: [], targetPoints: [] };
    }

    const svgWidth = 400;
    const svgHeight = 130;
    const paddingX = 20;
    const paddingY = 15;
    const chartWidth = svgWidth - paddingX * 2;
    const chartHeight = svgHeight - paddingY * 2;

    const n = trendData.length;
    const step = n > 1 ? chartWidth / (n - 1) : chartWidth;

    const actualPts = trendData.map((d, i) => {
      const score = Math.max(0, Math.min(100, Number(d.score) || 0));
      const x = paddingX + i * step;
      const y = paddingY + (chartHeight - (score / 100) * chartHeight);
      return { x, y, score, period: d.period || `Period ${i + 1}` };
    });

    const tgtPts = trendData.map((d, i) => {
      const targetScore = d.target != null ? Math.max(0, Math.min(100, Number(d.target))) : 80;
      const x = paddingX + i * step;
      const y = paddingY + (chartHeight - (targetScore / 100) * chartHeight);
      return { x, y, targetScore, period: d.period || `Period ${i + 1}` };
    });

    const pD = actualPts.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`, '');
    const tPD = tgtPts.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`, '');

    return { pathD: pD, targetPathD: tPD, points: actualPts, targetPoints: tgtPts };
  }, [trendData]);

  const activeTrendPoint = activeTrendIndex !== null && points[activeTrendIndex] 
    ? points[activeTrendIndex] 
    : points[points.length - 1];
  const activeTargetPoint = activeTrendIndex !== null && targetPoints[activeTrendIndex]
    ? targetPoints[activeTrendIndex]
    : targetPoints[targetPoints.length - 1];

  // Dynamic focus items
  const dynamicFocusItems = useMemo(() => {
    const items = [];
    if (redCount > 0) {
      items.push({
        id: 'f1',
        text: `Address ${redCount} critical red KPIs across ${entityTypeLabel.toLowerCase()}`,
        status: 'urgent'
      });
    }
    if (validationCompliance < 80) {
      items.push({
        id: 'f2',
        text: `Accelerate actuals validation (compliance at ${Math.round(validationCompliance)}%)`,
        status: 'pending'
      });
    }
    if (attentionRequired.length > 0) {
      items.push({
        id: 'f3',
        text: `Conduct operational review with ${attentionRequired[0].department || 'underperforming units'}`,
        status: 'action'
      });
    }
    if (items.length === 0) {
      items.push({
        id: 'f_ok',
        text: `All ${entityTypeLabel.toLowerCase()} meeting organizational performance thresholds`,
        status: 'healthy'
      });
    }
    return items;
  }, [redCount, entityTypeLabel, validationCompliance, attentionRequired]);

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
              Welcome, {userName} <span className="inline-block animate-bounce">👋</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {userTitle} • <span className="text-slate-700 font-semibold">{tenantName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refreshDashboard()}
            className="p-2 text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-lg border border-slate-200 transition flex items-center gap-1.5 text-xs font-semibold"
            title="Refresh Dashboard Data"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Top Banner Cards Grid (8 cols Executive Intelligence Summary, 4 cols Strategic Focus) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Executive Intelligence Summary (8 cols) */}
        <div className="lg:col-span-8 bg-blue-50/70 border border-blue-100 p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <SparklesIcon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-blue-950">Executive Intelligence Summary</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${healthLabel.bg} ${healthLabel.color}`}>
                  {healthLabel.text}
                </span>
              </div>
              <p className="text-xs text-blue-950 leading-relaxed font-medium">
                {intelligenceSummary}
              </p>
            </div>
          </div>
        </div>

        {/* Strategic Focus (4 cols) */}
        <div className="lg:col-span-4 bg-purple-50/50 border border-purple-100 p-5 rounded-2xl flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-2 text-purple-900 font-bold text-xs">
              <CalendarIcon className="w-4 h-4 text-purple-600" />
              <span>Leadership Action Items</span>
            </div>
            <div className="space-y-2 text-xs text-purple-950">
              {dynamicFocusItems.map((f) => (
                <div key={f.id} className="flex items-start gap-2">
                  <CheckIcon className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                  <span className="text-[11px] font-medium leading-tight">{f.text}</span>
                </div>
              ))}
            </div>
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
            <p className="text-lg font-bold text-slate-900">{Math.round(overallHealth)}%</p>
            <p className={`text-[10px] font-semibold ${healthLabel.color}`}>{healthLabel.text}</p>
          </div>
        </div>

        {/* KPI Completion Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ChartBarIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">KPI Completion</p>
            <p className="text-lg font-bold text-slate-900">{Math.round(kpiCompletionRate)}%</p>
            <p className="text-[10px] text-slate-500 font-semibold">{totalKpis} Total KPIs</p>
          </div>
        </div>

        {/* Dynamic Cascaded Units */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <BuildingOffice2Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400 truncate">{entityTypeLabel}</p>
            <p className="text-lg font-bold text-slate-900">{departmentRankings.length}</p>
            <p className="text-[10px] text-slate-500 font-semibold">
              <span className="text-emerald-600">{topPerforming.length} High</span>, <span className="text-rose-500">{attentionRequired.length} Alert</span>
            </p>
          </div>
        </div>

        {/* Validation Compliance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <DocumentCheckIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Validation Rate</p>
            <p className="text-lg font-bold text-slate-900">{Math.round(validationCompliance)}%</p>
            <p className="text-[10px] text-emerald-600 font-semibold">Compliance Rate</p>
          </div>
        </div>

        {/* Tracked KPIs Health */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ShieldCheckIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">KPI Distribution</p>
            <p className="text-lg font-bold text-slate-900">{totalKpis}</p>
            <p className="text-[10px] font-semibold text-slate-500">
              <span className="text-emerald-600">{greenCount}G</span> • <span className="text-amber-500">{yellowCount}Y</span> • <span className="text-rose-500">{redCount}R</span>
            </p>
          </div>
        </div>

        {/* Active Staff Contributors */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <UserGroupIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Active Staff</p>
            <p className="text-lg font-bold text-slate-900">{activeEmployees}</p>
            <p className="text-[10px] text-slate-500 font-semibold">Contributors</p>
          </div>
        </div>
      </div>

      {/* Middle Row (Organization Performance Trend, Entity Health Heatmap, Executive Alerts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Trend Line Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Organization Performance Trend</h2>
              <span className="text-[10px] text-slate-400 font-medium">Historical Trajectory</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-2">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-600 inline-block"></span> Actual Score</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-slate-400 border-b border-dashed inline-block"></span> Benchmark (80%)</span>
            </div>

            {/* Custom Dynamic SVG Line Chart */}
            <div className="mt-6 relative h-44 w-full">
              {points.length > 0 ? (
                <svg className="w-full h-full overflow-visible" viewBox="0 0 400 130">
                  <line x1="0" y1="25" x2="400" y2="25" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="65" x2="400" y2="65" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="105" x2="400" y2="105" stroke="#f1f5f9" strokeWidth="1" />

                  {/* Target / Benchmark Line */}
                  {targetPathD && (
                    <path d={targetPathD} fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
                  )}

                  {/* Actual Score Line */}
                  {pathD && (
                    <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
                  )}

                  {/* Interactive Points */}
                  {points.map((pt, idx) => (
                    <g key={idx} className="cursor-pointer" onMouseEnter={() => setActiveTrendIndex(idx)}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={activeTrendPoint?.period === pt.period ? 6 : 4}
                        fill={activeTrendPoint?.period === pt.period ? "#1d4ed8" : "#2563eb"}
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="transition-all"
                      />
                    </g>
                  ))}
                </svg>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                  No historical trend data available
                </div>
              )}

              {/* Active Callout / Tooltip */}
              {activeTrendPoint && (
                <div className="absolute top-1 right-2 bg-white/95 backdrop-blur-sm border border-slate-200 shadow-md rounded-xl p-2 text-[10px] space-y-0.5 z-10 pointer-events-none">
                  <p className="font-bold text-slate-900">{activeTrendPoint.period}</p>
                  <p className="text-slate-600">Actual Score: <span className="font-bold text-blue-600">{Math.round(activeTrendPoint.score)}%</span></p>
                  {activeTargetPoint && (
                    <p className="text-slate-500">Benchmark: <span className="font-bold text-slate-700">{Math.round(activeTargetPoint.targetScore)}%</span></p>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-3">
            {points.map(pt => <span key={pt.period}>{pt.period}</span>)}
          </div>
        </div>

        {/* Dynamic Cascaded Entity Health Heatmap (3 cols) */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900">{entityTypeLabel} Health</h2>
              <span className="text-[10px] text-slate-400">{departmentRankings.length} Total</span>
            </div>

            {departmentRankings.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {departmentRankings.map((dept) => {
                  const score = Number(dept.score) || 0;
                  const isGreen = score >= 90;
                  const isRed = score < 70;
                  const statusText = isGreen ? 'On Track' : isRed ? 'Off Track' : 'At Risk';

                  return (
                    <div
                      key={dept.department_id || dept.department}
                      className={`p-2 rounded-xl border text-center flex flex-col justify-between transition hover:shadow-sm ${
                        isGreen 
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                          : isRed 
                          ? 'bg-rose-50/70 border-rose-200 text-rose-950' 
                          : 'bg-amber-50/70 border-amber-200 text-amber-950'
                      }`}
                    >
                      <p className="text-[10px] font-bold truncate" title={dept.department}>
                        {dept.department}
                      </p>
                      <p className="text-sm font-bold my-1">{Math.round(score)}%</p>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                        isGreen ? 'bg-emerald-200/80 text-emerald-800' : isRed ? 'bg-rose-200/80 text-rose-800' : 'bg-amber-200/80 text-amber-800'
                      }`}>
                        {statusText}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No cascaded entity scores available
              </div>
            )}
          </div>
        </div>

        {/* Executive Alerts (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-900">Executive Alerts</h2>
              <span className="text-xs text-slate-400 font-semibold">{redAlerts.length} Active</span>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {redAlerts.length > 0 ? (
                redAlerts.map((alt, idx) => (
                  <div key={alt.id || idx} className="p-2.5 rounded-xl border border-rose-100 bg-rose-50/50 flex items-start gap-2 text-xs">
                    <ExclamationCircleIcon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 text-[11px] leading-tight truncate">
                        {alt.title || alt.kpi_name || alt.message || 'Critical KPI threshold breached'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {alt.created_at ? new Date(alt.created_at).toLocaleDateString() : 'Action required'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 flex items-center gap-3 text-xs">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold text-emerald-900 text-[11px]">All Systems Healthy</p>
                    <p className="text-[10px] text-emerald-700 mt-0.5">No critical red alerts currently active.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Row Grid (4 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Top Performing Entities */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>🏆</span> Top Performing {entityTypeLabel}
            </h3>
          </div>
          <div className="space-y-3">
            {topPerforming.length > 0 ? (
              topPerforming.map((d, index) => (
                <div key={d.department_id || index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <span className="font-semibold text-slate-800 truncate" title={d.department}>
                      {d.department}
                    </span>
                  </div>
                  <span className="font-bold text-emerald-600 shrink-0 ml-2">{Math.round(d.score || 0)}%</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No entity performance rankings available</p>
            )}
          </div>
        </div>

        {/* Entities Requiring Attention */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <ExclamationTriangleIcon className="w-4 h-4 text-rose-500" />
              <span>{entityTypeLabel} Requiring Attention</span>
            </h3>
          </div>
          <div className="space-y-3">
            {attentionRequired.length > 0 ? (
              attentionRequired.map((d, index) => (
                <div key={d.department_id || index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-5 h-5 rounded-md bg-rose-50 text-rose-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <span className="font-semibold text-slate-800 truncate" title={d.department}>
                      {d.department}
                    </span>
                  </div>
                  <span className="font-bold text-rose-500 shrink-0 ml-2">{Math.round(d.score || 0)}%</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">All entities performing within target ranges</p>
            )}
          </div>
        </div>

        {/* KPI Status Distribution Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900 mb-2">KPI Health Distribution</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-xs">
                <span className="text-emerald-900 font-semibold text-[11px]">Green (On Track)</span>
                <span className="font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full text-[10px] border border-emerald-200">
                  {greenCount}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50 border border-amber-100 text-xs">
                <span className="text-amber-900 font-semibold text-[11px]">Yellow (At Risk)</span>
                <span className="font-bold text-amber-700 bg-white px-2 py-0.5 rounded-full text-[10px] border border-amber-200">
                  {yellowCount}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50 border border-rose-100 text-xs">
                <span className="text-rose-900 font-semibold text-[11px]">Red (Critical)</span>
                <span className="font-bold text-rose-700 bg-white px-2 py-0.5 rounded-full text-[10px] border border-rose-200">
                  {redCount}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2">
            <span>Total Evaluated KPIs</span>
            <span className="font-bold text-slate-900">{totalKpis}</span>
          </div>
        </div>

        {/* Validation & Reporting Compliance Donut */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-bold text-slate-900">Validation Compliance</h3>
          <div className="flex flex-col items-center justify-center my-2 relative">
            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500 transition-all duration-1000 ease-out"
                strokeDasharray={`${Math.min(100, Math.max(0, validationCompliance))}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-bold text-slate-900">{Math.round(validationCompliance)}%</span>
              <span className="text-[9px] text-slate-400 font-semibold">Compliant</span>
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-2">
            <span>Target Completion: {Math.round(kpiCompletionRate)}%</span>
          </div>
        </div>

      </div>

      {/* Organization KPIs Section */}
      <OrganizationKPITable limit={5} />
    </div>
  );
};

export default ExecutiveDashboard;