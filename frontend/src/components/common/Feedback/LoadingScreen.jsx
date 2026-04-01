import React from 'react';
import Spinner from '../UI/Spinner';

const LoadingScreen = ({ 
    fullScreen = true, 
    message = 'Loading...',
    spinnerSize = 'lg',
    transparent = false,
    className = ''
}) => {
    const containerClasses = [
        'loading-screen',
        fullScreen ? 'fullscreen' : 'inline',
        transparent ? 'transparent' : '',
        className
    ].filter(Boolean).join(' ');
    
    return (
        <div className={containerClasses}>
            <div className="loading-content">
                <Spinner size={spinnerSize} color="primary" />
                {message && <p className="loading-message">{message}</p>}
            </div>
        </div>
    );
};

// Skeleton loader for content
export const SkeletonLoader = ({ 
    type = 'card', 
    count = 1,
    className = ''
}) => {
    const renderSkeleton = () => {
        switch (type) {
            case 'card':
                return (
                    <div className="skeleton-card">
                        <div className="skeleton-image"></div>
                        <div className="skeleton-title"></div>
                        <div className="skeleton-text"></div>
                        <div className="skeleton-text short"></div>
                    </div>
                );
                
            case 'table':
                return (
                    <div className="skeleton-table">
                        <div className="skeleton-table-header">
                            <div className="skeleton-line"></div>
                            <div className="skeleton-line"></div>
                            <div className="skeleton-line"></div>
                            <div className="skeleton-line"></div>
                        </div>
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="skeleton-table-row">
                                <div className="skeleton-line"></div>
                                <div className="skeleton-line"></div>
                                <div className="skeleton-line"></div>
                                <div className="skeleton-line"></div>
                            </div>
                        ))}
                    </div>
                );
                
            case 'list':
                return (
                    <div className="skeleton-list">
                        {[...Array(count)].map((_, i) => (
                            <div key={i} className="skeleton-list-item">
                                <div className="skeleton-avatar"></div>
                                <div className="skeleton-list-content">
                                    <div className="skeleton-title"></div>
                                    <div className="skeleton-text"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
                
            case 'form':
                return (
                    <div className="skeleton-form">
                        {[...Array(count)].map((_, i) => (
                            <div key={i} className="skeleton-form-field">
                                <div className="skeleton-label"></div>
                                <div className="skeleton-input"></div>
                            </div>
                        ))}
                        <div className="skeleton-button"></div>
                    </div>
                );
                
            default:
                return (
                    <div className="skeleton-default">
                        <div className="skeleton-title"></div>
                        <div className="skeleton-text"></div>
                    </div>
                );
        }
    };
    
    return (
        <div className={`skeleton-loader ${className}`}>
            {renderSkeleton()}
        </div>
    );
};
export { LoadingScreen };