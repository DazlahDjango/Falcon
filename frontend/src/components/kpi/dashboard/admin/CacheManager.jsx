import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiTrash2, FiRefreshCw, FiDatabase, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const CacheManager = () => {
    const dispatch = useDispatch();
    const [clearing, setClearing] = useState(false);
    const [clearResult, setClearResult] = useState(null);
    
    const cacheItems = [
        { key: 'sectors', label: 'Sectors Cache', size: '245 KB', lastUpdated: '2 minutes ago' },
        { key: 'frameworks', label: 'Frameworks Cache', size: '1.2 MB', lastUpdated: '5 minutes ago' },
        { key: 'categories', label: 'Categories Cache', size: '892 KB', lastUpdated: '3 minutes ago' },
        { key: 'kpis', label: 'KPIs Cache', size: '3.4 MB', lastUpdated: '1 minute ago' },
        { key: 'dashboard', label: 'Dashboard Cache', size: '2.1 MB', lastUpdated: '30 seconds ago' },
        { key: 'analytics', label: 'Analytics Cache', size: '4.5 MB', lastUpdated: '10 minutes ago' }
    ];
    
    const handleClearCache = async (cacheKey = null) => {
        setClearing(true);
        // Simulate cache clearing - replace with actual API call
        setTimeout(() => {
            setClearResult({
                success: true,
                message: cacheKey ? `${cacheKey} cache cleared successfully` : 'All caches cleared successfully',
                cleared: cacheKey ? [cacheKey] : cacheItems.map(c => c.key)
            });
            setClearing(false);
            setTimeout(() => setClearResult(null), 3000);
        }, 1500);
    };
    
    const handleClearAll = () => {
        if (window.confirm('Are you sure you want to clear all caches? This may temporarily affect performance.')) {
            handleClearCache();
        }
    };
    
    return (
        <div className="cache-manager">
            {clearResult && (
                <div className={`clear-result ${clearResult.success ? 'success' : 'error'}`}>
                    {clearResult.success ? <FiCheckCircle size={16} /> : <FiAlertCircle size={16} />}
                    {clearResult.message}
                </div>
            )}
            
            <div className="cache-actions">
                <button className="clear-all-btn" onClick={handleClearAll} disabled={clearing}>
                    <FiTrash2 size={14} />
                    {clearing ? 'Clearing...' : 'Clear All Caches'}
                </button>
                <button className="refresh-cache-btn" onClick={() => window.location.reload()}>
                    <FiRefreshCw size={14} />
                    Refresh Cache Stats
                </button>
            </div>
            
            <div className="cache-stats">
                <div className="stat-card">
                    <FiDatabase size={24} color="var(--kpi-primary)" />
                    <div className="stat-info">
                        <div className="stat-value">12.5 MB</div>
                        <div className="stat-label">Total Cache Size</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <div className="stat-value">98.2%</div>
                        <div className="stat-label">Hit Rate</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <div className="stat-value">156</div>
                        <div className="stat-label">Items Cached</div>
                    </div>
                </div>
            </div>
            
            <div className="cache-items">
                <h3>Cache Items</h3>
                <div className="cache-table">
                    <div className="cache-header">
                        <span>Cache Key</span>
                        <span>Size</span>
                        <span>Last Updated</span>
                        <span></span>
                    </div>
                    {cacheItems.map((item, index) => (
                        <div key={index} className="cache-row">
                            <span className="cache-key">{item.label}</span>
                            <span className="cache-size">{item.size}</span>
                            <span className="cache-time">{item.lastUpdated}</span>
                            <button 
                                className="clear-item-btn"
                                onClick={() => handleClearCache(item.key)}
                                disabled={clearing}
                            >
                                <FiTrash2 size={14} />
                                Clear
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="cache-info">
                <h4>About Caching</h4>
                <p>Cached data improves dashboard performance by reducing database queries. Clear cache when you need to see the most recent data immediately.</p>
                <ul>
                    <li>Dashboard data is cached for 5 minutes</li>
                    <li>Reference data is cached for 1 hour</li>
                    <li>Analytics data is cached for 15 minutes</li>
                </ul>
            </div>
        </div>
    );
};

export default CacheManager;