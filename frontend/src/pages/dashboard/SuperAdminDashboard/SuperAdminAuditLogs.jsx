import React from 'react';
import { DashboardLayout } from '../../../components/dashboard/Layout';
import AuditLogs from '../../../components/accounts/audit/AuditLogs';

const SuperAdminAuditLogs = () => {
    return (
        <DashboardLayout role="super_admin">
            <div className="dashboard-content">
                <AuditLogs />
            </div>
        </DashboardLayout>
    );
};

export default SuperAdminAuditLogs;
