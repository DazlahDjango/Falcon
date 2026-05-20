import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FiSearch, FiFilter, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { DashboardCard } from '../common/DashboardCard';
import { TeamMemberCard } from './TeamMemberCard';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';

export const TeamListView = ({ 
  data, 
  loading = false, 
  error = null,
  title = 'Team Members',
  onRefresh,
  onMemberClick,
  itemsPerPage = 10,
  showSearch = true,
  showFilters = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredAndSortedData = useMemo(() => {
    if (!data || !data.length) return [];
    
    let filtered = [...data];
    
    if (searchTerm) {
      filtered = filtered.filter(member => 
        (member.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         member.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         member.title?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(member => member.traffic_light === filterStatus);
    }
    
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return (a.first_name || '').localeCompare(b.first_name || '');
      }
      if (sortBy === 'score') {
        return (b.aggregated_score || 0) - (a.aggregated_score || 0);
      }
      if (sortBy === 'reports') {
        return (b.direct_report_count || 0) - (a.direct_report_count || 0);
      }
      return 0;
    });
    
    return filtered;
  }, [data, searchTerm, sortBy, filterStatus]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(start, start + itemsPerPage);
  }, [filteredAndSortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  if (loading) {
    return <LoadingSkeleton type="list" count={5} />;
  }

  if (error) {
    return (
      <DashboardCard title={title} error={error} onRefresh={onRefresh}>
        <EmptyState title="Failed to load team members" message={error} />
      </DashboardCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <DashboardCard title={title} onRefresh={onRefresh}>
        <EmptyState title="No Team Members" message="No team members found." />
      </DashboardCard>
    );
  }

  return (
    <DashboardCard 
      title={title} 
      onRefresh={onRefresh}
      actions={
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {showSearch && (
            <div style={{ position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                style={{
                  padding: '6px 12px 6px 32px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '13px',
                  width: '200px'
                }}
              />
            </div>
          )}
          
          {showFilters && (
            <>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '13px',
                  background: 'white'
                }}
              >
                <option value="name">Sort by Name</option>
                <option value="score">Sort by Score</option>
                <option value="reports">Sort by Reports</option>
              </select>
              
              <select 
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '13px',
                  background: 'white'
                }}
              >
                <option value="all">All Status</option>
                <option value="green">On Track</option>
                <option value="yellow">At Risk</option>
                <option value="red">Off Track</option>
              </select>
            </>
          )}
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {paginatedData.map((member) => (
          <TeamMemberCard 
            key={member.id} 
            member={member} 
            onClick={onMemberClick}
          />
        ))}
      </div>
      
      {totalPages > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} of {filteredAndSortedData.length}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: 'white',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              <FiChevronLeft size={16} />
            </button>
            <span style={{ padding: '6px 12px', fontSize: '13px' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: 'white',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
      
      {filteredAndSortedData.length === 0 && (
        <EmptyState 
          title="No matching members" 
          message={`No team members found matching your criteria.`}
        />
      )}
    </DashboardCard>
  );
};

TeamListView.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    email: PropTypes.string,
    title: PropTypes.string,
    role: PropTypes.string,
    department: PropTypes.string,
    traffic_light: PropTypes.string,
    aggregated_score: PropTypes.number,
    direct_report_count: PropTypes.number
  })),
  loading: PropTypes.bool,
  error: PropTypes.string,
  title: PropTypes.string,
  onRefresh: PropTypes.func,
  onMemberClick: PropTypes.func,
  itemsPerPage: PropTypes.number,
  showSearch: PropTypes.bool,
  showFilters: PropTypes.bool
};