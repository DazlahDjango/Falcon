import React from 'react';
import { AuditLogList } from '../../components/config/audit/AuditLogList';
import { ConfigBreadcrumb } from '../../components/config/common/ConfigBreadcrumb';
import { FiList } from 'react-icons/fi';

export const AuditLogPage = () => {
  return (
    <div className="p-6">
      <div className="mb-4">
        <ConfigBreadcrumb />
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FiList className="text-blue-600" />
          Audit Logs
        </h1>
        <p className="text-gray-500 mt-1">Track all configuration changes and administrative actions</p>
      </div>

      <AuditLogList />
    </div>
  );
};
export default AuditLogPage;