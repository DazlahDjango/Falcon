import React from 'react';
import PropTypes from 'prop-types';
import styles from './CascadeTree.module.css';

const CascadeTree = ({ cascadeMaps, target, onRollback }) => {
    const [expandedNodes, setExpandedNodes] = React.useState(new Set());
    const toggleNode = (nodeId) => {
        const newSet = new Set(expandedNodes);
        if (newSet.has(nodeId)) {
            newSet.delete(nodeId);
        } else {
            newSet.add(nodeId);
        }
    };
    const formatValue = (value) => {
        return `${value.toFixed(2)} ${target?.unit || ''}`;
    };
    const formatPercentage = (percentage) => {
        return `${percentage.toFixed(1)}%`;
    };
    const departmentGroups = {};
    cascadeMaps.forEach(map => {
        if (map.department_target) {
            const deptId = map.department_target.id;
            if (!departmentGroups[deptId]) {
                departmentGroups[deptId] = {
                    id: deptId,
                    name: map.department_target.name || `Department ${deptId}`,
                    target_value: map.department_target.target_value,
                    contribution: map.contribution_percentage,
                    individuals: []
                };
            }
        }
        if (map.individual_target) {
            const deptId = map.department_target?.id;
            if (deptId && departmentGroups[deptId]) {
                departmentGroups[deptId].individuals.push({
                    id: map.individual_target.id,
                    name: map.individual_target.user_name || `User ${map.individual_target.user_id}`,
                    target_value: map.individual_target.target_value,
                    contribution: map.contribution_percentage
                });
            }
        }
    });
    const departments = Object.values(departmentGroups);
    return (
        <div className={styles.cascadeTree}>
            {/* Root - Organization Target */}
            <div className={styles.rootNode}>
                <div className={styles.nodeHeader}>
                    <div className={styles.nodeIcon}>🏢</div>
                    <div className={styles.nodeContent}>
                        <div className={styles.nodeTitle}>Organization Target</div>
                        <div className={styles.nodeValue}>
                            {formatValue(target.target_value)}
                        </div>
                    </div>
                </div>
                <div className={styles.nodeConnector} />
            </div>

            {/* Department Level */}
            <div className={styles.departmentLevel}>
                {departments.map(dept => (
                    <div key={dept.id} className={styles.departmentNode}>
                        <div 
                            className={styles.nodeHeader}
                            onClick={() => toggleNode(dept.id)}
                        >
                            <div className={styles.nodeIcon}>🏛️</div>
                            <div className={styles.nodeContent}>
                                <div className={styles.nodeTitle}>
                                    {dept.name}
                                    <span className={styles.contribution}>
                                        ({formatPercentage(dept.contribution)})
                                    </span>
                                </div>
                                <div className={styles.nodeValue}>
                                    {formatValue(dept.target_value)}
                                </div>
                            </div>
                            <div className={styles.expandIcon}>
                                {expandedNodes.has(dept.id) ? '▼' : '▶'}
                            </div>
                        </div>
                        
                        {expandedNodes.has(dept.id) && dept.individuals.length > 0 && (
                            <div className={styles.individualsLevel}>
                                {dept.individuals.map(individual => (
                                    <div key={individual.id} className={styles.individualNode}>
                                        <div className={styles.nodeHeader}>
                                            <div className={styles.nodeIcon}>👤</div>
                                            <div className={styles.nodeContent}>
                                                <div className={styles.nodeTitle}>
                                                    {individual.name}
                                                    <span className={styles.contribution}>
                                                        ({formatPercentage(individual.contribution)})
                                                    </span>
                                                </div>
                                                <div className={styles.nodeValue}>
                                                    {formatValue(individual.target_value)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {expandedNodes.has(dept.id) && dept.individuals.length === 0 && (
                            <div className={styles.emptyMessage}>
                                No individual targets assigned yet
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {departments.length === 0 && (
                <div className={styles.emptyState}>
                    No cascade structure configured yet
                </div>
            )}

            <div className={styles.actions}>
                <button 
                    onClick={() => {
                        if (cascadeMaps.length > 0 && window.confirm('Are you sure you want to rollback this cascade? This will delete all cascaded targets.')) {
                            onRollback(cascadeMaps[0].id);
                        }
                    }}
                    className={styles.rollbackButton}
                    disabled={cascadeMaps.length === 0}
                >
                    Rollback Cascade
                </button>
            </div>
        </div>
    );
};
CascadeTree.propTypes = {
    cascadeMaps: PropTypes.array.isRequired,
    target: PropTypes.shape({
        target_value: PropTypes.number,
        unit: PropTypes.string,
    }).isRequired,
    onRollback: PropTypes.func.isRequired,
};
export default CascadeTree;