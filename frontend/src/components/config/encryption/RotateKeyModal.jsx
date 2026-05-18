import { useState } from 'react';
import { useEncryption } from '../../../hooks/config';
import { ENCRYPTION_KEY_SOURCES, ENCRYPTION_KEY_SOURCE_LABELS } from '../../../config/constants/configConstants';
import { FiX, FiLoader, FiAlertTriangle } from 'react-icons/fi';

export const RotateKeyModal = ({ keyToRotate, onClose, onSuccess }) => {
  const { rotateKey } = useEncryption();
  const [formData, setFormData] = useState({
    new_key_alias: `${keyToRotate.key_alias}_rotated_${new Date().getFullYear()}`,
    key_source: keyToRotate.key_source
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleRotate = async () => {
    setIsLoading(true);
    try {
      await rotateKey.mutateAsync({
        oldKeyId: keyToRotate.id,
        newKeyAlias: formData.new_key_alias,
        keySource: formData.key_source
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to rotate key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-full"><FiAlertTriangle className="text-yellow-600 text-xl" /></div>
            <h2 className="text-xl font-semibold text-gray-800">Rotate Encryption Key</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><FiX /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
            Rotating key: <span className="font-medium">{keyToRotate.key_alias}</span>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">New Key Alias</label>
            <input type="text" value={formData.new_key_alias} onChange={(e) => setFormData({ ...formData, new_key_alias: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Key Source</label>
            <select value={formData.key_source} onChange={(e) => setFormData({ ...formData, key_source: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              {Object.entries(ENCRYPTION_KEY_SOURCES).map(([key, value]) => <option key={value} value={value}>{ENCRYPTION_KEY_SOURCE_LABELS[value]}</option>)}
            </select>
          </div>
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            Warning: Key rotation will affect all data encrypted with the old key. Ensure all backups are re-encrypted.
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={handleRotate} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50">
            {isLoading ? <FiLoader className="animate-spin" /> : <FiAlertTriangle />}
            Confirm Rotation
          </button>
        </div>
      </div>
    </div>
  );
};