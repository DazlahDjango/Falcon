import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ActualEntryForm from './ActualEntryForm';
import ActualEntryHistory from './ActualEntryHistory';
import { PeriodSelector } from '../../../common';
import actualService from '../../../../../services/kpi/actual.service';
import kpiService from '../../../../../services/kpi/kpi.service';
import styles from './ActualEntryPage.module.css';

const ActualEntryPage = ({ userId, refreshTrigger, onRefresh, onError }) => {
    const [kpis, setKpis] = useState([]);
    const [selectedKpi, setSelectedKpi] = useState(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [existingActual, setExistingActual] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    useEffect(() => {
        fetchKPIs();
    }, [userId]);
    useEffect(() => {
        if (selectedKpi) {
            fetchExistingActual();
            fetchHistory();
        }
    }, [selectedKpi, selectedYear, selectedMonth, refreshTrigger]);
    const fetchKPIs = async () => {
        try {
            const response = await kpiService.getKPIs({ owner: userId, is_active: true });
            setKpis(response.results || []);
            if (response.results?.length > 0) {
                setSelectedKpi(response.results[0]);
            }
        } catch (error) {
             console.error('Failed to fetch KPIs:', error);
            if (onError) onError(error);
        } finally {
            setLoading(false);
        }
    };
    const fetchExistingActual = async () => {
        if (!selectedKpi) return;
        try {
            const response = await actualService.getActuals({
                kpi: selectedKpi.id,
                user: userId,
                year: selectedYear,
                month: selectedMonth
            });
            setExistingActual(response.results?.[0] || null);
        } catch (error) {
            console.error('Failed to fetch existing actual:', error);
        }
    };
    const fetchHistory = async () => {
        if (!selectedKpi) return;
        try {
            const response = await actualService.getActualHistory(selectedKpi.id, userId);
            setHistory(response.results || []);
        } catch (error) {
            console.error('Failed to fetch history:', error);
        }
    };
    const handleSubmit = async (data) => {
        setSubmitting(true);
        try {
            if (existingActual) {
                await actualService.updateActual(existingActual.id, data);
            } else {
                await actualService.createActual({
                    ...data,
                    kpi_id: selectedKpi.id,
                    user_id: userId,
                    year: selectedYear,
                    month: selectedMonth
                });
            }
            onRefresh();
        } catch (error) {
            console.error('Failed to submit actual:', error);
            if (onError) onError(error);
        } finally {
            setSubmitting(false);
        }
    };
    const handlePeriodChange = (year, month) => {
        setSelectedYear(year);
        setSelectedMonth(month);
    };
    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p>Loading your KPIs...</p>
            </div>
        );
    }
    if (kpis.length === 0) {
        return (
            <div className={styles.emptyContainer}>
                <div className={styles.emptyIcon}>📊</div>
                <p>You don't have any active KPIs assigned.</p>
                <p className={styles.emptyHint}>Contact your manager to assign KPIs for performance tracking.</p>
            </div>
        );
    }
    return (
        <div className={styles.actualEntryPage}>
            <div className={styles.kpiSelector}>
                <label>Select KPI</label>
                <select 
                    value={selectedKpi?.id || ''} 
                    onChange={(e) => setSelectedKpi(kpis.find(k => k.id === e.target.value))}
                    className={styles.kpiSelect}
                >
                    {kpis.map(kpi => (
                        <option key={kpi.id} value={kpi.id}>{kpi.name} ({kpi.code})</option>
                    ))}
                </select>
            </div>

            <div className={styles.periodSelector}>
                <PeriodSelector
                    year={selectedYear}
                    month={selectedMonth}
                    onChange={handlePeriodChange}
                />
            </div>

            {selectedKpi && (
                <>
                    <div className={styles.kpiInfo}>
                        <div className={styles.kpiDetail}>
                            <span className={styles.kpiName}>{selectedKpi.name}</span>
                            <span className={styles.kpiCode}>{selectedKpi.code}</span>
                        </div>
                        <div className={styles.kpiMeta}>
                            <span>Type: {selectedKpi.kpi_type}</span>
                            <span>Unit: {selectedKpi.unit || 'N/A'}</span>
                            <span>Logic: {selectedKpi.calculation_logic === 'HIGHER_IS_BETTER' ? 'Higher is Better' : 'Lower is Better'}</span>
                        </div>
                    </div>

                    <ActualEntryForm
                        kpi={selectedKpi}
                        existingActual={existingActual}
                        onSubmit={handleSubmit}
                        isLoading={submitting}
                    />

                    <ActualEntryHistory
                        history={history}
                        kpi={selectedKpi}
                    />
                </>
            )}
        </div>
    );
};
ActualEntryPage.propTypes = {
    userId: PropTypes.string.isRequired,
    refreshTrigger: PropTypes.number,
    onRefresh: PropTypes.func.isRequired,
    onError: PropTypes.func,
};
export default ActualEntryPage;