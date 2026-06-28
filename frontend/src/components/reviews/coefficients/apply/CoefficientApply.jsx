// src/components/reviews/coefficients/apply/CoefficientApply.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { useCoefficients } from '../../../../hooks/reviews';
import { ReviewLoading } from '../../common';
import CoefficientCalculator from './CoefficientCalculator';

const CoefficientApply = () => {
  const navigate = useNavigate();
  const { apply, applyResult, loading, resetApply } = useCoefficients();
  const [score, setScore] = useState('');
  const [coefficientValue, setCoefficientValue] = useState(1.0);
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    if (!score) return;
    setIsApplying(true);
    try {
      await apply(Number(score), coefficientValue);
    } finally {
      setIsApplying(false);
    }
  };

  const handleReset = () => {
    setScore('');
    setCoefficientValue(1.0);
    resetApply();
  };

  const result = applyResult;
  const adjustedScore = result?.adjusted_score;
  const originalScore = result?.original_score;
  const coefficient = result?.coefficient;

  return (
    <div className="coefficient-apply">
      <div className="coefficient-apply-header">
        <button className="coefficient-apply-back" onClick={() => navigate('/reviews/coefficients')}>
          <ArrowLeft size={20} />
          Back to Coefficients
        </button>
        <h1 className="coefficient-apply-title">Apply Coefficient</h1>
      </div>

      <div className="coefficient-apply-content">
        <div className="coefficient-apply-form">
          <div className="coefficient-apply-group">
            <label className="coefficient-apply-label">Original Score</label>
            <input
              type="number"
              className="coefficient-apply-input"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="Enter score (0-100)"
              min={0}
              max={100}
              step={0.5}
              disabled={loading}
            />
          </div>

          <div className="coefficient-apply-group">
            <label className="coefficient-apply-label">Coefficient Value</label>
            <input
              type="number"
              className="coefficient-apply-input"
              value={coefficientValue}
              onChange={(e) => setCoefficientValue(Number(e.target.value))}
              min={0.5}
              max={1.5}
              step={0.01}
              disabled={loading}
            />
            <span className="coefficient-apply-hint">Must be between 0.5 and 1.5</span>
          </div>

          <div className="coefficient-apply-actions">
            <button
              className="btn btn-outline"
              onClick={handleReset}
              disabled={loading}
            >
              <RefreshCw size={18} />
              Reset
            </button>
            <button
              className="btn btn-primary"
              onClick={handleApply}
              disabled={loading || !score}
            >
              <Calculator size={18} />
              {loading ? 'Calculating...' : 'Apply Coefficient'}
            </button>
          </div>
        </div>

        {result && (
          <div className="coefficient-apply-result">
            <h3 className="coefficient-apply-result-title">Result</h3>
            <div className="coefficient-apply-result-grid">
              <div className="coefficient-apply-result-item">
                <span className="coefficient-apply-result-label">Original Score</span>
                <span className="coefficient-apply-result-value">{originalScore}%</span>
              </div>
              <div className="coefficient-apply-result-item">
                <span className="coefficient-apply-result-label">Coefficient</span>
                <span className="coefficient-apply-result-value">×{coefficient}</span>
              </div>
              <div className="coefficient-apply-result-item highlight">
                <span className="coefficient-apply-result-label">Adjusted Score</span>
                <span
                  className="coefficient-apply-result-value"
                  style={{
                    color: adjustedScore >= 80 ? '#22c55e' : adjustedScore >= 60 ? '#f59e0b' : '#ef4444',
                    fontSize: '28px',
                  }}
                >
                  {adjustedScore}%
                </span>
              </div>
              <div className="coefficient-apply-result-item">
                <span className="coefficient-apply-result-label">Change</span>
                <span
                  className="coefficient-apply-result-value"
                  style={{
                    color: adjustedScore > originalScore ? '#22c55e' : adjustedScore < originalScore ? '#ef4444' : '#6b7280',
                  }}
                >
                  {adjustedScore > originalScore ? (
                    <TrendingUp size={18} />
                  ) : adjustedScore < originalScore ? (
                    <TrendingDown size={18} />
                  ) : null}
                  {adjustedScore > originalScore ? '+' : ''}
                  {(adjustedScore - originalScore).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoefficientApply;