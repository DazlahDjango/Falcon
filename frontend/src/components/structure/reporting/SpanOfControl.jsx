import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiRefreshCw,
  FiUser,
  FiUsers,
  FiAlertCircle,
  FiCheckCircle,
  FiBarChart2,
  FiLayers,
  FiShield,
  FiChevronRight,
  FiBriefcase,
  FiSearch,
} from 'react-icons/fi';
import { useStructurePermissions } from '../../../hooks/structure';
import useAppAuth from '../../../hooks/dashboard/useAppAuth';
import {
  StructureLoading,
  StructureStatusBadge,
  StructureEmptyState,
} from '../common';
import { employmentService } from '../../../services/structure/employment.service';
import { reportingLineService } from '../../../services/structure/reportingLine.service';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './reporting.css';

export const SpanOfControl = () => {
  const navigate = useNavigate();
  const { managerId: routeManagerId } = useParams();
  const { user } = useAppAuth();
  const { isSuperAdmin, isClientAdmin, isExecutive, role } = useStructurePermissions();

  // Full organization audit scope allowed only for SuperAdmin, ClientAdmin, Executive, and HR Admin
  const isOrgAdmin = useMemo(() => {
    return Boolean(
      isSuperAdmin || 
      isClientAdmin || 
      isExecutive || 
      role === 'hr_admin' || 
      user?.role === 'hr_admin' ||
      user?.is_superuser
    );
  }, [isSuperAdmin, isClientAdmin, isExecutive, role, user]);

  const [currentView, setCurrentView] = useState('loading'); // 'organization' | 'manager'
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [managerSpanData, setManagerSpanData] = useState(null);
  const [orgSpanData, setOrgSpanData] = useState(null);
  const [managerSearchQuery, setManagerSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sub-team navigation history for managers drilling down into sub-leads
  const [navHistory, setNavHistory] = useState([]);
  const currentManagerRef = useRef({ id: '', name: '' });

  // Keep ref in sync
  useEffect(() => {
    if (managerSpanData && selectedManagerId) {
      currentManagerRef.current = {
        id: selectedManagerId,
        name: managerSpanData.manager_name || 'Previous Manager',
      };
    }
  }, [managerSpanData, selectedManagerId]);

  // 1. Fetch Organization-wide Span
  const loadOrganizationSpan = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await reportingLineService.getOrganizationSpan();
      const data = res?.data || res;
      setOrgSpanData(data);
      setCurrentView('organization');
      setSelectedManagerId('');
      setNavHistory([]);
    } catch (err) {
      console.error('[SpanOfControl] Organization span error:', err);
      setError(err?.displayMessage || err?.message || 'Failed to fetch organization span report.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. Fetch Specific Manager's Span
  const loadManagerSpan = useCallback(async (targetId, pushHistory = false) => {
    if (!targetId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await reportingLineService.getSpanOfControl(targetId);
      const data = res?.data || res;
      
      if (pushHistory && currentManagerRef.current.id && currentManagerRef.current.id !== targetId) {
        setNavHistory(prev => [...prev, { id: currentManagerRef.current.id, name: currentManagerRef.current.name }]);
      }

      setManagerSpanData(data);
      setSelectedManagerId(targetId);
      setCurrentView('manager');
    } catch (err) {
      console.error('[SpanOfControl] Manager span error:', err);
      setError(err?.displayMessage || err?.message || 'Failed to fetch span of control for the selected manager.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize view on mount without circular dependency
  useEffect(() => {
    let isMounted = true;

    const initializeSpan = async () => {
      if (routeManagerId) {
        await loadManagerSpan(routeManagerId);
      } else if (isOrgAdmin) {
        await loadOrganizationSpan();
      } else if (user?.id) {
        await loadManagerSpan(user.id);
      } else {
        try {
          const res = await employmentService.getMyEmployment();
          const emp = res?.data?.current_employment || res?.data || res;
          if (isMounted && emp?.user_id) {
            await loadManagerSpan(emp.user_id);
          }
        } catch (err) {
          console.warn('[SpanOfControl] Employment fallback error:', err);
        }
      }
    };

    initializeSpan();

    return () => {
      isMounted = false;
    };
  }, [routeManagerId, isOrgAdmin, user?.id, loadManagerSpan, loadOrganizationSpan]);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    if (currentView === 'organization' && isOrgAdmin) {
      loadOrganizationSpan();
    } else if (selectedManagerId) {
      loadManagerSpan(selectedManagerId);
    } else if (user?.id) {
      loadManagerSpan(user.id);
    }
  }, [currentView, isOrgAdmin, selectedManagerId, user?.id, loadOrganizationSpan, loadManagerSpan]);

  // Handle drill down into a sub-team lead
  const handleDrillDown = useCallback((subLeadUserId) => {
    loadManagerSpan(subLeadUserId, true);
  }, [loadManagerSpan]);

  // Pop history to go back up one level in the hierarchy
  const handlePopHistory = useCallback(() => {
    if (navHistory.length > 0) {
      const prev = navHistory[navHistory.length - 1];
      setNavHistory(h => h.slice(0, h.length - 1));
      loadManagerSpan(prev.id, false);
    } else if (!isOrgAdmin && user?.id && selectedManagerId !== user.id) {
      loadManagerSpan(user.id, false);
    } else if (isOrgAdmin) {
      loadOrganizationSpan();
    } else {
      navigate(-1);
    }
  }, [navHistory, isOrgAdmin, user?.id, selectedManagerId, loadManagerSpan, loadOrganizationSpan, navigate]);

  const getHealthStatus = (directReports) => {
    if (directReports <= 7) {
      return { status: 'Healthy', badgeClass: 'bg-emerald-500/10 text-emerald-700 border-emerald-300', icon: FiCheckCircle, desc: 'Optimal supervisory capacity & direct coaching bandwidth' };
    }
    if (directReports <= 10) {
      return { status: 'Elevated (Warning)', badgeClass: 'bg-amber-500/10 text-amber-700 border-amber-300', icon: FiAlertCircle, desc: 'Approaching supervisory strain; consider sub-team delegation' };
    }
    return { status: 'Critical Overload', badgeClass: 'bg-rose-500/10 text-rose-700 border-rose-300', icon: FiAlertCircle, desc: 'High management bottleneck risk; recommended to appoint team leads' };
  };

  // Filtered actual managers list for the Admin dropdown selector
  const availableManagers = useMemo(() => {
    if (!orgSpanData?.managers) return [];
    if (!managerSearchQuery) return orgSpanData.managers;
    const q = managerSearchQuery.toLowerCase();
    return orgSpanData.managers.filter(m => 
      (m.manager_name && m.manager_name.toLowerCase().includes(q)) ||
      (m.manager_position && m.manager_position.toLowerCase().includes(q))
    );
  }, [orgSpanData, managerSearchQuery]);

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 space-y-6 text-slate-800 font-sans">
      
      {/* Top Navigation & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (navHistory.length > 0 || (currentView === 'manager' && isOrgAdmin)) {
                handlePopHistory();
              } else {
                navigate(STRUCTURE_ROUTES.MY_TEAM);
              }
            }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5 text-xs font-semibold"
          >
            <FiArrowLeft size={16} /> Back
          </button>
          
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FiBarChart2 className="text-blue-600" />
              {currentView === 'organization' ? 'Organization Span of Control Overview' : 'Team Span of Control'}
            </h1>
            <p className="text-xs text-slate-500">
              {currentView === 'organization' 
                ? 'Company-wide leadership hierarchy metrics and management capacity analysis.'
                : 'Direct and indirect reporting footprints and supervisory bandwidth.'}
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Admin / Executive Only: Manager Switcher Dropdown */}
          {isOrgAdmin && (
            <div className="relative min-w-[280px]">
              <select
                value={currentView === 'manager' ? selectedManagerId : ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'ORGANIZATION_VIEW' || !val) {
                    loadOrganizationSpan();
                  } else {
                    loadManagerSpan(val);
                  }
                }}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ORGANIZATION_VIEW">🏢 All Organization (Company-wide)</option>
                <optgroup label="Managers & Operational Leaders">
                  {(orgSpanData?.managers || []).map((mgr) => (
                    <option key={mgr.manager_user_id} value={mgr.manager_user_id}>
                      {mgr.manager_name} — {mgr.manager_position || 'Manager'} ({mgr.direct_reports} Directs)
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          )}

          {/* Admin / Executive Toggle to Org Overview */}
          {isOrgAdmin && currentView === 'manager' && (
            <button
              onClick={loadOrganizationSpan}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition flex items-center gap-1.5"
            >
              <FiLayers size={14} /> Organization View
            </button>
          )}

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Refresh"
          >
            <FiRefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <span>{typeof error === 'object' ? JSON.stringify(error) : String(error)}</span>
          <button onClick={() => setError(null)} className="font-bold underline ml-4">Dismiss</button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <StructureLoading text="Loading span of control metrics..." />
        </div>
      )}

      {/* VIEW 1: SPECIFIC MANAGER TEAM SPAN VIEW (Mark Vance or Selected Lead) */}
      {!isLoading && currentView === 'manager' && managerSpanData && (
        <div className="space-y-6">
          
          {/* Breadcrumb Trail for Sub-Lead Drilling */}
          {navHistory.length > 0 && (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
              <button 
                onClick={() => {
                  setNavHistory([]);
                  if (user?.id) loadManagerSpan(user.id);
                }}
                className="text-blue-600 hover:underline"
              >
                My Team Root ({user?.first_name || 'Manager'})
              </button>
              {navHistory.map((nh, idx) => (
                <React.Fragment key={idx}>
                  <FiChevronRight className="text-slate-400" />
                  <button 
                    onClick={() => {
                      setNavHistory(h => h.slice(0, idx));
                      loadManagerSpan(nh.id);
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    {nh.name}
                  </button>
                </React.Fragment>
              ))}
              <FiChevronRight className="text-slate-400" />
              <span className="text-slate-900 font-bold">{managerSpanData.manager_name}</span>
            </div>
          )}

          {/* Leader Hero Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wider">
                    {managerSpanData.manager_position || 'Engineering Manager'}
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    ★ Team Leader / Supervisor
                  </span>
                  {managerSpanData.is_healthy ? (
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <FiCheckCircle size={12} /> Optimal Span
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <FiAlertCircle size={12} /> Capacity Warning
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                    {managerSpanData.manager_name}
                  </h2>
                  <p className="text-xs text-slate-300">
                    {managerSpanData.manager_email || 'Verified Manager Account'}
                  </p>
                </div>
              </div>

              {/* Quick Metrics Badges in Hero */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-slate-800/80 px-4 py-3 rounded-xl border border-slate-700 min-w-[120px] text-center">
                  <p className="text-[11px] font-medium text-slate-400">Direct Reports</p>
                  <p className="text-2xl font-black text-blue-400">{managerSpanData.direct_reports || 0}</p>
                  <p className="text-[10px] text-slate-400">Immediate Team</p>
                </div>
                <div className="bg-slate-800/80 px-4 py-3 rounded-xl border border-slate-700 min-w-[120px] text-center">
                  <p className="text-[11px] font-medium text-slate-400">Indirect Reports</p>
                  <p className="text-2xl font-black text-sky-400">{managerSpanData.indirect_reports || 0}</p>
                  <p className="text-[10px] text-slate-400">Sub-team Members</p>
                </div>
                <div className="bg-slate-800/80 px-4 py-3 rounded-xl border border-slate-700 min-w-[120px] text-center">
                  <p className="text-[11px] font-medium text-slate-400">Total Footprint</p>
                  <p className="text-2xl font-black text-emerald-400">{managerSpanData.total_reports || 0}</p>
                  <p className="text-[10px] text-slate-400">Under Hierarchy</p>
                </div>
              </div>
            </div>
          </div>

          {/* Span Health Assessment Card */}
          {(() => {
            const health = getHealthStatus(managerSpanData.direct_reports || 0);
            const Icon = health.icon;
            return (
              <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${health.badgeClass}`}>
                <Icon size={20} className="shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-slate-900">
                    Span Health Assessment: {health.status} ({managerSpanData.direct_reports} Direct Reports)
                  </p>
                  <p className="text-slate-700 mt-0.5">{health.desc}</p>
                </div>
              </div>
            );
          })()}

          {/* Direct Reports Breakdown Table & Sub-Teams */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FiUsers className="text-blue-600" /> Direct Subordinates & Sub-Team Leads
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Employees directly supervised by {managerSpanData.manager_name}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {managerSpanData.direct_reports_list?.length || managerSpanData.direct_reports || 0} Directs
              </span>
            </div>

            {managerSpanData.direct_reports_list && managerSpanData.direct_reports_list.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {managerSpanData.direct_reports_list.map((rep) => {
                  const isSubLead = rep.is_manager || rep.direct_reports_count > 0;
                  return (
                    <div 
                      key={rep.user_id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSubLead ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {rep.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{rep.name}</h4>
                            {isSubLead && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                Team Lead
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {rep.position_title}
                            {rep.department_name && ` • ${rep.department_name}`}
                            {rep.position_code && <span className="ml-1 font-mono text-[10px] text-slate-400">({rep.position_code})</span>}
                          </p>
                        </div>
                      </div>

                      {/* Sub-lead Span Badges & Action */}
                      <div className="flex items-center gap-3 shrink-0">
                        {isSubLead ? (
                          <div className="flex items-center gap-2">
                            <div className="text-right text-xs">
                              <span className="font-bold text-indigo-700">{rep.direct_reports_count} Direct</span>
                              <span className="text-slate-400 ml-1">({rep.total_reports_count} Subordinates)</span>
                            </div>
                            <button
                              onClick={() => handleDrillDown(rep.user_id)}
                              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition flex items-center gap-1"
                            >
                              Inspect Sub-Team <FiChevronRight size={13} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium px-2 py-1 rounded bg-slate-50 border border-slate-100">
                            Individual Contributor
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No direct subordinate records found for this leader.
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: ORGANIZATION-WIDE AUDIT VIEW (Admins / Executives Scope Only) */}
      {!isLoading && currentView === 'organization' && orgSpanData && isOrgAdmin && (
        <div className="space-y-6">
          
          {/* Org Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-[11px] font-medium text-slate-400 uppercase">Average Direct Reports</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{orgSpanData.average_direct || 0}</p>
              <p className="text-[10px] text-blue-600 font-semibold mt-1">Per Operational Manager</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-[11px] font-medium text-slate-400 uppercase">Average Indirect Reports</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{orgSpanData.average_indirect || 0}</p>
              <p className="text-[10px] text-sky-600 font-semibold mt-1">Tier-2+ Subordinates</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-[11px] font-medium text-slate-400 uppercase">Average Total Span</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{orgSpanData.average_total || 0}</p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-1">Total Organizational Reach</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-[11px] font-medium text-slate-400 uppercase">Managers with Warning</p>
              <p className="text-2xl font-black text-amber-600 mt-1">{orgSpanData.managers_with_warning?.length || 0}</p>
              <p className="text-[10px] text-amber-600 font-semibold mt-1">Exceeding healthy thresholds</p>
            </div>
          </div>

          {/* Span Distribution Histogram Breakdown */}
          {orgSpanData.distribution && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Organization Span Distribution (Direct Reports Buckets)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {Object.entries(orgSpanData.distribution).map(([bucket, count]) => (
                  <div key={bucket} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <p className="text-xs font-bold text-slate-800">{bucket} Directs</p>
                    <p className="text-xl font-black text-blue-600 mt-1">{count}</p>
                    <p className="text-[10px] text-slate-400">Managers</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leaders Roster Grid with Search */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  All Operational Leaders & Managers ({availableManagers.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Click any manager card to inspect their team span and subordinate roster
                </p>
              </div>
              <div className="relative min-w-[240px]">
                <FiSearch className="absolute left-3 top-2.5 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Filter managers by name..."
                  value={managerSearchQuery}
                  onChange={(e) => setManagerSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableManagers.map((mgr) => {
                const health = getHealthStatus(mgr.direct_reports);
                return (
                  <div
                    key={mgr.manager_user_id}
                    onClick={() => loadManagerSpan(mgr.manager_user_id)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition cursor-pointer bg-white group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                            {mgr.manager_name}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">{mgr.manager_position || 'Manager'}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${health.badgeClass}`}>
                          {health.status}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <span>👥 Direct: <strong className="text-slate-900">{mgr.direct_reports}</strong></span>
                      <span>🌐 Subordinates: <strong className="text-slate-900">{mgr.total_reports}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* Fallback Empty State */}
      {!isLoading && !managerSpanData && !orgSpanData && (
        <StructureEmptyState
          title="No Span Data Available"
          description="Could not load span of control information for your account. Please contact your administrator."
          icon={FiUsers}
        />
      )}

    </div>
  );
};

export default SpanOfControl;
