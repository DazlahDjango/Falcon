import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { fetchStrategicLinkages, createStrategicLinkage, deleteStrategicLinkage, selectStrategicLinkages, selectKPILoading } from '../../../../store/kpi';
import KPILoading from '../../common/KPILoading';
import KPIEmptyState from '../../common/KPIEmptyState';
import KPIConfirmDialog from '../../common/KPIConfirmDialog';

const KPIStrategicLinkages = ({ kpiId }) => {
    const dispatch = useDispatch();
    const [showForm, setShowForm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    
    const linkages = useSelector(selectStrategicLinkages);
    const loading = useSelector(selectKPILoading);
    
    useEffect(() => {
        dispatch(fetchStrategicLinkages({ kpiId }));
    }, [dispatch, kpiId]);
    
    const handleCreate = async (data) => {
        await dispatch(createStrategicLinkage({ kpiId, data })).unwrap();
        setShowForm(false);
        dispatch(fetchStrategicLinkages({ kpiId }));
    };
    
    const handleDelete = async () => {
        await dispatch(deleteStrategicLinkage(deleteId)).unwrap();
        setDeleteId(null);
        dispatch(fetchStrategicLinkages({ kpiId }));
    };
    
    if (loading) {
        return <KPILoading size="sm" text="Loading linkages..." />;
    }
    
    return (
        <div className="kpi-linkages-section">
            <div className="section-header">
                <h3>Strategic Linkages</h3>
                <button className="add-btn" onClick={() => setShowForm(true)}>
                    <FiPlus size={14} />
                    Add Linkage
                </button>
            </div>
            
            {linkages.length === 0 ? (
                <KPIEmptyState 
                    icon="🎯"
                    title="No Strategic Linkages"
                    description="Link this KPI to strategic objectives"
                />
            ) : (
                <div className="linkages-list">
                    {linkages.map(link => (
                        <div key={link.id} className="linkage-item">
                            <div className="linkage-info">
                                <div className="linkage-objective">{link.strategic_objective}</div>
                                <div className="linkage-meta">
                                    <span className="linkage-type">{link.linkage_type_display}</span>
                                    <span className="linkage-weight">Weight: {link.weight}%</span>
                                </div>
                                {link.description && (
                                    <div className="linkage-description">{link.description}</div>
                                )}
                            </div>
                            <button className="delete-btn" onClick={() => setDeleteId(link.id)}>
                                <FiTrash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            
            <KPIConfirmDialog
                isOpen={!!deleteId}
                title="Remove Linkage"
                message="Are you sure you want to remove this strategic linkage?"
                confirmText="Remove"
                type="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    );
};

export default KPIStrategicLinkages;