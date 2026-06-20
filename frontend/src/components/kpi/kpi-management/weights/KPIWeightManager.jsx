import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiPlus, FiSave, FiAlertCircle } from 'react-icons/fi';
import KPIWeightList from './KPIWeightList';
import KPIWeightForm from './KPIWeightForm';
import KPIWeightValidation from './KPIWeightValidation';
import { fetchKPIWeights, updateKPIWeights, validateWeightSum, selectKPIWeights, selectWeightValidation, selectKPILoading } from '../../../../store/kpi';
import KPILoading from '../../common/KPILoading';
import KPIEmptyState from '../../common/KPIEmptyState';

const KPIWeightManager = ({ kpiId, kpiName, userId, readOnly = false }) => {
    const dispatch = useDispatch();
    const [showForm, setShowForm] = useState(false);
    const [editingWeight, setEditingWeight] = useState(null);
    const [localWeights, setLocalWeights] = useState([]);
    
    const weights = useSelector(selectKPIWeights);
    const weightValidation = useSelector(selectWeightValidation);
    const loading = useSelector(selectKPILoading);
    
    useEffect(() => {
        if (kpiId) {
            dispatch(fetchKPIWeights({ kpiId }));
        }
    }, [dispatch, kpiId]);
    
    useEffect(() => {
        if (weights) {
            setLocalWeights(weights);
        }
    }, [weights]);
    
    const handleAddWeight = (weightData) => {
        const newWeights = [...localWeights, { ...weightData, id: Date.now(), is_new: true }];
        setLocalWeights(newWeights);
        setShowForm(false);
    };
    
    const handleUpdateWeight = (id, weightData) => {
        const updatedWeights = localWeights.map(w => 
            w.id === id ? { ...w, ...weightData, is_updated: true } : w
        );
        setLocalWeights(updatedWeights);
        setEditingWeight(null);
    };
    
    const handleDeleteWeight = (id) => {
        const updatedWeights = localWeights.filter(w => w.id !== id);
        setLocalWeights(updatedWeights);
    };
    
    const handleSaveAll = async () => {
        const weightsToSave = localWeights.map(w => ({
            user_id: w.user_id,
            weight: w.weight,
            effective_from: w.effective_from,
            effective_to: w.effective_to,
            is_active: w.is_active
        }));
        await dispatch(updateKPIWeights({ kpiId, weights: weightsToSave })).unwrap();
        dispatch(fetchKPIWeights({ kpiId }));
    };
    
    const handleValidate = async () => {
        await dispatch(validateWeightSum({ userId: userId || localWeights[0]?.user_id, weights: localWeights.map(w => w.weight) })).unwrap();
    };
    
    const totalWeight = localWeights.reduce((sum, w) => sum + (w.weight || 0), 0);
    const isValid = Math.abs(totalWeight - 100) <= 0.01;
    
    if (loading) {
        return <KPILoading size="sm" text="Loading weights..." />;
    }
    
    return (
        <div className="kpi-weight-manager">
            <div className="weight-manager-header">
                <div>
                    <h3>Weight Distribution</h3>
                    <p>Assign percentage weights to users for {kpiName || 'this KPI'}</p>
                </div>
                <div className="weight-actions">
                    {!readOnly && (
                        <>
                            <button className="weight-validate-btn" onClick={handleValidate}>
                                <FiAlertCircle size={14} />
                                Validate
                            </button>
                            <button className="weight-add-btn" onClick={() => setShowForm(true)}>
                                <FiPlus size={14} />
                                Add User Weight
                            </button>
                            {localWeights.length > 0 && (
                                <button className="weight-save-btn" onClick={handleSaveAll}>
                                    <FiSave size={14} />
                                    Save All
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
            
            <div className="weight-summary">
                <div className={`total-weight ${isValid ? 'valid' : 'invalid'}`}>
                    <span>Total Weight:</span>
                    <strong>{totalWeight.toFixed(1)}%</strong>
                    {!isValid && (
                        <span className="warning-text">(Must equal 100%)</span>
                    )}
                </div>
                {weightValidation && (
                    <KPIWeightValidation validation={weightValidation} />
                )}
            </div>
            
            {localWeights.length === 0 ? (
                <KPIEmptyState 
                    icon="⚖️"
                    title="No Weights Assigned"
                    description="Assign percentage weights to users for this KPI"
                    actionText="Add Weight"
                    onAction={() => setShowForm(true)}
                />
            ) : (
                <KPIWeightList 
                    weights={localWeights}
                    onEdit={setEditingWeight}
                    onDelete={handleDeleteWeight}
                    readOnly={readOnly}
                />
            )}
            
            {showForm && (
                <KPIWeightForm 
                    onSubmit={handleAddWeight}
                    onCancel={() => setShowForm(false)}
                />
            )}
            
            {editingWeight && (
                <KPIWeightForm 
                    weight={editingWeight}
                    onSubmit={(data) => handleUpdateWeight(editingWeight.id, data)}
                    onCancel={() => setEditingWeight(null)}
                />
            )}
        </div>
    );
};

export default KPIWeightManager;