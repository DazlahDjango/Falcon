// src/components/reviews/dashboard/supervisor/TeamPIPsCard.jsx
import React from 'react';
import { ShieldAlert, Calendar, CheckSquare } from 'lucide-react';

const TeamPIPsCard = ({ pips = [] }) => {
  if (!pips || pips.length === 0) {
    return (
      <div className="self-assessment-progress-card" style={{ marginTop: '24px' }}>
        <h3 className="self-assessment-progress-card-title">
          <ShieldAlert size={18} />
          Active Team PIPs
        </h3>
        <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
          No active PIPs for your direct reports
        </div>
      </div>
    );
  }

  return (
    <div className="self-assessment-progress-card" style={{ marginTop: '24px' }}>
      <h3 className="self-assessment-progress-card-title">
        <ShieldAlert size={18} />
        Active Team PIPs
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
        {pips.map((pip) => (
          <div key={pip.id} style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: '600', color: '#1a1a2e' }}>{pip.employee_name}</span>
              <span style={{ fontSize: '13px', fontWeight: '500', color: '#2563eb' }}>{pip.progress_percentage}% Complete</span>
            </div>
            
            <div className="self-assessment-progress-card-bar" style={{ marginBottom: '8px', height: '6px' }}>
              <div
                className="self-assessment-progress-card-fill"
                style={{ width: `${pip.progress_percentage}%`, height: '100%' }}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckSquare size={12} />
                Actions: {pip.completed_actions_count}/{pip.action_plans_count} completed
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} />
                Ends: {new Date(pip.end_date).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamPIPsCard;
