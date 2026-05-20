import React from 'react';
import PropTypes from 'prop-types';
import { FiUser, FiMail, FiPhone, FiAward, FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';
import { TrafficLight } from '../common/TrafficLight';
import { StatusBadge } from '../common/StatusBadge';

export const TeamMemberCard = ({ 
  member, 
  onClick, 
  compact = false,
  showDetails = true,
  className = ''
}) => {
  const getTrendIcon = (trend) => {
    if (trend === 'up') return <FiTrendingUp color="#10b981" size={14} />;
    if (trend === 'down') return <FiTrendingDown color="#ef4444" size={14} />;
    return <FiMinus color="#6b7280" size={14} />;
  };

  if (compact) {
    return (
      <div 
        onClick={() => onClick?.(member.id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px',
          background: 'white',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
      >
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: member.traffic_light === 'green' ? '#dcfce7' : 
                     member.traffic_light === 'yellow' ? '#fef3c7' : '#fee2e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <FiUser size={20} color={member.traffic_light === 'green' ? '#166534' : 
                                    member.traffic_light === 'yellow' ? '#92400e' : '#991b1b'} />
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500 }}>{member.first_name} {member.last_name}</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>{member.title || member.role}</div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '16px', fontWeight: 600 }}>
            {member.aggregated_score !== undefined ? `${Math.round(member.aggregated_score)}%` : '—'}
          </div>
          <TrafficLight status={member.traffic_light} size="small" />
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`team-member-card ${className}`}
      onClick={() => onClick?.(member.id)}
      style={{
        padding: '16px',
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
    >
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: member.traffic_light === 'green' ? '#dcfce7' : 
                     member.traffic_light === 'yellow' ? '#fef3c7' : '#fee2e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <FiUser size={32} color={member.traffic_light === 'green' ? '#166534' : 
                                    member.traffic_light === 'yellow' ? '#92400e' : '#991b1b'} />
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 600 }}>
                {member.first_name} {member.last_name}
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                {member.title || member.role || 'Staff Member'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {member.aggregated_score !== undefined ? `${Math.round(member.aggregated_score)}%` : '—'}
              </div>
              <TrafficLight status={member.traffic_light} size="medium" showLabel />
            </div>
          </div>
          
          {showDetails && (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569' }}>
                  <FiMail size={14} />
                  <span>{member.email}</span>
                </div>
                {member.phone_number && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569' }}>
                    <FiPhone size={14} />
                    <span>{member.phone_number}</span>
                  </div>
                )}
                {member.department && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569' }}>
                    <FiAward size={14} />
                    <span>{member.department}</span>
                  </div>
                )}
                {member.trend && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                    {getTrendIcon(member.trend)}
                    <span style={{ color: '#475569' }}>
                      {member.trend === 'up' ? 'Improving' : member.trend === 'down' ? 'Declining' : 'Stable'}
                    </span>
                  </div>
                )}
              </div>
              
              {member.direct_report_count > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <StatusBadge status="info" text={`Manages ${member.direct_report_count} team member${member.direct_report_count > 1 ? 's' : ''}`} size="small" />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

TeamMemberCard.propTypes = {
  member: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    email: PropTypes.string,
    phone_number: PropTypes.string,
    title: PropTypes.string,
    role: PropTypes.string,
    department: PropTypes.string,
    traffic_light: PropTypes.oneOf(['green', 'yellow', 'red']),
    aggregated_score: PropTypes.number,
    direct_report_count: PropTypes.number,
    trend: PropTypes.oneOf(['up', 'down', 'stable'])
  }).isRequired,
  onClick: PropTypes.func,
  compact: PropTypes.bool,
  showDetails: PropTypes.bool,
  className: PropTypes.string
};