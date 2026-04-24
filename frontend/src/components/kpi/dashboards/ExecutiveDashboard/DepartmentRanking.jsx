import React from 'react';
import PropTypes from 'prop-types';
import styles from './ExecutiveDashboard.module.css';

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
                        <div className={`${styles.departmentScore} ${getScoreColor(dept.score)}`}>
                            {dept.score?.toFixed(1)}%
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
    })),
};
DepartmentRanking.defaultProps = {
    departments: [],
};
export default DepartmentRanking;