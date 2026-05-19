import { useEncryption } from '../../../hooks/config';
import { FiStar } from 'react-icons/fi';

export const DefaultKeySelector = ({ onSelect }) => {
  const { useEncryptionKeys } = useEncryption();
  const { data } = useEncryptionKeys({ key_status: 'active' });
  const keys = data?.data?.results || [];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Default Encryption Key</label>
      <select onChange={(e) => onSelect(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
        <option value="">Select default key...</option>
        {keys.map(key => (
          <option key={key.id} value={key.id}>{key.key_alias} ({key.key_source})</option>
        ))}
      </select>
      <p className="text-xs text-gray-500">Default key is used for encrypting new backups</p>
    </div>
  );
};