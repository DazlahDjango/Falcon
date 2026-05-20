import React from 'react';
import PropTypes from 'prop-types';

export const LoadingSkeleton = ({ type = 'card', count = 1, className = '' }) => {
  const renderCardSkeleton = () => (
    <div className="skeleton-card" style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '12px', background: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div className="skeleton" style={{ width: '60%', height: '20px', background: '#e5e7eb', borderRadius: '4px' }} />
        <div className="skeleton" style={{ width: '40px', height: '20px', background: '#e5e7eb', borderRadius: '4px' }} />
      </div>
      <div className="skeleton" style={{ width: '100%', height: '100px', background: '#e5e7eb', borderRadius: '8px', marginBottom: '12px' }} />
      <div className="skeleton" style={{ width: '80%', height: '12px', background: '#e5e7eb', borderRadius: '4px' }} />
    </div>
  );

  const renderTableSkeleton = () => (
    <div className="skeleton-table">
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton" style={{ flex: 1, height: '32px', background: '#e5e7eb', borderRadius: '4px' }} />
        ))}
      </div>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
          {[1, 2, 3, 4].map(j => (
            <div key={j} className="skeleton" style={{ flex: 1, height: '20px', background: '#e5e7eb', borderRadius: '4px' }} />
          ))}
        </div>
      ))}
    </div>
  );

  const renderChartSkeleton = () => (
    <div className="skeleton-chart" style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '12px', background: 'white' }}>
      <div className="skeleton" style={{ width: '40%', height: '20px', background: '#e5e7eb', borderRadius: '4px', marginBottom: '24px' }} />
      <div className="skeleton" style={{ width: '100%', height: '200px', background: '#e5e7eb', borderRadius: '8px' }} />
    </div>
  );

  const renderListSkeleton = () => (
    <div className="skeleton-list">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
          <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e5e7eb' }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ width: '60%', height: '16px', background: '#e5e7eb', borderRadius: '4px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ width: '40%', height: '12px', background: '#e5e7eb', borderRadius: '4px' }} />
          </div>
        </div>
      ))}
    </div>
  );

  const skeletonMap = {
    card: renderCardSkeleton,
    table: renderTableSkeleton,
    chart: renderChartSkeleton,
    list: renderListSkeleton
  };

  const renderSkeleton = skeletonMap[type] || renderCardSkeleton;

  return (
    <div className={`loading-skeleton loading-skeleton--${type} ${className}`} style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
      {Array.from({ length: count }).map((_, i) => (
        <React.Fragment key={i}>{renderSkeleton()}</React.Fragment>
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .loading-skeleton {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

LoadingSkeleton.propTypes = {
  type: PropTypes.oneOf(['card', 'table', 'chart', 'list']),
  count: PropTypes.number,
  className: PropTypes.string
};