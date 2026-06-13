import React from 'react';
import { PortalSettings } from '../../components/billing/billing-portal/PortalSettings';
import { BillingShell } from '../../components/billing/common/BillingShell';
import { useSubscription } from '../../hooks/billing/useSubscription';
import { useBillingPermissions } from '../../hooks/billing/useBillingPermissions';
import { LoadingSkeleton } from '../../components/billing/shared/LoadingSkeleton';
import { EmptyState } from '../../components/billing/shared/EmptyState';

const BillingSettingsPage = () => {
    const { permissions } = useBillingPermissions();
    const { subscription, loading, fetchCurrent } = useSubscription({ autoFetch: true });

    if (!permissions.canViewBilling) {
        return <EmptyState type="default" title="Access Denied" message="You don't have permission to access billing settings." />;
    }

    if (loading) return <LoadingSkeleton type="card" count={1} />;

    return (
        <BillingShell title="Billing Settings" subtitle="Manage your billing preferences and notifications">
            <PortalSettings subscription={subscription} onUpdate={fetchCurrent} />
        </BillingShell>
    );
};

export default BillingSettingsPage;