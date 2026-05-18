import { useState } from 'react';
import { useEncryption } from '../../../hooks/config';
import { ENCRYPTION_KEY_SOURCES, ENCRYPTION_KEY_SOURCE_LABELS } from '../../../config/constants/configConstants';
import { FiX, FiLoader } from 'react-icons/fi';

export const EncryptionKeyForm = ({ onClose, onSuccess }) => {
  const { createKey } = useEncryption();
  const [formData, setFormData] = useState({
    key_alias: '',
    key_source: ENCRYPTION_KEY_SOURCES.AWS_KMS,
    key_region: 'us-east-1',
    key_arn: '',
    is_default: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createKey.mutateAsync(formData);
      onSuccess();
    } catch (error) {
      console.error('Failed to create key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Add Encryption Key</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><FiX /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Key Alias *</label>
            <input type="text" value={formData.key_alias} onChange={(e) => setFormData({ ...formData, key_alias: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Key Source</label>
            <select value={formData.key_source} onChange={(e) => setFormData({ ...formData, key_source: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              {Object.entries(ENCRYPTION_KEY_SOURCES).map(([key, value]) => <option key={value} value={value}>{ENCRYPTION_KEY_SOURCE_LABELS[value]}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
            <input type="text" value={formData.key_region} onChange={(e) => setFormData({ ...formData, key_region: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Key ARN / Key ID</label>
            <input type="text" value={formData.key_arn} onChange={(e) => setFormData({ ...formData, key_arn: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_default} onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })} className="w-4 h-4" /> Set as default key</label>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {isLoading ? <FiLoader className="animate-spin" /> : null}
              Add Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};