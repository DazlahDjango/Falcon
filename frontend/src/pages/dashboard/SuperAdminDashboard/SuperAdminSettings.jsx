import React from 'react';
import { DashboardLayout } from '../../../components/dashboard/Layout';
import { SettingsPage } from '../../accounts/SettingsPage';

const SuperAdminSettings = () => {
    return (
        <DashboardLayout role="super_admin">
            <div className="dashboard-content">
                <SettingsPage />
            </div>
        </DashboardLayout>
    );
};

export default SuperAdminSettings;
