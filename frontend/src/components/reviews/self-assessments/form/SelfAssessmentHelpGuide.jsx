// src/components/reviews/self-assessments/form/SelfAssessmentHelpGuide.jsx
import React from 'react';
import { HelpCircle } from 'lucide-react';

const SelfAssessmentHelpGuide = () => {
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
        Self-Assessment Guide
      </h3>
      
      <div className="competency-help-section" style={{ marginBottom: '16px' }}>
        <p className="competency-help-text" style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
          <strong>Writing Your Self-Evaluation</strong><br />
          Self-assessments are your opportunity to showcase your accomplishments, reflect on challenges, and align with your manager on career growth and training needs.
        </p>
      </div>

      <div className="competency-help-section" style={{ marginBottom: '16px' }}>
        <span className="competency-help-section-title" style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>
          💡 Writing Tips:
        </span>
        <ul className="competency-help-text" style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, paddingLeft: '20px', margin: 0, listStyleType: 'disc' }}>
          <li style={{ marginBottom: '6px' }}><strong>Achievements:</strong> Use the <strong>STAR method</strong> (Situation, Task, Action, Result). Quantify metrics where possible.</li>
          <li style={{ marginBottom: '6px' }}><strong>Challenges:</strong> Frame challenges constructively. Focus on what you learned or how you resolved the roadblock.</li>
          <li style={{ marginBottom: '6px' }}><strong>Aspirations:</strong> List specific roles or project responsibilities you'd like to take on next.</li>
        </ul>
      </div>

      <div className="competency-help-section">
        <span className="competency-help-section-title" style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>
          📝 Good vs. Needs Improvement:
        </span>
        <div className="competency-help-examples" style={{ background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px' }}>
          
          <div className="competency-example-item" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '8px' }}>
            <div className="competency-example-name" style={{ fontWeight: 600, color: '#16a34a', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              ✓ Professional & Metric-Driven
            </div>
            <div className="competency-example-desc" style={{ fontSize: '12px', color: '#475569', marginTop: '4px', lineHeight: 1.4 }}>
              "Successfully launched the client dashboard, reducing ticket resolution time by 14%. Faced challenges with database latencies, which we resolved by implementing Redis caching."
            </div>
          </div>

          <div className="competency-example-item">
            <div className="competency-example-name" style={{ fontWeight: 600, color: '#ef4444', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              ✗ Vague or Non-Constructive
            </div>
            <div className="competency-example-desc" style={{ fontSize: '12px', color: '#475569', marginTop: '4px', lineHeight: 1.4 }}>
              "Work went fine, finished my projects. Sometimes database was slow which made it hard to work."
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SelfAssessmentHelpGuide;
