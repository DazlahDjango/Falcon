import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { fetchTargets, createTarget, updateTarget, deleteTarget, selectTargets, selectTargetLoading } from '../../../../store/kpi';
import KPILoading from '../../common/KPILoading';
import KPIEmptyState from '../../common/KPIEmptyState';
import KPIConfirmDialog from '../../common/KPIConfirmDialog';

const KPITargets = ({ kpiId, kpi }) => {
    const dispatch = useDispatch();
    const [showForm, setShowForm] = useState(false);
    const [editingTarget, setEditingTarget] = useState(null);
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    
    const targets = useSelector(selectTargets);
    const loading = useSelector(selectTargetLoading);
    
    useEffect(() => {
        dispatch(fetchTargets({ kpi: kpiId }));
    }, [dispatch, kpiId]);
    
    const handleCreate = async (data) => {
        await dispatch(createTarget({ ...data, kpi: kpiId })).unwrap();
        setShowForm(false);
        dispatch(fetchTargets({ kpi: kpiId }));
    };
    
    const handleUpdate = async (id, data) => {
        await dispatch(updateTarget({ id, data })).unwrap();
        setEditingTarget(null);
        dispatch(fetchTargets({ kpi: kpiId }));
    };
    
    const handleDelete = async () => {
        await dispatch(deleteTarget(deleteTargetId)).unwrap();
        setDeleteTargetId(null);
        dispatch(fetchTargets({ kpi: kpiId }));
    };
    
    if (loading) {
        return <KPILoading size="sm" text="Loading targets..." />;
    }
    
    return (
        <div className="kpi-targets-section">
            <div className="section-header">
                <h3>Annual Targets</h3>
                <button className="add-btn" onClick={() => setShowForm(true)}>
                    <FiPlus size={14} />
                    Add Target
                </button>
            </div>
            
            {targets.length === 0 ? (
                <KPIEmptyState 
                    icon="🎯"
                    title="No Targets"
                    description="No annual targets have been set for this KPI"
                    actionText="Set Target"
                    onAction={() => setShowForm(true)}
                />
            ) : (
                <div className="targets-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Year</th>
                                <th>Target Value</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {targets.map(target => (
                                <tr key={target.id}>
                                    <td>{target.year}</td>
                                    <td>{target.target_value} {kpi?.unit}</td>
                                    <td>
                                        <span className={`status-badge ${target.is_approved ? 'approved' : 'pending'}`}>
                                            {target.is_approved ? 'Approved' : 'Pending'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="edit-btn" onClick={() => setEditingTarget(target)}>
                                            <FiEdit size={14} />
                                        </button>
                                        <button className="delete-btn" onClick={() => setDeleteTargetId(target.id)}>
                                            <FiTrash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {/* Target Form Modal would go here - similar to create pattern */}
            
            <KPIConfirmDialog
                isOpen={!!deleteTargetId}
                title="Delete Target"
                message="Are you sure you want to delete this target?"
                confirmText="Delete"
                type="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTargetId(null)}
            />
        </div>
    );
};

export default KPITargets;