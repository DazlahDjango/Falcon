import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiRefreshCw, FiTrash2, FiDatabase } from 'react-icons/fi';
import { clearCache, clearUserCache, clearTenantCache } from '../../../../store/accounts/slice/adminSlice';
import { showAlert } from '../../../../store/accounts/slice/uiSlice';
import ConfirmationDialog from '../../../common/Feedback/ConfirmationDialog';

const CacheControl = () => {
    const dispatch = useDispatch();
    const [showClearAll, setShowClearAll] = useState(false);
    const [clearType, setClearType] = useState(null);
    const [clearValue, setClearValue] = useState('');
    const handleClearAll = async () => {
        try {
            await dispatch(clearCache()).unwrap();
            dispatch(showAlert({ type: 'success', message: 'All cache cleared' }));
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error.message || 'Failed to clear cache' }));
        }
        setShowClearAll(false);
    };
    const handleClearUserCache = async () => {
        if (!clearValue) return;
        try {
            await dispatch(clearUserCache(clearValue)).unwrap();
            dispatch(showAlert({ type: 'success', message: `User cache cleared for ${clearValue}` }));
            setClearType(null);
            setClearValue('')
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error.message || 'Failed to clear user cache' }));
        }
    };
    const handleClearTenantCache = async () => {
        if (!clearCache) return;
        try {
            await dispatch(clearTenantCache(clearValue)).unwrap();
            dispatch(showAlert({ type: 'success', message: `Tenant cache cleared for ${clearValue}` }));
            setClearType(null);
            setClearValue('');
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error.message || 'Failed to clear tenant cache' }));
        }
    };
    return (
        <div className="cache-control">
            <h2>Cache Management</h2>
            <p>Manage cached data to ensure fresh content</p>
            
            <div className="cache-stats">
                <div className="stat-item">
                    <FiDatabase size={20} />
                    <div>
                        <div className="stat-value">1.2 GB</div>
                        <div className="stat-label">Cache Size</div>
                    </div>
                </div>
                <div className="stat-item">
                    <FiRefreshCw size={20} />
                    <div>
                        <div className="stat-value">98%</div>
                        <div className="stat-label">Hit Rate</div>
                    </div>
                </div>
            </div>
            
            <div className="cache-actions">
                <button className="btn btn-danger" onClick={() => setShowClearAll(true)}>
                    <FiTrash2 size={16} />
                    Clear All Cache
                </button>
            </div>
            
            <div className="cache-advanced">
                <h3>Advanced Cache Management</h3>
                <div className="clear-form">
                    <input
                        type="text"
                        placeholder="User ID or Email"
                        value={clearType === 'user' ? clearValue : ''}
                        onChange={(e) => setClearValue(e.target.value)}
                        className="form-input"
                    />
                    <button className="btn btn-secondary" onClick={() => setClearType('user')}>
                        Clear User Cache
                    </button>
                </div>
                
                <div className="clear-form">
                    <input
                        type="text"
                        placeholder="Tenant ID"
                        value={clearType === 'tenant' ? clearValue : ''}
                        onChange={(e) => setClearValue(e.target.value)}
                        className="form-input"
                    />
                    <button className="btn btn-secondary" onClick={() => setClearType('tenant')}>
                        Clear Tenant Cache
                    </button>
                </div>
            </div>
            
            <ConfirmationDialog
                isOpen={showClearAll}
                onClose={() => setShowClearAll(false)}
                onConfirm={handleClearAll}
                type="warning"
                title="Clear All Cache"
                message="This will clear all cached data. The system may experience temporary slowdown while cache rebuilds."
                confirmText="Clear All"
            />
            
            <ConfirmationDialog
                isOpen={clearType === 'user'}
                onClose={() => { setClearType(null); setClearValue(''); }}
                onConfirm={handleClearUserCache}
                type="warning"
                title="Clear User Cache"
                message={`Clear cache for user: ${clearValue}?`}
                confirmText="Clear"
            />
            
            <ConfirmationDialog
                isOpen={clearType === 'tenant'}
                onClose={() => { setClearType(null); setClearValue(''); }}
                onConfirm={handleClearTenantCache}
                type="warning"
                title="Clear Tenant Cache"
                message={`Clear cache for tenant: ${clearValue}?`}
                confirmText="Clear"
            />
        </div>
    );
};
export default CacheControl;