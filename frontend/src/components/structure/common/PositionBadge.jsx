import React from 'react';

const PositionBadge = ({ position, size = 'md', showLevel = false, className = '' }) => {
  const sizeClass = {
    sm: 'structure-badge-sm',
    md: '',
    lg: 'structure-badge-lg',
  }[size];
  if (!position) {
    return <span className={`structure-badge badge-position ${sizeClass} ${className}`}>N/A</span>;
  }
  const isVacant = position.current_incumbents_count === 0;
  const vacantClass = isVacant ? 'badge-position-vacant' : '';
  return (
    <span className={`structure-badge badge-position ${vacantClass} ${sizeClass} ${className}`}>
      <span className="font-mono">{position.job_code}</span>
      <span className="mx-0.5">•</span>
      <span>{position.title}</span>
      {showLevel && position.level && (
        <>
          <span className="mx-0.5">•</span>
          <span className="text-xs">L{position.level}</span>
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