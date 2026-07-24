// frontend/src/components/reports/common/ReportConfirmDialog.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './common.css';

export const ReportConfirmDialog = ({
    isOpen = false,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmVariant = 'danger',
    onConfirm,
    onCancel,
    className = '',
}) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onCancel?.();
        }
    };

    const getConfirmClass = () => {
        const variants = {
            primary: 'btn-primary',
            danger: 'btn-danger',
            warning: 'btn-warning',
            success: 'btn-success',
        };
        return variants[confirmVariant] || 'btn-primary';
    };

    return (
        <div className={`report-confirm-dialog-overlay ${className}`} onClick={handleBackdropClick}>
            <div className="report-confirm-dialog">
                <div className="dialog-header">
                    <h3 className="dialog-title">{title}</h3>
                    <button className="dialog-close" onClick={onCancel}>
                        ✕
                    </button>
                </div>
                <div className="dialog-body">
                    <p className="dialog-message">{message}</p>
                </div>
                <div className="dialog-footer">
                    <button className="btn btn-outline dialog-cancel" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button className={`btn ${getConfirmClass()} dialog-confirm`} onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

ReportConfirmDialog.propTypes = {
    isOpen: PropTypes.bool,
    title: PropTypes.string,
    message: PropTypes.string,
    confirmText: PropTypes.string,
    cancelText: PropTypes.string,
    confirmVariant: PropTypes.oneOf(['primary', 'danger', 'warning', 'success']),
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func,
    className: PropTypes.string,
};