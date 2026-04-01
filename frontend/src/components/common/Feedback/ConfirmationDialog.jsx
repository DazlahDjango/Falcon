import React from 'react';
import { FiAlertTriangle, FiInfo, FiHelpCircle, FiX } from 'react-icons/fi';
import Button from '../UI/Button';
import Modal from '../UI/Modal';

const ConfirmationDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'warning', // warning, danger, info, success
    confirmVariant = 'primary',
    loading = false,
    icon = null,
    children = null
}) => {
    const getTypeStyles = () => {
        switch (type) {
            case 'danger':
                return {
                    confirmVariant: 'danger',
                    icon: <FiAlertTriangle size={24} />,
                    iconClass: 'dialog-icon-danger'
                };
            case 'warning':
                return {
                    confirmVariant: 'warning',
                    icon: <FiAlertTriangle size={24} />,
                    iconClass: 'dialog-icon-warning'
                };
            case 'info':
                return {
                    confirmVariant: 'primary',
                    icon: <FiInfo size={24} />,
                    iconClass: 'dialog-icon-info'
                };
            default:
                return {
                    confirmVariant: 'primary',
                    icon: <FiHelpCircle size={24} />,
                    iconClass: 'dialog-icon-default'
                };
        }
    };
    const typeStyles = getTypeStyles();
    const finalConfirmVariant = confirmVariant !== 'primary' ? confirmVariant : typeStyles.confirmVariant;
    const handleConfirm = async () => {
        try {
            await onConfirm();
            onClose();
        } catch (error) {
            console.error('Confirmation action failed:', error);
        }
    };
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="sm"
            showCloseButton={false}
        >
            <div className="confirmation-dialog">
                <button className="dialog-close" onClick={onClose}>
                    <FiX size={20} />
                </button>
                
                <div className="dialog-content">
                    <div className={`dialog-icon ${typeStyles.iconClass}`}>
                        {icon || typeStyles.icon}
                    </div>
                    
                    <h3 className="dialog-title">{title}</h3>
                    <p className="dialog-message">{message}</p>
                    
                    {children && (
                        <div className="dialog-children">
                            {children}
                        </div>
                    )}
                </div>
                
                <div className="dialog-actions">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={finalConfirmVariant}
                        onClick={handleConfirm}
                        loading={loading}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
// Variants
export const DeleteConfirmation = ({
    isOpen,
    onClose,
    onConfirm,
    itemName,
    loading = false,
    ...props
}) => (
    <ConfirmationDialog
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={onConfirm}
        type="danger"
        title="Delete Item"
        message={`Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={loading}
        {...props}
    />
);
export const LogoutConfirmation = ({ isOpen, onClose, onConfirm, loading = false }) => (
    <ConfirmationDialog
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={onConfirm}
        type="warning"
        title="Logout"
        message="Are you sure you want to log out? You will need to log in again to access your account."
        confirmText="Logout"
        loading={loading}
    />
);
export { ConfirmationDialog };