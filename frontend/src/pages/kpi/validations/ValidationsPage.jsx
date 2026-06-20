import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { PendingValidations, ValidationDetail } from '../../../components/kpi';
import { fetchPendingValidations, approveActual, rejectActual } from '../../../store/kpi';
import { useKPIPermissions } from '../../../hooks/kpi';

const ValidationsPage = () => {
    const dispatch = useDispatch();
    const { canValidateActuals, isManager, isExecutive, isSuperAdmin, isClientAdmin } = useKPIPermissions();
    const [selectedValidation, setSelectedValidation] = useState(null);
    
    const canValidate = canValidateActuals || isManager || isExecutive || isSuperAdmin || isClientAdmin;
    
    useEffect(() => {
        if (canValidate) {
            dispatch(fetchPendingValidations());
        }
    }, [dispatch, canValidate]);
    
    const handleApprove = async (id, comment) => {
        await dispatch(approveActual({ id, comment })).unwrap();
        dispatch(fetchPendingValidations());
        setSelectedValidation(null);
    };
    
    const handleReject = async (id, reasonId, comment) => {
        await dispatch(rejectActual({ id, reasonId, comment })).unwrap();
        dispatch(fetchPendingValidations());
        setSelectedValidation(null);
    };
    
    if (!canValidate) {
        return (
            <div className="kpi-page-container">
                <div className="unauthorized-message">
                    You don't have permission to access validations
                </div>
            </div>
        );
    }
    
    return (
        <div className="kpi-page-container">
            <div className="page-header">
                <h1>Pending Validations</h1>
            </div>
            
            <PendingValidations 
                onApprove={handleApprove}
                onReject={handleReject}
                canValidate={canValidate}
            />
        </div>
    );
};

export default ValidationsPage;