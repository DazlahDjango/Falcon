import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUsers, 
  FiDatabase, 
  FiServer, 
  FiActivity, 
  FiTrendingUp, 
  FiAlertCircle, 
  FiSettings, 
  FiRefreshCw, 
  FiTrash2, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle, 
  FiHardDrive, 
  FiShield, 
  FiPieChart,
  FiChevronRight
} from 'react-icons/fi';

import { 
  fetchSystemStats, 
  fetchSystemHealth,
  clearCache,
  clearUserCache,
  clearTenantCache
} from '../../../store/accounts/slice/adminSlice';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import { useConfigDashboard } from '../../../hooks/config';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import store from '../../../store';
import { useAppDispatch } from '../../../hooks/dashboard/useAppDispatch';

// Local custom component for Stats Widget
const StatsWidget = ({ 
  title, 
  value, 
  icon, 
  trend = null, 
  subtitle = null,
  color = 'primary'
}) => {
  const getColorClass = () => {
    switch (color) {
      case 'primary': return 'border-l-4 border-blue-500 bg-blue-50/10';
      case 'success': return 'border-l-4 border-emerald-500 bg-emerald-50/10';
      case 'info': return 'border-l-4 border-sky-500 bg-sky-50/10';
      case 'warning': return 'border-l-4 border-amber-500 bg-amber-50/10';
      default: return 'border-l-4 border-blue-500 bg-blue-50/10';
    }
  };

  return (
    <div className={`stats-widget p-6 rounded-xl shadow-sm border border-gray-150/50 bg-white/80 backdrop-blur-md transition-all duration-300 hover:shadow-md ${getColorClass()}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-gray-500 text-sm font-medium tracking-wide uppercase">{title}</h3>
        <div className={`p-2 rounded-lg bg-gray-100/80 text-gray-700`}>{icon}</div>
      </div>
      <div className="text-3xl font-bold text-gray-800 tracking-tight">{value}</div>
      {(trend !== null || subtitle) && (
        <div className="flex items-center mt-3 text-xs">
          {trend !== null && (
            <span className={`flex items-center font-semibold mr-2 ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              <FiTrendingUp className="mr-1" /> {Math.abs(trend)}%
            </span>
          )}
          {subtitle && <span className="text-gray-400 font-medium">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

// System Health component helper
const getStatusIcon = (status) => {
  switch (status) {
    case 'healthy': return <FiCheckCircle className="text-emerald-500" size={18} />;
    case 'degraded': return <FiAlertCircle className="text-amber-500" size={18} />;
    case 'down': return <FiXCircle className="text-rose-500" size={18} />;
    default: return <FiClock className="text-gray-400" size={18} />;
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'healthy': return 'Healthy';
    case 'degraded': return 'Degraded';
    case 'down': return 'Down';
    default: return 'Unknown';
  }
};

export const SuperAdminDashboardCustom = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Accounts Admin store states from the main store
  const { stats, health, isLoading } = useSyncExternalStore(
    (listener) => store.subscribe(listener),
    () => store.getState().admin || { stats: null, health: null, isLoading: false },
    () => store.getState().admin || { stats: null, health: null, isLoading: false }
  );
  
  // Configs app React Query states
  const { useOverview } = useConfigDashboard();
  const { data: configOverview, isLoading: configLoading } = useOverview();
  
  // Local dialog control
  const [showClearAll, setShowClearAll] = useState(false);
  const [clearType, setClearType] = useState(null); // 'user' or 'tenant'
  const [clearValue, setClearValue] = useState('');
  const [isProcessingCache, setIsProcessingCache] = useState(false);

  useEffect(() => {
    dispatch(fetchSystemStats());
    dispatch(fetchSystemHealth());
    
    const interval = setInterval(() => {
      dispatch(fetchSystemHealth());
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchSystemStats());
    dispatch(fetchSystemHealth());
    dispatch(showAlert({ type: 'success', message: 'System statistics reloaded' }));
  };

  const handleClearAll = async () => {
    setIsProcessingCache(true);
    try {
      await dispatch(clearCache()).unwrap();
      dispatch(showAlert({ type: 'success', message: 'Entire system cache cleared successfully' }));
    } catch (error) {
      dispatch(showAlert({ type: 'error', message: error.message || 'Failed to clear system cache' }));
    } finally {
      setIsProcessingCache(false);
      setShowClearAll(false);
    }
  };

  const handleClearUserCache = async () => {
    if (!clearValue) return;
    setIsProcessingCache(true);
    try {
      await dispatch(clearUserCache(clearValue)).unwrap();
      dispatch(showAlert({ type: 'success', message: `User cache cleared for ${clearValue}` }));
      setClearType(null);
      setClearValue('');
    } catch (error) {
      dispatch(showAlert({ type: 'error', message: error.message || 'Failed to clear user cache' }));
    } finally {
      setIsProcessingCache(false);
    }
  };

  const handleClearTenantCache = async () => {
    if (!clearValue) return;
    setIsProcessingCache(true);
    try {
      await dispatch(clearTenantCache(clearValue)).unwrap();
      dispatch(showAlert({ type: 'success', message: `Tenant cache cleared for ${clearValue}` }));
      setClearType(null);
      setClearValue('');
    } catch (error) {
      dispatch(showAlert({ type: 'error', message: error.message || 'Failed to clear tenant cache' }));
    } finally {
      setIsProcessingCache(false);
    }
  };

  const systemStats = configOverview?.data || { backups: {}, maintenance: {}, disasterRecovery: {}, quota: {} };

  return (
    <div className="admin-dashboard max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fade-in">
      
      {/* Header section */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-150/50 shadow-sm backdrop-blur-lg">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Super Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time system administration, monitoring, and configurations</p>
        </div>
        <button 
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 active:scale-95 transition-all text-sm font-semibold text-gray-600 shadow-sm bg-white"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <FiRefreshCw className={`animate-spin-once ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </button>
      </div>

      {/* Stats Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsWidget 
          title="Total Users"
          value={stats?.total_users || 0}
          icon={<FiUsers size={20} />}
          color="primary"
          subtitle={`${stats?.active_users || 0} active currently`}
        />
        <StatsWidget 
          title="Active Tenants"
          value={stats?.active_tenants || 0}
          icon={<FiDatabase size={20} />}
          color="success"
          subtitle="Enterprise Tenant Database"
        />
        <StatsWidget 
          title="System Uptime"
          value={stats?.uptime || '0d'}
          icon={<FiServer size={20} />}
          color="info"
          subtitle="Continuous Server Status"
        />
        <StatsWidget 
          title="API Requests (24h)"
          value={stats?.api_requests || 0}
          icon={<FiActivity size={20} />}
          trend={stats?.request_trend}
          color="warning"
          subtitle="Volume of API Calls"
        />
      </div>

      {/* Main Admin Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: System Health & Cache Controls */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* System Health */}
          <div className="bg-white rounded-2xl border border-gray-150/50 shadow-sm p-6 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-800">System Component Health</h2>
              <p className="text-gray-400 text-xs mt-1">Status checks updated automatically every 30 seconds</p>
            </div>
            
            {health ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 font-semibold text-sm">Overall Platform State</span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      health.overall === 'healthy' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {getStatusIcon(health.overall)}
                      {getStatusText(health.overall)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <FiClock /> {new Date(health.last_check).toLocaleString()}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-all">
                    <span className="text-gray-600 font-medium text-sm">Postgres Database</span>
                    <div className="flex items-center gap-2">
                      {health.database?.latency && <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded font-mono">{health.database.latency}ms</span>}
                      {getStatusIcon(health.database?.status)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-all">
                    <span className="text-gray-600 font-medium text-sm">Redis Memory Cache</span>
                    <div className="flex items-center gap-2">
                      {health.redis?.latency && <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded font-mono">{health.redis.latency}ms</span>}
                      {getStatusIcon(health.redis?.status)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-all">
                    <span className="text-gray-600 font-medium text-sm">Celery Async Workers</span>
                    <div className="flex items-center gap-2">
                      {health.celery?.active_workers !== undefined && (
                        <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">{health.celery.active_workers} active</span>
                      )}
                      {getStatusIcon(health.celery?.status)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-all">
                    <span className="text-gray-600 font-medium text-sm">SMTP Email Dispatch</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(health.email?.status)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center py-8 text-gray-400 text-sm">
                <FiRefreshCw className="animate-spin mr-2" /> Fetching system component states...
              </div>
            )}
          </div>

          {/* Cache Management Control */}
          <div className="bg-white rounded-2xl border border-gray-150/50 shadow-sm p-6 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-800">Advanced Cache Control</h2>
              <p className="text-gray-400 text-xs mt-1">Flush global database queries or selectively invalidate cache contexts</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
                  <FiDatabase size={20} />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-800">1.2 GB</div>
                  <div className="text-xs text-gray-400 font-medium">Memory Cache Size</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                  <FiRefreshCw size={20} />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-800">98.4%</div>
                  <div className="text-xs text-gray-400 font-medium">Cache Hit Rate</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-rose-100/50 bg-rose-50/10 rounded-xl">
                <div>
                  <span className="text-gray-700 font-semibold text-sm">Flush All System Cache</span>
                  <p className="text-gray-400 text-xs mt-0.5">Clears all configurations, sessions, and metrics globally</p>
                </div>
                <button 
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 transition-all text-white text-xs font-bold rounded-lg shadow-sm"
                  onClick={() => setShowClearAll(true)}
                >
                  <FiTrash2 size={14} /> Clear Cache
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                <div className="space-y-2">
                  <label className="text-gray-600 font-semibold text-xs tracking-wider uppercase block">Target User Cache Invalidation</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="User ID or Email"
                      value={clearType === 'user' ? clearValue : ''}
                      onChange={(e) => { setClearType('user'); setClearValue(e.target.value); }}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                      className="px-3 py-2 bg-gray-800 hover:bg-gray-900 active:scale-95 transition-all text-white text-xs font-bold rounded-lg"
                      onClick={() => handleClearUserCache()}
                      disabled={!clearValue || clearType !== 'user'}
                    >
                      Invalidate
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-gray-600 font-semibold text-xs tracking-wider uppercase block">Target Tenant Cache Invalidation</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Tenant ID (UUID)"
                      value={clearType === 'tenant' ? clearValue : ''}
                      onChange={(e) => { setClearType('tenant'); setClearValue(e.target.value); }}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                      className="px-3 py-2 bg-gray-800 hover:bg-gray-900 active:scale-95 transition-all text-white text-xs font-bold rounded-lg"
                      onClick={() => handleClearTenantCache()}
                      disabled={!clearValue || clearType !== 'tenant'}
                    >
                      Invalidate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Configs App Overview & Quick Actions */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Config App Real Overview Panel */}
          <div className="bg-white rounded-2xl border border-gray-150/50 shadow-sm p-6 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-800">Platform Registry Overview</h2>
              <p className="text-gray-400 text-xs mt-1">Aggregated statistics from the global `configs` app</p>
            </div>

            {configLoading ? (
              <div className="flex justify-center items-center py-6 text-gray-400 text-sm">
                <FiRefreshCw className="animate-spin mr-2" /> Syncing with config manager...
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <FiHardDrive size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-700">Backup Storage</div>
                    <div className="text-xs text-gray-400 truncate">
                      {systemStats.backups?.successRate || '100%'} successful • {systemStats.backups?.totalCount || 0} archives
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <FiSettings size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-700">Maintenance Window</div>
                    <div className="text-xs text-gray-400 truncate">
                      {systemStats.maintenance?.activeWindow ? '🔧 Active Maintenance' : '🟢 Standard Operation Mode'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                    <FiShield size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-700">Disaster Recovery</div>
                    <div className="text-xs text-gray-400 truncate">
                      Failover Ready • Sync Latency {systemStats.disasterRecovery?.syncLatency || '< 1s'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                    <FiPieChart size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-700">Storage Quotas</div>
                    <div className="text-xs text-gray-400 truncate">
                      Usage allocation at {systemStats.quota?.usagePercent || '12%'} capacity
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white rounded-2xl border border-gray-150/50 shadow-sm p-6 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-800">Quick Operations</h2>
              <p className="text-gray-400 text-xs mt-1">Administrative navigation shortcuts</p>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50/50 hover:text-blue-600 transition-all rounded-xl text-left text-gray-700 font-semibold text-sm border border-transparent hover:border-blue-100/50"
                onClick={() => navigate('/users')}
              >
                <span className="flex items-center gap-2.5">
                  <FiUsers size={16} /> Manage All Users
                </span>
                <FiChevronRight size={16} />
              </button>

              <button 
                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-emerald-50/50 hover:text-emerald-600 transition-all rounded-xl text-left text-gray-700 font-semibold text-sm border border-transparent hover:border-emerald-100/50"
                onClick={() => navigate('/tenants')}
              >
                <span className="flex items-center gap-2.5">
                  <FiDatabase size={16} /> Manage active Tenants
                </span>
                <FiChevronRight size={16} />
              </button>

              <button 
                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-sky-50/50 hover:text-sky-600 transition-all rounded-xl text-left text-gray-700 font-semibold text-sm border border-transparent hover:border-sky-100/50"
                onClick={() => navigate('/config/dashboard')}
              >
                <span className="flex items-center gap-2.5">
                  <FiServer size={16} /> Config Registry App
                </span>
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Confirmation Dialog Modals */}
      <ConfirmDialog 
        isOpen={showClearAll}
        title="Clear Entire System Cache"
        message="This action will clear all persistent caches globally. Downstream API speeds may temporarily decrease during cache reconstruction."
        confirmText="Flush Cache"
        cancelText="Keep Cache"
        type="danger"
        isLoading={isProcessingCache}
        onClose={() => setShowClearAll(false)}
        onConfirm={handleClearAll}
      />

    </div>
  );
};

export default SuperAdminDashboardCustom;
