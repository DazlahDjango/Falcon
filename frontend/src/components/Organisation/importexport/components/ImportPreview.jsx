import React, { useState } from 'react';

const ImportPreview = ({ data, columns, onConfirm, onCancel, loading }) => {
  const [selectedRows, setSelectedRows] = useState(null);
  const [previewRows, setPreviewRows] = useState(5);

  if (!data || data.length === 0) {
    return null;
  }

  const displayData = data.slice(0, previewRows);
  const totalRows = data.length;
  const validRows = data.filter(row => row.is_valid !== false).length;
  const invalidRows = totalRows - validRows;

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{totalRows}</p>
          <p className="text-xs text-blue-600">Total Rows</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{validRows}</p>
          <p className="text-xs text-green-600">Valid Rows</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{invalidRows}</p>
          <p className="text-xs text-red-600">Invalid Rows</p>
        </div>
      </div>

      {/* Data Preview Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayData.map((row, idx) => (
              <tr key={idx} className={!row.is_valid ? 'bg-red-50' : ''}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-2 text-sm text-gray-900">
                    {row[col.key] || '-'}
                  </td>
                ))}
                <td className="px-4 py-2">
                  {row.is_valid === false ? (
                    <span className="text-xs text-red-600" title={row.error_message}>
                      ❌ Invalid
                    </span>
                  ) : (
                    <span className="text-xs text-green-600">✅ Valid</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Show more rows control */}
      {data.length > previewRows && (
        <div className="flex justify-center">
          <button
            onClick={() => setPreviewRows(prev => prev + 10)}
            className="text-sm text-indigo-600 hover:text-indigo-900"
          >
            Show more rows...
          </button>
        </div>
      )}

      {/* Error Summary */}
      {invalidRows > 0 && (
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-red-800 mb-2">
            ⚠️ {invalidRows} row(s) have validation errors
          </p>
          <div className="space-y-1">
            {data.filter(row => !row.is_valid).slice(0, 5).map((row, idx) => (
              <p key={idx} className="text-xs text-red-700">
                • Row {idx + 1}: {row.error_message}
              </p>
            ))}
            {invalidRows > 5 && (
              <p className="text-xs text-red-600">...and {invalidRows - 5} more errors</p>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={() => onConfirm(data)}
          disabled={loading || invalidRows > 0}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Importing...' : `Import ${validRows} Rows`}
        </button>
      </div>
    </div>
  );
};

export default ImportPreview;
