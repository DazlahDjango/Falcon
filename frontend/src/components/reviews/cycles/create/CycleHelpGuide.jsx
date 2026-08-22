// src/components/reviews/cycles/create/CycleHelpGuide.jsx
import React from 'react';
import { HelpCircle, Calendar, PieChart, Layers, CheckCircle2, ShieldAlert } from 'lucide-react';

const CycleHelpGuide = () => {
  return (
    <div className="competency-help-panel" style={{
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      height: 'fit-content'
    }}>
      <h3 className="competency-help-title" style={{
        fontSize: '16px',
        fontWeight: 700,
        color: '#0f172a',
        marginTop: 0,
        marginBottom: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <HelpCircle size={18} style={{ color: '#2563eb' }} />
        Review Cycle Quick Guide
      </h3>
      
      {/* 1. What is a Review Cycle */}
      <div className="competency-help-section" style={{ marginBottom: '14px' }}>
        <p className="competency-help-text" style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
          <strong>What is a Review Cycle?</strong><br />
          A time-bound campaign during which appraisals take place. It controls deadlines for self-assessments, manager evaluations, committee calibration, and final score sign-offs.
        </p>
      </div>

      {/* 2. Department Scope */}
      <div className="competency-help-section" style={{ marginBottom: '14px', background: '#eff6ff', padding: '10px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e40af', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
          <Layers size={14} /> Department Scope & Hierarchy:
        </span>
        <p style={{ fontSize: '11px', color: '#1e3a8a', lineHeight: 1.4, margin: 0 }}>
          <strong>"Include All Departments"</strong> acts as a company-wide umbrella. All employees in every <strong>Division, Department, Section, and Unit</strong> are automatically included. Uncheck only if running a cycle for a specific team.
        </p>
      </div>

      {/* 3. Deadlines Sequence */}
      <div className="competency-help-section" style={{ marginBottom: '14px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Calendar size={14} /> Chronological Deadlines:
        </span>
        <div style={{ fontSize: '11px', color: '#475569', lineHeight: 1.5, background: 'white', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <strong>1. Start Date:</strong> Cycle opens & notifies staff.<br />
          <strong>2. Self Assessment:</strong> Employee submission cutoff.<br />
          <strong>3. Supervisor Review:</strong> Manager evaluation cutoff.<br />
          <strong>4. Final Approval:</strong> HR calibration & sign-off.<br />
          <strong>5. End Date:</strong> Scores locked permanently.
        </div>
      </div>

      {/* 4. Score Weights Explanation */}
      <div className="competency-help-section" style={{ marginBottom: '14px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <PieChart size={14} /> 4 Score Weight Pillars (Must = 100%):
        </span>
        <ul style={{ fontSize: '11px', color: '#475569', lineHeight: 1.45, paddingLeft: '16px', margin: 0 }}>
          <li style={{ marginBottom: '4px' }}><strong>KPI Weight:</strong> Quantifiable numerical goals (e.g. Sales, Uptime).</li>
          <li style={{ marginBottom: '4px' }}><strong>Competency Weight:</strong> Behavioral values, culture & soft skills.</li>
          <li style={{ marginBottom: '4px' }}><strong>Mission Weight:</strong> Special one-off strategic initiatives & company OKRs (e.g. ERP rollout, ISO certification).</li>
          <li style={{ marginBottom: '4px' }}><strong>Task Weight:</strong> Daily routine operational execution & checklist completion.</li>
        </ul>
      </div>

      {/* 5. Standard Presets */}
      <div className="competency-help-section">
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
          💡 Recommended Weight Presets:
        </span>
        <div style={{ background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
            <div style={{ fontWeight: 600, color: '#2563eb', fontSize: '12px' }}>
              📊 Standard Staff (Default)
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              <strong>70% KPI</strong> · <strong>30% Competency</strong> · 0% Mission · 0% Task
            </div>
          </div>

          <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
            <div style={{ fontWeight: 600, color: '#d97706', fontSize: '12px' }}>
              🎯 Operations & Support Staff
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              <strong>50% KPI</strong> · <strong>25% Task</strong> · <strong>25% Competency</strong>
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 600, color: '#16a34a', fontSize: '12px' }}>
              🌟 Project Leads & Strategic Teams
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              <strong>50% KPI</strong> · <strong>30% Mission</strong> · <strong>20% Competency</strong>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CycleHelpGuide;
