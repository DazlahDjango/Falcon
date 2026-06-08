import React, { useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import ExportModal from './ExportModal';

const ExportButton = ({ type, data, filters, disabled, variant = 'primary' }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const getButtonClass = () => {
        switch (variant) {
            case 'primary': return 'export-btn-primary';
            case 'secondary': return 'export-btn-secondary';
            case 'outline': return 'export-btn-outline';
            default: return 'export-btn-primary';
        }
    };
    
    return (
        <>
            <button 
                className={`export-btn ${getButtonClass()}`}
                onClick={() => setIsModalOpen(true)}
                disabled={disabled}
            >
                <FiDownload size={14} />
                Export
            </button>
            
            {isModalOpen && (
                <ExportModal 
                    type={type}
                    data={data}
                    filters={filters}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    );
};

export default ExportButton;