// src/components/reviews/cycles/create/CycleHelpGuide.jsx
import React from 'react';
import { HelpCircle } from 'lucide-react';

const CycleHelpGuide = () => {
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
        Review Cycle Guide
      </h3>
      
      <div className="competency-help-section" style={{ marginBottom: '16px' }}>
        <p className="competency-help-text" style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
          <strong>What is a Review Cycle?</strong><br />
          Review Cycles are the calendar evaluation periods during which employee performance is measured. It manages deadlines for self-assessments, manager reviews, calibration, and final sign-offs.
        </p>
      </div>

      <div className="competency-help-section" style={{ marginBottom: '16px' }}>
        <span className="competency-help-section-title" style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>
          Form Configuration Tips:
        </span>
        <ul className="competency-help-text" style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, paddingLeft: '20px', margin: 0, listStyleType: 'disc' }}>
          <li style={{ marginBottom: '6px' }}><strong>Rating Scale:</strong> Assigns the scoring rubric (e.g. 5-point scale) used during reviews.</li>
          <li style={{ marginBottom: '6px' }}><strong>Deadlines:</strong> Chronological order is required: Start Date → Self Assessment → Supervisor Review → Final Approval → End Date.</li>
          <li style={{ marginBottom: '6px' }}><strong>Score Weights:</strong> Total sum of KPI, Competency, Mission, and Task weights must equal 100%.</li>
        </ul>
      </div>

      <div className="competency-help-section">
        <span className="competency-help-section-title" style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>
          💡 Standard Weights Templates:
        </span>
        <div className="competency-help-examples" style={{ background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px' }}>
          
          <div className="competency-example-item" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '8px' }}>
            <div className="competency-example-name" style={{ fontWeight: 600, color: '#2563eb', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              📊 1. Core Focused (Default)
            </div>
            <div className="competency-example-desc" style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
              <strong>KPI Weight:</strong> 70%. <strong>Competency Weight:</strong> 30%<br />
              <strong>Best for:</strong> Standard professional roles where output objectives are main focus.
            </div>
          </div>

          <div className="competency-example-item" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '8px' }}>
            <div className="competency-example-name" style={{ fontWeight: 600, color: '#d97706', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              🎯 2. Execution & Task Heavy
            </div>
            <div className="competency-example-desc" style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
              <strong>KPI:</strong> 50%. <strong>Competency:</strong> 25%. <strong>Task:</strong> 25%<br />
              <strong>Best for:</strong> Operations, logistics, or support teams with high task completion tracking.
            </div>
          </div>

          <div className="competency-example-item">
            <div className="competency-example-name" style={{ fontWeight: 600, color: '#16a34a', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              🌟 3. Balanced Output
            </div>
            <div className="competency-example-desc" style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
              <strong>KPI:</strong> 40%. <strong>Competency:</strong> 30%. <strong>Mission:</strong> 30%<br />
              <strong>Best for:</strong> Leadership, specialized consultancies, or project-based delivery teams.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CycleHelpGuide;
