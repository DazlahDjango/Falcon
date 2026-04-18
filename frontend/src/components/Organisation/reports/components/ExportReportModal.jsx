import React, { useState } from 'react';

const ExportReportModal = ({ onExport, onClose, loading, reportData }) => {
  const [format, setFormat] = useState('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRawData, setIncludeRawData] = useState(false);
  const [emailReport, setEmailReport] = useState(false);
  const [email, setEmail] = useState('');

  const handleExport = () => {
    onExport({
      format,
      include_charts: includeCharts,
      include_raw_data: includeRawData,
      email_report: emailReport,
      email: email,
    });
  };

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document', icon: '📄', description: 'Professional report with charts and tables' },
    { value: 'excel', label: 'Excel Spreadsheet', icon: '📊', description: 'Data in tabular format for analysis' },
    { value: 'csv', label: 'CSV File', icon: '📋', description: 'Raw data for import into other systems' },
  ];

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Export Report</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 text-2xl">×</button>
        </div>

        <div className="p-6 space-y-4">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <div className="space-y-2">
              {formatOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                    format === opt.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value={opt.value}
                    checked={format === opt.value}
                    onChange={(e) => setFormat(e.target.value)}
                    className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{opt.icon}</span>
                      <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{opt.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeCharts}
                onChange={(e) => setIncludeCharts(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Include charts and visualizations</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeRawData}
                onChange={(e) => setIncludeRawData(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Include raw data tables</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={emailReport}
                onChange={(e) => setEmailReport(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Email report to me</span>
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

          {/* File size info */}
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-xs text-gray-500">
              📁 Estimated file size: ~500KB - 2MB depending on data volume
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Exporting...' : 'Export Report'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportReportModal;