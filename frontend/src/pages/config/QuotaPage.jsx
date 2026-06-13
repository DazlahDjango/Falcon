import React from 'react';
import { QuotaList } from '../../components/config/quota/QuotaList';
import { QuotaSettingsPanel } from '../../components/config/quota/QuotaSettingsPanel';
import { ConfigBreadcrumb } from '../../components/config/common/ConfigBreadcrumb';
import { useConfigPermissions } from '../../hooks/config';
import { FiPieChart } from 'react-icons/fi';

export const QuotaPage = () => {
  const { isSuperAdmin } = useConfigPermissions();

  return (
    <div className="p-6">
      <div className="mb-4">
        <ConfigBreadcrumb />
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FiPieChart className="text-blue-600" />
          Storage Quotas
        </h1>
        <p className="text-gray-500 mt-1">Manage backup storage limits per tenant</p>
      </div>

      <div className="space-y-6">
        <QuotaList />
        {isSuperAdmin && <QuotaSettingsPanel />}
      </div>
    </div>
  );
};
export default QuotaPage;