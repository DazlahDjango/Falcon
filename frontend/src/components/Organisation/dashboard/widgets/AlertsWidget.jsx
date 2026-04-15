import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '@/contexts/accounts/AuthContext';

const AlertsWidget = () => {
  const { isAuthenticated } = useAuthContext();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAlerts();
    }
  }, [isAuthenticated]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      // In production, fetch from API
      // const response = await alertsApi.getAll();
      // setAlerts(response.data);
      
      // Sample alerts for demo
      setAlerts([
        { id: 1, type: 'warning', title: 'Subscription expiring soon', message: 'Your trial ends in 5 days', link: '/organisation/subscription' },
        { id: 2, type: 'info', title: 'KPI review pending', message: '3 KPIs awaiting your review', link: '/organisation/kpis' },
        { id: 3, type: 'success', title: 'Domain verified', message: 'pms.yourcompany.com is now active', link: '/organisation/domains' },
      ]);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'danger': return '🔴';
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      default: return '📋';
    }
  };

  const getAlertBg = (type) => {
    switch (type) {
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'danger': return 'bg-red-50 border-red-200';
      case 'success': return 'bg-green-50 border-green-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading && alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Alerts & Notifications</h3>
      </div>

      <div className="divide-y divide-gray-200">
        {alerts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>✅ All good! No alerts at this time.</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <Link
              key={alert.id}
              to={alert.link}
              className={`block p-4 hover:bg-gray-50 transition-colors ${getAlertBg(alert.type)}`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-xl">{getAlertIcon(alert.type)}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{alert.message}</p>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertsWidget;