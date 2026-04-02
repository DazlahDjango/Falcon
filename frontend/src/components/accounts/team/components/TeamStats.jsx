import React from 'react';
import { FiUsers, FiUserCheck, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';
import StatsWidget from '../../dashboard/components/StatsWidget';

const TeamStats = ({ stats }) => {
    if (!stats) {
        return (
            <div className="team-stats-skeleton">
                <div className="stats-grid">
                    {[1, 2, 3, 4].map(i => (
                        <div className="stats-skeleton"/>
                    ))}
                </div>
            </div>
        );
    }
    return (
        <div className="team-stats">
            <div className="stats-grid">
                <StatsWidget 
                    title="Total Members"
                    value={stats.total_members || 0}
                    icon={<FiUsers />}
                    trend={stats.member_trend}
                    color="primary"
                />
                <StatsWidget 
                    title="Active Members"
                    value={stats.active_members || 0}
                    icon={<FiUserCheck />}
                    subtitle={`${stats.active_percentage || 0}% of total`}
                    color="success"
                />
                <StatsWidget 
                    title="Team Performance"
                    value={`${stats.avg_score || 0}%`}
                    icon={<FiTrendingUp />}
                    trend={stats.score_trend}
                    color="info"
                />
                <StatsWidget 
                    title="At Risk"
                    value={stats.at_risk_members || 0}
                    icon={<FiAlertCircle />}
                    subtitle={`${stats.at_risk_percentage || 0}% of team`}
                    color="warning"
                />
            </div>
        </div>
    );
};
export default TeamStats;