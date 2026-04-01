import React, { useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';
const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true,
    closeOnOverlayClick = true,
    closeOnEsc = true,
    footer = null,
    className = ''
}) => {
    const modalRef = useRef(null);
    const sizes = {
        sm: 'modal-sm',
        md: 'modal-md',
        lg: 'modal-lg',
        xl: 'modal-xl',
        full: 'modal-full'
    };
    useEffect(() => {
        const handleEsc = (e) => {
            if (closeOnEsc && e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose, closeOnEsc]);
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);
    const handleOverlayClick = (e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            onClose();
        }
    };
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className={`modal-container ${sizes[size]} ${className}`} ref={modalRef}>
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    {showCloseButton && (
                        <button className="modal-close" onClick={onClose}>
                            <FiX size={20} />
                        </button>
                    )}
                </div>
                <div className="modal-body">
                    {children}
                </div>
                {footer && (
                    <div className="modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export { Modal };