// src/components/reviews/promotions/PromotionDrawer.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Award, ArrowRight, TrendingUp } from 'lucide-react';
import './promotions.css';

const PromotionDrawer = ({ 
  isOpen, 
  onClose, 
  highPerformers = [], 
  loading = false 
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleRecommend = (employeeId, score) => {
    navigate('/reviews/promotions/create', { 
      state: { employeeId, initialScore: score } 
    });
    onClose();
  };

  return (
    <div className={`promotion-drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="promotion-drawer-content" onClick={(e) => e.stopPropagation()}>
        <div className="promotion-drawer-header">
          <div className="promotion-drawer-header-title">
            <Award className="text-primary" size={24} />
            <h2>High Performers & Promotions</h2>
          </div>
          <button className="promotion-drawer-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="promotion-drawer-body">
          <p className="promotion-drawer-desc">
            The following employees scored outstanding results (score &ge; 90%) in calibrated cycles. Select an employee to recommend them for a promotion.
          </p>

          {loading ? (
            <div className="promotion-drawer-loading">
              <div className="spinner"></div>
              <p>Loading high performers...</p>
            </div>
          ) : highPerformers.length === 0 ? (
            <div className="promotion-drawer-empty">
              <TrendingUp size={48} className="text-muted" />
              <h3>No high performers found</h3>
              <p>No employees with score &ge; 90% in this session/cycle.</p>
            </div>
          ) : (
            <div className="promotion-drawer-list">
              {highPerformers.map((candidate) => (
                <div key={candidate.id || candidate.employee_id} className="promotion-drawer-item">
                  <div className="promotion-drawer-item-info">
                    <h4>{candidate.employee_name || candidate.name}</h4>
                    <span>{candidate.department_name || 'No Department'} • Calibrated Score: <strong>{candidate.score || candidate.final_score}%</strong></span>
                  </div>
                  <button 
                    className="btn btn-primary btn-sm promotion-drawer-btn"
                    onClick={() => handleRecommend(candidate.employee_id || candidate.id, candidate.score || candidate.final_score)}
                  >
                    Recommend
                    <ArrowRight size={14} style={{ marginLeft: '4px' }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromotionDrawer;
