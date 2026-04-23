import React, { useState } from 'react';
import PropTypes from 'prop-types';
import KPIList from './KPIList';
import KPIDetail from './KPIDetail';
import KPICreate from './KPICreate';
import KPIEdit from './KPIEdit';
import KPIWeight from './KPIWeight';
import styles from './KPIManagement.module.css';

const KPIManagement = ({ 
    initialView = 'list',
    initialKpiId = null,
    onKpiChange,
    onError 
}) => {
    const [currentView, setCurrentView] = useState(initialView);
    const [selectedKpiId, setSelectedKpiId] = useState(initialKpiId);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const handleKpiSelect = (kpiId) => {
        setSelectedKpiId(kpiId);
        setCurrentView('detail');
        if (onKpiChange) onKpiChange(kpiId);
    };
    const handleCreateComplete = (newKpi) => {
        setRefreshTrigger(prev => prev + 1);
        setCurrentView('list');
    };
    const handleEditComplete = () => {
        setRefreshTrigger(prev => prev + 1);
        setCurrentView('detail');
    };
    const handleWeightComplete = () => {
        setRefreshTrigger(prev => prev + 1);
        setCurrentView('detail');
    };
    const handleBack = () => {
        setCurrentView('list');
        setSelectedKpiId(null);
    };
    const handleError = (error) => {
        if (onError) onError(error);
    };
    const renderView = () => {
        switch (currentView) {
            case 'list':
                return (
                    <KPIList
                        onKpiSelect={handleKpiSelect}
                        onCreateNew={() => setCurrentView('create')}
                        refreshTrigger={refreshTrigger}
                        onError={handleError}
                    />
                );
            case 'detail':
                return (
                    <KPIDetail
                        kpiId={selectedKpiId}
                        onBack={handleBack}
                        onEdit={() => setCurrentView('edit')}
                        onManageWeights={() => setCurrentView('weights')}
                        onRefresh={() => setRefreshTrigger(prev => prev + 1)}
                        onError={handleError}
                    />
                );
            case 'create':
                return (
                    <KPICreate
                        onComplete={handleCreateComplete}
                        onCancel={handleBack}
                        onError={handleError}
                    />
                );
            case 'edit':
                return (
                    <KPIEdit
                        kpiId={selectedKpiId}
                        onComplete={handleEditComplete}
                        onCancel={handleBack}
                        onError={handleError}
                    />
                );
            case 'weights':
                return (
                    <KPIWeight
                        kpiId={selectedKpiId}
                        onComplete={handleWeightComplete}
                        onCancel={handleBack}
                        onError={handleError}
                    />
                );
            default:
                return null;
        }
    };
    return (
        <div className={styles.kpiManagement}>
            {renderView()}
        </div>
    );
};
KPIManagement.propTypes = {
    initialView: PropTypes.oneOf(['list', 'detail', 'create', 'edit', 'weights']),
    initialKpiId: PropTypes.string,
    onKpiChange: PropTypes.func,
    onError: PropTypes.func
};
KPIManagement.defaultProps = {
    initialView: 'list',
};
export default KPIManagement;