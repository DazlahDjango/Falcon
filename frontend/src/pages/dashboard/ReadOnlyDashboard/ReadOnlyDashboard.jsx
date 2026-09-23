// frontend/src/pages/dashboard/ReadOnlyDashboard/ReadOnlyDashboard.jsx

import React, { useMemo, useState } from 'react';
import useExecutiveDashboard from '../../../hooks/kpi/useExecutiveDashboard';
import OrganizationKPITable from '../../../components/kpi/dashboard/OrganizationKPITable';
import {
  BuildingOffice2Icon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ChartBarIcon,
  DocumentCheckIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

import HeaderTag from '../../../components/dashboard/HeaderTag';

const ReadOnlyDashboard = () => {
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
    entityTypeLabel,
  } = useExecutiveDashboard({ autoFetch: true });

  const [activeTrendIndex, setActiveTrendIndex] = useState(null);

  // Overall health assessment
  const healthLabel = useMemo(() => {
    if (overallHealth >= 90) return { text: 'On Track', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' };
    if (overallHealth >= 75) return { text: 'Good', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' };
    if (overallHealth >= 50) return { text: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' };
    return { text: 'Critical', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' };
  }, [overallHealth]);

  // Dynamic SVG Trend Points
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

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 space-y-6 text-slate-800 font-sans">
      {/* Banner */}
      <HeaderTag
        roleBadge="Read-Only Observer"
        badgeColor="amber"
        onRefresh={refreshDashboard}
        loading={loading}
      />

      {/* 6 Top Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Overall Performance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Overall Score</p>
            <p className="text-lg font-bold text-slate-900">{Math.round(overallHealth)}%</p>
            <p className={`text-[10px] font-semibold ${healthLabel.color}`}>{healthLabel.text}</p>
          </div>
        </div>

        {/* KPI Completion */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ChartBarIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Target Completion</p>
            <p className="text-lg font-bold text-slate-900">{Math.round(kpiCompletionRate)}%</p>
            <p className="text-[10px] text-blue-600 font-semibold">{totalKpis} Total KPIs</p>
          </div>
        </div>

        {/* Dynamic Cascaded Entities */}
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
            <p className="text-[10px] text-teal-600 font-semibold">Actuals Validated</p>
          </div>
        </div>

        {/* KPI Status Distribution */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ShieldCheckIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Distribution</p>
            <p className="text-lg font-bold text-slate-900">{totalKpis}</p>
            <p className="text-[10px] font-semibold text-slate-500">
              <span className="text-emerald-600">{greenCount}G</span> • <span className="text-amber-500">{yellowCount}Y</span> • <span className="text-rose-500">{redCount}R</span>
            </p>
          </div>
        </div>

        {/* Active Staff */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <UserGroupIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Contributors</p>
            <p className="text-lg font-bold text-slate-900">{activeEmployees}</p>
            <p className="text-[10px] text-slate-500 font-semibold">Active Staff</p>
          </div>
        </div>
      </div>

      {/* Middle Row (Trend Chart, Performance by Status Donut, Cascaded Entities) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Performance Trend Line Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Organization Performance Trend</h2>
              <span className="text-[10px] text-slate-400 font-medium">Trajectory</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-2">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-600 inline-block"></span> Actual Score</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-slate-400 border-b border-dashed inline-block"></span> Benchmark (80%)</span>
            </div>

            {/* Custom SVG Line Chart */}
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

              {/* Popover Callout */}
              {activeTrendPoint && (
                <div className="absolute top-1 right-2 bg-white/95 backdrop-blur-sm border border-slate-200 shadow-md rounded-xl p-2 text-[10px] space-y-0.5 z-10 pointer-events-none">
                  <p className="font-bold text-slate-900">{activeTrendPoint.period}</p>
                  <p className="text-slate-600">Actual Score: <span className="font-bold text-blue-600">{Math.round(activeTrendPoint.score)}%</span></p>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-3">
            {points.map(pt => <span key={pt.period}>{pt.period}</span>)}
          </div>
        </div>

        {/* Validation Compliance Donut (3 cols) */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h2 className="text-sm font-bold text-slate-900">Validation Compliance</h2>

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
                strokeDasharray={`${Math.min(100, Math.max(0, validationCompliance))}, 100`}
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold text-slate-900">{Math.round(validationCompliance)}%</span>
              <span className="text-[10px] text-slate-400 font-semibold">Compliant</span>
            </div>
          </div>

          <div className="space-y-1.5 text-[11px] border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Green ({greenCount})</span>
              <span className="font-bold text-slate-800">{totalKpis > 0 ? Math.round((greenCount / totalKpis) * 100) : 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Yellow ({yellowCount})</span>
              <span className="font-bold text-slate-800">{totalKpis > 0 ? Math.round((yellowCount / totalKpis) * 100) : 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Red ({redCount})</span>
              <span className="font-bold text-slate-800">{totalKpis > 0 ? Math.round((redCount / totalKpis) * 100) : 0}%</span>
            </div>
          </div>
        </div>

        {/* Dynamic Cascaded Entities Overview (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900">{entityTypeLabel} Health Overview</h2>
              <span className="text-xs text-slate-400 font-semibold">{departmentRankings.length} Total</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {departmentRankings.length > 0 ? (
                departmentRankings.map((dept, idx) => {
                  const score = Number(dept.score) || 0;
                  const isGreen = score >= 90;
                  const isRed = score < 70;
                  const statusText = isGreen ? 'On Track' : isRed ? 'Off Track' : 'At Risk';

                  return (
                    <div key={dept.department_id || idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-800 truncate" title={dept.department}>
                          {dept.department}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ml-2 ${
                        isGreen ? 'bg-emerald-50 text-emerald-700' : isRed ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {Math.round(score)}% ({statusText})
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No cascaded entity records available
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

export default ReadOnlyDashboard;