import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiPlus, FiTrash2, FiArrowRight } from 'react-icons/fi';
import { fetchDependencies, createDependency, deleteDependency, selectDependencies, selectKPILoading } from '../../../../store/kpi';
import KPILoading from '../../common/KPILoading';
import KPIEmptyState from '../../common/KPIEmptyState';
import KPIConfirmDialog from '../../common/KPIConfirmDialog';

const KPIDependencies = ({ kpiId }) => {
    const dispatch = useDispatch();
    const [showForm, setShowForm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    
    const dependencies = useSelector(selectDependencies);
    const loading = useSelector(selectKPILoading);
    
    useEffect(() => {
        dispatch(fetchDependencies({ kpiId }));
    }, [dispatch, kpiId]);
    
    const handleCreate = async (data) => {
        await dispatch(createDependency({ ...data, source_kpi: kpiId })).unwrap();
        setShowForm(false);
        dispatch(fetchDependencies({ kpiId }));
    };
    
    const handleDelete = async () => {
        await dispatch(deleteDependency(deleteId)).unwrap();
        setDeleteId(null);
        dispatch(fetchDependencies({ kpiId }));
    };
    
    if (loading) {
        return <KPILoading size="sm" text="Loading dependencies..." />;
    }
    
    return (
        <div className="kpi-dependencies-section">
            <div className="section-header">
                <h3>KPI Dependencies</h3>
                <button className="add-btn" onClick={() => setShowForm(true)}>
                    <FiPlus size={14} />
                    Add Dependency
                </button>
            </div>
            
            {dependencies.length === 0 ? (
                <KPIEmptyState 
                    icon="🔗"
                    title="No Dependencies"
                    description="This KPI has no dependencies on other KPIs"
                />
            ) : (
                <div className="dependencies-list">
                    {dependencies.map(dep => (
                        <div key={dep.id} className="dependency-item">
                            <div className="dependency-flow">
                                <span className="kpi-name">{dep.source_kpi_name}</span>
                                <FiArrowRight size={16} />
                                <span className="kpi-name">{dep.target_kpi_name}</span>
                            </div>
                            <div className="dependency-details">
                                <span className="dependency-type">{dep.dependency_type_display}</span>
                                <span className="impact-factor">Impact: {dep.impact_factor}x</span>
                            </div>
                            <button className="delete-btn" onClick={() => setDeleteId(dep.id)}>
                                <FiTrash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            
            <KPIConfirmDialog
                isOpen={!!deleteId}
                title="Remove Dependency"
                message="Are you sure you want to remove this dependency?"
                confirmText="Remove"
                type="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    );
};

export default KPIDependencies;