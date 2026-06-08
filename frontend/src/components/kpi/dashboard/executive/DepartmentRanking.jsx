// frontend/src/components/executive/DepartmentRanking/index.js
import React from 'react';
import PropTypes from 'prop-types';
import styles from './ExecutiveDashboard.module.css';

const getScoreColor = (score) => {
    if (score >= 80) return styles.scoreExcellent;
    if (score >= 60) return styles.scoreGood;
    if (score >= 40) return styles.scoreWarning;
    return styles.scoreCritical;
};

const DepartmentRanking = ({ departments }) => {
    if (!departments || departments.length === 0) {
        return (
            <div className={styles.rankingContainer}>
                <h4>Department Ranking</h4>
                <p className={styles.noData}>No department data available</p>
            </div>
        );
    }

    const getRankColor = (rank) => {
        if (rank === 1) return styles.gold;
        if (rank === 2) return styles.silver;
        if (rank === 3) return styles.bronze;
        return '';
    };

    return (
        <div className={styles.rankingContainer}>
            <h4>Department Ranking</h4>
            <div className={styles.rankingList}>
                {departments.map((dept, index) => (
                    <div key={dept.departmentId || index} className={styles.rankingItem}>
                        <div className={styles.rankInfo}>
                            <span className={`${styles.rankNumber} ${getRankColor(index + 1)}`}>
                                #{index + 1}
                            </span>
                            <span className={styles.departmentName}>{dept.department}</span>
                        </div>
                        <div className={styles.departmentStats}>
                            <span className={styles.kpiCount}>
                                {dept.totalScores} KPIs
                            </span>
                            <div className={`${styles.departmentScore} ${getScoreColor(dept.score)}`}>
                                {dept.score?.toFixed(1)}%
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

DepartmentRanking.propTypes = {
    departments: PropTypes.arrayOf(PropTypes.shape({
        departmentId: PropTypes.string,
        department: PropTypes.string,
        score: PropTypes.number,
        totalScores: PropTypes.number,
        greenCount: PropTypes.number,
        yellowCount: PropTypes.number,
        redCount: PropTypes.number,
    })),
};

DepartmentRanking.defaultProps = {
    departments: [],
};

export default DepartmentRanking;