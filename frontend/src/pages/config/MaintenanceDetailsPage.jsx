import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MaintenanceDetails } from '../../components/config/maintenance/MaintenanceDetails';
import { ConfigBreadcrumb } from '../../components/config/common/ConfigBreadcrumb';
import { FiArrowLeft } from 'react-icons/fi';

export const MaintenanceDetailsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => navigate('/config/maintenance')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft className="text-gray-600" />
        </button>
        <ConfigBreadcrumb />
      </div>
      <MaintenanceDetails />
    </div>
  );
};
export default MaintenanceDetailsPage;