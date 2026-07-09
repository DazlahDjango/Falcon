import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiRefreshCw,
  FiUser,
  FiUsers,
  FiChevronRight,
  FiSearch,
} from 'react-icons/fi';
import { useReportingLines } from '../../../hooks/structure';
import {
  StructureLoading,
  StructureStatusBadge,
  StructureEmptyState,
  StructureSearchBar,
} from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './reporting.css';

export const ReportingChain = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [chainData, setChainData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { fetchChain, clearError } = useReportingLines({ autoFetch: false });

  const handleSearch = useCallback(async (value) => {
    setSearchValue(value);
    if (!value || value.length < 3) {
      setChainData(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchChain(value);
      setChainData(response.data || response);
      setUserId(value);
    } catch (err) {
      setError(err.message || 'Failed to fetch reporting chain');
      setChainData(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchChain]);

  const handleRefresh = useCallback(() => {
    if (userId) {
      handleSearch(userId);
    }
  }, [userId, handleSearch]);

  const handleBack = useCallback(() => {
    navigate(STRUCTURE_ROUTES.REPORTING_LINES);
  }, [navigate]);

  const renderChainNode = (node, index, isLast) => {
    if (!node) return null;

    return (
      <div className="chain-node" key={index}>
        <div className="chain-node-content">
          <div className="node-avatar">
            <FiUser size={24} />
          </div>
          <div className="node-info">
            <div className="node-name">{node.user_name || node.user_id}</div>
            <div className="node-details">
              <span className="node-position">{node.position_title || 'Position'}</span>
              {node.is_manager && (
                <StructureStatusBadge status="active" customLabel="Manager" size="sm" />
              )}
              {node.is_executive && (
                <StructureStatusBadge status="active" customLabel="Executive" size="sm" />
              )}
            </div>
          </div>
          {!isLast && (
            <div className="node-arrow">
              <FiChevronRight size={24} />
            </div>
          )}
        </div>
        {!isLast && <div className="chain-connector" />}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="reporting-chain-loading">
        <StructureLoading text="Loading reporting chain..." />
      </div>
    );
  }

  return (
    <div className="reporting-chain-container">
      <div className="reporting-chain-header">
        <button onClick={handleBack} className="back-btn">
          <FiArrowLeft size={18} />
          Back
        </button>
        <h1>Reporting Chain</h1>
      </div>

      <div className="reporting-chain-search">
        <StructureSearchBar
          value={searchValue}
          onChange={handleSearch}
          placeholder="Enter user ID to view reporting chain..."
          debounce={500}
          autoFocus
        />
        <button onClick={handleRefresh} className="btn btn-secondary" title="Refresh">
          <FiRefreshCw size={16} />
        </button>
      </div>

      {error && (
        <div className="reporting-chain-error">
          <p>{error}</p>
          <button onClick={clearError} className="btn btn-secondary">
            Dismiss
          </button>
        </div>
      )}

      {chainData ? (
        <div className="reporting-chain-body">
          <div className="chain-summary">
            <div className="summary-item">
              <span className="summary-label">User ID</span>
              <span className="summary-value">{userId}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Management Level</span>
              <span className="summary-value">{chainData.management_level || chainData.managers?.length || 0}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Direct Reports</span>
              <span className="summary-value">{chainData.direct_report_count || 0}</span>
            </div>
          </div>

          <div className="chain-section">
            <h3>Managers (Above)</h3>
            {chainData.managers && chainData.managers.length > 0 ? (
              <div className="chain-list">
                {chainData.managers.map((manager, index) =>
                  renderChainNode(manager, index, index === chainData.managers.length - 1)
                )}
              </div>
            ) : (
              <p className="chain-empty-message">No managers above this employee</p>
            )}
          </div>

          <div className="chain-section">
            <h3>Subordinates (Below)</h3>
            {chainData.subordinates && chainData.subordinates.length > 0 ? (
              <div className="chain-list">
                {chainData.subordinates.map((subordinate, index) =>
                  renderChainNode(subordinate, index, index === chainData.subordinates.length - 1)
                )}
              </div>
            ) : (
              <p className="chain-empty-message">No subordinates below this employee</p>
            )}
          </div>
        </div>
      ) : (
        !isLoading && (
          <StructureEmptyState
            title="Search for Reporting Chain"
            description="Enter a user ID above to view their reporting chain."
            icon={FiSearch}
          />
        )
      )}
    </div>
  );
};

export default ReportingChain;
