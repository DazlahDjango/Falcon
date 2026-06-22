// src/components/reviews/common/ReviewConfirmDialog.jsx
import React from 'react';
import PropTypes from 'prop-types';

const ReviewConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  isLoading = false,
  icon = null,
}) => {
  if (!isOpen) return null;

  const variantClasses = {
    primary: 'btn-primary',
    danger: 'btn-danger',
    warning: 'btn-warning',
    success: 'btn-success',
  };

  return (
    <div className="review-confirm-overlay" onClick={onClose}>
      <div className="review-confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="review-confirm-header">
          {icon && <span className="review-confirm-icon">{icon}</span>}
          <h3 className="review-confirm-title">{title}</h3>
          <button className="review-confirm-close" onClick={onClose}>×</button>
        </div>
        <div className="review-confirm-body">
          <p className="review-confirm-message">{message}</p>
        </div>
        <div className="review-confirm-footer">
          <button
            className="btn btn-outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            className={`btn ${variantClasses[variant]}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

ReviewConfirmDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'danger', 'warning', 'success']),
  isLoading: PropTypes.bool,
  icon: PropTypes.node,
};

export default ReviewConfirmDialog;