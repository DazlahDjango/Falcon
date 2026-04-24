import React, { useState } from 'react';
import PropTypes from 'prop-types';
import TargetList from './TargetList';
import TargetPhasing from './TargetPhasing';
import TargetCascade from './TargetCascade';
import styles from './TargetManagement.module.css';

const TargetManagement = ({ 
    initialView = 'list',
    initialTargetId = null,
    onTargetChange,
    onError 
}) => {
    const [currentView, setCurrentView] = useState(initialView);
    const [selectedTargetId, setSelectedTargetId] = useState(initialTargetId);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const handleTargetSelect = (targetId) => {
        setSelectedTargetId(targetId);
        setCurrentView('phasing');
        if (onTargetChange) onTargetChange(targetId);
    };
    const handlePhasingComplete = () => {
        setRefreshTrigger(prev => prev + 1);
        setCurrentView('list');
    };
    const handleCascadeComplete = () => {
        setRefreshTrigger(prev => prev + 1);
        setCurrentView('list');
    };
    const handleBack = () => {
        setCurrentView('list');
        setSelectedTargetId(null);
    };
    const handleError = (error) => {
        if (onError) onError(error);
    };
    const renderView = () => {
        switch (currentView) {
            case 'list':
                return (
                    <TargetList
                        onTargetSelect={handleTargetSelect}
                        onManagePhasing={() => setCurrentView('phasing')}
                        onManageCascade={() => setCurrentView('cascade')}
                        refreshTrigger={refreshTrigger}
                        onError={handleError}
                    />
                );
            case 'phasing':
                return (
                    <TargetPhasing
                        targetId={selectedTargetId}
                        onComplete={handlePhasingComplete}
                        onCancel={handleBack}
                        onError={handleError}
                    />
                );
            case 'cascade':
                return (
                    <TargetCascade
                        targetId={selectedTargetId}
                        onComplete={handleCascadeComplete}
                        onCancel={handleBack}
                        onError={handleError}
                    />
                )
            default:
                return null;
        }
    };
    return (
        <div className={styles.targetManagement}>
            {renderView()}
        </div>
    );
};
TargetManagement.propTypes = {
    initialView: PropTypes.oneOf(['list', 'phasing', 'cascade']),
    initialTargetId: PropTypes.string,
    onTargetChange: PropTypes.func,
    onError: PropTypes.func,
};
TargetManagement.defaultProps = {
    initialView: 'list',
};
export default TargetManagement;