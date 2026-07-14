import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiRefreshCw,
  FiDollarSign,
  FiPercent,
  FiPieChart,
  FiBarChart2,
} from 'react-icons/fi';
import { useCostCenters } from '../../../hooks/structure';
import {
  StructureLoading,
  StructureEmptyState,
  StructureStatusBadge,
} from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './costcenter.css';

export const CostCenterUtilization = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [utilizationData, setUtilizationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { currentItem, fetchById, fetchUtilization, clearError } = useCostCenters({ autoFetch: false });

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [detailResponse, utilizationResponse] = await Promise.all([
        fetchById(id),
        fetchUtilization(id),
      ]);
      setUtilizationData(utilizationResponse.data || utilizationResponse);
    } catch (err) {
      setError(err.message || 'Failed to load utilization data');
    } finally {
      setIsLoading(false);
    }
  }, [id, fetchById, fetchUtilization]);

  const handleRefresh = useCallback(() => {
    loadData();
  }, [loadData]);

  const handleBack = useCallback(() => {
    navigate(STRUCTURE_ROUTES.COST_CENTERS);
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="costcenter-utilization-loading">
        <StructureLoading text="Loading utilization data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="costcenter-utilization-error">
        <p>{error}</p>
        <button onClick={() => { clearError(); loadData(); }} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (!currentItem) {
    return (
      <StructureEmptyState
        title="Cost Center Not Found"
        description="The cost center you are looking for does not exist."
        actionLabel="Back to Cost Centers"
        onAction={handleBack}
      />
    );
  }

  const getUtilizationColor = (percentage) => {
    if (percentage < 60) return 'success';
    if (percentage < 80) return 'warning';
    return 'danger';
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return `$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const utilization = utilizationData?.utilization || {};
  const usedBudget = utilization.used_budget || 0;
  const totalBudget = utilization.total_budget || currentItem.budget_amount || 0;
  const utilizationPercentage = totalBudget > 0 ? (usedBudget / totalBudget) * 100 : 0;

  return (
    <div className="costcenter-utilization-container">
      <div className="costcenter-utilization-header">
        <button onClick={handleBack} className="back-btn">
          <FiArrowLeft size={18} />
          Back
        </button>
        <h1>Budget Utilization: {currentItem.name}</h1>
        <StructureStatusBadge
          status={currentItem.is_active ? 'active' : 'inactive'}
          size="lg"
        />
        <button onClick={handleRefresh} className="btn btn-secondary" title="Refresh">
          <FiRefreshCw size={16} />
        </button>
      </div>

      <div className="costcenter-utilization-body">
        <div className="utilization-summary-grid">
          <div className="utilization-card">
            <div className="utilization-card-icon">
              <FiDollarSign size={24} />
            </div>
            <div className="utilization-card-content">
              <span className="utilization-card-label">Total Budget</span>
              <span className="utilization-card-value">{formatCurrency(totalBudget)}</span>
            </div>
          </div>

          <div className="utilization-card">
            <div className="utilization-card-icon">
              <FiBarChart2 size={24} />
            </div>
            <div className="utilization-card-content">
              <span className="utilization-card-label">Used Budget</span>
              <span className="utilization-card-value">{formatCurrency(usedBudget)}</span>
            </div>
          </div>

          <div className="utilization-card">
            <div className="utilization-card-icon">
              <FiPieChart size={24} />
            </div>
            <div className="utilization-card-content">
              <span className="utilization-card-label">Remaining Budget</span>
              <span className="utilization-card-value">{formatCurrency(totalBudget - usedBudget)}</span>
            </div>
          </div>

          <div className={`utilization-card utilization-card-${getUtilizationColor(utilizationPercentage)}`}>
            <div className="utilization-card-icon">
              <FiPercent size={24} />
            </div>
            <div className="utilization-card-content">
              <span className="utilization-card-label">Utilization Rate</span>
              <span className="utilization-card-value">
                {utilizationPercentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="utilization-progress-section">
          <h3>Budget Utilization Progress</h3>
          <div className="progress-container">
            <div className="progress-bar-wrapper">
              <div
                className={`progress-bar progress-bar-${getUtilizationColor(utilizationPercentage)}`}
                style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
              />
            </div>
            <div className="progress-labels">
              <span>0%</span>
              <span className="progress-current">{utilizationPercentage.toFixed(1)}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        <div className="utilization-details-section">
          <h3>Utilization Details</h3>
          <div className="utilization-details-grid">
            <div className="detail-item">
              <span className="detail-label">Cost Center Code</span>
              <span className="detail-value">{currentItem.code}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Category</span>
              <span className="detail-value">{currentItem.category || 'operational'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Fiscal Year</span>
              <span className="detail-value">{currentItem.fiscal_year || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Allocation</span>
              <span className="detail-value">{currentItem.allocation_percentage || 0}%</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Shared Service</span>
              <span className="detail-value">
                <StructureStatusBadge                  status={currentItem.is_shared ? 'active' : 'inactive'}
                  customLabel={currentItem.is_shared ? 'Yes' : 'No'}
                  size="sm"
                />
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Requires Approval</span>
              <span className="detail-value">
                <StructureStatusBadge
                  status={currentItem.requires_budget_approval ? 'active' : 'inactive'}
                  customLabel={currentItem.requires_budget_approval ? 'Yes' : 'No'}
                  size="sm"
                />
              </span>
            </div>
          </div>
        </div>

        {utilization.breakdown && Object.keys(utilization.breakdown).length > 0 && (
          <div className="utilization-breakdown-section">
            <h3>Breakdown by Category</h3>
            <div className="breakdown-grid">
              {Object.entries(utilization.breakdown).map(([key, value]) => (
                <div key={key} className="breakdown-item">
                  <span className="breakdown-label">{key}</span>
                  <span className="breakdown-value">{formatCurrency(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CostCenterUtilization;
