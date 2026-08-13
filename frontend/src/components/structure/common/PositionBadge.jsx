import React from 'react';

const PositionBadge = ({ position, size = 'md', showLevel = false, className = '' }) => {
  if (!position) {
    return <span className={`structure-badge badge-position ${className}`}>N/A</span>;
  }

  const title = typeof position === 'object' ? (position.title || position.name || position.job_title || '') : String(position);
  const jobCode = typeof position === 'object' ? position.job_code : null;
  const level = typeof position === 'object' ? position.level : null;
  const isVacant = typeof position === 'object' && position.current_incumbents_count === 0;

  const sizeClass = {
    sm: 'structure-badge-sm',
    md: '',
    lg: 'structure-badge-lg',
  }[size] || '';

  const vacantClass = isVacant ? 'badge-position-vacant' : '';

  return (
    <span className={`structure-badge badge-position ${vacantClass} ${sizeClass} ${className}`}>
      {jobCode && <span className="font-mono">{jobCode}</span>}
      {jobCode && title && <span className="mx-0.5">•</span>}
      <span>{title}</span>
      {showLevel && level && (
        <>
          <span className="mx-0.5">•</span>
          <span className="text-xs">L{level}</span>
        </>
      )}
      {isVacant && (
        <>
          <span className="mx-0.5">•</span>
          <span className="text-xs">Vacant</span>
        </>
      )}
    </span>
  );
};

export default PositionBadge;
