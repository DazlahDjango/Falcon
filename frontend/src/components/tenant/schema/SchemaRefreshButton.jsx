// frontend/src/components/tenant/schema/SchemaRefreshButton.jsx
import React, { useState } from 'react';
import './schema.css';

export const SchemaRefreshButton = ({ onRefresh, isLoading = false }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleClick = async () => {
        setIsRefreshing(true);
        await onRefresh();
        setIsRefreshing(false);
    };

    const loading = isLoading || isRefreshing;

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className="schema-refresh-btn"
        >
            <span className="schema-refresh-btn-icon">{loading ? '⏳' : '🔄'}</span>
            {loading ? 'Refreshing...' : 'Refresh Stats'}
        </button>
    );
};