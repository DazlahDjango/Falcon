import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUserPlus, FiCheckCircle } from 'react-icons/fi';
import { BulkUserImportModal } from '../../components/accounts/bulk/BulkUserImportModal';
import { ACCOUNTS_ROUTES } from '../../config/constants/accountsRouteConstants';

export const BulkImportPage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleClose = () => {
    navigate(ACCOUNTS_ROUTES.USERS);
  };

  const handleSuccess = () => {
    // Keep modal state intact for summary review or navigate back
  };

  return (
    <div className="accounts-page bulk-import-page p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={handleClose}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <FiArrowLeft /> Back to Users
        </button>
      </div>

      <BulkUserImportModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default BulkImportPage;
