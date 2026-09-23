// frontend/src/pages/dashboard/ChampionDashboard/ChampionDashboard.jsx

import React, { useMemo } from 'react';
import useChampionDashboard from '../../../hooks/kpi/useChampionDashboard';
import OrganizationKPITable from '../../../components/kpi/dashboard/OrganizationKPITable';
import {
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  BuildingOffice2Icon,
  ArrowPathIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  AdjustmentsHorizontalIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

import HeaderTag from '../../../components/dashboard/HeaderTag';

const ChampionDashboard = () => {
  const {
    loading,
    refreshDashboard,
    user,
    tenant,
    organizationSubmissionRate,
    unvalidatedEntries,
    pendingEscalations,
    departmentCompliance,
    redKpiAlerts,
    escalations,
    entityTypeLabel,
  } = useChampionDashboard({ autoFetch: true });

  // Overall compliance label
  const complianceLabel = useMemo(() => {
    if (organizationSubmissionRate >= 90) return { text: 'High Compliance', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' };
    if (organizationSubmissionRate >= 70) return { text: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' };
    return { text: 'Low Submissions', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' };
  }, [organizationSubmissionRate]);

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 space-y-6 text-slate-800 font-sans">
      {/* Header Banner */}
      <HeaderTag 
        roleBadge="KPI Champion" 
        badgeColor="purple" 
        onRefresh={refreshDashboard} 
        loading={loading} 
      />

      {/* Top 5 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Organization Submission Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Submission Rate</p>
            <p className="text-lg font-bold text-slate-900">{Math.round(organizationSubmissionRate)}%</p>
            <p className={`text-[10px] font-semibold ${complianceLabel.color}`}>{complianceLabel.text}</p>
          </div>
        </div>

        {/* Unvalidated Entries */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ClockIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Unvalidated Entries</p>
            <p className="text-lg font-bold text-slate-900">{unvalidatedEntries}</p>
            <p className="text-[10px] text-blue-600 font-semibold">Pending Validation</p>
          </div>
        </div>

        {/* Pending Escalations */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <ExclamationTriangleIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Escalations</p>
            <p className="text-lg font-bold text-slate-900">{pendingEscalations}</p>
            <p className="text-[10px] text-amber-600 font-semibold">{pendingEscalations > 0 ? 'Requires Action' : 'All Clear'}</p>
          </div>
        </div>

        {/* Cascaded Units Monitored */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <BuildingOffice2Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400 truncate">{entityTypeLabel}</p>
            <p className="text-lg font-bold text-slate-900">{departmentCompliance.length}</p>
            <p className="text-[10px] text-teal-600 font-semibold">Tracked Units</p>
          </div>
        </div>

        {/* Red KPI Alerts */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <ShieldCheckIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Critical Red KPIs</p>
            <p className="text-lg font-bold text-slate-900">{redKpiAlerts.length}</p>
            <p className="text-[10px] text-rose-500 font-semibold">{redKpiAlerts.length > 0 ? 'Breaches Found' : 'Within Bounds'}</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid (8 cols / 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Entity Submission Compliance & Red KPIs (8 cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Cascaded Entity Compliance Table */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  {entityTypeLabel} Submission Compliance
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                    {departmentCompliance.length} Units
                  </span>
                </h2>
                <p className="text-xs text-slate-500">Monthly actuals submission rates across organizational tiers</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              {departmentCompliance.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs text-slate-400 font-medium">
                      <th className="py-2.5 px-3">Unit / Department</th>
                      <th className="py-2.5 px-3">Submitted / Total</th>
                      <th className="py-2.5 px-3">Compliance Rate</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {departmentCompliance.map((dept, idx) => {
                      const rate = Number(dept.compliance_rate) || 0;
                      const isGreen = rate >= 90;
                      const isRed = rate < 70;
                      const statusText = isGreen ? 'High' : isRed ? 'Low' : 'Moderate';

                      return (
                        <tr key={idx} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-3 font-semibold text-slate-800">
                            {dept.department}
                          </td>
                          <td className="py-3 px-3 text-slate-600 font-medium">
                            {dept.submitted} / {dept.total_members} Staff
                          </td>
                          <td className="py-3 px-3 w-40">
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isGreen ? 'bg-emerald-500' : isRed ? 'bg-rose-500' : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
                                />
                              </div>
                              <span className="font-bold text-slate-700 text-[11px]">{Math.round(rate)}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isGreen ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : isRed ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              ● {statusText}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No entity submission compliance records found
                </div>
              )}
            </div>
          </div>

          {/* Critical Red KPI Alerts */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Critical Red KPI Flags</h2>
                <p className="text-xs text-slate-500">Persistent underperformance requiring governance intervention</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                {redKpiAlerts.length} Flagged
              </span>
            </div>

            <div className="space-y-2.5">
              {redKpiAlerts.length > 0 ? (
                redKpiAlerts.map((alert, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-rose-100 bg-rose-50/50 flex items-center justify-between text-xs">
                    <div className="flex items-start gap-3 min-w-0">
                      <ExclamationCircleIcon className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-xs truncate">{alert.kpi}</p>
                        <p className="text-[11px] text-slate-500 truncate">
                          Assigned: <span className="font-medium text-slate-700">{alert.user}</span> • {alert.consecutive_months} consecutive months in Red
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-rose-600 bg-white px-2.5 py-1 rounded-lg border border-rose-200 text-xs shrink-0 ml-2">
                      Score: {Math.round(alert.score)}%
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 flex items-center gap-3 text-xs">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold text-emerald-900 text-[11px]">All KPI Targets In Order</p>
                    <p className="text-[10px] text-emerald-700 mt-0.5">No chronic red KPI breaches detected across the organization.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Submission Rate Donut, Quick Actions, Escalations (4 cols) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Submission Rate Donut */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <h2 className="text-sm font-bold text-slate-900">Organization Submission Rate</h2>

            <div className="flex flex-col items-center justify-center my-4 relative">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-purple-600 transition-all duration-1000 ease-out"
                  strokeDasharray={`${Math.min(100, Math.max(0, organizationSubmissionRate))}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold text-slate-900">{Math.round(organizationSubmissionRate)}%</span>
                <span className="text-[9px] text-slate-400 font-semibold">Submitted</span>
              </div>
            </div>

            <div className="space-y-1.5 text-[11px] border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Unvalidated Submissions</span>
                <span className="font-bold text-blue-600">{unvalidatedEntries}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Active Escalations</span>
                <span className="font-bold text-amber-600">{pendingEscalations}</span>
              </div>
            </div>
          </div>

          {/* Quick Governance Actions */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900">Governance Actions</h3>
            <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-semibold">
              <button 
                onClick={() => refreshDashboard()}
                className="p-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl transition flex flex-col items-center gap-1 border border-purple-100"
              >
                <AdjustmentsHorizontalIcon className="w-4 h-4 text-purple-600" />
                <span>Audit Actuals</span>
              </button>
              <button 
                onClick={() => refreshDashboard()}
                className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition flex flex-col items-center gap-1 border border-blue-100"
              >
                <UserGroupIcon className="w-4 h-4 text-blue-600" />
                <span>Notify Leads</span>
              </button>
            </div>
          </div>

          {/* Escalations Stream */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900">Escalations</h3>
              <span className="text-[10px] text-slate-400">{escalations.length} Total</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {escalations.length > 0 ? (
                escalations.map((esc, idx) => (
                  <div key={esc.id || idx} className="p-2.5 rounded-xl border border-amber-100 bg-amber-50/50 flex items-start gap-2 text-xs">
                    <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 text-[11px] truncate">{esc.title || esc.kpi_name || 'Validation Escalation'}</p>
                      <p className="text-[10px] text-slate-400">Status: {esc.status || 'Pending'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-center text-xs text-slate-400">
                  No active escalations recorded
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

export default ChampionDashboard;