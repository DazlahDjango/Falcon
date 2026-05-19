import { useState } from 'react';
import { useQuota } from '../../../hooks/config';
import { QuotaForm } from './QuotaForm';
import { FiSettings, FiPlus } from 'react-icons/fi';

export const QuotaSettingsPanel = () => {
  const { useQuotas } = useQuota();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuota, setEditingQuota] = useState(null);
  const { data, refetch } = useQuotas({ system: true });
  const quotas = data?.data?.results || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Quota Settings</h2>
        <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <FiPlus size={14} /> Add Quota
        </button>
      </div>
      <div className="space-y-3">
        {quotas.map(quota => (
          <div key={quota.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-800">{quota.tenant_name || 'System Wide'}</div>
              <div className="text-sm text-gray-500">{quota.app_name || 'All Apps'} - {quota.total_storage_gb} GB limit</div>
            </div>
            <button onClick={() => setEditingQuota(quota)} className="p-2 hover:bg-gray-200 rounded-lg">
              <FiSettings className="text-gray-500" />
            </button>
          </div>
        ))}
      </div>
      {(showAddForm || editingQuota) && (
        <QuotaForm
          quota={editingQuota}
          onClose={() => { setShowAddForm(false); setEditingQuota(null); }}
          onSuccess={() => { refetch(); setShowAddForm(false); setEditingQuota(null); }}
        />
      )}
    </div>
  );
};