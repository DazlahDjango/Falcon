import React, { useState } from 'react';
import { FiSave, FiX, FiCheckCircle } from 'react-icons/fi';
import TargetCreateForm from './TargetCreateForm';
import KPILoading from '../../common/KPILoading';
import KPISuccess from '../../common/KPISuccess';

const TargetCreate = ({ kpis, users, onSubmit, onCancel, loading }) => {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (data) => {
        const result = await onSubmit(data);
        if (result) {
            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
                onCancel();
            }, 2000);
        }
    };

    if (loading) {
        return <KPILoading text="Creating target..." />;
    }

    if (submitted) {
        return <KPISuccess title="Success!" message="Target created successfully." />;
    }

    return (
        <div className="kpi-target-create">
            <div className="kpi-target-create-header">
                <h2>Create Annual Target</h2>
                <button className="kpi-target-create-close" onClick={onCancel}>
                    <FiX size={20} />
                </button>
            </div>
            
            <div className="kpi-target-create-content">
                <TargetCreateForm 
                    kpis={kpis}
                    users={users}
                    onSubmit={handleSubmit}
                    onCancel={onCancel}
                />
            </div>
        </div>
    );
};

export default TargetCreate;