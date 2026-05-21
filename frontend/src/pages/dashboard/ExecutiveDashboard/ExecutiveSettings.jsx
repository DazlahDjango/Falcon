import React from 'react';
import { DashboardLayout } from '../../../components/dashboard/Layout';
import Settings from '../../../components/accounts/settings/Settings';

const ExecutiveSettings = () => {
    return (
        <DashboardLayout role="executive">
            <div className="dashboard-content">
                <Settings />
            </div>
        </DashboardLayout>
    );
};

export default ExecutiveSettings;
