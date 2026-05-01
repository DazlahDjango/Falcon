import React from 'react';
import { Building2, Users, Layers, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const DepartmentStats = ({ 
  department, 
  stats = {}, 
  isLoading = false, 
  showDetails = true,
  className = '' 
}) => {
  // Use provided stats or derive from department object
  const subDepartmentCount = stats.subDepartmentCount ?? department?.child_count ?? department?.children?.length ?? 0;
  const teamCount = stats.teamCount ?? department?.team_count ?? 0;
  const employeeCount = stats.employeeCount ?? department?.employee_count ?? 0;
  const headcountLimit = stats.headcountLimit ?? department?.headcount_limit;
  const sensitivityLevel = stats.sensitivityLevel ?? department?.sensitivity_level;
  // Calculate utilization percentage
  const utilization = headcountLimit ? Math.round((employeeCount / headcountLimit) * 100) : null;
  // Get utilization status color and label
  const getUtilizationStatus = () => {
    if (!utilization) return { color: 'text-gray-500', label: 'No limit', icon: null };
    if (utilization >= 90) return { color: 'text-red-600', bg: 'bg-red-100', label: 'Critical', icon: AlertCircle };
    if (utilization >= 75) return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'High', icon: AlertCircle };
    if (utilization >= 50) return { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Moderate', icon: null };
    return { color: 'text-green-600', bg: 'bg-green-100', label: 'Good', icon: CheckCircle };
  };
  const utilizationStatus = getUtilizationStatus();
  const StatusIcon = utilizationStatus.icon;
  // Get sensitivity badge color
  const getSensitivityBadge = () => {
    switch (sensitivityLevel) {
      case 'public': return 'bg-green-100 text-green-700';
      case 'internal': return 'bg-blue-100 text-blue-700';
      case 'confidential': return 'bg-yellow-100 text-yellow-700';
      case 'restricted': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  if (isLoading) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Sub-departments Stat */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Layers size={16} />
            <span className="text-sm font-medium">Sub-departments</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{subDepartmentCount}</div>
          <div className="text-xs text-gray-400 mt-1">
            {subDepartmentCount === 0 ? 'No sub-departments' : `${subDepartmentCount} total`}
          </div>
        </div>
        {/* Teams Stat */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Users size={16} />
            <span className="text-sm font-medium">Teams</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{teamCount}</div>
          <div className="text-xs text-gray-400 mt-1">
            {teamCount === 0 ? 'No teams' : `${teamCount} active teams`}
          </div>
        </div>
        {/* Employees Stat */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Building2 size={16} />
            <span className="text-sm font-medium">Employees</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{employeeCount}</div>
          <div className="text-xs text-gray-400 mt-1">
            {headcountLimit ? `Limit: ${headcountLimit}` : 'No limit set'}
          </div>
        </div>
        {/* Utilization Stat */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <TrendingUp size={16} />
            <span className="text-sm font-medium">Utilization</span>
          </div>
          {utilization !== null ? (
            <>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold ${utilizationStatus.color}`}>{utilization}%</span>
                {StatusIcon && <StatusIcon size={16} className={utilizationStatus.color} />}
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    utilization >= 90 ? 'bg-red-500' : utilization >= 75 ? 'bg-yellow-500' : utilization >= 50 ? 'bg-blue-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, utilization)}%` }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {utilizationStatus.label}
              </div>
            </>
          ) : (
            <div className="text-gray-400">No limit set</div>
          )}
        </div>
      </div>
      {/* Detailed Stats (Optional - shows when showDetails is true) */}
      {showDetails && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Department Details</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {/* Depth */}
            <div>
              <span className="text-gray-500">Hierarchy Depth:</span>
              <span className="ml-2 font-medium text-gray-900">{department?.depth ?? 0}</span>
            </div>
            {/* Path */}
            <div className="col-span-2">
              <span className="text-gray-500">Path:</span>
              <span className="ml-2 font-mono text-xs text-gray-600 truncate block">
                {department?.path || '/'}
              </span>
            </div>
            {/* Sensitivity */}
            {sensitivityLevel && (
              <div>
                <span className="text-gray-500">Sensitivity:</span>
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${getSensitivityBadge()}`}>
                  {sensitivityLevel.charAt(0).toUpperCase() + sensitivityLevel.slice(1)}
                </span>
              </div>
            )}
            {/* Status */}
            <div>
              <span className="text-gray-500">Status:</span>
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                department?.is_active 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {department?.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          {/* Headcount Warning */}
          {headcountLimit && utilization >= 90 && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-xs">
              <AlertCircle size={14} />
              <span>Department is at {utilization}% capacity. Only {headcountLimit - employeeCount} positions remaining.</span>
            </div>
          )}
          {headcountLimit && utilization >= 75 && utilization < 90 && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-yellow-600 text-xs">
              <AlertCircle size={14} />
              <span>Department is at {utilization}% capacity. Consider planning for growth.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default DepartmentStats;