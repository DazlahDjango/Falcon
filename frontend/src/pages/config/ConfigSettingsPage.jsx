import React from 'react';
import { ConfigSettingsPanel } from '../../components/config/settings/ConfigSettingsPanel';
import { ConfigBreadcrumb } from '../../components/config/common/ConfigBreadcrumb';
import { FiSettings } from 'react-icons/fi';

export const ConfigSettingsPage = () => {
  return (
    <div className="p-6">
      <div className="mb-4">
        <ConfigBreadcrumb />
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FiSettings className="text-blue-600" />
          Configuration Settings
        </h1>
        <p className="text-gray-500 mt-1">Global settings for backup, maintenance, and disaster recovery</p>
      </div>

      <ConfigSettingsPanel />
    </div>
  );
};