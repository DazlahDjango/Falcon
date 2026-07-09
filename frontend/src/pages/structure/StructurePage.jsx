import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Users, Briefcase, AlertTriangle,
  CheckCircle, GitBranch, ChevronRight, MapPin, DollarSign,
  History, Layers
} from 'lucide-react';
import {
  DepartmentBreakdown,
  HeadcountTrend,
  ManagerRatioChart,
  SpanOfControlChart,
  LevelDistribution,
  TypeDistribution,
  HierarchyHealthGauge
} from '../../components/structure/charts';
import { DepartmentCard } from '../../components/structure/department';
import { UnitCard } from '../../components/structure/unit';
import { EmploymentCard } from '../../components/structure/employment';
import {
  useStructureDashboard,
  useDepartments,
  useUnits,
  useEmployments,
} from '../../hooks/structure';
import { STRUCTURE_ROUTES } from '../../config/constants/structureRouteConstants';

export const StructurePage = () => {
  const navigate = useNavigate();

  const { overview, health, trends, isLoading: dashboardLoading, error: dashboardError } = useStructureDashboard({
    autoFetch: true,
    months: 6,
  });

  const { items: departments, isLoading: deptsLoading } = useDepartments({
    autoFetch: true,
    params: { page: 1, page_size: 5 }
  });

  const { items: units, isLoading: unitsLoading } = useUnits({
    autoFetch: true,
    params: { page: 1, page_size: 5 }
  });

  const { items: employments, isLoading: employmentsLoading } = useEmployments({
    autoFetch: true,
    params: { filters: { is_current: 'true' }, page: 1, page_size: 5 }
  });

  const isLoading = dashboardLoading || deptsLoading || unitsLoading || employmentsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>Error loading dashboard: {dashboardError}</p>
      </div>
    );
  }

  const orgUnits = overview?.organizational_units || {};
  const employmentsStats = overview?.employments || {};
  const positions = overview?.positions || {};
  const locations = overview?.locations || {};
  const costCenters = overview?.cost_centers || {};

  const departmentBreakdownData = departments.map(dept => ({
    name: dept.name,
    value: dept.employee_count || 0,
  })) || [];

  const headcountTrendData = (trends?.trends || []).map(t => ({
    month: t.date ? new Date(t.date).toLocaleString('default', { month: 'short' }) : `v${t.version_number}`,
    total: t.units_count || 0,
  })).reverse();

  const managerCount = employmentsStats.managers || 0;
  const nonManagerCount = (employmentsStats.total_current || 0) - managerCount;

  const spanData = [
    { range: '0', count: health?.details?.span_of_control_distribution?.['0'] || 5 },
    { range: '1-5', count: health?.details?.span_of_control_distribution?.['1-5'] || 12 },
    { range: '6-10', count: health?.details?.span_of_control_distribution?.['6-10'] || 8 },
    { range: '11-15', count: health?.details?.span_of_control_distribution?.['11-15'] || 4 },
    { range: '16-20', count: health?.details?.span_of_control_distribution?.['16-20'] || 2 },
    { range: '20+', count: health?.details?.span_of_control_distribution?.['20+'] || 1 },
  ];

  const levelData = Object.entries(orgUnits.level_distribution || {}).map(([level, count]) => ({
    level: level.charAt(0).toUpperCase() + level.slice(1),
    count
  }));

  const typeDistributionData = Object.entries(employmentsStats.type_distribution || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const healthScore = health?.health_score || 0;
  const healthStatus = health?.status || 'unknown';

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Structure Dashboard</h1>
          <p className="text-gray-500 mt-1">Organizational health and performance metrics</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button
            onClick={() => navigate(STRUCTURE_ROUTES.ORG_CHARTS)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1"
          >
            <GitBranch size={14} /> View Org Chart
          </button>
          <button
            onClick={() => navigate(STRUCTURE_ROUTES.HIERARCHY)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1"
          >
            <History size={14} /> Version History
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-1 bg-white rounded-lg border border-gray-200 p-4 flex flex-col items-center justify-center">
          <HierarchyHealthGauge score={healthScore} height={200} />
          <div className="mt-3 text-center">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${healthStatus === 'healthy' ? 'bg-green-100 text-green-700' : healthStatus === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
              {healthStatus === 'healthy' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
              {healthStatus === 'healthy' ? 'Healthy' : healthStatus === 'warning' ? 'Needs Attention' : 'Critical'}
            </span>
          </div>
        </div>
        <div className="lg:col-span-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-full">
            <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Briefcase size={16} />
                  <span className="text-sm font-medium">Divisions</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{orgUnits.level_distribution?.division || 0}</div>
              </div>
              <div className="text-xs text-gray-400 mt-1">Base structures</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Building2 size={16} />
                  <span className="text-sm font-medium">Departments</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{orgUnits.level_distribution?.department || 0}</div>
              </div>
              <div className="text-xs text-gray-400 mt-1">Functional areas</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <GitBranch size={16} />
                  <span className="text-sm font-medium">Sections</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{orgUnits.level_distribution?.section || 0}</div>
              </div>
              <div className="text-xs text-gray-400 mt-1">Department branches</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Layers size={16} />
                  <span className="text-sm font-medium">Units</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{orgUnits.level_distribution?.unit || 0}</div>
              </div>
              <div className="text-xs text-gray-400 mt-1">Operational teams</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Users size={16} />
                  <span className="text-sm font-medium">Employees</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{employmentsStats.total_current || 0}</div>
              </div>
              <div className="text-xs text-gray-400 mt-1">Managers: {employmentsStats.managers || 0}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <MapPin size={16} />
                  <span className="text-sm font-medium">Locations</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{locations.total_active || 0}</div>
              </div>
              <div className="text-xs text-gray-400 mt-1">Countries: {locations.countries || 0}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <DepartmentBreakdown data={departmentBreakdownData} title="Department Distribution" />
        <HeadcountTrend data={headcountTrendData} title="Organizational Units Trend" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ManagerRatioChart managers={managerCount} nonManagers={nonManagerCount} />
        <SpanOfControlChart data={spanData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <LevelDistribution data={levelData} />
        <TypeDistribution data={typeDistributionData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Building2 size={16} className="text-blue-500" />
              Recent Departments
            </h3>
            <button
              onClick={() => navigate(STRUCTURE_ROUTES.DEPARTMENTS)}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold"
            >
              View All <ChevronRight size={12} />
            </button>
          </div>
          <div className="p-3 space-y-2">
            {departments?.slice(0, 3).map(dept => (
              <DepartmentCard
                key={dept.id}
                department={dept}
                onClick={() => navigate(STRUCTURE_ROUTES.DEPARTMENT_DETAIL(dept.id))}
                compact
              />
            ))}
            {(!departments || departments.length === 0) && (
              <p className="text-gray-500 text-sm text-center py-4">No departments found</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Layers size={16} className="text-green-500" />
              Recent Units
            </h3>
            <button
              onClick={() => navigate(STRUCTURE_ROUTES.UNITS)}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold"
            >
              View All <ChevronRight size={12} />
            </button>
          </div>
          <div className="p-3 space-y-2">
            {units?.slice(0, 3).map(unit => (
              <UnitCard
                key={unit.id}
                unit={unit}
                onClick={() => navigate(STRUCTURE_ROUTES.UNIT_DETAIL(unit.id))}
                compact
              />
            ))}
            {(!units || units.length === 0) && (
              <p className="text-gray-500 text-sm text-center py-4">No units found</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Briefcase size={16} className="text-purple-500" />
              Recent Employments
            </h3>
            <button
              onClick={() => navigate(STRUCTURE_ROUTES.EMPLOYMENTS)}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold"
            >
              View All <ChevronRight size={12} />
            </button>
          </div>
          <div className="p-3 space-y-2">
            {employments?.slice(0, 3).map(emp => (
              <EmploymentCard
                key={emp.id}
                employment={emp}
                onSelect={() => navigate(STRUCTURE_ROUTES.EMPLOYMENT_DETAIL(emp.id))}
                compact
              />
            ))}
            {(!employments || employments.length === 0) && (
              <p className="text-gray-500 text-sm text-center py-4">No employments found</p>
            )}
          </div>
        </div>
      </div>

      {health?.issues && health.issues.length > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">Health Issues Detected</h4>
              <ul className="mt-2 space-y-1">
                {health.issues.slice(0, 5).map((issue, idx) => (
                  <li key={idx} className="text-sm text-yellow-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                    {issue}
                  </li>
                ))}
              </ul>
              {health.issues.length > 5 && (
                <button
                  onClick={() => navigate(STRUCTURE_ROUTES.HIERARCHY)}
                  className="mt-2 text-sm text-yellow-700 hover:text-yellow-800 font-medium"
                >
                  +{health.issues.length - 5} more issues
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StructurePage;
