import React from 'react';
import PropTypes from 'prop-types';
import { FiUsers, FiTrendingUp, FiTrendingDown, FiMinus, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { DashboardCard } from '../common/DashboardCard';
import { TrafficLight } from '../common/TrafficLight';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';

export const TeamAggregateCard = ({ 
  data, 
  loading = false, 
  error = null,
  title = 'Team Performance Summary',
  onRefresh,
  onCardClick
}) => {
  if (loading) {
    return <LoadingSkeleton type="card" />;
  }

  if (error) {
    return (
      <DashboardCard title={title} error={error} onRefresh={onRefresh}>
        <EmptyState title="Failed to load team summary" message={error} />
      </DashboardCard>
    );
  }

  if (!data) {
    return (
      <DashboardCard title={title} onRefresh={onRefresh}>
        <EmptyState title="No Team Data" message="No team performance data available." />
      </DashboardCard>
    );
  }

  const getTrendIcon = (score, previousScore) => {
    if (!previousScore) return <FiMinus size={16} color="#6b7280" />;
    if (score > previousScore) return <FiTrendingUp size={16} color="#10b981" />;
    if (score < previousScore) return <FiTrendingDown size={16} color="#ef4444" />;
    return <FiMinus size={16} color="#6b7280" />;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const averageScore = data.average_score || 0;
  const submissionRate = data.submission_rate || 0;

  return (
    <DashboardCard 
      title={title} 
      onRefresh={onRefresh}
      onClick={onCardClick}
      style={{ cursor: onCardClick ? 'pointer' : 'default' }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
        <div style={{ textAlign: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            <FiUsers size={20} color="#3b82f6" />
            <span style={{ fontSize: '13px', color: '#64748b' }}>Team Size</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
            {data.total_members || 0}
          </div>
        </div>
        
        <div 
          style={{ 
            textAlign: 'center', 
            padding: '16px', 
            background: '#f8fafc', 
            borderRadius: '12px',
            position: 'relative'
          }}
        >
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>Avg Performance</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: getScoreColor(averageScore) }}>
            {Math.round(averageScore)}%
          </div>
          {data.previous_average_score && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '4px' }}>
              {getTrendIcon(averageScore, data.previous_average_score)}
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                vs {Math.round(data.previous_average_score)}%
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '20px' }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>On Track</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <FiCheckCircle size={14} color="#10b981" />
            <span style={{ fontSize: '20px', fontWeight: 600, color: '#10b981' }}>
              {data.green_count || 0}
            </span>
          </div>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>At Risk</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <FiAlertCircle size={14} color="#f59e0b" />
            <span style={{ fontSize: '20px', fontWeight: 600, color: '#f59e0b' }}>
              {data.yellow_count || 0}
            </span>
          </div>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Off Track</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <FiAlertCircle size={14} color="#ef4444" />
            <span style={{ fontSize: '20px', fontWeight: 600, color: '#ef4444' }}>
              {data.red_count || 0}
            </span>
          </div>
        </div>
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
          <span>Submission Rate</span>
          <span style={{ fontWeight: 500 }}>{Math.round(submissionRate)}%</span>
        </div>
        <div style={{ background: '#e2e8f0', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
          <div style={{ 
            width: `${Math.min(100, submissionRate)}%`, 
            height: '100%', 
            background: submissionRate >= 80 ? '#10b981' : submissionRate >= 50 ? '#f59e0b' : '#ef4444',
            borderRadius: '10px',
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        padding: '12px',
        background: '#f8fafc',
        borderRadius: '10px',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrafficLight status="green" size="small" />
          <span>{data.green_percentage ? Math.round(data.green_percentage) : 0}% of team</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrafficLight status="red" size="small" />
          <span>{data.red_percentage ? Math.round(data.red_percentage) : 0}% of team</span>
        </div>
      </div>
      
      {data.pending_reviews > 0 && (
        <div style={{ 
          marginTop: '16px', 
          padding: '10px', 
          background: '#fef3c7', 
          borderRadius: '8px',
          fontSize: '12px',
          color: '#92400e',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FiAlertCircle size={14} />
          <span>{data.pending_reviews} pending review{data.pending_reviews > 1 ? 's' : ''}</span>
        </div>
      )}
    </DashboardCard>
  );
};

TeamAggregateCard.propTypes = {
  data: PropTypes.shape({
    total_members: PropTypes.number,
    green_count: PropTypes.number,
    yellow_count: PropTypes.number,
    red_count: PropTypes.number,
    average_score: PropTypes.number,
    previous_average_score: PropTypes.number,
    submission_rate: PropTypes.number,
    green_percentage: PropTypes.number,
    red_percentage: PropTypes.number,
    pending_reviews: PropTypes.number
  }),
  loading: PropTypes.bool,
  error: PropTypes.string,
  title: PropTypes.string,
  onRefresh: PropTypes.func,
  onCardClick: PropTypes.func
};