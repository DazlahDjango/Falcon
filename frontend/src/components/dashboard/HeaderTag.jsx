// frontend/src/components/dashboard/HeaderTag.jsx

import React, { useMemo } from 'react';
import { useAuthContext } from '../../contexts/accounts/AuthContext';
import { useEmployments } from '../../hooks/structure/useEmployments';
import {
  BuildingOffice2Icon,
  UserIcon,
  ShieldCheckIcon,
  SparklesIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  ChevronRightIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

/**
 * HeaderTag Component
 * 
 * Centralized dashboard header banner combining Accounts app identity and
 * Structure app organizational hierarchy (Division > Department > Section > Unit).
 * Handles Super Admin graceful bypass (no tenant structure required).
 */
const HeaderTag = ({
  greetingPrefix = 'Welcome',
  roleBadge,
  badgeColor = 'purple',
  actions,
  subtitleExtra,
  customTitle,
  showStructure = true,
  onRefresh,
  loading = false
}) => {
  const { user: authUser, currentTenant, isSuperAdmin } = useAuthContext();
  
  const userRole = authUser?.role ? authUser.role.toLowerCase() : '';
  const isSuperAdminRole = isSuperAdmin || userRole === 'super_admin' || userRole === 'superadmin';

  // Structure app data fetching (Skipped for Super Admin)
  const { items: employments } = useEmployments({
    autoFetch: !isSuperAdminRole,
    params: { page: 1, pageSize: 50 }
  });

  // User identity details
  const userName = authUser?.first_name 
    ? `${authUser.first_name} ${authUser.last_name || ''}`.trim() 
    : (authUser?.full_name || authUser?.username || authUser?.email?.split('@')[0] || 'User');
  
  const userInitial = userName ? userName[0].toUpperCase() : 'U';
  const tenantName = currentTenant?.name || authUser?.tenant_name || 'Organization';

  // Find active employment structure for non super admin users
  const userEmployment = useMemo(() => {
    if (isSuperAdminRole || !employments || employments.length === 0) return null;

    // Match by user id or first active current employment
    const active = employments.find(e => 
      (e.user_id === authUser?.id || e.user_email === authUser?.email) && 
      e.is_current !== false && e.is_active !== false
    ) || employments.find(e => e.is_current !== false) || employments[0];

    return active || null;
  }, [employments, authUser, isSuperAdminRole]);

  // Extract structural hierarchy details
  const divisionName = userEmployment?.division_name || userEmployment?.position?.division?.name || null;
  const departmentName = userEmployment?.department_name || userEmployment?.position?.department?.name || authUser?.department_name || authUser?.department || null;
  const sectionName = userEmployment?.section_name || userEmployment?.position?.section?.name || null;
  const unitName = userEmployment?.unit_name || userEmployment?.position?.unit?.name || null;
  const positionTitle = userEmployment?.position_title || userEmployment?.position?.title || authUser?.job_title || authUser?.position_title || authUser?.title || 'Team Member';

  // Identify Leadership Role (Director, Manager, Section Lead, Unit Lead)
  const leadershipTag = useMemo(() => {
    if (isSuperAdminRole) return null;

    const titleLower = positionTitle.toLowerCase();
    const isExec = userEmployment?.is_executive || userRole === 'executive';
    const isMgr = userEmployment?.is_manager || userRole === 'manager' || userRole === 'supervisor';

    if (isExec || titleLower.includes('director') || titleLower.includes('vp') || titleLower.includes('chief')) {
      return { label: `Division Director ${divisionName ? `• ${divisionName}` : ''}`, icon: '👑', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    }
    if (isMgr || titleLower.includes('manager') || titleLower.includes('head')) {
      return { label: `Department Manager ${departmentName ? `• ${departmentName}` : ''}`, icon: '👔', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
    if (titleLower.includes('section lead') || (sectionName && titleLower.includes('lead'))) {
      return { label: `Section Lead ${sectionName ? `• ${sectionName}` : ''}`, icon: '⭐', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    if (titleLower.includes('unit lead') || titleLower.includes('team lead') || (unitName && titleLower.includes('lead'))) {
      return { label: `Unit Lead ${unitName ? `• ${unitName}` : ''}`, icon: '🎯', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
    return null;
  }, [isSuperAdminRole, positionTitle, userEmployment, userRole, divisionName, departmentName, sectionName, unitName]);

  // Color theme mapping for role badges & avatar
  const themeStyles = useMemo(() => {
    switch (badgeColor) {
      case 'purple':
        return { avatar: 'bg-purple-600', badge: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'blue':
        return { avatar: 'bg-blue-600', badge: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'emerald':
        return { avatar: 'bg-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'amber':
        return { avatar: 'bg-amber-600', badge: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'indigo':
        return { avatar: 'bg-indigo-600', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      default:
        return { avatar: 'bg-slate-700', badge: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  }, [badgeColor]);

  // Render Super Admin Header View
  if (isSuperAdminRole) {
    return (
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white font-bold flex items-center justify-center text-lg shrink-0 shadow-sm">
            <ShieldCheckIcon className="w-6 h-6 text-purple-100" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2 flex-wrap">
              {customTitle || `${greetingPrefix}, ${userName}`} <span className="inline-block animate-bounce">👋</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                {roleBadge || 'Platform Super Admin'}
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-700">Falcon Multi-Tenant System Oversight</span>
              <span>•</span>
              <span className="text-purple-600 font-medium">Global Administrative Control</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {actions}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-slate-500 hover:text-purple-600 bg-slate-100 hover:bg-purple-50 rounded-lg border border-slate-200 transition flex items-center gap-1.5 text-xs font-semibold"
              title="Refresh Platform Data"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin text-purple-600' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Render Tenant User Header View with Organizational Structure
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full ${themeStyles.avatar} text-white font-bold flex items-center justify-center text-lg shrink-0 shadow-sm`}>
            {userInitial}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900">
                {customTitle || `${greetingPrefix}, ${userName}!`} <span className="inline-block animate-bounce">👋</span>
              </h1>
              {roleBadge && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${themeStyles.badge}`}>
                  {roleBadge}
                </span>
              )}
              {leadershipTag && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${leadershipTag.color} flex items-center gap-1`}>
                  <span>{leadershipTag.icon}</span>
                  <span>{leadershipTag.label}</span>
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <BriefcaseIcon className="w-3.5 h-3.5 text-slate-400 inline" />
                {positionTitle}
              </span>
              <span>•</span>
              <span className="text-slate-700 font-semibold flex items-center gap-1">
                <BuildingOffice2Icon className="w-3.5 h-3.5 text-slate-400 inline" />
                {tenantName}
              </span>
              {subtitleExtra}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {actions}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-lg border border-slate-200 transition flex items-center gap-1.5 text-xs font-semibold"
              title="Refresh Data"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* Structural Hierarchy Breadcrumb Row */}
      {showStructure && (divisionName || departmentName || sectionName || unitName) && (
        <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500 overflow-x-auto">
          <span className="font-semibold text-slate-400 shrink-0 flex items-center gap-1">
            <AcademicCapIcon className="w-3.5 h-3.5 text-slate-400" /> Structure:
          </span>

          {divisionName && (
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium shrink-0 flex items-center gap-1">
              <span className="text-slate-400 font-bold">DIV:</span> {divisionName}
            </span>
          )}

          {divisionName && (departmentName || sectionName || unitName) && (
            <ChevronRightIcon className="w-3 h-3 text-slate-300 shrink-0" />
          )}

          {departmentName && (
            <span className="px-2 py-0.5 rounded bg-blue-50/70 text-blue-800 border border-blue-100 font-medium shrink-0 flex items-center gap-1">
              <span className="text-blue-400 font-bold">DEP:</span> {departmentName}
            </span>
          )}

          {departmentName && (sectionName || unitName) && (
            <ChevronRightIcon className="w-3 h-3 text-slate-300 shrink-0" />
          )}

          {sectionName && (
            <span className="px-2 py-0.5 rounded bg-purple-50/70 text-purple-800 border border-purple-100 font-medium shrink-0 flex items-center gap-1">
              <span className="text-purple-400 font-bold">SEC:</span> {sectionName}
            </span>
          )}

          {sectionName && unitName && (
            <ChevronRightIcon className="w-3 h-3 text-slate-300 shrink-0" />
          )}

          {unitName && (
            <span className="px-2 py-0.5 rounded bg-emerald-50/70 text-emerald-800 border border-emerald-100 font-medium shrink-0 flex items-center gap-1">
              <span className="text-emerald-500 font-bold">UNT:</span> {unitName}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default HeaderTag;
