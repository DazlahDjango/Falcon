// src/components/reviews/dashboard/executive/TopBottomCompetenciesCard.jsx
import React from 'react';
import { Award, Star } from 'lucide-react';

const TopBottomCompetenciesCard = ({ competencies }) => {
  if (!competencies) return null;
  const { top = [], bottom = [] } = competencies;

  const renderList = (list, isTop) => {
    if (list.length === 0) {
      return <div style={{ padding: '12px', color: '#6b7280', textAlign: 'center' }}>No competency data available</div>;
    }

    return list.map((item, idx) => (
      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '13px' }}>{item.competency__name}</span>
          <span style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'capitalize' }}>Category: {item.competency_type || 'N/A'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Star size={14} fill={isTop ? '#f59e0b' : 'none'} stroke={isTop ? '#f59e0b' : '#ef4444'} />
          <span style={{ fontSize: '14px', fontWeight: '700', color: isTop ? '#10b981' : '#ef4444' }}>{parseFloat(item.avg_rating).toFixed(2)}</span>
        </div>
      </div>
    ));
  };

  return (
    <div className="cycle-performance-card" style={{ marginTop: '24px', padding: '20px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
      <h3 className="cycle-performance-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '600', color: '#1a1a2e', margin: '0 0 16px 0' }}>
        <Award size={18} />
        Competency Strengths & Focus Areas
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Top Competencies */}
        <div>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#10b981', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Top Strengths
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {renderList(top, true)}
          </div>
        </div>

        {/* Bottom Competencies */}
        <div>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#ef4444', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Focus Areas
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {renderList(bottom, false)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBottomCompetenciesCard;
