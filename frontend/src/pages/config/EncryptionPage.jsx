import React from 'react';
import { EncryptionKeyList } from '../../components/config/encryption/EncryptionKeyList';
import { ConfigBreadcrumb } from '../../components/config/common/ConfigBreadcrumb';
import { FiKey } from 'react-icons/fi';

export const EncryptionPage = () => {
  return (
    <div className="p-6">
      <div className="mb-4">
        <ConfigBreadcrumb />
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FiKey className="text-blue-600" />
          Encryption Keys
        </h1>
        <p className="text-gray-500 mt-1">Manage encryption keys for backup security</p>
      </div>

      <EncryptionKeyList />
    </div>
  );
};
export default EncryptionPage;