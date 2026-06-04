import React from 'react';
import { FiInbox, FiCreditCard, FiFileText, FiCalendar, FiDatabase, FiPlus } from 'react-icons/fi';
import './shared.css';

const ICON_MAP = {
    invoices: FiFileText,
    transactions: FiCreditCard,
    subscriptions: FiCalendar,
    payment_methods: FiCreditCard,
    plans: FiDatabase,
    default: FiInbox,
};

export const EmptyState = ({ type = 'default', title, message, actionText, onAction, icon, className = '' }) => {
    const IconComponent = icon || ICON_MAP[type] || ICON_MAP.default;

    return (
        <div className={`empty-state ${className}`}>
            <div className="empty-state-icon">
                <IconComponent />
            </div>
            <h3 className="empty-state-title">{title || `No ${type.replace('_', ' ')} found`}</h3>
            <p className="empty-state-message">
                {message || `You don't have any ${type.replace('_', ' ')} yet. ${actionText ? 'Get started by creating one.' : ''}`}
            </p>
            {actionText && onAction && (
                <button className="empty-state-action" onClick={onAction}>
                    <FiPlus /> {actionText}
                </button>
            )}
        </div>
    );
};

export default EmptyState;