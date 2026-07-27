// src/components/reviews/dashboard/DashboardSwitcher.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useReviewsPermissions } from '../../../hooks/reviews';
import { Settings, Shield, User, Users } from 'lucide-react';
import './DashboardSwitcher.css';

const DashboardSwitcher = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSuperAdmin, isClientAdmin } = useReviewsPermissions();

  // Switcher is only visible to super admin and client admin
  const isAdmin = isSuperAdmin || isClientAdmin;
  if (!isAdmin) return null;

  const currentPath = location.pathname;

  const tabs = [
    {
      id: 'admin',
      label: 'Admin View',
      path: '/reviews/dashboard/admin',
      icon: Settings,
    },
    {
      id: 'executive',
      label: 'Executive View',
      path: '/reviews/dashboard/executive',
      icon: Shield,
    },
    {
      id: 'supervisor',
      label: 'Supervisor View',
      path: '/reviews/dashboard/supervisor',
      icon: Users,
    },
    {
      id: 'staff',
      label: 'Staff View',
      path: '/reviews/dashboard/staff',
      icon: User,
    },
  ];

  return (
    <div className="reviews-dashboard-switcher-container">
      <div className="reviews-dashboard-switcher">
        <span className="reviews-dashboard-switcher-label">Dashboard View:</span>
        <div className="reviews-dashboard-switcher-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentPath === tab.path;
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`reviews-dashboard-switcher-tab ${isActive ? 'active' : ''}`}
                title={`Switch to ${tab.label}`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardSwitcher;
