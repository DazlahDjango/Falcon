import { useState } from 'react';
import { useAuditLog } from '../../../hooks/config';
import { FiDownload, FiLoader } from 'react-icons/fi';

export const AuditLogExporter = ({ filters }) => {
  const { exportAuditLogs } = useAuditLog();
  const [isExporting, setIsExporting] = useState(false);
  const [format, setFormat] = useState('csv');

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportAuditLogs.mutateAsync({ params: filters, format });
      if (format === 'csv' || format === 'excel') {
        const url = window.URL.createObjectURL(new Blob([result.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `audit_logs_${new Date().toISOString()}.${format === 'excel' ? 'xlsx' : 'csv'}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <select value={format} onChange={(e) => setFormat(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
        <option value="csv">CSV</option>
        <option value="excel">Excel</option>
        <option value="json">JSON</option>
      </select>
      <button onClick={handleExport} disabled={isExporting} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
        {isExporting ? <FiLoader className="animate-spin" /> : <FiDownload />}
        Export
      </button>
    </div>
  );
};