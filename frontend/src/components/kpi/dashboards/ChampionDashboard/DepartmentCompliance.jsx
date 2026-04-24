import React from 'react';
import PropTypes from 'prop-types';
import styles from './ChampionDashboard.module.css';

const DepartmentCompliance = ({ departments }) => {
    if (!departments || departments.length === 0) {
        return (
            <div className={styles.complianceContainer}>
                <h4>Department Compliance</h4>
                <p className={styles.noData}>No department compliance data available</p>
            </div>
        );
    }
    const getComplianceColor = (rate) => {
        if (rate >= 90) return styles.highCompliance;
        if (rate >= 70) return styles.mediumCompliance;
        return styles.lowCompliance;
    };
    return (
        <div className={styles.complianceContainer}>
            <h4>Department Compliance</h4>
            <div className={styles.complianceList}>
                {departments.map((dept, index) => (
                    <div key={index} className={styles.complianceItem}>
                        <div className={styles.complianceInfo}>
                            <span className={styles.departmentName}>{dept.department}</span>
                            <span className={styles.complianceStats}>
                                {dept.submitted}/{dept.totalMembers} submitted
                            </span>
                        </div>
                        <div className={styles.complianceBar}>
                            <div 
                                className={`${styles.complianceFill} ${getComplianceColor(dept.complianceRate)}`}
                                style={{ width: `${dept.complianceRate}%` }}
                            />
                            <span className={styles.complianceRate}>
                                {dept.complianceRate.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            <div className={styles.complianceNote}>
                * Compliance rate shows percentage of team members who have submitted data
            </div>
        </div>
    );
};
DepartmentCompliance.propTypes = {
    departments: PropTypes.arrayOf(PropTypes.shape({
        department: PropTypes.string,
        totalMembers: PropTypes.number,
        submitted: PropTypes.number,
        complianceRate: PropTypes.number,
    })),
};
DepartmentCompliance.defaultProps = {
    departments: [],
};
export default DepartmentCompliance;