import React from 'react';
import { FiMail, FiPhone, FiCalendar, FiStar } from 'react-icons/fi';
import UserRoleBadge from '../../users/components/UserRoleBadge';
import UserStatusBadge from '../../users/components/UserStatusBadge';

const TeamMemberCard = ({ member, onClick, detailed = false }) => {
    const getPerfomanceColor = (score) => {
        if (score >= 90) return 'excellent';
        if (score >= 75) return 'good';
        if (score >= 60) return 'average';
        return 'poor';
    };
    return (
        <div className={`team-member-card ${detailed ? 'detailed' : ''}`} onClick={onClick}>
            <div className="member-avatar">
                <img 
                    src={member.avatar_url || '/static/accounts/img/default-avatar.png'} 
                    alt={member.name}
                />
                {member.is_online && <span className="online-dot" />}
            </div>
            
            <div className="member-info">
                <h4 className="member-name">{member.name}</h4>
                <p className="member-title">{member.title || 'No title'}</p>
                <div className="member-badges">
                    <UserRoleBadge role={member.role} />
                    <UserStatusBadge isActive={member.is_active} />
                </div>
                
                {detailed && (
                    <>
                        <div className="member-details">
                            <div className="detail-row">
                                <FiMail size={14} />
                                <span>{member.email}</span>
                            </div>
                            {member.phone && (
                                <div className="detail-row">
                                    <FiPhone size={14} />
                                    <span>{member.phone}</span>
                                </div>
                            )}
                            <div className="detail-row">
                                <FiCalendar size={14} />
                                <span>Joined {new Date(member.joined_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                        
                        {member.performance_score !== undefined && (
                            <div className="member-performance">
                                <div className="performance-header">
                                    <FiStar size={14} />
                                    <span>Performance Score</span>
                                </div>
                                <div className="performance-score">
                                    <span className={`score-value ${getPerformanceColor(member.performance_score)}`}>
                                        {member.performance_score}%
                                    </span>
                                    <div className="score-bar">
                                        <div 
                                            className={`score-fill ${getPerformanceColor(member.performance_score)}`}
                                            style={{ width: `${member.performance_score}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {member.direct_reports_count > 0 && (
                            <div className="direct-reports">
                                <FiUsers size={14} />
                                <span>{member.direct_reports_count} direct report(s)</span>
                            </div>
                        )}
                    </>
                )}
            </div>
            
            {!detailed && member.performance_score !== undefined && (
                <div className="member-score">
                    <span className={`score-badge ${getPerformanceColor(member.performance_score)}`}>
                        {member.performance_score}%
                    </span>
                </div>
            )}
        </div>
    );
};
export default TeamMemberCard;