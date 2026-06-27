import React from 'react';
import { DashboardLayout } from '../../../components/dashboard/Layout';
import { AuditLogList } from '../../../components/accounts/audit/AuditLogList';

const SuperAdminAuditLogs = () => {
    return (
        <DashboardLayout role="super_admin">
            <div className="dashboard-content">
                <AuditLogList />
            </div>
        </DashboardLayout>
    );
};

export default SuperAdminAuditLogs;
