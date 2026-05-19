import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useAdminBilling } from '../../../hooks/billing';
import { TenantSubscriptionManager } from './TenantSubscriptionManager';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';

export const TenantsList = () => {
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(false);
    const { getTenantBillingSummary } = useAdminBilling();

    // This would fetch tenants from your tenant management API
    // For now, showing placeholder structure

    const handleViewTenant = async (tenantId) => {
        setLoading(true);
        try {
            const summary = await getTenantBillingSummary(tenantId);
            setSelectedTenant({ id: tenantId, ...summary });
        } finally {
            setLoading(false);
        }
    };

    if (loading && !selectedTenant) {
        return <LoadingSkeleton type="list" count={5} />;
    }

    if (selectedTenant) {
        return (
            <TenantSubscriptionManager 
                tenant={selectedTenant}
                onBack={() => setSelectedTenant(null)}
            />
        );
    }

    return (
        <div className="tenants-list">
            <div className="tenants-list-header">
                <h3>Tenant Billing Management</h3>
                <p>View and manage billing for all tenants</p>
            </div>

            <div className="tenants-table-container">
                <table className="tenants-table">
                    <thead>
                        <tr>
                            <th>Tenant ID</th>
                            <th>Company</th>
                            <th>Plan</th>
                            <th>Status</th>
                            <th>Next Billing</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* This would be populated from API */}
                        <tr>
                            <td colSpan="6" className="tenants-table-empty">
                                <EmptyState 
                                    title="No tenants loaded"
                                    message="Connect to tenant management API to view tenants"
                                    icon="🏢"
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TenantsList;