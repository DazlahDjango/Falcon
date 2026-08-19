import React, { useState } from 'react';
import { FiDownload, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useUsers } from '../../../hooks/accounts/useUsers';

export const BulkExportButton = ({ className = '', label = 'Export CSV' }) => {
  const { exportUsers } = useUsers();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      toast.loading('Exporting users to CSV...', { id: 'export-toast' });
      await exportUsers();
      toast.success('Users exported successfully!', { id: 'export-toast' });
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to export users', { id: 'export-toast' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isExporting}
      className={
        className ||
        'flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-semibold shadow-sm transition-all disabled:opacity-50'
      }
    >
      {isExporting ? <FiRefreshCw className="animate-spin" /> : <FiDownload />}
      <span>{label}</span>
    </button>
  );
};

export default BulkExportButton;
