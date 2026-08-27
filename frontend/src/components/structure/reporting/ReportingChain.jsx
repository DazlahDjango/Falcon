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
} from '../common';
import UserSelector from '../../accounts/users/UserSelector';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './reporting.css';

export const ReportingChain = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [chainData, setChainData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { fetchChain, clearError } = useReportingLines({ autoFetch: false });

  const handleSelectUser = useCallback(async (value) => {
    setUserId(value || '');
    if (!value) {
      setChainData(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const resultAction = await fetchChain(value);
      const data = resultAction?.payload?.data || resultAction?.payload || resultAction?.data || resultAction;
      setChainData(data);
    } catch (err) {
      setError(err?.displayMessage || err?.message || 'Failed to fetch reporting chain');
      setChainData(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchChain]);

  const handleRefresh = useCallback(() => {
    if (userId) {
      handleSelectUser(userId);
    }
  }, [userId, handleSelectUser]);

  const handleBack = useCallback(() => {
    navigate(STRUCTURE_ROUTES.REPORTING_LINES);
  }, [navigate]);

  const renderChainNode = (node, index, isLast) => {
    if (!node) return null;

    return (
      <div className="chain-node" key={index} style={{ marginBottom: '16px' }}>
        <div className="chain-node-content" style={{ display: 'flex', alignItems: 'center', padding: '16px', background: 'var(--bg-surface, #fff)', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="node-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary-color, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px' }}>
            <FiUser size={20} />
          </div>
          <div className="node-info" style={{ flex: 1 }}>
            <div className="node-name" style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary, #1e293b)' }}>
              {node.user_name || node.user_email || node.user_id}
            </div>
            <div className="node-details" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', fontSize: '13px', color: 'var(--text-secondary, #64748b)' }}>
              <span className="node-position">{node.position_title || node.position || 'Position'}</span>
              {node.department_name && <span>• {node.department_name}</span>}
              {node.division_name && <span>• {node.division_name}</span>}
              {node.is_manager && (
                <StructureStatusBadge status="active" customLabel="Manager" size="sm" />
              )}
              {node.is_executive && (
                <StructureStatusBadge status="active" customLabel="Executive" size="sm" />
              )}
            </div>
          </div>
          {!isLast && (
            <div className="node-arrow" style={{ color: 'var(--text-muted, #94a3b8)', marginLeft: '12px' }}>
              <FiChevronRight size={20} />
            </div>
          )}
        </div>
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

  const chainList = Array.isArray(chainData) ? chainData : (chainData?.managers || chainData?.chain || []);

  return (
    <div className="reporting-chain-container">
      <div className="reporting-chain-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button onClick={handleBack} className="back-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FiArrowLeft size={18} />
          Back
        </button>
        <h1 style={{ margin: 0 }}>Reporting Chain of Command</h1>
      </div>

      <div className="reporting-chain-search" style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
        <div style={{ flex: 1, maxWidth: '400px' }}>
          <UserSelector
            value={userId}
            onChange={handleSelectUser}
            placeholder="Select staff member to view chain of command..."
            className="w-full"
          />
        </div>
        <button onClick={handleRefresh} className="btn btn-secondary" title="Refresh">
          <FiRefreshCw size={16} />
        </button>
      </div>

      {error && (
        <div className="reporting-chain-error" style={{ padding: '12px 16px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '6px', marginBottom: '16px' }}>
          <p style={{ margin: 0 }}>{typeof error === 'object' ? (error?.message || error?.detail || JSON.stringify(error)) : String(error || '')}</p>
          <button onClick={clearError} className="btn btn-secondary" style={{ marginTop: '8px' }}>
            Dismiss
          </button>
        </div>
      )}

      {chainData ? (
        <div className="reporting-chain-body">
          <div className="chain-summary" style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div className="summary-item" style={{ padding: '12px 20px', background: 'var(--bg-surface, #fff)', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span className="summary-label" style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Chain Depth</span>
              <span className="summary-value" style={{ fontSize: '18px', fontWeight: 'bold' }}>{chainList.length} Levels to CEO</span>
            </div>
          </div>

          <div className="chain-section">
            <h3 style={{ marginBottom: '16px' }}>Chain of Command Hierarchy (Upwards to CEO)</h3>
            {chainList.length > 0 ? (
              <div className="chain-list">
                {chainList.map((node, index) =>
                  renderChainNode(node, index, index === chainList.length - 1)
                )}
              </div>
            ) : (
              <p className="chain-empty-message" style={{ color: '#64748b', fontStyle: 'italic' }}>This employee is at the top of the organization (e.g. CEO / Board).</p>
            )}
          </div>
        </div>
      ) : (
        !isLoading && (
          <StructureEmptyState
            title="Select Employee for Reporting Chain"
            description="Select any staff member from the dropdown above to view their upward chain of command to the CEO."
            icon={FiSearch}
          />
        )
      )}
    </div>
  );
};

export default ReportingChain;
