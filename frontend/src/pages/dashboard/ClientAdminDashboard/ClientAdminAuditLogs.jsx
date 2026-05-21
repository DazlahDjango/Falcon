import React from 'react';
import { DashboardLayout } from '../../../components/dashboard/Layout';
import AuditLogs from '../../../components/accounts/audit/AuditLogs';

const ClientAdminAuditLogs = () => {
    return (
        <DashboardLayout role="client_admin">
            <div className="dashboard-content">
                <AuditLogs />
            </div>
        </DashboardLayout>
    );
};

export default ClientAdminAuditLogs;
