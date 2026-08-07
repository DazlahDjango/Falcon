// src/components/reviews/competency-categories/create/CategoryHelpGuide.jsx
import React from 'react';
import { HelpCircle } from 'lucide-react';

const CategoryHelpGuide = () => {
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
        Category Creation Guide
      </h3>
      
      <div className="competency-help-section" style={{ marginBottom: '16px' }}>
        <p className="competency-help-text" style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
          <strong>What is a Competency Category?</strong><br />
          Competency Categories group and organize related competencies. This makes it easier to navigate the catalog, analyze specific fields, and apply score rules in review cycles.
        </p>
      </div>

      <div className="competency-help-section" style={{ marginBottom: '16px' }}>
        <span className="competency-help-section-title" style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>
          Form Configuration Tips:
        </span>
        <ul className="competency-help-text" style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, paddingLeft: '20px', margin: 0, listStyleType: 'disc' }}>
          <li style={{ marginBottom: '6px' }}><strong>Name:</strong> Keep it clean and descriptive (e.g. <i>Core Leadership Values</i>).</li>
          <li style={{ marginBottom: '6px' }}><strong>Display Order:</strong> Numerical priority for ordering categories in charts and tables (e.g. 1, 2, 3).</li>
          <li style={{ marginBottom: '6px' }}><strong>Parent Category:</strong> Create hierarchical nested categories if you need sub-groupings.</li>
        </ul>
      </div>

      <div className="competency-help-section">
        <span className="competency-help-section-title" style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>
          💡 Category Group Examples:
        </span>
        <div className="competency-help-examples" style={{ background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px' }}>
          
          <div className="competency-example-item" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '8px' }}>
            <div className="competency-example-name" style={{ fontWeight: 600, color: '#2563eb', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              🌟 1. Organization Core Values
            </div>
            <div className="competency-example-desc" style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
              <strong>Used for:</strong> Foundational skills required of every employee.<br />
              <strong>Examples:</strong> Integrity, Customer Focus, Teamwork.
            </div>
          </div>

          <div className="competency-example-item" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '8px' }}>
            <div className="competency-example-name" style={{ fontWeight: 600, color: '#d97706', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              👥 2. Leadership & Management
            </div>
            <div className="competency-example-desc" style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
              <strong>Used for:</strong> Behaviors expected from managers and team leads.<br />
              <strong>Examples:</strong> Conflict Resolution, Strategic Planning, Talent Mentoring.
            </div>
          </div>

          <div className="competency-example-item">
            <div className="competency-example-name" style={{ fontWeight: 600, color: '#16a34a', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              💻 3. Technical Standards
            </div>
            <div className="competency-example-desc" style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
              <strong>Used for:</strong> Domain-specific software and engineering practices.<br />
              <strong>Examples:</strong> Code Quality, System Architecture, Code Design.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CategoryHelpGuide;
