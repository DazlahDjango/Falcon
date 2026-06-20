import React from 'react';

const KPIConfirmDialog = ({ 
    isOpen, 
    title = 'Confirm Action', 
    message = 'Are you sure you want to proceed?', 
    confirmText = 'Confirm', 
    cancelText = 'Cancel',
    onConfirm, 
    onCancel,
    type = 'danger' // danger, warning, info
}) => {
    if (!isOpen) return null;

    const getConfirmButtonClass = () => {
        switch (type) {
            case 'danger': return 'kpi-confirm-confirm';
            case 'warning': return 'kpi-btn-warning';
            default: return 'kpi-btn-primary';
        }
    };

    return (
        <div className="kpi-confirm-overlay" onClick={onCancel}>
            <div className="kpi-confirm-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="kpi-confirm-header">
                    <h3>{title}</h3>
                </div>
                <div className="kpi-confirm-content">
                    <p>{message}</p>
                </div>
                <div className="kpi-confirm-footer">
                    <button className="kpi-confirm-cancel" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button className={getConfirmButtonClass()} onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default KPIConfirmDialog;