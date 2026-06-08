import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { TrafficLight } from '../../common';
import styles from './ManagerDashboard.module.css';

const TeamMemberList = ({ teamMembers, onMemberClick }) => {
    const [sortBy, setSortBy] = useState('score');
    const [sortOrder, setSortOrder] = useState('desc');
    const [searchTerm, setSearchTerm] = useState('');
    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder == 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };
    const sortedMembers = [...teamMembers].sort((a, b) => {
        let aVal, bVal;
        switch (sortBy) {
            case 'name':
                aVal = a.name;
                bVal = b.name; 
                return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            case 'score':
                aVal = a.score || 0;
                bVal = b.score || 0;
                return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
            case 'status':
                const statusOrder = { GREEN: 3, YELLOW: 2, RED: 1 };
                aVal = statusOrder[a.status] || 0;
                bVal = statusOrder[b.status] || 0;
                return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
            default:
                return 0
        }
    });
    const filterMembers = sortedMembers.filter(member => {
        member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase())
    });
    const getSortIcon = (field) => {
        if (sortBy !== field) return '↕️';
        return sortOrder === 'asc' ? '↑' : '↓';
    };
    return (
        <div className={styles.teamSection}>
            <div className={styles.teamHeader}>
                <h3>Team Members</h3>
                <div className={styles.teamControls}>
                    <input
                        type="text"
                        placeholder="Search team members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            </div>

            <div className={styles.teamTable}>
                <div className={styles.tableHeader}>
                    <div className={styles.tableCell} onClick={() => handleSort('name')}>
                        Name {getSortIcon('name')}
                    </div>
                    <div className={styles.tableCell} onClick={() => handleSort('score')}>
                        Score {getSortIcon('score')}
                    </div>
                    <div className={styles.tableCell} onClick={() => handleSort('status')}>
                        Status {getSortIcon('status')}
                    </div>
                    <div className={styles.tableCell}>KPIs</div>
                </div>

                {filteredMembers.length === 0 ? (
                    <div className={styles.noResults}>
                        <p>No team members found.</p>
                    </div>
                ) : (
                    filteredMembers.map(member => (
                        <div 
                            key={member.userId} 
                            className={styles.tableRow}
                            onClick={() => onMemberClick(member.userId)}
                        >
                            <div className={styles.tableCell}>
                                <div className={styles.memberInfo}>
                                    <span className={styles.memberName}>{member.name}</span>
                                    <span className={styles.memberEmail}>{member.email}</span>
                                </div>
                            </div>
                            <div className={styles.tableCell}>
                                <span className={`${styles.memberScore} ${getScoreClass(member.score)}`}>
                                    {member.score?.toFixed(1) || 0}%
                                </span>
                            </div>
                            <div className={styles.tableCell}>
                                <TrafficLight 
                                    status={member.status} 
                                    size="sm" 
                                    showLabel={false}
                                />
                            </div>
                            <div className={styles.tableCell}>
                                {member.kpiCount || 0}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
    function getScoreClass(score) {
        if (score >= 90) return styles.scoreExcellent;
        if (score >= 70) return styles.scoreGood;
        if (score >= 50) return styles.scoreFair;
        return styles.scorePoor;
    }
};
TeamMemberList.propTypes = {
    teamMembers: PropTypes.arrayOf(PropTypes.shape({
        userId: PropTypes.string,
        name: PropTypes.string,
        email: PropTypes.string,
        score: PropTypes.number,
        status: PropTypes.string,
        kpiCount: PropTypes.number,
    })),
    onMemberClick: PropTypes.func,
};
TeamMemberList.defaultProps = {
    teamMembers: [],
    onMemberClick: () => {},
};
export default TeamMemberList;