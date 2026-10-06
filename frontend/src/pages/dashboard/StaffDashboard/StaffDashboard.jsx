// frontend/src/pages/dashboard/StaffDashboard/StaffDashboard.jsx

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ExclamationCircleIcon,
  UserGroupIcon,
  BriefcaseIcon,
  BuildingOffice2Icon,
  UserIcon,
  ChevronRightIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';

import {
  FiUsers,
  FiUser,
  FiBriefcase,
  FiGitBranch,
  FiLayers,
  FiMail,
  FiMapPin,
  FiShield,
  FiArrowRight,
} from 'react-icons/fi';
import { HiOutlineBuildingOffice } from 'react-icons/hi2';

import HeaderTag from '../../../components/dashboard/HeaderTag';
import { employmentService } from '../../../services/structure/employment.service';
import { reportingLineService } from '../../../services/structure/reportingLine.service';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';

const StaffDashboard = () => {
  const navigate = useNavigate();

  // KPI Dashboard data
  const {
    loading: kpiLoading,
    refreshDashboard: refreshKpi,
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

  // Structure Data
  const [employment, setEmployment] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [reportingChain, setReportingChain] = useState([]);
  const [structureLoading, setStructureLoading] = useState(true);

  const fetchStructureData = useCallback(async () => {
    setStructureLoading(true);
    try {
      const [empRes, teamRes, chainRes] = await Promise.all([
        employmentService.getMyEmployment().catch(e => {
          console.warn('[StaffDashboard] My employment fetch error:', e);
          return null;
        }),
        reportingLineService.getMyTeam().catch(e => {
          console.warn('[StaffDashboard] My team fetch error:', e);
          return [];
        }),
        reportingLineService.getMyChain().catch(e => {
          console.warn('[StaffDashboard] My chain fetch error:', e);
          return [];
        }),
      ]);

      if (empRes) {
        const rawEmp = empRes?.data || empRes;
        setEmployment(rawEmp?.current_employment || rawEmp);
      }

      const teamList = Array.isArray(teamRes) ? teamRes : (teamRes?.data || teamRes?.results || []);
      setTeamMembers(teamList);

      const chainList = Array.isArray(chainRes) ? chainRes : (chainRes?.data || chainRes?.chain || []);
      setReportingChain(chainList);
    } catch (err) {
      console.error('Failed to load structure overview data:', err);
    } finally {
      setStructureLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStructureData();
  }, [fetchStructureData]);

  const refreshAll = useCallback(() => {
    refreshKpi();
    fetchStructureData();
  }, [refreshKpi, fetchStructureData]);

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

  // Find supervisor and direct peers
  const { supervisor, directPeers } = useMemo(() => {
    let sup = null;
    const peers = [];
    const currentUid = String(user?.id || employment?.user_id || '');
    const directManagerId = reportingChain?.[0]?.user_id ? String(reportingChain[0].user_id) : null;

    teamMembers.forEach(m => {
      const memberUid = String(m.user_id || m.id || '');
      const isSelf = memberUid === currentUid;
      if (isSelf) return;

      if (directManagerId && memberUid === directManagerId) {
        sup = m;
      } else if (!directManagerId && m.is_manager && !sup) {
        sup = m;
      } else {
        peers.push(m);
      }
    });

    if (!sup && reportingChain && reportingChain.length > 0) {
      sup = reportingChain[0];
    }

    return { supervisor: sup, directPeers: peers };
  }, [teamMembers, user, employment, reportingChain]);

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 space-y-6 text-slate-800 font-sans">
      {/* Header Banner */}
      <HeaderTag
        greetingPrefix="Welcome back"
        roleBadge="Staff Member"
        badgeColor="emerald"
        subtitleExtra={
          <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold border ${healthLabel.bg} ${healthLabel.color}`}>
            Score: {Math.round(overallScore)}% ({healthLabel.text})
          </span>
        }
        onRefresh={refreshAll}
        loading={kpiLoading || structureLoading}
      />

      {/* 👤 Role & Organization Structure Snapshot Hero Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wider">
                {employment?.position_title || 'Staff Position'}
              </span>
              {employment?.position_code && (
                <span className="text-xs text-slate-400 font-mono bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                  {employment.position_code}
                </span>
              )}
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {employment?.fte_allocation ? `● Active Full-Time (${parseFloat(employment.fte_allocation).toFixed(1)} FTE)` : '● Active Full-Time (1.0 FTE)'}
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                {user?.first_name ? `${user.first_name} ${user.last_name}` : (employment?.user_name || 'Staff Member')}
              </h2>
              <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <BuildingOffice2Icon className="w-4 h-4 text-indigo-400 shrink-0" />
                  <strong>{employment?.department_name || 'Department'}</strong>
                </span>
                {employment?.division_name && (
                  <span className="text-slate-400">
                    • {employment.division_name}
                  </span>
                )}
                {employment?.unit_name && (
                  <span className="text-slate-400">
                    • {employment.unit_name}
                  </span>
                )}
              </p>
            </div>

            {/* Supervisor & Team Quick Pill */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60">
                <FiShield className="text-emerald-400 shrink-0" size={14} />
                <span>
                  Reports to: <strong className="text-white">{supervisor ? supervisor.user_name : (reportingChain && reportingChain.length > 0 ? (reportingChain[0]?.user_name || reportingChain[0]?.name) : 'Executive Leadership')}</strong>
                  {(supervisor?.position_title || reportingChain?.[0]?.position_title || reportingChain?.[0]?.position) && (
                    <span className="text-slate-400 ml-1">
                      ({supervisor?.position_title || reportingChain?.[0]?.position_title || reportingChain?.[0]?.position})
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60">
                <FiUsers className="text-blue-400 shrink-0" size={14} />
                <span>
                  Team: <strong className="text-white">{teamMembers.length > 0 ? `${teamMembers.length} Members` : '1 Member'}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Structure Navigation Buttons */}
          <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
            <button
              onClick={() => navigate(STRUCTURE_ROUTES.MY_TEAM)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition flex items-center justify-center gap-2 shadow-sm"
            >
              <FiUsers size={14} /> My Team & Peers
            </button>
            <button
              onClick={() => navigate(STRUCTURE_ROUTES.MY_CHAIN)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center justify-center gap-2"
            >
              <FiGitBranch size={14} /> Reporting Chain
            </button>
            <button
              onClick={() => navigate(STRUCTURE_ROUTES.ORG_CHART_TREE)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center justify-center gap-2"
            >
              <FiLayers size={14} /> Company Org Tree
            </button>
          </div>
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

        {/* Direct Team Members */}
        <div 
          onClick={() => navigate(STRUCTURE_ROUTES.MY_TEAM)}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 cursor-pointer hover:border-blue-300 transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
            <UserGroupIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Direct Team Peers</p>
            <p className="text-lg font-bold text-slate-900">{teamMembers.length} <span className="text-xs text-slate-400 font-normal">Members</span></p>
            <p className="text-[10px] text-indigo-600 font-semibold flex items-center gap-0.5">
              View Squad ➔
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

          {/* 👥 Immediate Team Squad Mini-Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">My Team Squad</h2>
                <p className="text-[11px] text-slate-400">Direct supervisor & colleagues</p>
              </div>
              <button
                onClick={() => navigate(STRUCTURE_ROUTES.MY_TEAM)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View All ({teamMembers.length}) <ChevronRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Supervisor */}
              {supervisor && (
                <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {supervisor.user_name?.charAt(0) || 'M'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-xs truncate">{supervisor.user_name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{supervisor.position_title || 'Supervisor'}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded shrink-0">
                    Manager
                  </span>
                </div>
              )}

              {/* Direct Peers */}
              {directPeers.slice(0, 3).map((peer, idx) => (
                <div key={peer.id || peer.user_id || idx} className="p-2.5 rounded-xl bg-slate-50/60 border border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-semibold text-xs shrink-0">
                      {peer.user_name?.charAt(0) || 'P'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 text-xs truncate">{peer.user_name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{peer.position_title || 'Team Member'}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium shrink-0">
                    Peer
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 🌿 Upward Leadership Chain-of-Command Mini Path */}
          {reportingChain && reportingChain.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Leadership Chain</h2>
                  <p className="text-[11px] text-slate-400">{reportingChain.length} levels to CEO</p>
                </div>
                <button
                  onClick={() => navigate(STRUCTURE_ROUTES.MY_CHAIN)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  Inspect <ChevronRightIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Mini Horizontal Flow */}
              <div className="space-y-1.5 text-xs">
                {reportingChain.map((node, index) => (
                  <div key={index} className="flex items-center gap-2 text-[11px]">
                    <span className="w-4 h-4 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[9px] shrink-0 border border-indigo-200">
                      {index + 1}
                    </span>
                    <span className="font-semibold text-slate-800 truncate">{node.user_name || node.name || 'Executive'}</span>
                    <span className="text-slate-400 truncate">({node.position_title || node.position})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

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