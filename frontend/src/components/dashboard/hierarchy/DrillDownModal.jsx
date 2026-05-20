import React from 'react';
import PropTypes from 'prop-types';
import { FiX, FiUser, FiMail, FiPhone, FiBriefcase, FiMapPin, FiCalendar, FiAward } from 'react-icons/fi';
import { TrafficLight } from '../common/TrafficLight';
import { StatusBadge } from '../common/StatusBadge';
import { ScoreGauge } from '../common/ScoreGauge';

export const DrillDownModal = ({ 
  isOpen, 
  onClose, 
  user, 
  loading = false,
  onViewTeam,
  onViewKpis
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.2s ease'
      }}
      onClick={handleBackdropClick}
    >
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto',
        animation: 'slideUp 0.3s ease'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
            User Details
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              color: '#64748b'
            }}
          >
            <FiX size={20} />
          </button>
        </div>
        
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            <p style={{ marginTop: '16px', color: '#64748b' }}>Loading user details...</p>
          </div>
        ) : user ? (
          <div>
            <div style={{ padding: '24px', textAlign: 'center', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: user.traffic_light === 'green' ? '#dcfce7' : 
                           user.traffic_light === 'yellow' ? '#fef3c7' : '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <FiUser size={40} color={user.traffic_light === 'green' ? '#166534' : 
                                          user.traffic_light === 'yellow' ? '#92400e' : '#991b1b'} />
              </div>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>
                {user.first_name} {user.last_name}
              </h2>
              <p style={{ margin: '8px 0 0', color: '#64748b' }}>
                {user.title || user.role || 'Staff Member'}
              </p>
              <div style={{ marginTop: '12px' }}>
                <TrafficLight status={user.traffic_light} size="medium" showLabel />
              </div>
            </div>
            
            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiMail size={16} color="#64748b" />
                  <div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Email</div>
                    <div style={{ fontSize: '14px' }}>{user.email}</div>
                  </div>
                </div>
                {user.phone_number && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FiPhone size={16} color="#64748b" />
                    <div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>Phone</div>
                      <div style={{ fontSize: '14px' }}>{user.phone_number}</div>
                    </div>
                  </div>
                )}
                {user.department && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FiBriefcase size={16} color="#64748b" />
                    <div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>Department</div>
                      <div style={{ fontSize: '14px' }}>{user.department}</div>
                    </div>
                  </div>
                )}
                {user.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FiMapPin size={16} color="#64748b" />
                    <div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>Location</div>
                      <div style={{ fontSize: '14px' }}>{user.location}</div>
                    </div>
                  </div>
                )}
                {user.joined_at && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FiCalendar size={16} color="#64748b" />
                    <div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>Joined</div>
                      <div style={{ fontSize: '14px' }}>{new Date(user.joined_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '16px',
                background: '#f8fafc',
                borderRadius: '12px',
                marginBottom: '24px'
              }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>Performance Score</div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
                    {user.aggregated_score !== undefined ? `${Math.round(user.aggregated_score)}%` : '—'}
                  </div>
                </div>
                <ScoreGauge score={user.aggregated_score || 0} size={80} showLabel={false} />
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                {user.direct_report_count > 0 && onViewTeam && (
                  <button
                    onClick={() => onViewTeam(user.id)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #3b82f6',
                      background: 'white',
                      color: '#3b82f6',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    View Team ({user.direct_report_count})
                  </button>
                )}
                {onViewKpis && (
                  <button
                    onClick={() => onViewKpis(user.id)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#3b82f6',
                      color: 'white',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    View KPIs
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ color: '#64748b' }}>No user data available</p>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

DrillDownModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    email: PropTypes.string,
    phone_number: PropTypes.string,
    title: PropTypes.string,
    role: PropTypes.string,
    department: PropTypes.string,
    location: PropTypes.string,
    joined_at: PropTypes.string,
    traffic_light: PropTypes.string,
    aggregated_score: PropTypes.number,
    direct_report_count: PropTypes.number
  }),
  loading: PropTypes.bool,
  onViewTeam: PropTypes.func,
  onViewKpis: PropTypes.func
};