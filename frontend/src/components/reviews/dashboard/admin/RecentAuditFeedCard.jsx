// src/components/reviews/dashboard/admin/RecentAuditFeedCard.jsx
import React from 'react';
import { Activity, Clock, User } from 'lucide-react';

const RecentAuditFeedCard = ({ feed = [] }) => {
  if (!feed || feed.length === 0) {
    return (
      <div className="system-health-card" style={{ marginTop: '24px', padding: '20px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '600', color: '#1a1a2e', margin: '0 0 16px 0' }}>
          <Activity size={18} />
          System Audit Trail
        </h3>
        <div style={{ padding: '16px', color: '#6b7280', textAlign: 'center' }}>No recent audit logs available</div>
      </div>
    );
  }

  return (
    <div className="system-health-card" style={{ marginTop: '24px', padding: '20px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '600', color: '#1a1a2e', margin: '0 0 16px 0' }}>
        <Activity size={18} />
        System Audit Trail
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {feed.map((log) => (
          <div key={log.id} style={{ display: 'flex', gap: '12px', padding: '10px 12px', background: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#e0e7ff', borderRadius: '50%', color: '#4f46e5', flexShrink: 0 }}>
              <User size={16} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '13px' }}>{log.actor_name}</span>
                <span style={{ fontSize: '11px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} />
                  {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <span style={{ fontSize: '13px', color: '#4b5563', textTransform: 'capitalize', fontWeight: '500' }}>
                Action: {log.action.replace(/_/g, ' ')}
              </span>
              {log.details && (
                <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                  {log.details}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentAuditFeedCard;
