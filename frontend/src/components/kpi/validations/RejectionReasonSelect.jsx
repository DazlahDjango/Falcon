import React, { useEffect } from 'react';
import useRejectionReasons from '../../../hooks/kpi/useRejectionReasons';
import KPILoading from '../common/KPILoading';

const RejectionReasonSelect = ({ value, onChange }) => {
    const { reasons, loading, refresh } = useRejectionReasons();

    useEffect(() => {
        refresh();
    }, []);

    if (loading) {
        return <KPILoading size="sm" text="Loading reasons..." />;
    }

    return (
        <div className="kpi-escalation-form-group">
            <label className="kpi-escalation-form-label">
                Rejection Reason <span style={{ color: 'var(--kpi-danger)' }}>*</span>
            </label>
            <select 
                className="kpi-rejection-select"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="">Select a reason...</option>
                {reasons.map(reason => (
                    <option key={reason.id} value={reason.id}>
                        {reason.category_display}: {reason.reason}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default RejectionReasonSelect;