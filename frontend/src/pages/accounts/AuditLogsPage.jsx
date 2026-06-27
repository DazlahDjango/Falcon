import React from 'react';
import { AuditLogList } from '../../components/accounts/audit';

export const AuditLogsPage = () => {
  return (
    <div className="accounts-page audit-logs-page">
      <AuditLogList />
    </div>
  );
};
export default AuditLogsPage;