import React, { useState } from 'react';
import { FiAlertTriangle, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import EscalationForm from './EscalationForm';
import EscalationList from './EscalationList';

const EscalationPanel = ({ 
    actualId, 
    escalations, 
    loading, 
    onEscalate, 
    onViewDetail,
    canEscalate 
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showForm, setShowForm] = useState(false);

    return (
        <div className="kpi-escalation-panel">
            <div 
                className="kpi-escalation-header"
                style={{ cursor: 'pointer' }}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <FiAlertTriangle size={16} />
                <span>Escalations ({escalations?.length || 0})</span>
                {isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </div>
            
            {isExpanded && (
                <>
                    {canEscalate && !showForm && (
                        <button 
                            className="kpi-validation-approve-btn"
                            onClick={() => setShowForm(true)}
                            style={{ marginBottom: 'var(--kpi-space-4)', background: 'var(--kpi-warning)' }}
                        >
                            <FiAlertTriangle size={14} />
                            Escalate This Issue
                        </button>
                    )}
                    
                    {showForm && (
                        <EscalationForm 
                            actualId={actualId}
                            onSubmit={async (data) => {
                                await onEscalate(data);
                                setShowForm(false);
                            }}
                            onCancel={() => setShowForm(false)}
                        />
                    )}
                    
                    <EscalationList 
                        escalations={escalations}
                        loading={loading}
                        onViewDetail={onViewDetail}
                    />
                </>
            )}
        </div>
    );
};

export default EscalationPanel;