import React from 'react';
import { FiUser, FiMail, FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';
import TrafficLightIcon from '../../scores/TrafficLightIcon';

const TeamMembersTable = ({ members }) => {
    const getTrendIcon = (change) => {
        if (change > 0) return <FiTrendingUp size={12} color="var(--kpi-success)" />;
        if (change < 0) return <FiTrendingDown size={12} color="var(--kpi-danger)" />;
        return <FiMinus size={12} color="var(--kpi-warning)" />;
    };
    
    if (!members || members.length === 0) {
        return (
            <div className="dashboard-card">
                <div className="card-header">
                    <h3>Team Members</h3>
                </div>
                <div className="card-empty">No team members found</div>
            </div>
        );
    }
    
    return (
        <div className="dashboard-card">
            <div className="card-header">
                <h3>Team Members</h3>
                <span className="card-count">{members.length} members</span>
            </div>
            <div className="team-members-table">
                <table>
                    <thead>
                        <tr>
                            <th>Member</th>
                            <th>Score</th>
                            <th>Status</th>
                            <th>KPIs</th>
                            <th>Trend</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map((member, index) => (
                            <tr key={index}>
                                <td className="member-info">
                                    <div className="member-avatar">
                                        <FiUser size={16} />
                                    </div>
                                    <div>
                                        <div className="member-name">{member.name}</div>
                                        <div className="member-email">{member.email}</div>
                                    </div>
                                </td>
                                <td className="member-score">{member.score}%</td>
                                <td>
                                    <TrafficLightIcon status={member.status} size="sm" />
                                </td>
                                <td>{member.kpi_count}</td>
                                <td>{getTrendIcon(member.score_change)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeamMembersTable;