import React, { useState, useMemo } from 'react';
import { FiAlertCircle, FiCheckSquare, FiCalendar, FiFilter, FiCheckCircle } from 'react-icons/fi';
import ValidationList from './ValidationList';
import ValidationModal from './ValidationModal';
import PendingSummaryCard from './PendingSummaryCard';
import KPILoading from '../common/KPILoading';
import KPIError from '../common/KPIError';

const MONTH_NAMES = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const PendingValidations = ({ 
    validations, 
    summary, 
    loading, 
    error,
    onApprove, 
    onReject, 
    onRefresh, 
    canValidate 
}) => {
    const [selectedValidation, setSelectedValidation] = useState(null);
    const [modalType, setModalType] = useState(null); // 'approve', 'reject'
    const [selectedMonth, setSelectedMonth] = useState('ALL'); // 'ALL' or 'YYYY-MM'
    const [isBatchApproving, setIsBatchApproving] = useState(false);

    // Extract unique monthly periods from validations
    const availablePeriods = useMemo(() => {
        const periodSet = new Set();
        (validations || []).forEach(v => {
            if (v.year && v.month) {
                periodSet.add(`${v.year}-${String(v.month).padStart(2, '0')}`);
            } else if (v.period) {
                periodSet.add(v.period);
            }
        });
        return Array.from(periodSet).sort().reverse();
    }, [validations]);

    // Filter validations by selected period
    const filteredValidations = useMemo(() => {
        if (selectedMonth === 'ALL') return validations || [];
        return (validations || []).filter(v => {
            const periodStr = v.year && v.month ? `${v.year}-${String(v.month).padStart(2, '0')}` : v.period;
            return periodStr === selectedMonth;
        });
    }, [validations, selectedMonth]);

    const handleApprove = (validation) => {
        setSelectedValidation(validation);
        setModalType('approve');
    };

    const handleReject = (validation) => {
        setSelectedValidation(validation);
        setModalType('reject');
    };

    const handleConfirm = async (data) => {
        if (modalType === 'approve') {
            await onApprove(selectedValidation.id, data.comment);
        } else if (modalType === 'reject') {
            await onReject(selectedValidation.id, data.reasonId, data.comment);
        }
        setSelectedValidation(null);
        setModalType(null);
        onRefresh();
    };

    const handleBatchApprove = async () => {
        if (filteredValidations.length === 0 || isBatchApproving) return;
        const confirmMsg = `Are you sure you want to approve all ${filteredValidations.length} pending submissions${selectedMonth !== 'ALL' ? ` for Period ${selectedMonth}` : ''}?`;
        if (!window.confirm(confirmMsg)) return;

        try {
            setIsBatchApproving(true);
            for (const item of filteredValidations) {
                await onApprove(item.id, 'Batch Approved via Monthly Review');
            }
            onRefresh();
        } catch (err) {
            console.error('Batch approval error:', err);
        } finally {
            setIsBatchApproving(false);
        }
    };

    if (loading) {
        return <KPILoading text="Loading pending validations..." />;
    }

    if (error) {
        return <KPIError message={error} onRetry={onRefresh} />;
    }

    return (
        <div className="kpi-validations-container">
            {summary && <PendingSummaryCard summary={summary} />}

            {/* Non-blocking Monthly Review Policy Banner */}
            <div style={{
                padding: '0.85rem 1.25rem',
                backgroundColor: '#f0f9ff',
                borderRadius: '10px',
                border: '1px solid #bae6fd',
                color: '#0369a1',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '1rem'
            }}>
                <FiAlertCircle size={18} color="#0284c7" style={{ flexShrink: 0 }} />
                <span>
                    <strong>Monthly Review Cycle:</strong> Validations are reviewed month-by-month. Disputed or escalated items in prior months do not block reviewing current submissions.
                </span>
            </div>

            {/* Monthly Filter and Batch Action Bar */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                marginBottom: '1.25rem',
                flexWrap: 'wrap',
                gap: '0.75rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiCalendar size={15} color="#64748b" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Filter Period:</span>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        style={{
                            padding: '0.4rem 0.75rem',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            color: '#0f172a',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="ALL">All Pending Months ({validations?.length || 0})</option>
                        {availablePeriods.map(p => {
                            const [y, m] = p.split('-');
                            const mLabel = MONTH_NAMES[parseInt(m) - 1] || m;
                            return (
                                <option key={p} value={p}>
                                    {mLabel} {y}
                                </option>
                            );
                        })}
                    </select>
                </div>

                {canValidate && filteredValidations.length > 0 && (
                    <button
                        type="button"
                        onClick={handleBatchApprove}
                        disabled={isBatchApproving}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '0.45rem 1rem',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: '#10b981',
                            color: '#ffffff',
                            fontWeight: 600,
                            fontSize: '0.82rem',
                            cursor: isBatchApproving ? 'not-allowed' : 'pointer',
                            boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
                        }}
                    >
                        <FiCheckSquare size={14} />
                        {isBatchApproving ? 'Approving...' : `Approve All Filtered (${filteredValidations.length})`}
                    </button>
                )}
            </div>
            
            <ValidationList
                validations={filteredValidations}
                loading={loading}
                onApprove={handleApprove}
                onReject={handleReject}
                canValidate={canValidate}
            />
            
            <ValidationModal
                isOpen={!!modalType}
                type={modalType}
                validation={selectedValidation}
                onConfirm={handleConfirm}
                onClose={() => {
                    setSelectedValidation(null);
                    setModalType(null);
                }}
            />
        </div>
    );
};

export default PendingValidations;