// frontend/src/pages/dashboard/ManagerDashboard/TeamMembersTable.jsx

import React, { useState } from 'react';
import { DashboardCard, TrafficLight, StatusBadge } from '../../../components/dashboard/common';

export const TeamMembersTable = ({ data, loading, onRefresh, onDrillDown }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const teamMembers = data || [];

  const filteredMembers = teamMembers.filter(member =>
    member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    if (sortBy === 'score') {
      aVal = a.overall_score || 0;
      bVal = b.overall_score || 0;
    }
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return <span className="sort-icon">↕️</span>;
    return sortOrder === 'asc' ? <span className="sort-icon">↑</span> : <span className="sort-icon">↓</span>;
  };

  return (
    <DashboardCard 
      title="Team Members" 
      loading={loading}
      onRefresh={onRefresh}
    >
      <div className="table-toolbar">
        <input
          type="text"
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <div className="table-info">
          Showing {sortedMembers.length} of {teamMembers.length} members
        </div>
      </div>
      
      <div className="team-table-container">
        <table className="team-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')}>
                Name <SortIcon column="name" />
              </th>
              <th onClick={() => handleSort('role')}>
                Role <SortIcon column="role" />
              </th>
              <th onClick={() => handleSort('score')}>
                Score <SortIcon column="score" />
              </th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedMembers.map((member) => (
              <tr key={member.user_id} className="team-member-row">
                <td className="member-name">
                  <div className="member-avatar">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {member.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="member-info">
                    <div className="member-fullname">{member.name}</div>
                    <div className="member-email">{member.email}</div>
                  </div>
                </td>
                <td className="member-role">
                  <StatusBadge status={member.role} variant="role" />
                </td>
                <td className="member-score">
                  {member.overall_score ? (
                    <span className={`score-value ${member.traffic_light}`}>
                      {member.overall_score}%
                    </span>
                  ) : (
                    <span className="score-na">N/A</span>
                  )}
                </td>
                <td className="member-status">
                  <TrafficLight status={member.traffic_light} showLabel />
                </td>
                <td className="member-actions">
                  <button 
                    className="drill-down-btn"
                    onClick={() => onDrillDown?.(member.user_id)}
                    title="View Details"
                  >
                    👁️
                  </button>
                  {member.has_pending_approval && (
                    <span className="pending-badge" title="Pending Approval">
                      ⏳
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
};

export default TeamMembersTable;