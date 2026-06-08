import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiSettings, FiDatabase, FiActivity, FiUsers, FiTarget, FiCheckCircle, FiAlertCircle, FiServer } from 'react-icons/fi';
import { fetchAdminOverview, selectAdminOverview, selectDashboardLoading } from '../../../../store/kpi';
import AdminOverview from './AdminOverview';
import SystemHealth from './SystemHealth';
import CacheManager from './CacheManager';
import KPILoading from '../../common/KPILoading';

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('overview');
    
    const overview = useSelector(selectAdminOverview);
    const loading = useSelector(selectDashboardLoading);
    
    useEffect(() => {
        dispatch(fetchAdminOverview());
    }, [dispatch]);
    
    if (loading) {
        return <KPILoading text="Loading admin dashboard..." />;
    }
    
    const tabs = [
        { id: 'overview', label: 'Overview', icon: <FiActivity size={14} /> },
        { id: 'health', label: 'System Health', icon: <FiServer size={14} /> },
        { id: 'cache', label: 'Cache Manager', icon: <FiDatabase size={14} /> }
    ];
    
    const stats = [
        { 
            label: 'Total Frameworks', 
            value: overview?.frameworks?.total || 0, 
            icon: <FiTarget size={20} />,
            color: '#4f46e5'
        },
        { 
            label: 'Total KPIs', 
            value: overview?.kpis?.total || 0, 
            icon: <FiActivity size={20} />,
            color: '#10b981'
        },
        { 
            label: 'Active Users', 
            value: overview?.users?.active || 0, 
            icon: <FiUsers size={20} />,
            color: '#3b82f6'
        },
        { 
            label: 'System Status', 
            value: 'Operational', 
            icon: <FiCheckCircle size={20} />,
            color: '#10b981'
        }
    ];
    
    return (
        <div className="kpi-admin-dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Admin Dashboard</h1>
                    <p>System administration and monitoring</p>
                </div>
                <div className="admin-actions">
                    <button className="refresh-btn" onClick={() => dispatch(fetchAdminOverview())}>
                        <FiActivity size={14} />
                        Refresh
                    </button>
                </div>
            </div>
            
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
                        <div className="stat-icon" style={{ background: `${stat.color}10`, color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stat.value}</div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="admin-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>
            
            <div className="admin-content">
                {activeTab === 'overview' && <AdminOverview overview={overview} />}
                {activeTab === 'health' && <SystemHealth />}
                {activeTab === 'cache' && <CacheManager />}
            </div>
        </div>
    );
};

export default AdminDashboard;