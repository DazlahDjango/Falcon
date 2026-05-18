import { useState } from 'react';
import { useEncryption } from '../../../hooks/config';
import { KeyStatusBadge } from './KeyStatusBadge';
import { EncryptionKeyForm } from './EncryptionKeyForm';
import { RotateKeyModal } from './RotateKeyModal';
import { FiPlus, FiRotateCw, FiStar, FiTrash2 } from 'react-icons/fi';

export const EncryptionKeyList = () => {
  const { useEncryptionKeys, useDefaultKey, rotateKey, revokeKey } = useEncryption();
  const [showAddForm, setShowAddForm] = useState(false);
  const [rotatingKey, setRotatingKey] = useState(null);
  const { data, isLoading, refetch } = useEncryptionKeys();
  const { data: defaultKeyData } = useDefaultKey();

  const keys = data?.data?.results || [];
  const defaultKeyId = defaultKeyData?.data?.id;

  const handleSetDefault = async (keyId) => {
    if (confirm('Set this as the default encryption key?')) {
      // API call to set default key
      await refetch();
    }
  };

  const handleRevoke = async (key) => {
    if (confirm(`Revoke key "${key.key_alias}"? This will affect encrypted data.`)) {
      await revokeKey.mutateAsync(key.id);
      refetch();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Encryption Keys</h1>
        <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <FiPlus /> Add Key
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-left text-sm text-gray-600">
              <th className="px-5 py-3">Alias</th>
              <th className="px-5 py-3">Source</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Activated</th>
              <th className="px-5 py-3">Usage Count</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan="6" className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : keys.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-8 text-gray-500">No encryption keys found</td></tr>
            ) : (
              keys.map((key) => (
                <tr key={key.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{key.key_alias}</span>
                      {key.id === defaultKeyId && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Default</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm capitalize">{key.key_source.replace(/_/g, ' ')}</td>
                  <td className="px-5 py-3"><KeyStatusBadge status={key.key_status} /></td>
                  <td className="px-5 py-3 text-sm">{new Date(key.activated_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-sm">{key.usage_count || 0}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      {key.id !== defaultKeyId && key.key_status === 'active' && (
                        <button onClick={() => handleSetDefault(key.id)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="Set as default">
                          <FiStar className="text-yellow-500" />
                        </button>
                      )}
                      {key.key_status === 'active' && (
                        <button onClick={() => setRotatingKey(key)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="Rotate key">
                          <FiRotateCw className="text-blue-500" />
                        </button>
                      )}
                      <button onClick={() => handleRevoke(key)} className="p-1.5 hover:bg-red-100 rounded-lg" title="Revoke key">
                        <FiTrash2 className="text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddForm && <EncryptionKeyForm onClose={() => setShowAddForm(false)} onSuccess={() => { refetch(); setShowAddForm(false); }} />}
      {rotatingKey && <RotateKeyModal keyToRotate={rotatingKey} onClose={() => setRotatingKey(null)} onSuccess={() => { refetch(); setRotatingKey(null); }} />}
    </div>
  );
};