import React, { useState } from 'react';
import { Download, FileJson, FileText, FileSpreadsheet, Image, Loader2 } from 'lucide-react';
import { EXPORT_FORMATS, EXPORT_FORMAT_LABELS } from '../../../config/constants/structureConstants';

const HierarchyExportOptions = ({ onExport, isExporting = false, className = '' }) => {
  const [selectedFormat, setSelectedFormat] = useState(EXPORT_FORMATS.JSON);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [maxDepth, setMaxDepth] = useState(10);
  const getFormatIcon = (format) => {
    switch (format) {
      case EXPORT_FORMATS.JSON:
        return <FileJson size={16} />;
      case EXPORT_FORMATS.CSV:
        return <FileSpreadsheet size={16} />;
      case EXPORT_FORMATS.TEXT:
        return <FileText size={16} />;
      case EXPORT_FORMATS.PNG:
        return <Image size={16} />;
      default:
        return <Download size={16} />;
    }
  };
  const handleExport = () => {
    onExport({
      format: selectedFormat,
      include_inactive: includeInactive,
      max_depth: maxDepth,
    });
  };

  return (
    <div className={`hierarchy-export-options ${className}`}>
      <div className="flex flex-wrap gap-2">
        {Object.values(EXPORT_FORMATS).map((format) => (
          <button
            key={format}
            onClick={() => setSelectedFormat(format)}
            className={`export-format-button ${selectedFormat === format ? 'border-blue-500 bg-blue-50 text-blue-600' : ''}`}
          >
            {getFormatIcon(format)}
            <span className="text-sm">{EXPORT_FORMAT_LABELS[format]}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-gray-200">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(e) => setIncludeInactive(e.target.checked)}
            className="rounded"
          />
          <span>Include inactive departments</span>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Max Depth:</span>
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
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="ml-auto px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          {isExporting ? 'Exporting...' : 'Export'}
        </button>
      </div>
    </div>
  );
};
export default HierarchyExportOptions;