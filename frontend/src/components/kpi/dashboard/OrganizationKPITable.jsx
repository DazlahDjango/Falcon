// frontend/src/components/kpi/dashboard/OrganizationKPITable.jsx

import React, { useState } from 'react';
import { 
  BuildingOffice2Icon, 
  ArrowPathIcon, 
  EyeIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import useKPIs from '../../../hooks/kpi/useKPIs';
import KPIDetail from '../kpi-management/detail/KPIDetail';

const OrganizationKPITable = ({ title = "Organization KPIs", limit = 5, showSearch = true }) => {
  const { kpis, loading, refresh } = useKPIs();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedKpiId, setSelectedKpiId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter ONLY organizational level KPIs (non-staff created)
  const orgKPIs = (kpis || []).filter(kpi => !kpi.is_staff_created && !kpi.is_staff);

  // Filter by search term and status
  const filteredKPIs = orgKPIs.filter(kpi => {
    const matchesSearch = searchTerm === '' || 
      (kpi.name && kpi.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (kpi.code && kpi.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (kpi.category_name && kpi.category_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (kpi.category && typeof kpi.category === 'string' && kpi.category.toLowerCase().includes(searchTerm.toLowerCase()));
      
    if (!matchesSearch) return false;
    
    if (selectedStatus === 'ACTIVE') return kpi.is_active !== false;
    if (selectedStatus === 'INACTIVE') return kpi.is_active === false;
    if (selectedStatus === 'PENDING') return kpi.approval_status === 'PENDING_APPROVAL';
    return true;
  });

  const totalPages = Math.ceil(filteredKPIs.length / limit) || 1;
  const paginatedKPIs = filteredKPIs.slice((currentPage - 1) * limit, currentPage * limit);

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 75) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const formatTarget = (kpi) => {
    if (kpi.target_value != null && kpi.target_value !== undefined) {
      return `${kpi.target_value} ${kpi.unit || ''}`.trim();
    }
    if (kpi.target_min != null && kpi.target_max != null) {
      return `${kpi.target_min} - ${kpi.target_max} ${kpi.unit || ''}`.trim();
    }
    if (kpi.target_min != null) {
      return `≥ ${kpi.target_min} ${kpi.unit || ''}`.trim();
    }
    return kpi.unit ? `Unit: ${kpi.unit}` : '-';
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <BuildingOffice2Icon className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              {title}
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                {orgKPIs.length} Total
              </span>
            </h2>
            <p className="text-xs text-slate-500">Corporate & Organizational Level Performance Indicators</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showSearch && (
            <div className="relative">
              <MagnifyingGlassIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search org KPIs..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500 w-36 sm:w-44"
              />
            </div>
          )}

          <select
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
            className="py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="PENDING">Pending</option>
          </select>

          <button
            type="button"
            onClick={() => refresh()}
            className="p-1.5 text-slate-500 hover:text-purple-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            title="Refresh Organization KPIs"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-2.5 px-3">KRA / Category</th>
              <th className="py-2.5 px-3">Organization KPI</th>
              <th className="py-2.5 px-3">Target Metric</th>
              <th className="py-2.5 px-3">Owner / Level</th>
              <th className="py-2.5 px-3">Current Score</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {loading && orgKPIs.length === 0 ? (
              [...Array(limit)].map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-3 px-3"><div className="h-3 bg-slate-100 rounded w-20"></div></td>
                  <td className="py-3 px-3"><div className="h-3 bg-slate-100 rounded w-36"></div></td>
                  <td className="py-3 px-3"><div className="h-3 bg-slate-100 rounded w-16"></div></td>
                  <td className="py-3 px-3"><div className="h-3 bg-slate-100 rounded w-24"></div></td>
                  <td className="py-3 px-3"><div className="h-3 bg-slate-100 rounded w-12"></div></td>
                  <td className="py-3 px-3"><div className="h-3 bg-slate-100 rounded w-14"></div></td>
                  <td className="py-3 px-3 text-right"><div className="h-3 bg-slate-100 rounded w-8 ml-auto"></div></td>
                </tr>
              ))
            ) : paginatedKPIs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                  <BuildingOffice2Icon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-600">No Organization KPIs Found</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {searchTerm ? "No indicators match your search query." : "Corporate KPIs created by Executives or Champions will appear here."}
                  </p>
                </td>
              </tr>
            ) : (
              paginatedKPIs.map((kpi) => {
                const categoryDisplay = kpi.category_name || (typeof kpi.category === 'object' ? kpi.category?.name : kpi.category) || 'General KRA';
                const ownerDisplay = kpi.owner_name || (kpi.owner_email ? kpi.owner_email.split('@')[0] : (typeof kpi.owner === 'object' ? (kpi.owner?.full_name || kpi.owner?.email?.split('@')[0]) : 'Executive / Org'));
                const score = kpi.current_score || 0;
                
                return (
                  <tr key={kpi.id} className="hover:bg-slate-50/80 transition group">
                    <td className="py-3 px-3 font-medium text-slate-600">
                      <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px]">
                        {categoryDisplay}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        {kpi.name}
                        {kpi.code && (
                          <span className="text-[10px] text-slate-400 font-mono">({kpi.code})</span>
                        )}
                      </div>
                      {kpi.description && (
                        <p className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">{kpi.description}</p>
                      )}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700">
                      {formatTarget(kpi)}
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium text-[11px]">
                      {ownerDisplay}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getScoreColor(score)}`}>
                          {score}%
                        </span>
                        <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="bg-purple-600 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(score, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {kpi.approval_status === 'PENDING_APPROVAL' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          ● Pending
                        </span>
                      ) : kpi.is_active !== false ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ● Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          ● Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedKpiId(kpi.id)}
                        className="p-1 hover:text-purple-600 hover:bg-purple-50 rounded transition"
                        title="View KPI Details"
                      >
                        <EyeIcon className="w-4 h-4 text-slate-400 group-hover:text-purple-600" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredKPIs.length > limit && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Showing {Math.min((currentPage - 1) * limit + 1, filteredKPIs.length)} to {Math.min(currentPage * limit, filteredKPIs.length)} of {filteredKPIs.length} org KPIs
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeftIcon className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-slate-700 font-semibold">{currentPage} / {totalPages}</span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedKpiId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            maxWidth: '1000px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.5rem',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <KPIDetail kpiId={selectedKpiId} onBack={() => setSelectedKpiId(null)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationKPITable;
