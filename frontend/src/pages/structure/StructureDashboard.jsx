import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Users, Briefcase, TrendingUp, AlertTriangle, 
  CheckCircle, Activity, GitBranch, Calendar, Download,
  ChevronRight, Home, PieChart, BarChart3, MapPin, DollarSign
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
import { TeamCard } from '../../components/structure/team';
import { EmploymentCard } from '../../components/structure/employment';
import { 
  useStructureStats, 
  useHierarchyHealth, 
  useDepartments,
  useTeams,
  useEmployments,
} from '../../hooks/structure';
import { STRUCTURE_ROUTES } from '../../routes/structure.routes';

const StructureDashboard = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useStructureStats();
  const { data: health, isLoading: healthLoading } = useHierarchyHealth();
  const { data: departmentsPage } = useDepartments({ page: 1, pageSize: 5 });
  const departments = departmentsPage?.results ?? [];
  const { data: teamsPage } = useTeams({ page: 1, pageSize: 5 });
  const teams = teamsPage?.results ?? [];
  const { data: employmentsPage } = useEmployments({ filters: { is_current: 'true' }, page: 1, pageSize: 5 });
  const employments = employmentsPage?.results ?? [];
  const departmentBreakdownData = departments.map(dept => ({
    name: dept.name,
    value: dept.employee_count || 0,
  })) || [];
  const headcountTrendData = [
    { month: 'Jan', total: 120, new_hires: 5, departures: 2 },
    { month: 'Feb', total: 125, new_hires: 8, departures: 3 },
    { month: 'Mar', total: 130, new_hires: 10, departures: 5 },
    { month: 'Apr', total: 128, new_hires: 6, departures: 8 },
    { month: 'May', total: 132, new_hires: 12, departures: 8 },
    { month: 'Jun', total: 135, new_hires: 9, departures: 6 },
  ];
  const managerCount = employments?.filter(e => e.is_manager).length || 0;
  const nonManagerCount = (employments?.length || 0) - managerCount;
  const spanData = [
    { range: '0', count: 5 },
    { range: '1-5', count: 12 },
    { range: '6-10', count: 8 },
    { range: '11-15', count: 4 },
    { range: '16-20', count: 2 },
    { range: '20+', count: 1 },
  ];
  const levelData = [
    { level: 1, count: 1 },
    { level: 2, count: 3 },
    { level: 3, count: 5 },
    { level: 4, count: 8 },
    { level: 5, count: 12 },
    { level: 6, count: 15 },
    { level: 7, count: 20 },
    { level: 8, count: 18 },
    { level: 9, count: 12 },
    { level: 10, count: 8 },
  ];
  const typeData = employments?.reduce((acc, emp) => {
    const type = emp.employment_type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {}) || {};
  const typeDistributionData = Object.entries(typeData).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));
  const isLoading = statsLoading || healthLoading;
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }
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
            onClick={() => navigate(STRUCTURE_ROUTES.ORG_CHART)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1"
          >
            <GitBranch size={14} /> View Org Chart
          </button>
          <button
            onClick={() => navigate(STRUCTURE_ROUTES.HIERARCHY_VERSIONS)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1"
          >
            <History size={14} /> Version History
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-1">
          <HierarchyHealthGauge score={healthScore} height={200} />
          <div className="mt-3 text-center">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
              healthStatus === 'healthy' ? 'bg-green-100 text-green-700' :
              healthStatus === 'warning' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {healthStatus === 'healthy' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
              {healthStatus === 'healthy' ? 'Healthy' : healthStatus === 'warning' ? 'Needs Attention' : 'Critical'}
            </span>
          </div>
        </div>
        <div className="lg:col-span-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Building2 size={16} />
                <span className="text-sm">Departments</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats?.counts?.departments || 0}</div>
              <div className="text-xs text-gray-400 mt-1">Active: {stats?.counts?.departments_active || 0}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Users size={16} />
                <span className="text-sm">Teams</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats?.counts?.teams || 0}</div>
              <div className="text-xs text-gray-400 mt-1">With Leads: {stats?.teams_with_leads || 0}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Briefcase size={16} />
                <span className="text-sm">Employees</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats?.counts?.current_employments || 0}</div>
              <div className="text-xs text-gray-400 mt-1">Managers: {stats?.managers_count || 0}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <MapPin size={16} />
                <span className="text-sm">Locations</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats?.counts?.locations || 0}</div>
              <div className="text-xs text-gray-400 mt-1">Countries: {stats?.countries_count || 0}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <DepartmentBreakdown data={departmentBreakdownData} title="Department Distribution" />
        <HeadcountTrend data={headcountTrendData} title="Headcount Trend (Last 6 Months)" />
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
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
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
              <Users size={16} className="text-green-500" />
              Recent Teams
            </h3>
            <button
              onClick={() => navigate(STRUCTURE_ROUTES.TEAMS)}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All <ChevronRight size={12} />
            </button>
          </div>
          <div className="p-3 space-y-2">
            {teams?.slice(0, 3).map(team => (
              <TeamCard
                key={team.id}
                team={team}
                onClick={() => navigate(STRUCTURE_ROUTES.TEAM_DETAIL(team.id))}
                compact
              />
            ))}
            {(!teams || teams.length === 0) && (
              <p className="text-gray-500 text-sm text-center py-4">No teams found</p>
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
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
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
                  onClick={() => navigate(STRUCTURE_ROUTES.HIERARCHY_VERSIONS)}
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
export default StructureDashboard;