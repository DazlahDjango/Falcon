import React, { useState } from 'react';
import { DashboardCard } from '../../../components/dashboard/common';

export const KPIAssignmentPanel = ({
    assignedKPIs,
    availableKPIs,
    loading,
    onRefresh,
    onAssign,
    onUnassign,
    onUpdateWeight,
    targetUser
}) => {
    const [selectedKpi, setSelectedKpi] = useState(null);
    const [weight, setWeight] = useState(1);

    const handleAssign = () => {
        if (selectedKpi) {
            onAssign?.(selectedKpi.id, weight);
            setSelectedKpi(null);
            setWeight(1);
        }
    };

    const handleWeightChange = (kpiId, newWeight) => {
        onUpdateWeight?.(kpiId, newWeight);
    };

    return (
        <DashboardCard
            title={`KPI Assignment${targetUser ? ` for ${targetUser.name}` : ''}`}
            loading={loading}
            onRefresh={onRefresh}
        >
            <div className="kpi-assignment-layout">
                {/* Assigned KPIs Column */}
                <div className="assigned-kpis">
                    <h4>Assigned KPIs ({assignedKPIs?.length || 0})</h4>
                    <div className="assigned-list">
                        {assignedKPIs?.map(kpi => (
                            <div key={kpi.id} className="assigned-kpi-item">
                                <div className="kpi-info">
                                    <div className="kpi-name">{kpi.name}</div>
                                    <div className="kpi-weight">
                                        Weight:
                                        <input
                                            type="number"
                                            value={kpi.weight}
                                            onChange={(e) => handleWeightChange(kpi.id, parseInt(e.target.value))}
                                            min="0"
                                            max="100"
                                            className="weight-input"
                                        />
                                    </div>
                                </div>
                                <button
                                    className="remove-btn"
                                    onClick={() => onUnassign?.(kpi.id)}
                                    title="Remove"
                                >
                                    ✗
                                </button>
                            </div>
                        ))}
                        {(!assignedKPIs || assignedKPIs.length === 0) && (
                            <div className="empty-message">No KPIs assigned</div>
                        )}
                    </div>
                </div>

                {/* Available KPIs Column */}
                <div className="available-kpis">
                    <h4>Available KPIs ({availableKPIs?.length || 0})</h4>
                    <div className="available-list">
                        <select
                            value={selectedKpi?.id || ''}
                            onChange={(e) => {
                                const kpi = availableKPIs?.find(k => k.id === e.target.value);
                                setSelectedKpi(kpi);
                            }}
                            className="kpi-select"
                        >
                            <option value="">Select KPI to assign</option>
                            {availableKPIs?.map(kpi => (
                                <option key={kpi.id} value={kpi.id}>
                                    {kpi.name} (Target: {kpi.target})
                                </option>
                            ))}
                        </select>

                        {selectedKpi && (
                            <div className="assignment-controls">
                                <label>
                                    Weight:
                                    <input
                                        type="number"
                                        value={weight}
                                        onChange={(e) => setWeight(parseInt(e.target.value))}
                                        min="1"
                                        max="100"
                                    />
                                </label>
                                <button onClick={handleAssign}>+ Assign KPI</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardCard>
    );
};

export default KPIAssignmentPanel;