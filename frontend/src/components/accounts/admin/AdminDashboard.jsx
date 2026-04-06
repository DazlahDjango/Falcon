import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiUsers, FiDatabase, FiServer, FiActivity, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import StatsWidget from '../dashboard/components/StatsWidget';
import SystemHealth from './components/SystemHealth';
import CacheControl from './components/CacheControl';
import { fetchSystemStats, fetchSystemHealth } from '../../../store/accounts/slice/adminSlice';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { stats, health, isLoading } = useSelector((state) => state.admin);
    useEffect(() => {
        dispatch(fetchSystemStats());
        dispatch(fetchSystemHealth());
        const interval = setInterval(() => {
            dispatch(fetchSystemHealth());
        }, 30000);
        return () => clearInterval(interval);
    }, [dispatch]);
    return (
        <div className="admin-dashboard">
            <div className="page-header">
                <h1>Admin Dashboard</h1>
                <p>System administration and monitoring</p>
            </div>
            
            <div className="stats-grid">
                <StatsWidget 
                    title="Total Users"
                    value={stats?.total_users || 0}
                    icon={<FiUsers size={24} />}
                    color="primary"
                />
                <StatsWidget 
                    title="Active Tenants"
                    value={stats?.active_tenants || 0}
                    icon={<FiDatabase size={24} />}
                    color="success"
                />
                <StatsWidget 
                    title="System Uptime"
                    value={stats?.uptime || '0d'}
                    icon={<FiServer size={24} />}
                    color="info"
                />
                <StatsWidget 
                    title="API Requests (24h)"
                    value={stats?.api_requests || 0}
                    icon={<FiActivity size={24} />}
                    trend={stats?.request_trend}
                    color="warning"
                />
            </div>
            
            <div className="admin-grid">
                <SystemHealth health={health} />
                <CacheControl />
            </div>
            
            <div className="admin-actions">
                <h2>Quick Actions</h2>
                <div className="action-grid">
                    <button className="action-card" onClick={() => navigate('/admin/users')}>
                        <FiUsers size={24} />
                        <span>Manage Users</span>
                    </button>
                    <button className="action-card" onClick={() => navigate('/admin/tenants')}>
                        <FiDatabase size={24} />
                        <span>Manage Tenants</span>
                    </button>
                    <button className="action-card" onClick={() => navigate('/admin/system')}>
                        <FiServer size={24} />
                        <span>System Settings</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
export default AdminDashboard;