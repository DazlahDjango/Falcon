import React, { useState } from 'react';
import { exportApi } from '../../../services/organisation';
import toast from 'react-hot-toast';

const DataExport = () => {
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState('kpis');
  const [format, setFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('30');
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [emailReport, setEmailReport] = useState(false);
  const [email, setEmail] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const exportTypes = [
    { value: 'kpis', label: 'KPIs', icon: '📊', description: 'Export all KPI data including targets and actuals' },
    { value: 'users', label: 'Users', icon: '👥', description: 'Export user list with roles and departments' },
    { value: 'departments', label: 'Departments', icon: '🏢', description: 'Export department structure' },
    { value: 'teams', label: 'Teams', icon: '👥', description: 'Export team assignments' },
    { value: 'positions', label: 'Positions', icon: '💺', description: 'Export job positions' },
    { value: 'audit_logs', label: 'Audit Logs', icon: '📋', description: 'Export audit trail data' },
    { value: 'subscriptions', label: 'Subscriptions', icon: '💰', description: 'Export billing and subscription data' },
  ];

  const formatOptions = [
    { value: 'csv', label: 'CSV', icon: '📄', description: 'Comma-separated values' },
    { value: 'excel', label: 'Excel', icon: '📊', description: 'Microsoft Excel format' },
    { value: 'json', label: 'JSON', icon: '🔧', description: 'JSON format for developers' },
  ];

  const dateRangeOptions = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' },
    { value: '365', label: 'Last year' },
    { value: 'all', label: 'All time' },
    { value: 'custom', label: 'Custom range' },
  ];

  const handleExport = async () => {
    setLoading(true);
    try {
      const params = {
        type: exportType,
        format: format,
        include_headers: includeHeaders,
        include_deleted: includeDeleted,
        email: emailReport ? email : undefined,
        date_range: dateRange,
      };
      
      if (dateRange === 'custom') {
        params.start_date = customStartDate;
        params.end_date = customEndDate;
      } else if (dateRange !== 'all') {
        params.days = dateRange;
      }
      
      const response = await exportApi.exportData(params);
      
      // Download file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const extension = format === 'excel' ? 'xlsx' : format;
      link.setAttribute('download', `${exportType}_export_${new Date().toISOString()}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Export completed successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  const getEstimatedRows = () => {
    const estimates = {
      kpis: '500-2000',
      users: '50-500',
      departments: '10-100',
      teams: '20-200',
      positions: '30-300',
      audit_logs: '1000-10000',
      subscriptions: '10-100',
    };
    return estimates[exportType] || '100-1000';
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Data Export</h1>
        <p className="mt-1 text-sm text-gray-500">
          Export your organisation's data for analysis or backup
        </p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">Export Settings</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Export Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What would you like to export?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exportTypes.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                    exportType === type.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportType"
                    value={type.value}
                    checked={exportType === type.value}
                    onChange={(e) => setExportType(e.target.value)}
                    className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{type.icon}</span>
                      <span className="text-sm font-medium text-gray-900">{type.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              {formatOptions.map((fmt) => (
                <label
                  key={fmt.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    format === fmt.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value={fmt.value}
                    checked={format === fmt.value}
                    onChange={(e) => setFormat(e.target.value)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <div className="ml-2">
                    <div className="flex items-center space-x-1">
                      <span className="text-lg">{fmt.icon}</span>
                      <span className="text-sm font-medium text-gray-900">{fmt.label}</span>
                    </div>
                    <p className="text-xs text-gray-500">{fmt.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {dateRangeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Options */}
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeHeaders}
                onChange={(e) => setIncludeHeaders(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Include column headers</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeDeleted}
                onChange={(e) => setIncludeDeleted(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Include deleted records</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={emailReport}
                onChange={(e) => setEmailReport(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Email me the export</span>
            </label>
          </div>

          {emailReport && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="recipient@example.com"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}

          {/* Info Box */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-700">Estimated Export Size</p>
                <p className="text-xs text-gray-500 mt-1">
                  Approximately {getEstimatedRows()} rows
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">File Format</p>
                <p className="text-xs text-gray-500 mt-1">
                  {format.toUpperCase()} • Compatible with Excel, Google Sheets
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <a
              href="/dashboard"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </a>
            <button
              onClick={handleExport}
              disabled={loading || (emailReport && !email)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Exporting...' : 'Export Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataExport;