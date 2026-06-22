import React from 'react';
import './shared.css';

export const LoadingSkeleton = ({ type = 'card', count = 1, className = '' }) => {
    const skeletons = Array(count).fill(0);

    const renderSkeleton = () => {
        switch (type) {
            case 'card':
                return (
                    <div className="skeleton-card">
                        <div className="skeleton-card-header">
                            <div className="skeleton skeleton-title"></div>
                            <div className="skeleton skeleton-icon"></div>
                        </div>
                        <div className="skeleton-card-body">
                            <div className="skeleton skeleton-line"></div>
                            <div className="skeleton skeleton-line skeleton-line-short"></div>
                        </div>
                        <div className="skeleton-card-footer">
                            <div className="skeleton skeleton-button"></div>
                        </div>
                    </div>
                );
            case 'table':
                return (
                    <div className="skeleton-table">
                        <div className="skeleton-table-header">
                            {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton skeleton-table-cell"></div>)}
                        </div>
                        {Array(3).fill(0).map((_, row) => (
                            <div key={row} className="skeleton-table-row">
                                {Array(4).fill(0).map((_, col) => <div key={col} className="skeleton skeleton-table-cell"></div>)}
                            </div>
                        ))}
                    </div>
                );
            case 'invoice':
                return (
                    <div className="skeleton-invoice">
                        <div className="skeleton-invoice-header">
                            <div className="skeleton skeleton-title"></div>
                            <div className="skeleton skeleton-badge"></div>
                        </div>
                        <div className="skeleton-invoice-line-items">
                            {Array(3).fill(0).map((_, i) => (
                                <div key={i} className="skeleton-line-item">
                                    <div className="skeleton skeleton-line"></div>
                                    <div className="skeleton skeleton-line skeleton-line-short"></div>
                                </div>
                            ))}
                        </div>
                        <div className="skeleton-invoice-footer">
                            <div className="skeleton skeleton-line"></div>
                            <div className="skeleton skeleton-button"></div>
                        </div>
                    </div>
                );
            case 'chart':
                return (
                    <div className="skeleton-chart">
                        <div className="skeleton skeleton-chart-bar" style={{ height: '60%' }}></div>
                        <div className="skeleton skeleton-chart-bar" style={{ height: '40%' }}></div>
                        <div className="skeleton skeleton-chart-bar" style={{ height: '80%' }}></div>
                        <div className="skeleton skeleton-chart-bar" style={{ height: '30%' }}></div>
                        <div className="skeleton skeleton-chart-bar" style={{ height: '70%' }}></div>
                    </div>
                );
            default:
                return (
                    <div className="skeleton-default">
                        <div className="skeleton skeleton-line"></div>
                        <div className="skeleton skeleton-line"></div>
                        <div className="skeleton skeleton-line skeleton-line-short"></div>
                    </div>
                );
        }
    };

    return (
        <div className={`loading-skeleton loading-skeleton-${type} ${className}`}>
            {skeletons.map((_, index) => <div key={index} className="loading-skeleton-item">{renderSkeleton()}</div>)}
        </div>
    );
};

export const SkeletonText = ({ width = '100%', height = '16px', className = '' }) => (
    <div className={`skeleton skeleton-text ${className}`} style={{ width, height }}></div>
);

export const SkeletonCircle = ({ size = '40px', className = '' }) => (
    <div className={`skeleton skeleton-circle ${className}`} style={{ width: size, height: size, borderRadius: '50%' }}></div>
);

export const SkeletonButton = ({ width = '100px', height = '36px', className = '' }) => (
    <div className={`skeleton skeleton-button ${className}`} style={{ width, height }}></div>
);

export default LoadingSkeleton;