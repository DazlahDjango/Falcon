import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { actualService } from '../../../../../services/kpi/actual.service';
import styles from './AdjustmentRequests.module.css';

const AdjustmentRequests = ({ userId, userRole, refreshTrigger, onRefresh, onError }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [selectedActual, setSelectedActual] = useState(null);
    const [newValue, setNewValue] = useState('');
    const [reason, setReason] = useState('');

    useEffect(() => {
        fetchRequests();
    }, [userId, userRole, refreshTrigger]);
    const fetchRequests = async () => {
        setLoading(true);
        try {
            let response;
            if (userRole === 'manager' || userRole === 'client_admin' || userRole === 'super_admin') {
                response = await actualService.getAdjustmentRequests({ reviewer: userId });
            } else {
                response = await actualService.getAdjustmentRequests({ requester: userId });
            }
            setRequests(response.results || []);
        } catch (error) {
            console.error('Failed to fetch adjustment requests:', error);
            if (onError) onError(error);
        } finally {
            setLoading(false);
        }
    };
    const handleApprove = async (id) => {
        setProcessingId(id);
        try {
            await actualService.approveAdjustment(id);
            onRefresh();
        } catch (error) {
            console.error('Failed to approve:', error);
            if (onError) onError(error);
        } finally {
            setProcessingId(null);
        }
    };
    const handleReject = async (id) => {
        setProcessingId(id);
        try {
            await actualService.rejectAdjustment(id);
            onRefresh();
        } catch (error) {
            console.error('Failed to reject:', error);
            if (onError) onError(error);
        } finally {
            setProcessingId(null);
        }
    };
    const handleSubmitRequest = async () => {
        if (!selectedActual || !newValue || !reason) return;
        setProcessingId(selectedActual.id);
        try {
            await actualService.requestAdjustment(selectedActual.id, parseFloat(newValue), reason);
            setShowRequestModal(false);
            setSelectedActual(null);
            setNewValue('');
            setReason('');
            onRefresh();
        } catch (error) {
            console.error('Failed to submit request:', error);
            if (onError) onError(error);
        } finally {
            setProcessingId(null);
        }
    };
    const getStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED':
                return <span className={`${styles.badge} ${styles.approved}`}>Approved</span>;
            case 'REJECTED':
                return <span className={`${styles.badge} ${styles.rejected}`}>Rejected</span>;
            case 'PENDING':
                return <span className={`${styles.badge} ${styles.pending}`}>Pending</span>;
            default:
                return null;
        }
    };
    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p>Loading adjustment requests...</p>
            </div>
        );
    }
    return (
        <div className={styles.adjustmentRequests}>
            <div className={styles.header}>
                <h3>Adjustment Requests</h3>
                {userRole !== 'manager' && (
                    <button
                        onClick={() => setShowRequestModal(true)}
                        className={styles.requestButton}
                    >
                        + Request Adjustment
                    </button>
                )}
            </div>

            {requests.length === 0 ? (
                <div className={styles.emptyContainer}>
                    <div className={styles.emptyIcon}>↻</div>
                    <p>No adjustment requests found</p>
                </div>
            ) : (
                <div className={styles.requestsList}>
                    {requests.map(request => (
                        <div key={request.id} className={styles.requestItem}>
                            <div className={styles.requestHeader}>
                                <div className={styles.requestInfo}>
                                    <span className={styles.kpiName}>{request.kpi_name}</span>
                                    <span className={styles.userName}>
                                        {request.requester_name || request.requester_email}
                                    </span>
                                </div>
                                {getStatusBadge(request.status)}
                            </div>
                            <div className={styles.requestDetails}>
                                <div className={styles.valueChange}>
                                    <span className={styles.originalValue}>
                                        Original: {request.original_value} {request.unit}
                                    </span>
                                    <span className={styles.arrow}>→</span>
                                    <span className={styles.newValue}>
                                        Requested: {request.requested_value} {request.unit}
                                    </span>
                                </div>
                                <div className={styles.reason}>
                                    <strong>Reason:</strong> {request.reason}
                                </div>
                                {request.notes && (
                                    <div className={styles.notes}>
                                        <strong>Notes:</strong> {request.notes}
                                    </div>
                                )}
                                <div className={styles.date}>
                                    Requested: {new Date(request.requested_at).toLocaleDateString()}
                                </div>
                            </div>
                            {(userRole === 'manager' || userRole === 'client_admin' || userRole === 'super_admin') && request.status === 'PENDING' && (
                                <div className={styles.actions}>
                                    <button
                                        onClick={() => handleReject(request.id)}
                                        className={styles.rejectButton}
                                        disabled={processingId === request.id}
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleApprove(request.id)}
                                        className={styles.approveButton}
                                        disabled={processingId === request.id}
                                    >
                                        {processingId === request.id ? 'Processing...' : 'Approve'}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Request Modal */}
            {showRequestModal && (
                <div className={styles.modal} onClick={() => setShowRequestModal(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h4>Request Adjustment</h4>
                        <p>Select the actual data you want to adjust:</p>
                        
                        <select
                            value={selectedActual?.id || ''}
                            onChange={(e) => {
                                // Fetch actual data by ID
                                setSelectedActual({ id: e.target.value });
                            }}
                            className={styles.select}
                        >
                            <option value="">Select an entry...</option>
                            {/* Options would be populated from API */}
                        </select>

                        <div className={styles.fieldGroup}>
                            <label>New Value</label>
                            <input
                                type="number"
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                placeholder="Enter new value"
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label>Reason for Adjustment</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Explain why this adjustment is needed..."
                                className={styles.textarea}
                                rows={3}
                            />
                        </div>

                        <div className={styles.modalActions}>
                            <button onClick={() => setShowRequestModal(false)} className={styles.cancelButton}>
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitRequest}
                                className={styles.submitButton}
                                disabled={!selectedActual || !newValue || !reason || processingId}
                            >
                                {processingId ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
AdjustmentRequests.propTypes = {
    userId: PropTypes.string.isRequired,
    userRole: PropTypes.oneOf(['employee', 'manager', 'admin']).isRequired,
    refreshTrigger: PropTypes.number,
    onRefresh: PropTypes.func.isRequired,
    onError: PropTypes.func,
};
export default AdjustmentRequests;