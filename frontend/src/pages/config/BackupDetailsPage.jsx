import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BackupDetails } from '../../components/config/backup/BackupDetails';
import { ConfigBreadcrumb } from '../../components/config/common/ConfigBreadcrumb';
import { FiArrowLeft } from 'react-icons/fi';

export const BackupDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => navigate('/config/backups')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft className="text-gray-600" />
        </button>
        <ConfigBreadcrumb />
      </div>
      <BackupDetails />
    </div>
  );
};
export default BackupDetailsPage;