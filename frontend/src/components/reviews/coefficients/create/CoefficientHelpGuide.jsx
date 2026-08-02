// src/components/reviews/coefficients/create/CoefficientHelpGuide.jsx
import React from 'react';
import { HelpCircle } from 'lucide-react';

const CoefficientHelpGuide = () => {
  return (
    <div className="competency-help-panel" style={{
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      height: 'fit-content'
    }}>
      <h3 className="competency-help-title" style={{
        fontSize: '16px',
        fontWeight: 600,
        color: '#0f172a',
        marginTop: 0,
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <HelpCircle size={18} className="text-blue-500" style={{ color: '#3b82f6' }} />
        Coefficient Guide
      </h3>
      
      <div className="competency-help-section" style={{ marginBottom: '16px' }}>
        <p className="competency-help-text" style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
          <strong>What is a Score Coefficient?</strong><br />
          Coefficients are multipliers applied to employee review scores to normalize results across departments, roles, or individuals. This ensures fair comparison (e.g. compensating for roles with more difficult KPIs).
        </p>
      </div>

      <div className="competency-help-section" style={{ marginBottom: '16px' }}>
        <span className="competency-help-section-title" style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>
          Form Configuration Tips:
        </span>
        <ul className="competency-help-text" style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, paddingLeft: '20px', margin: 0, listStyleType: 'disc' }}>
          <li style={{ marginBottom: '6px' }}><strong>Type:</strong> Select whether this adjustment targets a specific <i>Department</i>, <i>Position</i>, or a single <i>Individual</i>.</li>
          <li style={{ marginBottom: '6px' }}><strong>Value:</strong> The multiplier value (must be between 0.50 and 1.50). 1.00 is no change.</li>
          <li style={{ marginBottom: '6px' }}><strong>Valid Dates:</strong> Set the calendar range during which this multiplier is active.</li>
        </ul>
      </div>

      <div className="competency-help-section">
        <span className="competency-help-section-title" style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>
          💡 Example Scenarios:
        </span>
        <div className="competency-help-examples" style={{ background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px' }}>
          
          <div className="competency-example-item" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '8px' }}>
            <div className="competency-example-name" style={{ fontWeight: 600, color: '#2563eb', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              🚀 1. Hard-to-Reach Goals Boost
            </div>
            <div className="competency-example-desc" style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
              <strong>Type:</strong> Department (R&D). <strong>Value:</strong> 1.0500 (+5%)<br />
              <strong>Reason:</strong> "Research metrics are inherently unpredictable and harder to reach than sales quotas."
            </div>
          </div>

          <div className="competency-example-item" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '8px' }}>
            <div className="competency-example-name" style={{ fontWeight: 600, color: '#d97706', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              📉 2. High Season Normalization
            </div>
            <div className="competency-example-desc" style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
              <strong>Type:</strong> Position (Sales Rep). <strong>Value:</strong> 0.9500 (-5%)<br />
              <strong>Reason:</strong> "Sales volume peaks naturally in Q4, so scores are normalized downward to maintain parity."
            </div>
          </div>

          <div className="competency-example-item">
            <div className="competency-example-name" style={{ fontWeight: 600, color: '#16a34a', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              👤 3. Special Individual Adjustment
            </div>
            <div className="competency-example-desc" style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
              <strong>Type:</strong> Individual (John Doe). <strong>Value:</strong> 1.1000 (+10%)<br />
              <strong>Reason:</strong> "Compensating for extended lead transition responsibilities while teammate was on leave."
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CoefficientHelpGuide;
