import { useState } from 'react';
import { useQuota } from '../../../hooks/config';
import { QuotaUsageBar } from './QuotaUsageBar';
import { QuotaForm } from './QuotaForm';
import { FiEdit, FiAlertCircle } from 'react-icons/fi';

export const QuotaList = () => {
  const { useQuotas, useOverThreshold, useExceededQuotas } = useQuota();
  const [editingQuota, setEditingQuota] = useState(null);
  const { data, isLoading } = useQuotas();
  const { data: overThreshold } = useOverThreshold();
  const { data: exceeded } = useExceededQuotas();

  const quotas = data?.data?.results || [];
  const overThresholdIds = new Set(overThreshold?.data?.map(q => q.id) || []);
  const exceededIds = new Set(exceeded?.data?.map(q => q.id) || []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Storage Quotas</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-left text-sm text-gray-600">
              <th className="px-5 py-3">Tenant / App</th>
              <th className="px-5 py-3">Usage</th>
              <th className="px-5 py-3">Limit</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan="5" className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : quotas.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-8 text-gray-500">No quotas configured</td></tr>
            ) : (
              quotas.map((quota) => {
                const isOverThreshold = overThresholdIds.has(quota.id);
                const isExceeded = exceededIds.has(quota.id);
                const usagePercent = (quota.used_backup_storage_bytes / quota.total_backup_storage_bytes) * 100;
                return (
                  <tr key={quota.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="font-medium text-gray-800">{quota.tenant_name || 'System'}</div>
                      <div className="text-xs text-gray-500">{quota.app_name || 'All Apps'}</div>
                    </td>
                    <td className="px-5 py-3 w-1/3">
                      <QuotaUsageBar used={quota.used_backup_storage_bytes} total={quota.total_backup_storage_bytes} showLabel={false} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-medium">{quota.total_storage_gb} GB</div>
                      <div className="text-xs text-gray-500">Max Backups: {quota.max_backup_count}</div>
                    </td>
                    <td className="px-5 py-3">
                      {isExceeded && <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full"><FiAlertCircle size={12} /> Exceeded</span>}
                      {!isExceeded && isOverThreshold && <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full"><FiAlertCircle size={12} /> Warning</span>}
                      {!isExceeded && !isOverThreshold && <span className="text-green-600 text-sm">Healthy</span>}
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => setEditingQuota(quota)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                        <FiEdit className="text-gray-500" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {editingQuota && <QuotaForm quota={editingQuota} onClose={() => setEditingQuota(null)} onSuccess={() => setEditingQuota(null)} />}
    </div>
  );
};