import React from 'react';
import { FiPlus, FiRefreshCw } from 'react-icons/fi';

const EmptyState = ({
    title = 'No data available',
    description = 'There is no data to display at the moment.',
    icon = null,
    action = null,
    actionText = 'Add New',
    onAction,
    illustration = null,
    size = 'md',
    className = ''
}) => {
    const sizeClasses = {
        sm: 'empty-state-sm',
        md: 'empty-state-md',
        lg: 'empty-state-lg'
    };
    
    const DefaultIcon = () => (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 3H21V21H3V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 7H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M8 12H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M8 17H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    );
    
    return (
        <div className={`empty-state ${sizeClasses[size]} ${className}`}>
            <div className="empty-state-illustration">
                {illustration || icon || <DefaultIcon />}
            </div>
            
            <h3 className="empty-state-title">{title}</h3>
            <p className="empty-state-description">{description}</p>
            
            {action && (
                <button className="empty-state-action" onClick={onAction}>
                    <FiPlus size={16} />
                    {actionText}
                </button>
            )}
        </div>
    );
};

// Variants
export const SearchEmptyState = ({ query, onClear, ...props }) => (
    <EmptyState
        title="No results found"
        description={`No results found for "${query}". Try adjusting your search.`}
        action={onClear ? { onAction: onClear, actionText: 'Clear Search' } : null}
        {...props}
    />
);

export const ErrorEmptyState = ({ error, onRetry, ...props }) => (
    <EmptyState
        title="Failed to load data"
        description={error || 'An error occurred while loading data.'}
        action={onRetry ? { onAction: onRetry, actionText: 'Try Again', icon: <FiRefreshCw /> } : null}
        {...props}
    />
);

export default EmptyState;