import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    TenantStatsCards,
    TenantListWidget,
    TenantActivityChart,
    TenantResourceSummary,
    TenantHealthWidget,
    TenantAlertsWidget
} from '../../components/tenant/dashboard/index.js';
import { fetchTenants } from '../../store/tenant/slice/index.js';  // ← Correct path

const TenantDashboardPage = () => {
    const dispatch = useDispatch();
    const { tenants, loading, error } = useSelector((state) => state.tenants);

    useEffect(() => {
        dispatch(fetchTenants());
    }, [dispatch]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Tenant Dashboard</h1>
                <p className="text-gray-600">Monitor and manage all tenants</p>
            </div>

            <TenantStatsCards tenants={tenants} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <TenantActivityChart tenants={tenants} />
                </div>
                <div>
                    <TenantHealthWidget tenants={tenants} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TenantResourceSummary tenants={tenants} />
                <TenantAlertsWidget tenants={tenants} />
            </div>

            <TenantListWidget tenants={tenants} />
        </div>
    );
};

export default TenantDashboardPage;