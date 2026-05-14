import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    FiUsers, FiActivity, FiAlertCircle, FiTrendingUp, 
    FiShield, FiRefreshCw, FiGrid, FiLayers 
} from 'react-icons/fi';
import { 
    fetchTenants,
    selectTenants, 
    selectTenantLoading, 
    selectTenantError 
} from '../../store/tenant/slice/tenantSlice.js';
import {
    fetchTenantStats,
    fetchActivityData,
    fetchHealthData,
    fetchDashboardAlerts,
    selectDashboardStats,
    selectActivityData,
    selectHealthData,
    selectDashboardAlerts,
    selectDashboardLoading
} from '../../store/tenant/slice/tenantDashboardSlice.js';
import {
    TenantStatsCards,
    TenantListWidget,
    TenantActivityChart,
    TenantResourceSummary,
    TenantHealthWidget,
    TenantAlertsWidget
} from '../../components/tenant/dashboard/index.js';

export const TenantDashboardPage = () => {
    const dispatch = useDispatch();
    
    // Selectors from appTenant slice
    const tenants = useSelector(selectTenants);
    const tenantsLoading = useSelector(selectTenantLoading);
    const tenantsError = useSelector(selectTenantError);

    // Selectors from tenantDashboard slice
    const stats = useSelector(selectDashboardStats);
    const activityData = useSelector(selectActivityData);
    const healthData = useSelector(selectHealthData);
    const alerts = useSelector(selectDashboardAlerts);
    const dashboardLoading = useSelector(selectDashboardLoading);

    useEffect(() => {
        dispatch(fetchTenants());
        dispatch(fetchTenantStats());
        dispatch(fetchActivityData());
        dispatch(fetchHealthData());
        dispatch(fetchDashboardAlerts());
    }, [dispatch]);

    const handleRefresh = () => {
        dispatch(fetchTenants());
        dispatch(fetchTenantStats());
        dispatch(fetchActivityData());
        dispatch(fetchHealthData());
        dispatch(fetchDashboardAlerts());
    };

    const isLoading = tenantsLoading || (dashboardLoading && !stats);
    const error = tenantsError;

    if (isLoading && !tenants?.length) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="kpi-spinner" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center max-w-md mx-auto">
                <div className="p-4 bg-red-50 rounded-3xl mb-4 inline-block">
                    <FiAlertCircle className="h-12 w-12 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Dashboard Error</h3>
                <p className="text-slate-500 mt-2">{error}</p>
                <button 
                    onClick={handleRefresh}
                    className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
                >
                    Retry Sync
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                        <FiGrid className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tenant Control Center</h1>
                        <p className="text-slate-500 mt-1 flex items-center gap-2">
                            <FiLayers className="text-blue-500" />
                            Comprehensive management of all platform instances
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRefresh}
                        className="px-5 py-2.5 bg-white text-slate-700 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all font-bold text-sm flex items-center gap-2"
                    >
                        <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-200">
                        <FiUsers className="h-4 w-4" />
                        New Tenant
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <TenantStatsCards tenants={tenants} stats={stats} />

            {/* Charts and Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <FiTrendingUp className="text-blue-500" />
                            <h3 className="text-xl font-bold text-slate-900">Activity Overview</h3>
                        </div>
                    </div>
                    <TenantActivityChart data={activityData} />
                </div>
                
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden h-full">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <FiShield className="text-green-400" />
                                <h3 className="text-xl font-bold">Health Status</h3>
                            </div>
                            <TenantHealthWidget healthData={healthData} />
                        </div>
                        <FiActivity className="absolute -right-8 -bottom-8 h-48 w-48 text-white/5" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Resource Allocation</h3>
                    <TenantResourceSummary resources={stats?.resources} loading={dashboardLoading} />
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">System Alerts</h3>
                    <TenantAlertsWidget alerts={alerts} loading={dashboardLoading} />
                </div>
            </div>

            {/* Tenant List Section */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/60 overflow-hidden">
                <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Active Registrations</h3>
                </div>
                <TenantListWidget tenants={tenants} />
            </div>
        </div>
    );
};

export default TenantDashboardPage;