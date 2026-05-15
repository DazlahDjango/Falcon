import React from 'react';
import PropTypes from 'prop-types';
import { useSubscription, useBillingAnalytics } from '../../../hooks/billing';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';

export const UsageStats = () => {
    const { subscription, loading: subLoading } = useSubscription();
    const { summary: analytics, loading: analyticsLoading } = useBillingAnalytics();

    const loading = subLoading || analyticsLoading;

    if (loading) {
        return <LoadingSkeleton type="metric" count={3} />;
    }

    if (!subscription) {
        return (
            <div className="usage-stats-empty">
                <p>No active subscription</p>
            </div>
        );
    }

    const plan = subscription.plan;
    const maxUsers = plan?.max_users === -1 ? 'Unlimited' : plan?.max_users;
    const maxKpis = plan?.max_kpis === -1 ? 'Unlimited' : plan?.max_kpis;
    
    // These would come from actual usage data
    const currentUsers = analytics?.current_users || 0;
    const currentKpis = analytics?.current_kpis || 0;

    const getUserPercentage = () => {
        if (plan?.max_users === -1) return 0;
        return (currentUsers / plan?.max_users) * 100;
    };

    const getKpiPercentage = () => {
        if (plan?.max_kpis === -1) return 0;
        return (currentKpis / plan?.max_kpis) * 100;
    };

    return (
        <div className="usage-stats">
            <h3 className="usage-stats-title">Usage Statistics</h3>
            
            <div className="usage-stats-grid">
                <div className="usage-stats-card">
                    <div className="usage-stats-header">
                        <span className="usage-stats-label">Users</span>
                        <span className="usage-stats-value">
                            {currentUsers} / {maxUsers}
                        </span>
                    </div>
                    <div className="usage-stats-progress">
                        <div 
                            className="usage-stats-progress-bar"
                            style={{ width: `${getUserPercentage()}%` }}
                        />
                    </div>
                    {plan?.max_users !== -1 && getUserPercentage() > 80 && (
                        <span className="usage-stats-warning">
                            Approaching user limit
                        </span>
                    )}
                </div>

                <div className="usage-stats-card">
                    <div className="usage-stats-header">
                        <span className="usage-stats-label">KPIs</span>
                        <span className="usage-stats-value">
                            {currentKpis} / {maxKpis}
                        </span>
                    </div>
                    <div className="usage-stats-progress">
                        <div 
                            className="usage-stats-progress-bar"
                            style={{ width: `${getKpiPercentage()}%` }}
                        />
                    </div>
                    {plan?.max_kpis !== -1 && getKpiPercentage() > 80 && (
                        <span className="usage-stats-warning">
                            Approaching KPI limit
                        </span>
                    )}
                </div>

                <div className="usage-stats-card">
                    <div className="usage-stats-header">
                        <span className="usage-stats-label">Storage</span>
                        <span className="usage-stats-value">
                            {analytics?.storage_used || 0} MB / {plan?.max_storage_mb === -1 ? 'Unlimited' : `${plan?.max_storage_mb} MB`}
                        </span>
                    </div>
                    <div className="usage-stats-progress">
                        <div 
                            className="usage-stats-progress-bar"
                            style={{ width: `${(analytics?.storage_percentage || 0)}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

UsageStats.propTypes = {
    subscription: PropTypes.object,
};

export default UsageStats;