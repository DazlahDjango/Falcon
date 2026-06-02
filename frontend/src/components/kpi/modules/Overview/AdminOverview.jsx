// frontend/src/components/kpi/modules/AdminOverview/AdminOverview.jsx
import React, { useEffect } from 'react';
import { FiRefreshCw, FiBarChart2, FiFolder, FiTag, FiFileText, FiActivity } from 'react-icons/fi';
import { useAdminOverview, useFrameworks, useCategories, useTemplates } from '../../../../hooks/kpi';
import StatsCards from './StatsCards';
import FrameworkStats from './FrameworkStats';
import CategoryStats from './CategoryStats';
import TemplateStats from './TemplateStats';
import KPIStats from './KPIStats';
import RecentActivity from './RecentActivity';
import SystemHealth from './SystemHealth';
import QuickActions from './QuickActions';

const AdminOverview = () => {
    const { data: overview, loading: overviewLoading, fetchOverview } = useAdminOverview(true);
    const { frameworks, fetchAll: fetchFrameworks } = useFrameworks(false);
    const { categories, fetchAll: fetchCategories } = useCategories(false);
    const { templates, fetchAll: fetchTemplates } = useTemplates(false);

    useEffect(() => {
        fetchFrameworks({ page_size: 100 });
        fetchCategories({ page_size: 100 });
        fetchTemplates({ page_size: 100 });
    }, []);

    const handleRefresh = async () => {
        await Promise.all([
            fetchOverview(),
            fetchFrameworks({ page_size: 100 }),
            fetchCategories({ page_size: 100 }),
            fetchTemplates({ page_size: 100 }),
        ]);
    };

    if (overviewLoading) {
        return (
            <div className="admin-overview">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const stats = {
        frameworks: {
            total: overview?.frameworks?.total || frameworks.length,
            published: overview?.frameworks?.published || frameworks.filter(f => f.status === 'PUBLISHED').length,
            draft: overview?.frameworks?.draft || frameworks.filter(f => f.status === 'DRAFT').length,
            archived: overview?.frameworks?.archived || frameworks.filter(f => f.status === 'ARCHIVED').length,
        },
        categories: {
            total: overview?.categories?.total || categories.length,
            withKPIs: overview?.categories?.with_kpis || categories.filter(c => c.kpi_count > 0).length,
        },
        templates: {
            total: overview?.templates?.total || templates.length,
            published: overview?.templates?.published || templates.filter(t => t.is_published).length,
            totalUsage: overview?.templates?.total_usage || templates.reduce((sum, t) => sum + (t.usage_count || 0), 0),
        },
        kpis: {
            total: overview?.kpis?.total || 0,
            active: overview?.kpis?.active || 0,
            byFramework: overview?.kpis?.by_framework || [],
        },
    };

    return (
        <div className="admin-overview">
            {/* Header */}
            <div className="overview-header">
                <div>
                    <h1 className="overview-title">KPI System Overview</h1>
                    <p className="overview-subtitle">Monitor and manage your KPI ecosystem</p>
                </div>
                <button className="refresh-btn" onClick={handleRefresh}>
                    <FiRefreshCw size={16} />
                    Refresh Data
                </button>
            </div>

            {/* Stats Cards */}
            <StatsCards stats={stats} />

            {/* Main Grid */}
            <div className="overview-grid">
                {/* Left Column */}
                <div className="grid-left">
                    <FrameworkStats frameworks={frameworks} stats={stats.frameworks} />
                    <CategoryStats categories={categories} stats={stats.categories} />
                    <TemplateStats templates={templates} stats={stats.templates} />
                </div>

                {/* Right Column */}
                <div className="grid-right">
                    <KPIStats stats={stats.kpis} />
                    <SystemHealth />
                    <QuickActions />
                </div>
            </div>

            {/* Recent Activity */}
            <RecentActivity activities={overview?.recent_activity || []} />
        </div>
    );
};

export default AdminOverview;