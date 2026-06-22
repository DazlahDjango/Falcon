import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiPlus, FiEdit, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import { fetchKPIWeights, updateKPIWeights, selectKPIWeights, selectKPILoading } from '../../../../store/kpi';
import KPILoading from '../../common/KPILoading';
import KPIEmptyState from '../../common/KPIEmptyState';
import KPIWeightForm from '../weights/KPIWeightForm';

const KPIWeights = ({ kpiId, kpi }) => {
    const dispatch = useDispatch();
    const [showForm, setShowForm] = useState(false);
    const [editingWeight, setEditingWeight] = useState(null);
    
    const weights = useSelector(selectKPIWeights);
    const loading = useSelector(selectKPILoading);
    
    useEffect(() => {
        dispatch(fetchKPIWeights({ kpiId }));
    }, [dispatch, kpiId]);
    
    const totalWeight = weights.reduce((sum, w) => sum + (w.weight || 0), 0);
    const isValid = Math.abs(totalWeight - 100) <= 0.01;
    
    const handleUpdate = async (weightData) => {
        await dispatch(updateKPIWeights({ kpiId, weights: weightData })).unwrap();
        setShowForm(false);
        setEditingWeight(null);
        dispatch(fetchKPIWeights({ kpiId }));
    };
    
    if (loading) {
        return <KPILoading size="sm" text="Loading weights..." />;
    }
    
    return (
        <div className="kpi-weights-section">
            <div className="section-header">
                <h3>User Weight Distribution</h3>
                <button className="add-btn" onClick={() => setShowForm(true)}>
                    <FiPlus size={14} />
                    Set Weights
                </button>
            </div>
            
            <div className="weight-summary">
                <div className={`total-weight ${isValid ? 'valid' : 'invalid'}`}>
                    <span>Total Weight:</span>
                    <strong>{totalWeight.toFixed(1)}%</strong>
                    {isValid && <FiCheckCircle size={16} />}
                </div>
                {!isValid && (
                    <div className="weight-warning">
                        Total weight must equal 100% for accurate scoring
                    </div>
                )}
            </div>
            
            {weights.length === 0 ? (
                <KPIEmptyState 
                    icon="⚖️"
                    title="No Weights Assigned"
                    description="Assign weights to users for this KPI"
                    actionText="Assign Weights"
                    onAction={() => setShowForm(true)}
                />
            ) : (
                <div className="weights-table">
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Weight</th>
                                <th>Effective From</th>
                                <th>Effective To</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {weights.map(weight => (
                                <tr key={weight.id}>
                                    <td>{weight.user_full_name || weight.user_email}</td>
                                    <td><strong>{weight.weight}%</strong></td>
                                    <td>{weight.effective_from}</td>
                                    <td>{weight.effective_to || 'Current'}</td>
                                    <td>
                                        <span className={`status-badge ${weight.is_active ? 'active' : 'inactive'}`}>
                                            {weight.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="edit-btn" onClick={() => setEditingWeight(weight)}>
                                            <FiEdit size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {(showForm || editingWeight) && (
                <KPIWeightForm 
                    kpiId={kpiId}
                    weights={weights}
                    onSubmit={handleUpdate}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingWeight(null);
                    }}
                />
            )}
        </div>
    );
};

export default KPIWeights;