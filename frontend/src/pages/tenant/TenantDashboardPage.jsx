// frontend/src/pages/tenant/TenantDashboardPage.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    TenantOverviewDashboard,
    TenantStatsCards,
    TenantListWidget,
    TenantResourceSummary,
    TenantActivityChart,
    TenantHealthWidget,
    TenantAlertsWidget,
} from '../../components/tenant/dashboard';
import {
    fetchDashboardStats,
    fetchTenantActivity,
    fetchSystemHealth,
    fetchRecentTenants,
    fetchDashboardAlerts,
    selectDashboardStats,
    selectActivityData,
    selectHealthData,
    selectRecentTenants,
    selectDashboardAlerts,
    selectTenantLoading,
} from '../../store/tenant';

export const TenantDashboardPage = () => {
    const dispatch = useDispatch();

    const stats = useSelector(selectDashboardStats);
    const activityData = useSelector(selectActivityData);
    const healthData = useSelector(selectHealthData);
    const recentTenants = useSelector(selectRecentTenants);
    const alerts = useSelector(selectDashboardAlerts);
    const loading = useSelector(selectTenantLoading);

    useEffect(() => {
        dispatch(fetchDashboardStats());
        dispatch(fetchTenantActivity());
        dispatch(fetchSystemHealth());
        dispatch(fetchRecentTenants());
        dispatch(fetchDashboardAlerts());
    }, [dispatch]);

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">Tenant Management Overview</p>
            </div>

            <TenantStatsCards stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2">
                    <TenantActivityChart data={activityData} />
                </div>
                <div className="lg:col-span-1">
                    <TenantHealthWidget healthData={healthData} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <TenantListWidget
                    tenants={recentTenants}
                    onViewAll={() => { }}
                    onSelectTenant={(id) => console.log('Select tenant', id)}
                    loading={loading}
                />
                <TenantResourceSummary resources={stats} loading={loading} />
            </div>

            <div className="mt-6">
                <TenantAlertsWidget alerts={alerts} loading={loading} />
            </div>
        </div>
    );
};