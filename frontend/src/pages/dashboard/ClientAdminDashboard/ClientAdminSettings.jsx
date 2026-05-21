import React from 'react';
import { DashboardLayout } from '../../../components/dashboard/Layout';
import Settings from '../../../components/accounts/settings/Settings';

const ClientAdminSettings = () => {
    return (
        <DashboardLayout role="client_admin">
            <div className="dashboard-content">
                <Settings />
            </div>
        </DashboardLayout>
    );
};

export default ClientAdminSettings;
