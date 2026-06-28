// src/components/reviews/reports/exports/ExportButton.jsx
import React, { useState } from 'react';
import { Download, ChevronDown, FileText, FileSpreadsheet, File } from 'lucide-react';

const ExportButton = ({ onExport, disabled = false, label = 'Export' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const formats = [
    { value: 'pdf', label: 'PDF', icon: <FileText size={14} /> },
    { value: 'excel', label: 'Excel', icon: <FileSpreadsheet size={14} /> },
    { value: 'csv', label: 'CSV', icon: <File size={14} /> },
  ];

  return (
    <div className="export-button-wrapper">
      <button
        className="btn btn-primary export-button"
        onClick={() => onExport('pdf')}
        disabled={disabled}
      >
        <Download size={18} />
        {label}
        <button
          className="export-button-dropdown"
          onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
          disabled={disabled}
        >
          <ChevronDown size={16} />
        </button>
      </button>

      {isOpen && (
        <div className="export-button-dropdown-menu">
          {formats.map((format) => (
            <button
              key={format.value}
              className="export-button-dropdown-item"
              onClick={() => { onExport(format.value); setIsOpen(false); }}
            >
              {format.icon}
              {format.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExportButton;