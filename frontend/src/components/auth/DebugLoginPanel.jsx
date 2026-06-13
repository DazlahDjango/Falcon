// src/components/auth/DebugLoginPanel.jsx
import React, { useState, useEffect } from 'react';

const DebugLoginPanel = ({ isVisible = true }) => {
    const [debugInfo, setDebugInfo] = useState({
        apiUrl: '',
        backendStatus: 'checking...',
        backendResponse: null,
        loginTestStatus: 'not tested',
        lastError: null,
        envVars: {},
        localStorage: {},
        performance: {
            pageLoadTime: 0,
            apiCalls: [],
            slowestCall: null,
            totalTime: 0
        },
        failedRequests: [],
        pendingRequests: []
    });

    const [isExpanded, setIsExpanded] = useState(true);
    const [logs, setLogs] = useState([]);

    // Add a log entry
    const addLog = (type, message, data = null) => {
        const newLog = {
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            type, // 'info', 'error', 'warning', 'success'
            message,
            data
        };
        setLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep last 50 logs
    };

    // Monitor all fetch requests
    useEffect(() => {
        if (!isVisible) return;

        // Measure page load time
        const pageLoadTime = performance.now();
        setDebugInfo(prev => ({
            ...prev,
            performance: { ...prev.performance, pageLoadTime }
        }));

        // Intercept all fetch requests to monitor them
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const startTime = performance.now();
            const url = args[0];
            const method = args[1]?.method || 'GET';
            
            addLog('info', `📡 API Call Started: ${method} ${url}`);
            
            try {
                const response = await originalFetch(...args);
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                addLog(
                    response.ok ? 'success' : 'warning',
                    `✅ API Call Completed: ${method} ${url} - ${response.status} (${duration.toFixed(0)}ms)`
                );
                
                setDebugInfo(prev => ({
                    ...prev,
                    performance: {
                        ...prev.performance,
                        apiCalls: [...prev.performance.apiCalls, { url, method, duration, status: response.status }]
                    }
                }));
                
                return response;
            } catch (error) {
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                addLog('error', `❌ API Call Failed: ${method} ${url} - ${error.message} (${duration.toFixed(0)}ms)`);
                
                setDebugInfo(prev => ({
                    ...prev,
                    failedRequests: [...prev.failedRequests, { url, method, error: error.message, duration }]
                }));
                
                throw error;
            }
        };
        
        // Monitor console errors
        const originalError = console.error;
        console.error = (...args) => {
            addLog('error', 'Console Error: ' + args[0]);
            originalError.apply(console, args);
        };
        
        // Monitor slow network requests
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.duration > 1000) { // Slower than 1 second
                        addLog('warning', `🐢 Slow Request: ${entry.name} took ${entry.duration.toFixed(0)}ms`);
                    }
                });
            });
            observer.observe({ entryTypes: ['resource'] });
        }
        
        return () => {
            window.fetch = originalFetch;
            console.error = originalError;
        };
    }, [isVisible]);

    const checkEnvironment = () => {
        const startTime = performance.now();
        addLog('info', '🔍 Checking environment...');
        
        setDebugInfo(prev => ({
            ...prev,
            envVars: {
                VITE_API_URL: import.meta.env.VITE_API_URL,
                VITE_WS_URL: import.meta.env.VITE_WS_URL,
                MODE: import.meta.env.MODE,
                DEV: import.meta.env.DEV
            },
            apiUrl: import.meta.env.VITE_API_URL
        }));
        
        const endTime = performance.now();
        addLog('success', `✅ Environment check complete (${(endTime - startTime).toFixed(0)}ms)`);
    };

    const checkLocalStorage = () => {
        setDebugInfo(prev => ({
            ...prev,
            localStorage: {
                hasAccessToken: !!localStorage.getItem('falcon_access_token'),
                hasRefreshToken: !!localStorage.getItem('falcon_refresh_token'),
                userRole: localStorage.getItem('user_role'),
                hasUser: !!localStorage.getItem('falcon_user'),
                tokenExpiry: localStorage.getItem('token_expiry'),
                allKeys: Object.keys(localStorage).filter(k => k.includes('falcon'))
            }
        }));
        addLog('info', '💾 Local storage checked');
    };

    const checkBackendHealth = async () => {
        const apiUrl = import.meta.env.VITE_API_URL;
        const startTime = performance.now();
        
        addLog('info', `🏥 Checking backend health at ${apiUrl}/health/...`);
        
        try {
            const response = await fetch(`${apiUrl}/health/`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const endTime = performance.now();
            const data = await response.json();
            
            setDebugInfo(prev => ({
                ...prev,
                backendStatus: 'online',
                backendResponse: data
            }));
            
            addLog('success', `✅ Backend online (${(endTime - startTime).toFixed(0)}ms)`);
        } catch (error) {
            setDebugInfo(prev => ({
                ...prev,
                backendStatus: 'offline',
                backendResponse: error.message
            }));
            addLog('error', `❌ Backend offline: ${error.message}`);
        }
    };

    const testLogin = async () => {
        const apiUrl = import.meta.env.VITE_API_URL;
        const startTime = performance.now();
        
        addLog('info', '🔐 Testing login with areen@gmail.com...');
        setDebugInfo(prev => ({ ...prev, loginTestStatus: 'testing...', lastError: null }));
        
        try {
            const response = await fetch(`${apiUrl}/auth/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'areen@gmail.com',
                    password: 'Dazl@123'
                })
            });
            
            const endTime = performance.now();
            const rawText = await response.text();
            
            let data;
            try {
                data = JSON.parse(rawText);
            } catch(e) {
                data = { error: 'Invalid JSON response', raw: rawText.substring(0, 200) };
            }
            
            if (response.ok) {
                addLog('success', `✅ Login successful! (${(endTime - startTime).toFixed(0)}ms)`);
                
                // Store the tokens if they exist
                if (data.access) {
                    localStorage.setItem('falcon_access_token', data.access);
                    localStorage.setItem('falcon_refresh_token', data.refresh);
                    addLog('success', '💾 Tokens stored in localStorage');
                }
                
                setDebugInfo(prev => ({
                    ...prev,
                    loginTestStatus: 'success',
                    lastError: null
                }));
                checkLocalStorage();
            } else {
                addLog('error', `❌ Login failed: ${response.status} - ${JSON.stringify(data)}`);
                setDebugInfo(prev => ({
                    ...prev,
                    loginTestStatus: 'failed',
                    lastError: data
                }));
            }
        } catch (error) {
            const endTime = performance.now();
            addLog('error', `❌ Login error: ${error.message} (${(endTime - startTime).toFixed(0)}ms)`);
            setDebugInfo(prev => ({
                ...prev,
                loginTestStatus: 'error',
                lastError: error.message
            }));
        }
    };

    const checkAllAPIs = async () => {
        const apiUrl = import.meta.env.VITE_API_URL;
        const endpoints = [
            { name: 'Health Check', url: `${apiUrl}/health/` },
            { name: 'Auth Login', url: `${apiUrl}/auth/login/` },
            { name: 'User Me', url: `${apiUrl}/users/me/` },
            { name: 'Reviews Cycles', url: `${apiUrl}/reviews/cycles/` },
            { name: 'Analytics Company', url: `${apiUrl}/reviews/analytics/company/` },
            { name: 'Reports', url: `${apiUrl}/reviews/reports/` }
        ];
        
        addLog('info', '🔍 Checking all API endpoints...');
        
        for (const endpoint of endpoints) {
            const startTime = performance.now();
            try {
                const response = await fetch(endpoint.url, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('falcon_access_token') || ''}`
                    }
                });
                const endTime = performance.now();
                
                if (response.ok) {
                    addLog('success', `✅ ${endpoint.name}: ${response.status} (${(endTime - startTime).toFixed(0)}ms)`);
                } else {
                    addLog('warning', `⚠️ ${endpoint.name}: ${response.status} (${(endTime - startTime).toFixed(0)}ms)`);
                }
            } catch (error) {
                const endTime = performance.now();
                addLog('error', `❌ ${endpoint.name}: ${error.message} (${(endTime - startTime).toFixed(0)}ms)`);
            }
        }
        
        addLog('success', '✅ API check complete');
    };

    const clearLocalStorage = () => {
        const keys = ['falcon_access_token', 'falcon_refresh_token', 'falcon_user', 'user_role', 'token_expiry'];
        keys.forEach(key => localStorage.removeItem(key));
        checkLocalStorage();
        addLog('success', '🗑️ Local storage cleared');
        alert('Local storage cleared! Refresh the page to see changes.');
    };

    const setSuperAdminRole = () => {
        localStorage.setItem('user_role', 'super_admin');
        localStorage.setItem('falcon_user', JSON.stringify({
            email: 'areen@gmail.com',
            role: 'super_admin',
            is_superuser: true,
            is_staff: true
        }));
        checkLocalStorage();
        addLog('success', '👑 Super Admin role set');
        alert('Super Admin role set! Refresh the page.');
    };

    useEffect(() => {
        if (!isVisible) return;
        checkEnvironment();
        checkBackendHealth();
        checkLocalStorage();
        
        // Auto-check APIs every 30 seconds
        const interval = setInterval(() => {
            checkBackendHealth();
        }, 30000);
        
        return () => clearInterval(interval);
    }, [isVisible]);

    const getLogColor = (type) => {
        switch(type) {
            case 'error': return '#ef4444';
            case 'warning': return '#f59e0b';
            case 'success': return '#10b981';
            default: return '#6b7280';
        }
    };

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: isExpanded ? '600px' : 'auto',
            backgroundColor: '#1e1e2e',
            color: '#fff',
            borderRadius: '8px',
            padding: isExpanded ? '15px' : '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 9999,
            fontFamily: 'monospace',
            fontSize: '12px',
            border: '1px solid #4a90e2',
            maxHeight: isExpanded ? '80vh' : 'auto',
            overflow: 'auto'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                marginBottom: isExpanded ? '10px' : 0,
                position: 'sticky',
                top: 0,
                backgroundColor: '#1e1e2e',
                padding: '5px 0'
            }} onClick={() => setIsExpanded(!isExpanded)}>
                <strong style={{ color: '#4a90e2' }}>🔧 DEBUG PANEL</strong>
                <span>{isExpanded ? '▼' : '▲'}</span>
            </div>
            
            {isExpanded && (
                <div>
                    {/* Performance Summary */}
                    <div style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#2a2a3e', borderRadius: '4px' }}>
                        <div><strong>⚡ Performance</strong></div>
                        <div style={{ fontSize: '10px' }}>
                            <div>API Calls: {debugInfo.performance.apiCalls.length}</div>
                            <div>Slowest: {debugInfo.performance.slowestCall?.duration?.toFixed(0) || 'N/A'}ms</div>
                            {debugInfo.failedRequests.length > 0 && (
                                <div style={{ color: '#ef4444' }}>Failed: {debugInfo.failedRequests.length}</div>
                            )}
                        </div>
                    </div>

                    {/* API Status */}
                    <div style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#2a2a3e', borderRadius: '4px' }}>
                        <div><strong>📡 API URL:</strong> {debugInfo.apiUrl || 'Not set'}</div>
                        <div><strong>🏥 Backend:</strong> 
                            <span style={{ color: debugInfo.backendStatus === 'online' ? '#4ade80' : '#ef4444' }}>
                                {debugInfo.backendStatus}
                            </span>
                        </div>
                    </div>

                    {/* Local Storage Status */}
                    <div style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#2a2a3e', borderRadius: '4px' }}>
                        <div><strong>💾 Local Storage:</strong></div>
                        <div style={{ fontSize: '10px' }}>
                            <div>Access Token: {debugInfo.localStorage.hasAccessToken ? '✅' : '❌'}</div>
                            <div>Refresh Token: {debugInfo.localStorage.hasRefreshToken ? '✅' : '❌'}</div>
                            <div>User Role: {debugInfo.localStorage.userRole || '❌'}</div>
                            <div>User Object: {debugInfo.localStorage.hasUser ? '✅' : '❌'}</div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button onClick={testLogin} style={{
                            padding: '5px 10px',
                            backgroundColor: '#4a90e2',
                            border: 'none',
                            borderRadius: '4px',
                            color: 'white',
                            cursor: 'pointer'
                        }}>
                            Test Login
                        </button>
                        <button onClick={checkAllAPIs} style={{
                            padding: '5px 10px',
                            backgroundColor: '#8b5cf6',
                            border: 'none',
                            borderRadius: '4px',
                            color: 'white',
                            cursor: 'pointer'
                        }}>
                            Check All APIs
                        </button>
                        <button onClick={clearLocalStorage} style={{
                            padding: '5px 10px',
                            backgroundColor: '#ef4444',
                            border: 'none',
                            borderRadius: '4px',
                            color: 'white',
                            cursor: 'pointer'
                        }}>
                            Clear Storage
                        </button>
                        <button onClick={setSuperAdminRole} style={{
                            padding: '5px 10px',
                            backgroundColor: '#10b981',
                            border: 'none',
                            borderRadius: '4px',
                            color: 'white',
                            cursor: 'pointer'
                        }}>
                            Set Super Admin
                        </button>
                    </div>

                    {/* Live Logs */}
                    <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#0f0f1a', borderRadius: '4px', maxHeight: '300px', overflow: 'auto' }}>
                        <div><strong>📋 Live Logs</strong></div>
                        <div style={{ fontSize: '10px', fontFamily: 'monospace' }}>
                            {logs.map(log => (
                                <div key={log.id} style={{ 
                                    color: getLogColor(log.type),
                                    borderBottom: '1px solid #2a2a3e',
                                    padding: '4px 0',
                                    marginBottom: '2px'
                                }}>
                                    <span style={{ color: '#888' }}>[{log.timestamp}]</span> {log.message}
                                </div>
                            ))}
                            {logs.length === 0 && <div style={{ color: '#888' }}>No logs yet. Click Test Login to start...</div>}
                        </div>
                    </div>

                    {/* Failed Requests */}
                    {debugInfo.failedRequests.length > 0 && (
                        <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#2a2a3e', borderRadius: '4px' }}>
                            <div><strong style={{ color: '#ef4444' }}>❌ Failed Requests</strong></div>
                            <div style={{ fontSize: '10px' }}>
                                {debugInfo.failedRequests.map((req, idx) => (
                                    <div key={idx} style={{ color: '#ef4444' }}>
                                        {req.method} {req.url} - {req.error}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DebugLoginPanel;