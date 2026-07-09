import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

export const StructureConfirmDialog = ({
  isOpen = false,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  type = 'warning',
  isLoading = false,
  className = '',
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    warning: {
      icon: FiAlertTriangle,
      className: 'confirm-warning',
    },
    danger: {
      icon: FiAlertTriangle,
      className: 'confirm-danger',
    },
    info: {
      icon: FiAlertTriangle,
      className: 'confirm-info',
    },
  };

  const config = typeConfig[type] || typeConfig.warning;
  const Icon = config.icon;

  return (
    <div className={`structure-confirm-overlay ${className}`}>
      <div className="structure-confirm-dialog">
        <div className="confirm-header">
          <div className={`confirm-icon ${config.className}`}>
            <Icon size={24} />
          </div>
          <button onClick={onClose} className="confirm-close-btn">
            <FiX size={20} />
          </button>
        </div>
        <div className="confirm-body">
          <h3 className="confirm-title">{title}</h3>
          <p className="confirm-message">{message}</p>
        </div>
        <div className="confirm-footer">
          <button
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`btn btn-${type === 'danger' ? 'danger' : 'primary'}`}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StructureConfirmDialog;
