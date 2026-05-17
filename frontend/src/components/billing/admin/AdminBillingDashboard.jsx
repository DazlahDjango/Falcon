import React, { useState, useEffect } from 'react';
import { useAdminBilling, useBillingAnalytics } from '../../../hooks/billing';
import { BillingMetricsCards } from '../analytics/BillingMetricsCards';
import { RevenueChart } from '../analytics/RevenueChart';
import { SubscriptionTrends } from '../analytics/SubscriptionTrends';
import { MRRCard } from '../analytics/MRRCard';
import { ChurnRate } from '../analytics/ChurnRate';
import { TenantsList } from './TenantsList';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { renderBillingIcon } from '../shared/BillingIcons';

export const AdminBillingDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const {
        systemMetrics,
        revenueReport,
        subscriptionReport,
        loading,
        getSystemMetrics,
        getRevenueReport,
        getSubscriptionReport,
    } = useAdminBilling();

    const { summary: analytics } = useBillingAnalytics();

    useEffect(() => {
        getSystemMetrics();
        getRevenueReport({ days: 30 });
        getSubscriptionReport();
    }, []);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: renderBillingIcon('overview') },
        { id: 'tenants', label: 'Tenants', icon: renderBillingIcon('tenants') },
        { id: 'reports', label: 'Reports', icon: renderBillingIcon('reports') },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="admin-overview">
                        <BillingMetricsCards metrics={systemMetrics} loading={loading} />
                        
                        <div className="admin-charts-grid">
                            <div className="admin-chart-card">
                                <h4>Revenue Trend</h4>
                                <RevenueChart data={revenueReport} loading={loading} />
                            </div>
                            <div className="admin-chart-card">
                                <h4>MRR Overview</h4>
                                <MRRCard 
                                    mrr={subscriptionReport?.total_mrr || 0} 
                                    previousMrr={subscriptionReport?.previous_mrr}
                                    loading={loading}
                                />
                            </div>
                        </div>

                        <div className="admin-charts-grid">
                            <div className="admin-chart-card">
                                <h4>Subscription Distribution</h4>
                                <SubscriptionTrends data={subscriptionReport} loading={loading} />
                            </div>
                            <div className="admin-chart-card">
                                <h4>Churn Analysis</h4>
                                <ChurnRate 
                                    churnRate={subscriptionReport?.churn_rate || 0}
                                    newCustomers={subscriptionReport?.new_subscriptions}
                                    lostCustomers={subscriptionReport?.lost_subscriptions}
                                    loading={loading}
                                />
                            </div>
                        </div>
                    </div>
                );
            case 'tenants':
                return <TenantsList />;
            case 'reports':
                return (
                    <div className="admin-reports">
                        <h4>Billing Reports</h4>
                        <p>Coming soon: Detailed billing reports</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="admin-billing-dashboard">
            <div className="admin-dashboard-header">
                <h2>Billing Administration</h2>
                <div className="admin-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div className="admin-dashboard-content">
                {renderContent()}
            </div>
        </div>
    );
};

export default AdminBillingDashboard;