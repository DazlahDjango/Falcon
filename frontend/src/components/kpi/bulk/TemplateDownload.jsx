import React from 'react';
import { FiDownload } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { downloadTemplate } from '../../../store/kpi';

const TemplateDownload = ({ type }) => {
    const dispatch = useDispatch();
    
    const getTemplateInfo = () => {
        switch (type) {
            case 'kpi':
                return {
                    title: 'Performance Indicator Template',
                    description: 'Download CSV template for bulk Performance Indicator upload',
                    headers: ['name', 'code', 'kpi_type', 'framework_id', 'unit', 'target_min', 'target_max']
                };
            case 'actual':
                return {
                    title: 'Actual Data Template',
                    description: 'Download CSV template for bulk actual data upload',
                    headers: ['kpi_id', 'user_id', 'actual_value', 'notes']
                };
            case 'target':
                return {
                    title: 'Target Template',
                    description: 'Download CSV template for bulk target upload',
                    headers: ['kpi_id', 'user_id', 'target_value', 'notes']
                };
            default:
                return null;
        }
    };
    
    const handleDownload = async () => {
        const result = await dispatch(downloadTemplate(type)).unwrap();
        const url = URL.createObjectURL(result.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_template.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };
    
    const info = getTemplateInfo();
    if (!info) return null;
    
    return (
        <div className="template-download-card">
            <div className="template-info">
                <h4>{info.title}</h4>
                <p>{info.description}</p>
                <div className="template-headers">
                    <small>Required columns: {info.headers.slice(0, 4).join(', ')}</small>
                </div>
            </div>
            <button className="template-download-btn" onClick={handleDownload}>
                <FiDownload size={14} />
                Download Template
            </button>
        </div>
    );
};

export default TemplateDownload;