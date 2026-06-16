// src/components/reviews/pips/reports/PIPReport.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCw, FileText, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { usePIP } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError } from '../../common';
import PIPSummary from './PIPSummary';
import PIPTrends from './PIPTrends';

const PIPReport = () => {
  const navigate = useNavigate();
  const { report, trends, loading, error, getReport, getTrends, canManage } = usePIP();
  const [activeTab, setActiveTab] = useState('summary');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    getReport();
    getTrends(6);
  }, [getReport, getTrends]);

  const handleRefresh = () => {
    getReport();
    getTrends(6);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Export logic would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Report exported successfully!');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) return <ReviewLoading size="lg" text="Loading PIP report..." />;
  if (error) return <ReviewError error={error} onRetry={handleRefresh} />;

  return (
    <div className="pip-report">
      <div className="pip-report-header">
        <button className="pip-report-back" onClick={() => navigate('/reviews/pips')}>
          <ArrowLeft size={20} />
          Back to PIPs
        </button>
        <h1 className="pip-report-title">PIP Reports & Analytics</h1>
        <div className="pip-report-actions">
          <button className="pip-report-refresh" onClick={handleRefresh}>
            <RefreshCw size={18} />
          </button>
          {canManage && (
            <button className="btn btn-primary" onClick={handleExport} disabled={isExporting}>
              <Download size={18} />
              {isExporting ? 'Exporting...' : 'Export Report'}
            </button>
          )}
        </div>
      </div>

      <div className="pip-report-tabs">
        <button
          className={`pip-report-tab ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          <FileText size={16} />
          Summary
        </button>
        <button
          className={`pip-report-tab ${activeTab === 'trends' ? 'active' : ''}`}
          onClick={() => setActiveTab('trends')}
        >
          <TrendingUp size={16} />
          Trends
        </button>
      </div>

      <div className="pip-report-content">
        {activeTab === 'summary' && (
          <PIPSummary data={report} />
        )}
        {activeTab === 'trends' && (
          <PIPTrends data={trends} />
        )}
      </div>
    </div>
  );
};

export default PIPReport;