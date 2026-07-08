import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiRefreshCw,
  FiUsers,
  FiBriefcase,
  FiMapPin,
  FiDollarSign,
  FiGitBranch,
  FiLayers,
  FiDatabase,
  FiSearch,
} from 'react-icons/fi';
import { useStructureReferenceData } from '../../../hooks/structure';
import {
  StructureLoading,
  StructureEmptyState,
  StructureStatusBadge,
  StructureSearchBar,
} from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './settings.css';

export const ReferenceData = () => {
  const navigate = useNavigate();
  const { data, counts, orgUnits, users, isLoading, error, fetch, clearError } = useStructureReferenceData({ autoFetch: true });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrgUnits, setFilteredOrgUnits] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    if (orgUnits) {
      setFilteredOrgUnits(orgUnits);
    }
    if (users) {
      setFilteredUsers(users);
    }
  }, [orgUnits, users]);

  useEffect(() => {
    if (orgUnits && searchTerm) {
      const filtered = orgUnits.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOrgUnits(filtered);
    } else if (orgUnits) {
      setFilteredOrgUnits(orgUnits);
    }
  }, [searchTerm, orgUnits]);

  const handleBack = useCallback(() => {
    navigate(STRUCTURE_ROUTES.BASE);
  }, [navigate]);

  const handleRefresh = useCallback(() => {
    fetch();
  }, [fetch]);

  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const StatCard = ({ icon: Icon, label, value, color = 'primary' }) => (
    <div className={`ref-stat-card ref-stat-card-${color}`}>
      <div className="ref-stat-icon">
        <Icon size={20} />
      </div>
      <div>
        <span className="ref-stat-label">{label}</span>
        <span className="ref-stat-value">{value}</span>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="reference-loading">
        <StructureLoading text="Loading reference data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="reference-error">
        <p>{error}</p>
        <button onClick={clearError} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  const getLevelColor = (level) => {
    const colors = {
      division: '#3b82f6',
      department: '#10b981',
      section: '#8b5cf6',
      unit: '#f59e0b',
    };
    return colors[level] || '#6b7280';
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'division': return <FiGitBranch size={14} />;
      case 'department': return <FiLayers size={14} />;
      case 'section': return <FiBriefcase size={14} />;
      default: return <FiMapPin size={14} />;
    }
  };

  return (
    <div className="reference-container">
      <div className="reference-header">
        <button onClick={handleBack} className="back-btn">
          <FiArrowLeft size={18} />
          Back
        </button>
        <h1>Reference Data</h1>
        <button onClick={handleRefresh} className="btn btn-secondary" title="Refresh">
          <FiRefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="reference-body">
        <div className="ref-stats-grid">
          <StatCard
            icon={FiLayers}
            label="Total Organizational Units"
            value={counts?.organizational_units || 0}
            color="primary"
          />
          <StatCard
            icon={FiGitBranch}
            label="Divisions"
            value={counts?.divisions || 0}
            color="info"
          />
          <StatCard
            icon={FiLayers}
            label="Departments"
            value={counts?.departments || 0}
            color="success"
          />
          <StatCard
            icon={FiBriefcase}
            label="Sections"
            value={counts?.sections || 0}
            color="warning"
          />
          <StatCard
            icon={FiMapPin}
            label="Units"
            value={counts?.units || 0}
            color="secondary"
          />
          <StatCard
            icon={FiUsers}
            label="Users"
            value={counts?.users || 0}
            color="primary"
          />
        </div>

        <div className="ref-data-section">
          <div className="ref-section-header">
            <h2>Organizational Units</h2>
            <span className="ref-count">{filteredOrgUnits?.length || 0} records</span>
          </div>
          <div className="ref-search-wrapper">
            <StructureSearchBar
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search organizational units..."
              debounce={300}
            />
          </div>
          <div className="ref-table-wrapper">
            <table className="ref-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Level</th>
                  <th>Parent</th>
                  <th>Depth</th>
                  <th>Path</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrgUnits && filteredOrgUnits.length > 0 ? (
                  filteredOrgUnits.slice(0, 100).map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className="ref-code">{item.code}</span>
                      </td>
                      <td>{item.name}</td>
                      <td>
                        <span
                          className="ref-level-badge"
                          style={{ backgroundColor: getLevelColor(item.level) }}
                        >
                          {getLevelIcon(item.level)}
                          {item.level || 'unit'}
                        </span>
                      </td>
                      <td>{item.parent_id || '-'}</td>
                      <td>{item.depth || 0}</td>
                      <td className="ref-path">{item.path || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="ref-empty">
                      No organizational units found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {filteredOrgUnits && filteredOrgUnits.length > 100 && (
              <div className="ref-more">Showing 100 of {filteredOrgUnits.length} records</div>
            )}
          </div>
        </div>

        <div className="ref-data-section">
          <div className="ref-section-header">
            <h2>Users</h2>
            <span className="ref-count">{users?.length || 0} records</span>
          </div>
          <div className="ref-table-wrapper">
            <table className="ref-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                </tr>
              </thead>
              <tbody>
                {users && users.length > 0 ? (
                  users.slice(0, 100).map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className="ref-code">{item.id?.substring(0, 8)}...</span>
                      </td>
                      <td>{item.email}</td>
                      <td>{item.first_name || '-'}</td>
                      <td>{item.last_name || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="ref-empty">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {users && users.length > 100 && (
              <div className="ref-more">Showing 100 of {users.length} records</div>
            )}
          </div>
        </div>

        <div className="ref-data-section">
          <div className="ref-section-header">
            <h2>Data Summary</h2>
          </div>
          <div className="ref-summary-grid">
            <div className="ref-summary-item">
              <span className="summary-label">Generated At</span>
              <span className="summary-value">
                {data?.generated_at ? new Date(data.generated_at).toLocaleString() : '-'}
              </span>
            </div>
            <div className="ref-summary-item">
              <span className="summary-label">Tenant ID</span>
              <span className="summary-value">{data?.tenant_id || '-'}</span>
            </div>
            <div className="ref-summary-item">
              <span className="summary-label">Total Records</span>
              <span className="summary-value">
                {(orgUnits?.length || 0) + (users?.length || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferenceData;