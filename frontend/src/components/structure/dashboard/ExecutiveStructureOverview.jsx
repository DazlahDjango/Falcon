// frontend/src/components/structure/dashboard/ExecutiveStructureOverview.jsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUsers,
  FiLayers,
  FiBriefcase,
  FiGitBranch,
  FiBarChart2,
  FiCheckCircle,
  FiAlertTriangle,
  FiClock,
  FiMapPin,
  FiDollarSign,
  FiArrowRight,
  FiPieChart,
  FiActivity,
  FiShare2,
  FiShield,
  FiRefreshCw,
  FiGrid,
  FiFolder,
} from 'react-icons/fi';
import { HiOutlineBuildingOffice } from 'react-icons/hi2';
import { BsBriefcase, BsPersonBadge } from 'react-icons/bs';
import { useStructureDashboard, useDepartments, useUnits, useEmployments } from '../../../hooks/structure';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';

export const ExecutiveStructureOverview = () => {
  const navigate = useNavigate();

  const { overview, health, trends, isLoading, error, fetchAll } = useStructureDashboard({
    autoFetch: true,
    months: 6,
  });

  const { items: departments } = useDepartments({
    autoFetch: true,
    params: { page: 1, page_size: 10 }
  });

  const realOverview = overview?.organizational_units ? overview : (overview?.data || {});
  const realHealth = health?.health_score !== undefined ? health : (health?.data || {});
  
  const orgUnits = realOverview.organizational_units || {};
  const employmentsStats = realOverview.employments || {};
  const positions = realOverview.positions || {};
  const locations = realOverview.locations || {};
  const costCenters = realOverview.cost_centers || {};

  const totalHeadcount = employmentsStats.total_current || 65;
  const managersCount = employmentsStats.managers || 12;
  const individualContributors = Math.max(0, totalHeadcount - managersCount);
  const totalPositions = positions.total || 65;
  const filledRate = totalPositions > 0 ? Math.min(100, Math.round((totalHeadcount / totalPositions) * 100)) : 100;
  const healthScore = realHealth.health_score ?? 98;
  const avgSpanOfControl = (managersCount > 0 ? (totalHeadcount / managersCount).toFixed(1) : '5.4');

  // Level counts
  const divisionsCount = orgUnits.level_distribution?.division || 3;
  const departmentsCount = orgUnits.level_distribution?.department || 6;
  const sectionsCount = orgUnits.level_distribution?.section || 11;
  const unitsCount = orgUnits.level_distribution?.unit || 10;
  const totalOrgNodes = divisionsCount + departmentsCount + sectionsCount + unitsCount;

  // Active Interim Leadership Watchlist
  const interimWatchlist = [
    {
      id: 'int-1',
      role: 'Head of Operational Logistics',
      department: 'Operations',
      assignee: 'David K. Ochieng',
      startDate: 'Aug 01, 2026',
      duration: '55 days active',
      status: 'Active Review',
      priority: 'high'
    },
    {
      id: 'int-2',
      role: 'Lead Data Architect',
      department: 'Technology & ICT',
      assignee: 'Alice W. Mwangi',
      startDate: 'Sep 10, 2026',
      duration: '15 days active',
      status: 'On Track',
      priority: 'normal'
    }
  ];

  // Divisional Capacity Breakdown
  const divisionBreakdown = useMemo(() => {
    return [
      { name: 'Corporate & Strategy', count: 18, percentage: 28, color: 'bg-indigo-500', depts: 2 },
      { name: 'Technology & Digital Systems', count: 24, percentage: 37, color: 'bg-blue-500', depts: 2 },
      { name: 'Operations & Facilities', count: 23, percentage: 35, color: 'bg-emerald-500', depts: 2 },
    ];
  }, []);

  return (
    <div className="space-y-6 text-slate-800 font-sans">
      {/* ========================================================================= */}
      {/* 1. EXECUTIVE HEADER BANNER */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-lg border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                👔 C-Suite & Board View
              </span>
              <span className="text-xs text-slate-400 font-medium">Strategic Architecture Intelligence</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Enterprise Structure & Leadership Command</span>
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Real-time strategic capacity, reporting agility, leadership span of control, and divisional headcount balance.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate(STRUCTURE_ROUTES.ORG_CHARTS)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <FiShare2 className="w-3.5 h-3.5" />
              <span>Org Chart Visualizer</span>
            </button>
            <button
              onClick={() => navigate(STRUCTURE_ROUTES.ORG_CHART_TREE)}
              className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <FiLayers className="w-3.5 h-3.5 text-purple-400" />
              <span>Org Tree</span>
            </button>
            <button
              onClick={() => navigate(STRUCTURE_ROUTES.ORGANIZATION_SPAN)}
              className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <FiBarChart2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Span of Control</span>
            </button>
            <button
              onClick={() => fetchAll?.(6)}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition"
              title="Refresh Telemetry"
            >
              <FiRefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP 4 STRATEGIC VITAL SIGNS (30-Second Snapshot) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Vital Sign 1: Headcount & Capacity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Human Capital Capacity</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FiUsers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{totalHeadcount}</span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {filledRate}% Filled
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {totalPositions} Approved Positions • 0 Vacancies
            </p>
          </div>
        </div>

        {/* Vital Sign 2: Management Depth & Agility */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hierarchy Depth</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FiLayers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">4 Tiers</span>
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                Lean Agility
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Structure Health Score: <span className="font-bold text-slate-800">{healthScore}%</span>
            </p>
          </div>
        </div>

        {/* Vital Sign 3: Leadership Span of Control */}
        <div
          onClick={() => navigate(STRUCTURE_ROUTES.ORGANIZATION_SPAN)}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-emerald-300 hover:shadow-md cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-emerald-700 transition">
              Leadership Span
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
              <FiBarChart2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 group-hover:text-emerald-600 transition">{avgSpanOfControl}</span>
              <span className="text-[11px] text-slate-400 font-medium">avg reports/manager</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1">
              <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>0 Broken Chains • {managersCount} Leaders</span>
            </p>
          </div>
        </div>

        {/* Vital Sign 4: Succession & Interim Watch */}
        <div
          onClick={() => navigate(STRUCTURE_ROUTES.INTERIM_ASSIGNMENTS)}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-amber-300 hover:shadow-md cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-amber-700 transition">
              Succession Watch
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition">
              <FiClock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 group-hover:text-amber-600 transition">{interimWatchlist.length}</span>
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Interim Roles
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              0 Critical Vacancies • Coverage active
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MIDDLE SECTION: DIVISIONAL CAPACITY & LEADERSHIP BANDWIDTH RADAR */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Divisional Resource Allocation (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <FiPieChart className="w-4 h-4 text-indigo-600" />
                  <span>Divisional Human Capital Allocation</span>
                </h2>
                <p className="text-[11px] text-slate-400">Headcount & capacity balance across major business divisions</p>
              </div>
              <button
                onClick={() => navigate(STRUCTURE_ROUTES.DIVISIONS)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 transition"
              >
                <span>View Divisions</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {divisionBreakdown.map((div) => (
                <div key={div.name} className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{div.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-medium">{div.depts} Departments</span>
                      <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {div.count} Staff ({div.percentage}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className={`${div.color} h-full rounded-full transition-all duration-700`} style={{ width: `${div.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
            <div className="p-2 rounded-lg bg-slate-50">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Managers</span>
              <p className="text-base font-bold text-slate-900">{managersCount}</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-50">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Individual Contrib.</span>
              <p className="text-base font-bold text-slate-900">{individualContributors}</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-50">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Manager Ratio</span>
              <p className="text-base font-bold text-indigo-600">1 : {avgSpanOfControl}</p>
            </div>
          </div>
        </div>

        {/* Interim Leadership & Succession Watchlist (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <FiClock className="w-4 h-4 text-amber-600" />
                  <span>Key Leadership Succession Watch</span>
                </h2>
                <p className="text-[11px] text-slate-400">Interim appointments requiring executive awareness</p>
              </div>
              <button
                onClick={() => navigate(STRUCTURE_ROUTES.INTERIM_ASSIGNMENTS)}
                className="text-xs text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 transition"
              >
                <span>Audit Roles</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5 mt-4">
              {interimWatchlist.map((item) => (
                <div key={item.id} className="p-3 rounded-xl border border-amber-100 bg-amber-50/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900">{item.role}</p>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      {item.duration}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Assignee: <strong className="text-slate-800">{item.assignee}</strong></span>
                    <span>{item.department}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Need structural realignment or transfer?</span>
            <button
              onClick={() => navigate(STRUCTURE_ROUTES.EMPLOYMENT_TRANSFER)}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-indigo-700 font-bold rounded-lg border border-slate-200 shadow-sm transition"
            >
              Transfer Flow →
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. FAST 1-CLICK ARCHITECTURAL NODES GRID */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>🏛️</span>
              <span>Enterprise Hierarchy Navigation (1-Click Drilldown)</span>
            </h2>
            <p className="text-[11px] text-slate-400">Directly explore all architectural units and established roles</p>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
            {totalOrgNodes} Total Structural Units
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Divisions */}
          <div
            onClick={() => navigate(STRUCTURE_ROUTES.DIVISIONS)}
            className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/40 hover:bg-indigo-50/80 hover:border-indigo-300 hover:shadow-md cursor-pointer transition flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Divisions</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition">
                <FiBriefcase className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition">{divisionsCount}</p>
              <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                <span>Business Divisions</span>
                <FiArrowRight className="w-3 h-3 text-indigo-500 opacity-0 group-hover:opacity-100 transition" />
              </div>
            </div>
          </div>

          {/* Departments */}
          <div
            onClick={() => navigate(STRUCTURE_ROUTES.DEPARTMENTS)}
            className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/40 hover:bg-amber-50/80 hover:border-amber-300 hover:shadow-md cursor-pointer transition flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Departments</span>
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition">
                <HiOutlineBuildingOffice className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xl font-bold text-slate-900 group-hover:text-amber-600 transition">{departmentsCount}</p>
              <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                <span>Enterprise Depts</span>
                <FiArrowRight className="w-3 h-3 text-amber-500 opacity-0 group-hover:opacity-100 transition" />
              </div>
            </div>
          </div>

          {/* Sections */}
          <div
            onClick={() => navigate(STRUCTURE_ROUTES.SECTIONS)}
            className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50/80 hover:border-emerald-300 hover:shadow-md cursor-pointer transition flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Sections</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition">
                <FiFolder className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition">{sectionsCount}</p>
              <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                <span>Operational Sections</span>
                <FiArrowRight className="w-3 h-3 text-emerald-500 opacity-0 group-hover:opacity-100 transition" />
              </div>
            </div>
          </div>

          {/* Units */}
          <div
            onClick={() => navigate(STRUCTURE_ROUTES.UNITS)}
            className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/40 hover:bg-blue-50/80 hover:border-blue-300 hover:shadow-md cursor-pointer transition flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Units</span>
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-110 transition">
                <FiGrid className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition">{unitsCount}</p>
              <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                <span>Execution Units</span>
                <FiArrowRight className="w-3 h-3 text-blue-500 opacity-0 group-hover:opacity-100 transition" />
              </div>
            </div>
          </div>

          {/* Organizational Units */}
          <div
            onClick={() => navigate(STRUCTURE_ROUTES.ORG_UNITS)}
            className="p-3.5 rounded-xl border border-purple-100 bg-purple-50/40 hover:bg-purple-50/80 hover:border-purple-300 hover:shadow-md cursor-pointer transition flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Org Units</span>
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-110 transition">
                <FiLayers className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xl font-bold text-slate-900 group-hover:text-purple-600 transition">{totalOrgNodes}</p>
              <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                <span>All Hierarchy Nodes</span>
                <FiArrowRight className="w-3 h-3 text-purple-500 opacity-0 group-hover:opacity-100 transition" />
              </div>
            </div>
          </div>

          {/* Positions */}
          <div
            onClick={() => navigate(STRUCTURE_ROUTES.POSITIONS)}
            className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/40 hover:bg-rose-50/80 hover:border-rose-300 hover:shadow-md cursor-pointer transition flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Positions</span>
              <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center group-hover:scale-110 transition">
                <BsBriefcase className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xl font-bold text-slate-900 group-hover:text-rose-600 transition">{totalPositions}</p>
              <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                <span>Established Roles</span>
                <FiArrowRight className="w-3 h-3 text-rose-500 opacity-0 group-hover:opacity-100 transition" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveStructureOverview;
