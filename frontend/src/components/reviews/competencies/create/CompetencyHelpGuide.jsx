// src/components/reviews/competencies/create/CompetencyHelpGuide.jsx
import React from 'react';
import { HelpCircle, Star, Award } from 'lucide-react';

const CompetencyHelpGuide = () => {
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
        Competency Creation Guide
      </h3>
      
      <div className="competency-help-section" style={{ marginBottom: '16px' }}>
        <p className="competency-help-text" style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
          <strong>What is a Competency?</strong><br />
          Competencies are the skills, behaviors, and attributes that employees are evaluated against. They outline "how" employees perform their tasks.
        </p>
      </div>

      <div className="competency-help-section" style={{ marginBottom: '16px' }}>
        <span className="competency-help-section-title" style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>
          Form Configuration Tips:
        </span>
        <ul className="competency-help-text" style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, paddingLeft: '20px', margin: 0, listStyleType: 'disc' }}>
          <li style={{ marginBottom: '6px' }}><strong>Default Weight (%):</strong> The percentage score contribution of this competency (e.g. 10%, 15%). Total weights of evaluated competencies sum up to 100%.</li>
          <li style={{ marginBottom: '6px' }}><strong>Display Order:</strong> The visual sequence (1, 2, 3, 4) in which this skill appears on review forms and report tables.</li>
          <li style={{ marginBottom: '6px' }}><strong>Type & Category:</strong> Categorization (e.g. <i>Technical Skills</i> under <i>Technical & Operational Excellence</i>).</li>
          <li style={{ marginBottom: '6px' }}><strong>Behavioral Indicators:</strong> Specific baseline benchmarks for Outstanding (5/5) vs. Poor (1/5) ratings.</li>
        </ul>
      </div>

      <div className="competency-help-section">
        <span className="competency-help-section-title" style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>
          💡 Examples by Category:
        </span>
        <div className="competency-help-examples" style={{ background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px' }}>
          
          <div className="competency-example-item" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '8px' }}>
            <div className="competency-example-name" style={{ fontWeight: 600, color: '#2563eb', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              🌟 1. Integrity & Ethical Conduct
            </div>
            <div className="competency-example-desc" style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
              <strong>Category:</strong> Core Values & Culture<br />
              <strong>Type:</strong> Cultural | <strong>Weight:</strong> 10% | <strong>Order:</strong> 1
            </div>
          </div>

          <div className="competency-example-item" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '8px' }}>
            <div className="competency-example-name" style={{ fontWeight: 600, color: '#16a34a', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              ⚙️ 2. Job Knowledge & Technical Skill
            </div>
            <div className="competency-example-desc" style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
              <strong>Category:</strong> Technical & Operational Excellence<br />
              <strong>Type:</strong> Technical Skills | <strong>Weight:</strong> 15% | <strong>Order:</strong> 2
            </div>
          </div>

          <div className="competency-example-item" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '8px' }}>
            <div className="competency-example-name" style={{ fontWeight: 600, color: '#0284c7', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              💬 3. Effective Communication
            </div>
            <div className="competency-example-desc" style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
              <strong>Category:</strong> Communication & Delivery<br />
              <strong>Type:</strong> Soft Skills | <strong>Weight:</strong> 10% | <strong>Order:</strong> 3
            </div>
          </div>

          <div className="competency-example-item">
            <div className="competency-example-name" style={{ fontWeight: 600, color: '#d97706', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              👥 4. People Leadership & Mentorship
            </div>
            <div className="competency-example-desc" style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
              <strong>Category:</strong> Leadership & Strategic Management<br />
              <strong>Type:</strong> Leadership | <strong>Weight:</strong> 15% | <strong>Order:</strong> 4
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CompetencyHelpGuide;
