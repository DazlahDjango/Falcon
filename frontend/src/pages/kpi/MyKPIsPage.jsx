import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useMyKPIs, useMyKPIWeights } from '../../hooks/kpi/useMyKPIs';
import MyKPIsTable from '../../components/kpi/my-kpis/MyKPIsTable';
import MyKPIDetailModal from '../../components/kpi/my-kpis/MyKPIDetailModal';
import MyKPIsFilter from '../../components/kpi/my-kpis/MyKPIsFilter';
import styles from './MyKPIsPage.module.css';

const MyKPIsPage = () => {
    const { user } = useSelector((state) => state.auth);
    const [filters, setFilters] = useState({
        status: 'all',
        search: '',
        category: '',
    });
    const [selectedKpi, setSelectedKpi] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const { data: kpis, isLoading: kpisLoading, refetch: refetchKPIs } = useMyKPIs(user?.id, filters);
    const { data: weights, isLoading: weightsLoading } = useMyKPIWeights(user?.id);

    const handleViewDetails = (kpi) => {
        setSelectedKpi(kpi);
        setShowDetailModal(true);
    };

    const handleFilterChange = (newFilters) => {
        setFilters({ ...filters, ...newFilters });
    };

    const handleRefresh = () => {
        refetchKPIs();
    };

    // Create weight map for quick lookup
    const weightMap = {};
    if (weights) {
        weights.forEach(w => {
            weightMap[w.kpi_id] = w.weight;
        });
    }

    // Calculate total weight for validation
    const totalWeight = Object.values(weightMap).reduce((sum, w) => sum + w, 0);
    const isWeightValid = Math.abs(totalWeight - 100) < 0.01;

    return (
        <div className={styles.myKPIsPage}>
            <div className={styles.header}>
                <h1>My KPIs</h1>
                <p className={styles.subtitle}>
                    View and track all your assigned Key Performance Indicators
                </p>
            </div>

            <div className={styles.weightSummary}>
                <div className={styles.weightCard}>
                    <div className={styles.weightLabel}>Total Weight Distribution</div>
                    <div className={styles.weightValue}>
                        {totalWeight.toFixed(1)}%
                        {!isWeightValid && (
                            <span className={styles.weightWarning}>
                                ⚠️ Should be 100%
                            </span>
                        )}
                    </div>
                    <div className={styles.weightProgress}>
                        <div 
                            className={`${styles.weightBar} ${isWeightValid ? styles.valid : styles.invalid}`}
                            style={{ width: `${Math.min(100, totalWeight)}%` }}
                        />
                    </div>
                    <div className={styles.weightHint}>
                        Your KPIs are weighted. This shows how each contributes to your overall score.
                    </div>
                </div>
            </div>

            <MyKPIsFilter 
                filters={filters}
                onFilterChange={handleFilterChange}
                onRefresh={handleRefresh}
                isLoading={kpisLoading}
            />

            <MyKPIsTable
                kpis={kpis?.results || []}
                weights={weightMap}
                isLoading={kpisLoading || weightsLoading}
                onViewDetails={handleViewDetails}
            />

            {showDetailModal && selectedKpi && (
                <MyKPIDetailModal
                    kpi={selectedKpi}
                    userId={user?.id}
                    onClose={() => setShowDetailModal(false)}
                />
            )}
        </div>
    );
};

export default MyKPIsPage;