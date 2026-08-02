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
          <li style={{ marginBottom: '6px' }}><strong>Type:</strong> Classification of the skill (e.g. <i>Technical</i> for developers, <i>Leadership</i> for managers).</li>
          <li style={{ marginBottom: '6px' }}><strong>Default Weight:</strong> The impact percentage of this competency on the total review score. Typically 5% - 25%.</li>
          <li style={{ marginBottom: '6px' }}><strong>Rating Scale:</strong> Select a custom scale to override the standard cycle scale for this specific competency.</li>
          <li style={{ marginBottom: '6px' }}><strong>Behavioral Indicators:</strong> Real examples of poor (needs improvement) and outstanding (excellent) performance to guide reviews.</li>
        </ul>
      </div>

      <div className="competency-help-section">
        <span className="competency-help-section-title" style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>
          💡 Predefined Examples:
        </span>
        <div className="competency-help-examples" style={{ background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px' }}>
          
          <div className="competency-example-item" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '8px' }}>
            <div className="competency-example-name" style={{ fontWeight: 600, color: '#2563eb', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              🔧 1. Technical Problem Solving
            </div>
            <div className="competency-example-desc" style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
              <strong>Type:</strong> Technical Skills. <strong>Weight:</strong> 15%<br />
              <strong>Excellent:</strong> "Finds optimal solutions to complex bugs, drafts robust tests, mentors peers."<br />
              <strong>Needs Improvement:</strong> "Struggles with fundamental coding, avoids reviews, ignores errors."
            </div>
          </div>

          <div className="competency-example-item" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '8px' }}>
            <div className="competency-example-name" style={{ fontWeight: 600, color: '#d97706', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              ⭐ 2. Initiative & Ownership
            </div>
            <div className="competency-example-desc" style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
              <strong>Type:</strong> Soft Skills. <strong>Weight:</strong> 10%<br />
              <strong>Excellent:</strong> "Proactively tackles issues, takes accountability for success and failures."<br />
              <strong>Needs Improvement:</strong> "Waits for instructions, shifts blame, resists changes."
            </div>
          </div>

          <div className="competency-example-item">
            <div className="competency-example-name" style={{ fontWeight: 600, color: '#16a34a', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              👑 3. Strategic Planning
            </div>
            <div className="competency-example-desc" style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
              <strong>Type:</strong> Leadership. <strong>Weight:</strong> 20%<br />
              <strong>Excellent:</strong> "Creates long-term objectives, aligns teams with business value, anticipates risks."<br />
              <strong>Needs Improvement:</strong> "Focuses solely on short-term tasks, fails to build plan targets."
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CompetencyHelpGuide;
