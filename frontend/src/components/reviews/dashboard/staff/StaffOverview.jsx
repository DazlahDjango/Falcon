// src/components/reviews/dashboard/staff/StaffOverview.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, CheckCircle, Clock, AlertCircle, FileText, Star, ArrowRight } from 'lucide-react';
import { ReviewStatusBadge, ReviewScoreGauge } from '../../common';

const StaffOverview = ({ employee, selfAssessment, supervisorReview, finalRating }) => {
  const navigate = useNavigate();
  if (!employee) return null;

  const saStatus = selfAssessment?.status || employee.self_assessment?.status || 'not_started';
  const srStatus = supervisorReview?.status || employee.supervisor_review?.status || 'pending';
  const frStatus = finalRating?.status || employee.final_rating?.status || 'pending';
  const frScore = finalRating?.score || employee.final_rating?.score || null;
  const frLabel = finalRating?.label || employee.final_rating?.label || null;

  const statusItems = [
    {
      icon: <FileText size={20} color="#2563eb" />,
      label: 'Self Assessment',
      status: saStatus,
      detail: saStatus === 'submitted' ? 'Submitted' : saStatus === 'draft' ? 'Draft in Progress' : 'Not Started',
      path: '/reviews/self-assessment',
      actionText: saStatus === 'submitted' ? 'View Submission' : 'Continue Form',
    },
    {
      icon: <User size={20} color="#7c3aed" />,
      label: 'Supervisor Appraisal',
      status: srStatus,
      detail: supervisorReview?.supervisor ? `Reviewer: ${supervisorReview.supervisor}` : 'Under Manager Review',
      path: '/reviews/self-assessments',
      actionText: 'Check Status',
    },
    {
      icon: <Star size={20} color="#f59e0b" />,
      label: 'Final Rating & Outcome',
      status: frStatus,
      score: frScore,
      detail: frLabel || (frScore ? `${frScore}/5.0` : 'Pending Cycle Completion'),
      path: '/reviews/final-ratings/my',
      actionText: 'View Final Rating',
    },
  ];

  return (
    <div className="staff-overview" style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 className="staff-overview-title" style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>Your Appraisal Progress</h3>
        <span style={{ fontSize: '13px', color: '#64748b' }}>Active Cycle Overview</span>
      </div>
      <div className="staff-overview-items" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        {statusItems.map((item, index) => (
          <div 
            key={index} 
            className="staff-overview-item"
            onClick={() => navigate(item.path)}
            style={{ 
              background: '#f8fafc', 
              borderRadius: '10px', 
              padding: '16px', 
              border: '1px solid #e2e8f0', 
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.icon}
                </div>
                <ReviewStatusBadge status={item.status} size="sm" />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', display: 'block' }}>{item.label}</span>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>{item.detail}</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '10px', borderTop: '1px dashed #e2e8f0', fontSize: '12px', fontWeight: 600, color: '#2563eb' }}>
              <span>{item.actionText}</span>
              <ArrowRight size={14} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffOverview;