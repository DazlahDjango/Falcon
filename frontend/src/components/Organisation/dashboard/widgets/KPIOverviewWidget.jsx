import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useKpiData } from '@/hooks/organisation';
import { useAuthContext } from '@/contexts/accounts/AuthContext';

const KPIOverviewWidget = () => {
  const { isAuthenticated } = useAuthContext();
  const { kpis, overview, loading, getKpiOverview } = useKpiData();

  useEffect(() => {
    if (isAuthenticated) {
      getKpiOverview();
    }
  }, [isAuthenticated, getKpiOverview]);

  const stats = {
    total: overview?.total || 0,
    onTrack: overview?.on_track || 0,
    atRisk: overview?.at_risk || 0,
    offTrack: overview?.off_track || 0,
  };

  const dashboardKpis = Array.isArray(kpis?.results) 
    ? kpis.results 
    : (Array.isArray(kpis) ? kpis : []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'on_track': return 'bg-green-500';
      case 'at_risk': return 'bg-yellow-500';
      case 'off_track': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading && dashboardKpis.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-200 rounded"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">KPI Performance</h3>
          <Link to="/organisation/kpis" className="text-sm text-indigo-600 hover:text-indigo-900">
            View All →
          </Link>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500">Total KPIs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.onTrack}</p>
            <p className="text-xs text-green-600">On Track</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.atRisk}</p>
            <p className="text-xs text-yellow-600">At Risk</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{stats.offTrack}</p>
            <p className="text-xs text-red-600">Off Track</p>
          </div>
        </div>

        <div className="space-y-3">
          {dashboardKpis.slice(0, 5).map((kpi) => (
            <div key={kpi.id} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{kpi.name}</p>
                <p className="text-xs text-gray-500">{kpi.department_name}</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className={`${getStatusColor(kpi.status)} h-2 rounded-full`}
                    style={{ width: `${kpi.progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{kpi.progress}%</span>
              </div>
            </div>
          ))}
        </div>

        {dashboardKpis.length === 0 && !loading && (
          <p className="text-center text-gray-500 py-4">No KPIs to display</p>
        )}
      </div>
    </div>
  );
};

export default KPIOverviewWidget;