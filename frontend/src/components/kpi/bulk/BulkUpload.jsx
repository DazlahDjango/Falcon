import React, { useState } from 'react';
import { FiUpload, FiFile, FiCheckCircle, FiAlertCircle, FiDownload, FiLayers } from 'react-icons/fi';
import BulkKPIUpload from './BulkKPIUpload';
import BulkActualUpload from './BulkActualUpload';
import BulkTargetUpload from './BulkTargetUpload';
import InteractiveBulkForm from './InteractiveBulkForm';
import TemplateDownload from './TemplateDownload';
import KPILoading from '../common/KPILoading';

const BulkUpload = () => {
    const [activeTab, setActiveTab] = useState('form');
    const [uploadResult, setUploadResult] = useState(null);
    const [uploading, setUploading] = useState(false);
    
    const tabs = [
        { id: 'form', label: 'Interactive Multi-Row Form', icon: <FiLayers size={14} /> },
        { id: 'kpi', label: 'Import Performance Indicators (CSV/Excel)', icon: <FiFile size={14} /> },
        { id: 'actual', label: 'Import Actuals (CSV/Excel)', icon: <FiFile size={14} /> },
        { id: 'target', label: 'Import Targets (CSV/Excel)', icon: <FiFile size={14} /> }
    ];
    
    const handleUploadComplete = (result) => {
        setUploadResult(result);
        setUploading(false);
        setTimeout(() => {
            setUploadResult(null);
        }, 5000);
    };
    
    return (
        <div className="kpi-bulk-container">
            <div className="bulk-header">
                <h2>Bulk Operations</h2>
                <p>Create and submit multiple metrics directly via interactive forms or spreadsheet files</p>
            </div>
            
            <div className="bulk-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`bulk-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>
            
            <div className="bulk-content">
                {activeTab === 'form' && (
                    <InteractiveBulkForm />
                )}
                {activeTab === 'kpi' && (
                    <BulkKPIUpload onComplete={handleUploadComplete} setUploading={setUploading} />
                )}
                {activeTab === 'actual' && (
                    <BulkActualUpload onComplete={handleUploadComplete} setUploading={setUploading} />
                )}
                {activeTab === 'target' && (
                    <BulkTargetUpload onComplete={handleUploadComplete} setUploading={setUploading} />
                )}
            </div>
            
            {uploading && <KPILoading size="sm" text="Uploading file..." />}
            
            {uploadResult && (
                <div className={`bulk-notification ${uploadResult.errors?.length > 0 ? 'error' : 'success'}`}>
                    {uploadResult.errors?.length > 0 ? (
                        <>
                            <FiAlertCircle size={20} />
                            <span>Upload completed with {uploadResult.errors.length} errors</span>
                        </>
                    ) : (
                        <>
                            <FiCheckCircle size={20} />
                            <span>Successfully uploaded {uploadResult.created} records</span>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default BulkUpload;