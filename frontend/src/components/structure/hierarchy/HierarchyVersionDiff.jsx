import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiRefreshCw,
  FiGitBranch,
  FiPlus,
  FiMinus,
  FiEdit,
  FiSearch,
} from 'react-icons/fi';
import { useHierarchy } from '../../../hooks/structure';
import {
  StructureLoading,
  StructureEmptyState,
  StructureStatusBadge,
  StructureSearchBar,
} from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './hierarchy.css';

export const HierarchyVersionDiff = () => {
  const navigate = useNavigate();
  const { id, compareToId } = useParams();
  const [versionAId, setVersionAId] = useState(id);
  const [versionBId, setVersionBId] = useState(compareToId || '');
  const [diffData, setDiffData] = useState(null);
  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { fetchAll, diff, clearError } = useHierarchy({ autoFetch: false });

  useEffect(() => {
    loadVersions();
  }, []);

  useEffect(() => {
    if (versionAId && versionBId) {
      loadDiff();
    }
  }, [versionAId, versionBId]);

  const loadVersions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchAll({ page_size: 100 });
      const items = response.data?.results || response.data || [];
      setVersions(items);
      if (!versionBId && items.length > 0) {
        const current = items.find(v => v.is_current);
        if (current && current.id !== versionAId) {
          setVersionBId(current.id);
        } else if (items.length > 1) {
          setVersionBId(items[0].id);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load versions');
    } finally {
      setIsLoading(false);
    }
  }, [fetchAll, versionAId, versionBId]);

  const loadDiff = useCallback(async () => {
    if (!versionAId || !versionBId || versionAId === versionBId) {
      setDiffData(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await diff(versionAId, versionBId);
      setDiffData(response.data || response);
    } catch (err) {
      setError(err.message || 'Failed to compare versions');
      setDiffData(null);
    } finally {
      setIsLoading(false);
    }
  }, [versionAId, versionBId, diff]);

  const handleBack = useCallback(() => {
    navigate(STRUCTURE_ROUTES.HIERARCHY);
  }, [navigate]);

  const handleRefresh = useCallback(() => {
    loadDiff();
  }, [loadDiff]);

  const handleVersionAChange = useCallback((e) => {
    setVersionAId(e.target.value);
  }, []);

  const handleVersionBChange = useCallback((e) => {
    setVersionBId(e.target.value);
  }, []);

  const handleSwapVersions = useCallback(() => {
    setVersionAId(versionBId);
    setVersionBId(versionAId);
  }, [versionAId, versionBId]);

  const getVersionLabel = (version) => {
    if (!version) return 'Unknown';
    return `${version.name || `v${version.version_number}`} (${version.version_type})`;
  };

  if (isLoading && versions.length === 0) {
    return (
      <div className="hierarchy-diff-loading">
        <StructureLoading text="Loading versions..." />
      </div>
    );
  }

  if (error && versions.length === 0) {
    return (
      <div className="hierarchy-diff-error">
        <p>{error}</p>
        <button onClick={clearError} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (versions.length < 2) {
    return (
      <StructureEmptyState
        title="Need More Versions"
        description="You need at least two hierarchy versions to compare. Capture a new snapshot to get started."
        actionLabel="Capture Snapshot"
        onAction={() => navigate(STRUCTURE_ROUTES.HIERARCHY_CAPTURE)}
      />
    );
  }

  const versionA = versions.find(v => v.id === versionAId);
  const versionB = versions.find(v => v.id === versionBId);

  const renderDiffItem = (label, items, type) => {
    if (!items || items.length === 0) return null;

    const icon = type === 'added' ? <FiPlus size={14} /> :
                 type === 'removed' ? <FiMinus size={14} /> :
                 <FiEdit size={14} />;

    const className = `diff-${type}`;

    return (
      <div className="diff-group">
        <div className="diff-group-header">
          {icon}
          <span>{label} ({items.length})</span>
        </div>
        <ul className="diff-list">
          {items.map((item, index) => (
            <li key={index} className={`diff-item ${className}`}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="hierarchy-diff-container">
      <div className="hierarchy-diff-header">
        <button onClick={handleBack} className="back-btn">
          <FiArrowLeft size={18} />
          Back
        </button>
        <h1>Compare Hierarchy Versions</h1>
      </div>

      <div className="hierarchy-diff-controls">
        <div className="version-select-group">
          <label>Version A</label>
          <select value={versionAId} onChange={handleVersionAChange}>
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                v{v.version_number} - {v.name || v.version_type}
              </option>
            ))}
          </select>
        </div>

        <button onClick={handleSwapVersions} className="swap-btn" title="Swap versions">
          <FiGitBranch size={18} />
        </button>

        <div className="version-select-group">
          <label>Version B</label>
          <select value={versionBId} onChange={handleVersionBChange}>
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                v{v.version_number} - {v.name || v.version_type}
              </option>
            ))}
          </select>
        </div>

        <button onClick={handleRefresh} className="btn btn-secondary" title="Refresh">
          <FiRefreshCw size={16} />
        </button>
      </div>

      {versionA && versionB && (
        <div className="version-info-bar">
          <div className="version-info">
            <span className="version-label">Version A:</span>
            <span className="version-name">v{versionA.version_number} - {versionA.name || versionA.version_type}</span>
            <StructureStatusBadge
              status={versionA.is_current ? 'active' : 'inactive'}
              customLabel={versionA.is_current ? 'Current' : 'Archived'}
              size="sm"
            />
          </div>
          <div className="version-info">
            <span className="version-label">Version B:</span>
            <span className="version-name">v{versionB.version_number} - {versionB.name || versionB.version_type}</span>
            <StructureStatusBadge
              status={versionB.is_current ? 'active' : 'inactive'}
              customLabel={versionB.is_current ? 'Current' : 'Archived'}
              size="sm"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="hierarchy-diff-error-banner">
          <p>{error}</p>
          <button onClick={() => { clearError(); loadDiff(); }} className="btn btn-secondary">
            Dismiss
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="hierarchy-diff-loading-content">
          <StructureLoading text="Comparing versions..." />
        </div>
      ) : diffData ? (
        <div className="hierarchy-diff-body">
          <div className="diff-summary">
            <div className="diff-summary-item">
              <span className="summary-label">Divisions Added</span>
              <span className="summary-value added">{diffData.differences?.add_count || 0}</span>
            </div>
            <div className="diff-summary-item">
              <span className="summary-label">Divisions Removed</span>
              <span className="summary-value removed">{diffData.differences?.remove_count || 0}</span>
            </div>
            <div className="diff-summary-item">
              <span className="summary-label">Divisions Modified</span>
              <span className="summary-value modified">{diffData.differences?.modify_count || 0}</span>
            </div>
            <div className="diff-summary-item">
              <span className="summary-label">Total Changes</span>
              <span className="summary-value total">
                {(diffData.differences?.add_count || 0) + (diffData.differences?.remove_count || 0) + (diffData.differences?.modify_count || 0)}
              </span>
            </div>
          </div>

          <div className="diff-details">
            {renderDiffItem('Divisions Added', diffData.differences?.divisions_added, 'added')}
            {renderDiffItem('Divisions Removed', diffData.differences?.divisions_removed, 'removed')}
            {renderDiffItem('Divisions Modified', diffData.differences?.divisions_modified, 'modified')}
          </div>
        </div>
      ) : (
        <div className="hierarchy-diff-empty">
          <p>Select two different versions to compare their differences.</p>
        </div>
      )}
    </div>
  );
};

export default HierarchyVersionDiff;
