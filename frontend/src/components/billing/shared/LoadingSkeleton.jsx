import React from 'react';
import PropTypes from 'prop-types';

export const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
    const skeletons = {
        card: (
            <div className="skeleton-card">
                <div className="skeleton-header"></div>
                <div className="skeleton-body">
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line short"></div>
                    <div className="skeleton-line"></div>
                </div>
            </div>
        ),
        list: (
            <div className="skeleton-list-item">
                <div className="skeleton-avatar"></div>
                <div className="skeleton-content">
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line short"></div>
                </div>
            </div>
        ),
        table: (
            <div className="skeleton-table">
                <div className="skeleton-table-header">
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line"></div>
                </div>
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="skeleton-table-row">
                        <div className="skeleton-line"></div>
                        <div className="skeleton-line"></div>
                        <div className="skeleton-line"></div>
                    </div>
                ))}
            </div>
        ),
        metric: (
            <div className="skeleton-metric">
                <div className="skeleton-line short"></div>
                <div className="skeleton-line large"></div>
            </div>
        ),
    };

    return (
        <div className="skeleton-container">
            {[...Array(count)].map((_, i) => (
                <React.Fragment key={i}>
                    {skeletons[type]}
                </React.Fragment>
            ))}
        </div>
    );
};

LoadingSkeleton.propTypes = {
    type: PropTypes.oneOf(['card', 'list', 'table', 'metric']),
    count: PropTypes.number,
};

export default LoadingSkeleton;