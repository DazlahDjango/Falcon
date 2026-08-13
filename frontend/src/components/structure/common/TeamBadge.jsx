import React from 'react';

const TeamBadge = ({ team, size = 'md', showCode = true, className = '' }) => {
  if (!team) {
    return <span className={`structure-badge badge-team ${className}`}>N/A</span>;
  }

  const teamName = typeof team === 'object' ? (team.name || team.code || '') : String(team);
  const teamCode = typeof team === 'object' ? team.code : null;

  const sizeClass = {
    sm: 'structure-badge-sm',
    md: '',
    lg: 'structure-badge-lg',
  }[size] || '';

  return (
    <span className={`structure-badge badge-team ${sizeClass} ${className}`}>
      {showCode && teamCode && <span className="font-mono">{teamCode}</span>}
      {showCode && teamCode && teamName && <span className="mx-0.5">•</span>}
      <span>{teamName}</span>
    </span>
  );
};

export default TeamBadge;
