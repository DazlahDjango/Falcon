import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUser,
  FiBell,
  FiShield,
  FiBriefcase,
  FiKey,
} from 'react-icons/fi';
import { Palette } from 'lucide-react';
import { useAuth } from '../../hooks/accounts/useAuth';
import { ACCOUNTS_ROUTES } from '../../config/constants/accountsRouteConstants';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();

  const settingsSections = [
    {
      id: 'profile',
      title: 'Profile',
      description: 'Manage your personal information',
      icon: FiUser,
      path: ACCOUNTS_ROUTES.MY_PROFILE,
    },
    {
      id: 'preferences',
      title: 'Preferences',
      description: 'Customize your experience',
      icon: FiUser,
      path: ACCOUNTS_ROUTES.MY_SETTINGS,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Configure notification preferences',
      icon: FiBell,
      path: ACCOUNTS_ROUTES.MY_SETTINGS,
    },
    {
      id: 'security',
      title: 'Security',
      description: 'MFA devices and backup codes',
      icon: FiShield,
      path: ACCOUNTS_ROUTES.MFA_DEVICES,
    },
    {
      id: 'branding',
      title: 'Branding',
      description: 'Customize your organization branding',
      icon: Palette,
      path: ACCOUNTS_ROUTES.TENANT_SETTINGS,
    },
    {
      id: 'tenant',
      title: 'Tenant Settings',
      description: 'Manage organization preferences',
      icon: FiBriefcase,
      path: ACCOUNTS_ROUTES.TENANT_SETTINGS,
    },
    {
      id: 'system',
      title: 'System Settings',
      description: 'System-wide configuration',
      icon: FiKey,
      path: ACCOUNTS_ROUTES.SYSTEM_SETTINGS,
      adminOnly: true,
    },
  ];

  const visibleSections = settingsSections.filter(
    (section) => !section.adminOnly || isSuperAdmin()
  );

  return (
    <div className="accounts-page settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account and organization settings</p>
      </div>

      <div className="settings-grid">
        {visibleSections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              className="settings-card"
              onClick={() => navigate(section.path)}
            >
              <div className="settings-card-icon">
                <Icon />
              </div>
              <div className="settings-card-content">
                <h3>{section.title}</h3>
                <p>{section.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default SettingsPage;