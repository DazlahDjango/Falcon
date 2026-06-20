
import React, { useState, useEffect } from 'react';
import './dashboard.css';
import ReviewWidgetGrid from './ReviewWidgetGrid';
import ReviewAddWidgetButton from './ReviewAddWidgetButton';
import ReviewWidgetConfigModal from './ReviewWidgetConfigModal';
import { useAnalyticsDashboard } from '@/hooks/reviews';
import { WIDGET_TYPES } from '@/config/constants/reviewConstants';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Users,
  Lightbulb,
  CheckCircle,
  TrendingDown,
  Minus,
} from 'lucide-react';

const ReviewDashboard = ({ onNavigate }) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingWidget, setEditingWidget] = useState(null);

  const {
    loading,
    widgets,
    widgetData,
    refreshing,
    fetchDashboard,
    refreshWidget,
    addWidget,
    updateWidget,
    removeWidget,
    reorderWidgets,
    resetDashboard,
  } = useAnalyticsDashboard();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleAddWidget = () => {
    setEditingWidget(null);
    setShowConfigModal(true);
  };

  const handleEditWidget = (widget) => {
    setEditingWidget(widget);
    setShowConfigModal(true);
  };

  const handleSaveWidget = async (widgetConfig) => {
    if (editingWidget) {
      await updateWidget(editingWidget.id, widgetConfig);
    } else {
      await addWidget(widgetConfig);
    }
    setShowConfigModal(false);
    setEditingWidget(null);
  };

  const handleDeleteWidget = async (widgetId) => {
    if (window.confirm('Are you sure you want to remove this widget?')) {
      await removeWidget(widgetId);
    }
  };

  const renderWidgetContent = (widget, data) => {
    if (!data) {
      return <div className="analytics-loading">Loading...</div>;
    }

    switch (widget.widget_type) {
      case WIDGET_TYPES.SCORE_TREND: {
        const trendData = data.trend_data || [
          { month: 'Jan', score: 3.5 },
          { month: 'Feb', score: 3.8 },
          { month: 'Mar', score: 4.0 },
          { month: 'Apr', score: 3.9 },
          { month: 'May', score: 4.2 },
        ];
        const avgScore = data.average_score?.toFixed(1) || 'N/A';
        const scoreChange = data.score_change || 0;
        const scoreColor = scoreChange > 0 ? '#10b981' : scoreChange < 0 ? '#ef4444' : '#6b7280';

        return (
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl" style={{ background: '#3b82f615' }}>
                <TrendingUp size={20} style={{ color: '#3b82f6' }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#1f2937' }}>
                  {avgScore}
                </div>
                <div
                  className="flex items-center gap-1 text-sm"
                  style={{ color: scoreColor }}
                >
                  {scoreChange > 0 ? (
                    <TrendingUp size={14} />
                  ) : scoreChange < 0 ? (
                    <TrendingDown size={14} />
                  ) : (
                    <Minus size={14} />
                  )}
                  <span>
                    {Math.abs(scoreChange).toFixed(1)} vs last period
                  </span>
                </div>
              </div>
            </div>
            <div style={{ height: 150 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#scoreGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      }

      case WIDGET_TYPES.RATING_DISTRIBUTION: {
        const distributionData = [
          { name: 'Excellent', value: data.excellent || 30 },
          { name: 'Good', value: data.good || 40 },
          { name: 'Average', value: data.average || 20 },
          { name: 'Poor', value: data.poor || 10 },
        ];
        const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

        return (
          <div className="p-4">
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value}%`, name]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              {distributionData.map((item, index) => (
                <div key={index} className="flex items-center gap-1 text-xs">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span style={{ color: '#6b7280' }}>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case WIDGET_TYPES.HIGH_RISK_EMPLOYEES: {
        const riskCount = data.high_risk_count || 3;
        const riskList = data.high_risk_employees || [
          { name: 'John Doe', role: 'Developer' },
          { name: 'Jane Smith', role: 'Designer' },
        ];

        return (
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl" style={{ background: '#ef444415' }}>
                <AlertTriangle size={20} style={{ color: '#ef4444' }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#1f2937' }}>
                  {riskCount}
                </div>
                <div className="text-sm" style={{ color: '#6b7280' }}>
                  High Risk Employees
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {riskList.slice(0, 3).map((emp, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                  <div>
                    <div className="text-sm font-medium" style={{ color: '#1f2937' }}>
                      {emp.name}
                    </div>
                    <div className="text-xs" style={{ color: '#6b7280' }}>
                      {emp.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case WIDGET_TYPES.INSIGHTS: {
        const insightCount = data.unread_count || 2;
        const insights = data.insights || [
          { title: 'Team productivity up 15%', type: 'positive' },
          { title: 'Turnover risk in Engineering', type: 'warning' },
        ];

        const getInsightIcon = (type) => {
          if (type === 'positive') return <Lightbulb size={16} style={{ color: '#10b981' }} />;
          if (type === 'warning') return <AlertTriangle size={16} style={{ color: '#f59e0b' }} />;
          if (type === 'negative') return <AlertTriangle size={16} style={{ color: '#ef4444' }} />;
          return <Lightbulb size={16} style={{ color: '#3b82f6' }} />;
        };

        const getInsightBg = (type) => {
          if (type === 'positive') return '#10b98115';
          if (type === 'warning') return '#f59e0b15';
          if (type === 'negative') return '#ef444415';
          return '#3b82f615';
        };

        return (
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl" style={{ background: '#8b5cf615' }}>
                <Lightbulb size={20} style={{ color: '#8b5cf6' }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#1f2937' }}>
                  {insightCount}
                </div>
                <div className="text-sm" style={{ color: '#6b7280' }}>
                  New Insights
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {insights.slice(0, 3).map((insight, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-2 rounded-lg"
                  style={{ background: getInsightBg(insight.type) }}
                >
                  {getInsightIcon(insight.type)}
                  <div className="text-sm" style={{ color: '#1f2937' }}>
                    {insight.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case WIDGET_TYPES.COMPLETION_RATE: {
        const completionRate = data.completion_rate || 75;

        return (
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl" style={{ background: '#10b98115' }}>
                <CheckCircle size={20} style={{ color: '#10b981' }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#1f2937' }}>
                  {completionRate}%
                </div>
                <div className="text-sm" style={{ color: '#6b7280' }}>
                  Review Completion
                </div>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${completionRate}%`,
                  background: completionRate >= 80 ? '#10b981' : completionRate >= 50 ? '#f59e0b' : '#ef4444',
                }}
              />
            </div>
          </div>
        );
      }

      case WIDGET_TYPES.DEPARTMENT_RANKING: {
        const departmentData = data.departments || [
          { name: 'Engineering', score: 4.2 },
          { name: 'Product', score: 4.0 },
          { name: 'Design', score: 3.8 },
        ];

        return (
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl" style={{ background: '#8b5cf615' }}>
                <BarChart3 size={20} style={{ color: '#8b5cf6' }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#1f2937' }}>
                  Top Depts
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {departmentData.slice(0, 4).map((dept, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#d97706' : '#6b7280', color: 'white' }}>
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium" style={{ color: '#1f2937' }}>
                      {dept.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: '#3b82f6' }}>
                    {dept.score.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      default:
        return <div>Widget data available</div>;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">My Dashboard</h1>
          <p className="dashboard-subtitle">Customize your analytics view</p>
        </div>
        <div className="dashboard-actions">
          <button className="filter-button" onClick={resetDashboard}>
            Reset Dashboard
          </button>
        </div>
      </div>

      <ReviewAddWidgetButton onClick={handleAddWidget} />

      <ReviewWidgetGrid
        widgets={widgets}
        widgetData={widgetData}
        refreshing={refreshing}
        onWidgetRefresh={refreshWidget}
        onWidgetEdit={handleEditWidget}
        onWidgetDelete={handleDeleteWidget}
        onWidgetExpand={(widget) => onNavigate?.(`/reviews/analytics?widget=${widget.id}`)}
        renderWidgetContent={renderWidgetContent}
        loading={loading}
      />

      <ReviewWidgetConfigModal
        isOpen={showConfigModal}
        onClose={() => {
          setShowConfigModal(false);
          setEditingWidget(null);
        }}
        onSave={handleSaveWidget}
        initialData={editingWidget}
      />
    </div>
  );
};

export default ReviewDashboard;
