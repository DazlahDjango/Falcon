import React, { useState } from 'react';
import { X, Download, FileJson, FileText, FileSpreadsheet, Image, FileOutput } from 'lucide-react';
import { EXPORT_FORMATS, EXPORT_FORMAT_LABELS } from '../../../config/constants/structureConstants';

const ExportOptionsModal = ({ isOpen, onClose, onExport, isExporting = false, className = '' }) => {
  const [selectedFormat, setSelectedFormat] = useState(EXPORT_FORMATS.JSON);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [maxDepth, setMaxDepth] = useState(10);
  if (!isOpen) return null;
  const getFormatIcon = (format) => {
    switch (format) {
      case EXPORT_FORMATS.JSON: return <FileJson size={16} />;
      case EXPORT_FORMATS.CSV: return <FileSpreadsheet size={16} />;
      case EXPORT_FORMATS.TEXT: return <FileText size={16} />;
      case EXPORT_FORMATS.PDF: return <FileOutput size={16} />;
      case EXPORT_FORMATS.PNG: return <Image size={16} />;
      default: return <Download size={16} />;
    }
  };
  const handleExport = () => {
    onExport({
      format: selectedFormat,
      include_inactive: includeInactive,
      include_metadata: includeMetadata,
      max_depth: maxDepth,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-container ${className}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Download size={18} className="text-green-500" />
            <h3 className="text-lg font-semibold">Export Options</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(EXPORT_FORMATS).map((format) => (
                <button
                  key={format}
                  onClick={() => setSelectedFormat(format)}
                  className={`flex items-center gap-2 px-3 py-2 border rounded-md text-sm transition-colors ${
                    selectedFormat === format
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {getFormatIcon(format)}
                  <span>{EXPORT_FORMAT_LABELS[format]}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
                className="rounded"
              />
              <span>Include inactive departments/teams</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
                className="rounded"
              />
              <span>Include metadata (created_at, updated_at, etc.)</span>
            </label>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700">Max Depth:</span>
              <select
                value={maxDepth}
                onChange={(e) => setMaxDepth(parseInt(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value={3}>3 levels</option>
                <option value={5}>5 levels</option>
                <option value={10}>10 levels</option>
                <option value={20}>All levels</option>
              </select>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            disabled={isExporting}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Download size={14} />
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default ExportOptionsModal;