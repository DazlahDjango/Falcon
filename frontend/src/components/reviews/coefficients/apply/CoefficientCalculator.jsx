// src/components/reviews/coefficients/apply/CoefficientCalculator.jsx
import React, { useState } from 'react';
import { Calculator, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const CoefficientCalculator = () => {
  const [score, setScore] = useState('');
  const [coefficient, setCoefficient] = useState(1.0);
  const [result, setResult] = useState(null);

  const calculate = () => {
    if (!score) return;
    const original = Number(score);
    const adjusted = Math.min(original * coefficient, 100);
    const change = adjusted - original;
    setResult({
      original,
      coefficient,
      adjusted: Math.round(adjusted * 100) / 100,
      change: Math.round(change * 100) / 100,
    });
  };

  const handleReset = () => {
    setScore('');
    setCoefficient(1.0);
    setResult(null);
  };

  const getChangeIcon = (change) => {
    if (change === 0) return <Minus size={16} color="#6b7280" />;
    if (change > 0) return <TrendingUp size={16} color="#22c55e" />;
    return <TrendingDown size={16} color="#ef4444" />;
  };

  const getChangeColor = (change) => {
    if (change === 0) return '#6b7280';
    if (change > 0) return '#22c55e';
    return '#ef4444';
  };

  return (
    <div className="coefficient-calculator">
      <h3 className="coefficient-calculator-title">
        <Calculator size={20} />
        Coefficient Calculator
      </h3>

      <div className="coefficient-calculator-form">
        <div className="coefficient-calculator-group">
          <label className="coefficient-calculator-label">Score (%)</label>
          <input
            type="number"
            className="coefficient-calculator-input"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="Enter score"
            min={0}
            max={100}
            step={0.5}
          />
        </div>

        <div className="coefficient-calculator-group">
          <label className="coefficient-calculator-label">Coefficient</label>
          <input
            type="number"
            className="coefficient-calculator-input"
            value={coefficient}
            onChange={(e) => setCoefficient(Number(e.target.value))}
            min={0.5}
            max={1.5}
            step={0.01}
          />
          <span className="coefficient-calculator-hint">Range: 0.5 - 1.5</span>
        </div>

        <div className="coefficient-calculator-actions">
          <button
            className="btn btn-outline btn-sm"
            onClick={handleReset}
          >
            Reset
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={calculate}
            disabled={!score}
          >
            <Calculator size={16} />
            Calculate
          </button>
        </div>
      </div>

      {result && (
        <div className="coefficient-calculator-result">
          <div className="coefficient-calculator-result-grid">
            <div className="coefficient-calculator-result-item">
              <span className="coefficient-calculator-result-label">Original</span>
              <span className="coefficient-calculator-result-value">{result.original}%</span>
            </div>
            <div className="coefficient-calculator-result-item">
              <span className="coefficient-calculator-result-label">× Coefficient</span>
              <span className="coefficient-calculator-result-value">{result.coefficient}</span>
            </div>
            <div className="coefficient-calculator-result-item highlight">
              <span className="coefficient-calculator-result-label">Adjusted</span>
              <span
                className="coefficient-calculator-result-value"
                style={{
                  color: result.adjusted >= 80 ? '#22c55e' : result.adjusted >= 60 ? '#f59e0b' : '#ef4444',
                  fontSize: '24px',
                }}
              >
                {result.adjusted}%
              </span>
            </div>
            <div className="coefficient-calculator-result-item">
              <span className="coefficient-calculator-result-label">Change</span>
              <span
                className="coefficient-calculator-result-value"
                style={{ color: getChangeColor(result.change) }}
              >
                {getChangeIcon(result.change)}
                {result.change > 0 ? '+' : ''}{result.change}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoefficientCalculator;