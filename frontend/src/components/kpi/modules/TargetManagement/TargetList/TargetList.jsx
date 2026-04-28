import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import targetService from '../../../../../services/kpi/target.service';
import { PeriodSelector } from '../../../common';
import styles from './TargetList.module.css';

const TargetList = ({ onTargetSelect, onManagePhasing, onManageCascade, refreshTrigger, onError }) => {
    const [targets, setTargets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedKpi, setSelectedKpi] = useState('');
    const [kpis, setKpis] = useState([]);
    const [users, setUsers] = useState([]);
    useEffect(() => {
        fetchTargets();
        fetchFilters();
    }, [selectedYear, selectedUser, selectedKpi, refreshTrigger]);
    const fetchTargets = async () => {
        setLoading(true);
        try {
            const params = { year: selectedYear };
            if (selectedUser) params.user = selectedUser;
            if (selectedKpi) params.kpi = selectedKpi;
            const response = await targetService.getTargets(params);
            setTargets(response.results || []);
        } catch (error) {
            console.error('Failed to fetch targets:', error);
            if (onError) onError(error);
        } finally {
            setLoading(false);
        }
    };
    const fetchFilters = async () => {
        try {
            // Fetch KPIs for filter
            const kpiResponse = await fetch('/api/kpi/kpis/?page_size=100');
            const kpiData = await kpiResponse.json();
            setKpis(kpiData.results || []);
            // Fetch users for filter
            const userResponse = await fetch('/api/accounts/users/');
            const userData = await userResponse.json();
            setUsers(userData.results || []);
        } catch (error) {
            console.error('Failed to fetch filters:', error);
        }
    };
    const handleYearChange = (year, month) => {
        setSelectedYear(year);
    };
    const handleUserChange = (e) => {
        setSelectedUser(e.target.value);
    };
    const handleKpiChange = (e) => {
        setSelectedKpi(e.target.value);
    };
    const clearFilters = () => {
        setSelectedUser('');
        setSelectedKpi('');
    };
    const getStatusBadge = (target) => {
        if (target.approved_by) {
            return <span className={styles.approvedBadge}>Approved</span>;
        }
        return <span className={styles.pendingBadge}>Pending</span>;
    };
    return (
        <div className={styles.targetList}>
            <div className={styles.header}>
                <h2>Annual Targets</h2>
                <PeriodSelector
                    year={selectedYear}
                    month={1}
                    onChange={handleYearChange}
                    showQuickNav={false}
                />
            </div>

            <div className={styles.filters}>
                <div className={styles.filterGroup}>
                    <label>User</label>
                    <select value={selectedUser} onChange={handleUserChange}>
                        <option value="">All Users</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>{user.name || user.email}</option>
                        ))}
                    </select>
                </div>
                <div className={styles.filterGroup}>
                    <label>KPI</label>
                    <select value={selectedKpi} onChange={handleKpiChange}>
                        <option value="">All KPIs</option>
                        {kpis.map(kpi => (
                            <option key={kpi.id} value={kpi.id}>{kpi.name}</option>
                        ))}
                    </select>
                </div>
                {(selectedUser || selectedKpi) && (
                    <button onClick={clearFilters} className={styles.clearButton}>
                        Clear Filters
                    </button>
                )}
            </div>

            <div className={styles.listContainer}>
                {loading ? (
                    <div className={styles.loadingState}>
                        <div className={styles.spinner} />
                        <p>Loading targets...</p>
                    </div>
                ) : targets.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>🎯</div>
                        <p>No targets found for {selectedYear}</p>
                    </div>
                ) : (
                    <>
                        <div className={styles.tableHeader}>
                            <div className={styles.headerCell}>KPI</div>
                            <div className={styles.headerCell}>User</div>
                            <div className={styles.headerCell}>Target Value</div>
                            <div className={styles.headerCell}>Status</div>
                            <div className={styles.headerCell}>Actions</div>
                        </div>
                        {targets.map(target => (
                            <div key={target.id} className={styles.tableRow}>
                                <div className={styles.cell}>
                                    <div className={styles.kpiName}>{target.kpi_name}</div>
                                    <div className={styles.kpiCode}>{target.kpi_code}</div>
                                </div>
                                <div className={styles.cell}>
                                    {target.user_email || target.user}
                                </div>
                                <div className={styles.cell}>
                                    <span className={styles.targetValue}>
                                        {target.target_value} {target.unit}
                                    </span>
                                </div>
                                <div className={styles.cell}>
                                    {getStatusBadge(target)}
                                </div>
                                <div className={styles.cell}>
                                    <button 
                                        onClick={() => onTargetSelect(target.id)}
                                        className={styles.actionButton}
                                        title="Manage Phasing"
                                    >
                                        📊 Phase
                                    </button>
                                    <button 
                                        onClick={() => onManageCascade()}
                                        className={styles.actionButton}
                                        title="Cascade Target"
                                    >
                                        🌳 Cascade
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};
TargetList.propTypes = {
    onTargetSelect: PropTypes.func.isRequired,
    onManagePhasing: PropTypes.func.isRequired,
    onManageCascade: PropTypes.func.isRequired,
    refreshTrigger: PropTypes.number,
    onError: PropTypes.func,
};
export default TargetList;