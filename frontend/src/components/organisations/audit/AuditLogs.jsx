import React, { useState, useEffect } from 'react';
import AuditEntry from './components/AuditEntry';
import AuditFilters from './components/AuditFilters';
import AuditExportModal from './components/AuditExportModal';
import { auditApi } from '../../../services/organisations';
import toast from 'react-hot-toast';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState({
    action: '',
    user: '',
    date_range: '',
    model: '',
  });

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.action) params.action = filters.action;
      if (filters.user) params.user_email = filters.user;
      if (filters.date_range) params.days = filters.date_range;
      if (filters.model) params.model_name = filters.model;
      
      const response = await auditApi.getAll(params);
      setLogs(response.data.results || response.data || []);
      setTotal(response.data.count || response.data.length || 0);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      action: '',
      user: '',
      date_range: '',
      model: '',
    });
  };

  const handleExport = async (exportParams) => {
    setExporting(true);
    try {
      const response = await auditApi.export({
        ...exportParams,
        ...filters,
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${new Date().toISOString()}.${exportParams.format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Export completed successfully');
      setShowExportModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track all changes and activities within your organisation
          </p>
        </div>
        <button
          onClick={() => setShowExportModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          📥 Export Logs
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{total}</p>
          <p className="text-xs text-gray-500">Total Events</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {logs.filter(l => l.action === 'created').length}
          </p>
          <p className="text-xs text-green-600">Created</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">
            {logs.filter(l => l.action === 'updated').length}
          </p>
          <p className="text-xs text-blue-600">Updated</p>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-red-600">
            {logs.filter(l => l.action === 'deleted').length}
          </p>
          <p className="text-xs text-red-600">Deleted</p>
        </div>
      </div>

      {/* Filters */}
      <AuditFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Logs List */}
      {logs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No audit logs found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your filters or check back later.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {logs.map((log) => (
              <AuditEntry key={log.id} entry={log} />
            ))}
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <AuditExportModal
          onExport={handleExport}
          onClose={() => setShowExportModal(false)}
          loading={exporting}
        />
      )}
    </div>
  );
};

export default AuditLogs;