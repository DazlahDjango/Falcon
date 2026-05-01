import React from 'react';

const TeamBadge = ({ team, size = 'md', showCode = true, className = '' }) => {
  const sizeClass = {
    sm: 'structure-badge-sm',
    md: '',
    lg: 'structure-badge-lg',
  }[size];
  if (!team) {
    return <span className={`structure-badge badge-team ${sizeClass} ${className}`}>N/A</span>;
  }
  return (
    <span className={`structure-badge badge-team ${sizeClass} ${className}`}>
      {showCode && <span className="font-mono">{team.code}</span>}
      {showCode && team.name && <span className="mx-0.5">•</span>}
      <span>{team.name}</span>
    </span>
  );
};

export default TeamBadge;