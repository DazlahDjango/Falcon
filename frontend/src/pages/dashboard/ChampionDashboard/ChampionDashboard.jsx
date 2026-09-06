// frontend/src/pages/dashboard/ChampionDashboard/ChampionDashboard.jsx

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  DocumentCheckIcon,
  UserGroupIcon,
  SparklesIcon,
  ArrowPathIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  BuildingOffice2Icon,
  FolderIcon,
  FunnelIcon,
  PlusIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

import { useAuthContext } from '../../../contexts/accounts/AuthContext';
import { useChampionDashboard } from '../../../hooks/dashboard/useChampionDashboard';
import OrganizationKPITable from '../../../components/kpi/dashboard/OrganizationKPITable';

import DashboardConfigPanel from './DashboardConfigPanel';
import KPIAssignmentPanel from './KPIAssignmentPanel';
import TargetSettingsPanel from './TargetSettingsPanel';
import TemplateLibrary from './TemplateLibrary';
import BulkAssignPanel from './BulkAssignPanel';

import {
  fetchEditableDashboard,
  fetchAvailableKPIs,
  fetchAssignedKPIs,
  fetchTemplates,
  setActiveDashboard
} from '../../../store/dashboard';
import { fetchUsers } from '../../../store/accounts/slice/userSlice';

const ChampionDashboard = () => {
  const dispatch = useDispatch();
  const { user: authUser, currentTenant } = useAuthContext();
  const [activeTab, setActiveTab] = useState('overview');

  const {
    dashboardData,
    availableKPIs,
    assignedKPIs,
    templates,
    targetUserId,
    period,
    loading,
    refreshDashboard,
    loadAvailableKPIs,
    loadAssignedKPIs,
    loadTemplates,
    updateConfig,
    addKPI,
    removeKPI,
    updateWeights,
    updateTargets,
    createTemplate,
    applyTemplate,
    setTargetUser,
    setPeriod
  } = useChampionDashboard({ autoFetch: true });

  const users = useSelector((state) => state.users?.users || []);

  useEffect(() => {
    dispatch(setActiveDashboard('champion'));
    dispatch(fetchEditableDashboard({ targetUserId, period }));
    if (targetUserId) {
      dispatch(fetchAvailableKPIs(targetUserId));
      dispatch(fetchAssignedKPIs(targetUserId));
    }
    dispatch(fetchTemplates());
    dispatch(fetchUsers());
  }, [dispatch, targetUserId, period]);

  const championUser = {
    name: authUser ? `${authUser.first_name || ''} ${authUser.last_name || ''}`.trim() || authUser.email : 'Dashboard Champion',
    title: authUser?.title || 'KPI Champion & Administrator',
    role: authUser?.role ? authUser.role.replace('_', ' ').toUpperCase() : 'DASHBOARD CHAMPION',
    tenant_name: currentTenant?.name || authUser?.tenant_name || 'Organization'
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'kpi_assignment', label: 'KPI Assignment', icon: AdjustmentsHorizontalIcon, count: assignedKPIs?.length || 0 },
    { id: 'targets', label: 'Target Settings', icon: DocumentCheckIcon },
    { id: 'templates', label: 'Templates', icon: FolderIcon, count: templates?.length || 0 },
    { id: 'bulk_assign', label: 'Bulk Assign', icon: UserGroupIcon }
  ];

  const targetUserObj = users.find(u => u.id === targetUserId);

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 space-y-6 text-slate-800 font-sans">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Champion Control Center
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              KPI Governance
            </span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Configure performance indicators, assign metrics to employees, manage templates, and monitor organizational KPIs
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Target User Selector */}
          <div className="relative">
            <select
              value={targetUserId || ''}
              onChange={(e) => setTargetUser(e.target.value || null)}
              className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
              disabled={loading}
            >
              <option value="">Select Target User (Optional)</option>
              {users?.map(u => (
                <option key={u.id} value={u.id}>
                  {u.first_name || u.name || u.email} ({u.role || 'Staff'})
                </option>
              ))}
            </select>
          </div>

          {/* Period Selector */}
          <div className="relative">
            <select
              value={period || 'current'}
              onChange={(e) => setPeriod(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
              disabled={loading}
            >
              <option value="current">Current Period</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {/* Refresh Action */}
          <button
            type="button"
            onClick={refreshDashboard}
            className="p-2 text-slate-500 hover:text-purple-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            title="Refresh Champion Dashboard"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Top 6 Stat Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Available KPIs */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <ChartBarIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Available KPIs</p>
            <p className="text-lg font-bold text-slate-900">{availableKPIs?.length || 0}</p>
            <p className="text-[10px] text-purple-600 font-semibold">System Library</p>
          </div>
        </div>

        {/* Assigned KPIs */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <AdjustmentsHorizontalIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Assigned KPIs</p>
            <p className="text-lg font-bold text-slate-900">{assignedKPIs?.length || 0}</p>
            <p className="text-[10px] text-blue-600 font-semibold">Active Assignments</p>
          </div>
        </div>

        {/* Templates Available */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <FolderIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">KPI Templates</p>
            <p className="text-lg font-bold text-slate-900">{templates?.length || 0}</p>
            <p className="text-[10px] text-emerald-600 font-semibold">Ready to Apply</p>
          </div>
        </div>

        {/* Target Users */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <UserGroupIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Target Users</p>
            <p className="text-lg font-bold text-slate-900">{users?.length || 0}</p>
            <p className="text-[10px] text-indigo-600 font-semibold">Tenant Staff</p>
          </div>
        </div>

        {/* Organization Health */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <BuildingOffice2Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Compliance Rate</p>
            <p className="text-lg font-bold text-slate-900">94%</p>
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
              <ArrowUpIcon className="w-3 h-3" /> +2.1%
            </p>
          </div>
        </div>

        {/* Edit Mode Badge Card */}
        <div className="bg-white p-4 rounded-xl border border-purple-200 bg-purple-50/30 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <SparklesIcon className="w-6 h-6 text-purple-700" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-purple-700">Governance Mode</p>
            <p className="text-sm font-bold text-slate-900">Champion Active</p>
            <p className="text-[10px] text-purple-600 font-semibold">Full Configuration</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation Controls */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-1">
        {tabs.map((t) => {
          const IconComp = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                isActive
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-purple-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <DashboardConfigPanel
              data={dashboardData}
              loading={loading}
              onRefresh={refreshDashboard}
              onSave={updateConfig}
              targetUser={targetUserObj}
            />

            {/* Organization KPIs Section */}
            <OrganizationKPITable limit={5} />
          </div>
        )}

        {activeTab === 'kpi_assignment' && (
          <KPIAssignmentPanel
            assignedKPIs={assignedKPIs}
            availableKPIs={availableKPIs}
            loading={loading}
            onRefresh={() => {
              loadAvailableKPIs();
              loadAssignedKPIs();
            }}
            onAssign={addKPI}
            onUnassign={removeKPI}
            onUpdateWeight={updateWeights}
            targetUser={targetUserObj}
          />
        )}

        {activeTab === 'targets' && (
          <TargetSettingsPanel
            assignedKPIs={assignedKPIs}
            loading={loading}
            onRefresh={refreshDashboard}
            onUpdateTarget={updateTargets}
            targetUser={targetUserObj}
          />
        )}

        {activeTab === 'templates' && (
          <TemplateLibrary
            templates={templates}
            loading={loading}
            onRefresh={loadTemplates}
            onCreateTemplate={createTemplate}
            onApplyTemplate={applyTemplate}
          />
        )}

        {activeTab === 'bulk_assign' && (
          <BulkAssignPanel
            users={users}
            availableKPIs={availableKPIs}
            loading={loading}
            onRefresh={() => {
              loadAvailableKPIs();
              loadAssignedKPIs();
            }}
            onBulkAssign={(data) => {
              console.log('Bulk assign:', data);
            }}
            targetUser={targetUserObj}
          />
        )}
      </div>
    </div>
  );
};

export default ChampionDashboard;