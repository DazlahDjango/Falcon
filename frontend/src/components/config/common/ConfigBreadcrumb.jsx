import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiChevronRight } from 'react-icons/fi';

const routeLabels = {
  config: 'Configuration',
  dashboard: 'Dashboard',
  backups: 'Backups',
  maintenance: 'Maintenance',
  'disaster-recovery': 'Disaster Recovery',
  health: 'Health Check',
  schedules: 'Schedules',
  quotas: 'Quotas',
  encryption: 'Encryption Keys',
  'audit-logs': 'Audit Logs',
  settings: 'Settings'
};

export const ConfigBreadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  if (pathnames.length === 0 || pathnames[0] !== 'config') return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
      <Link to="/config/dashboard" className="hover:text-blue-600 transition-colors">
        <FiHome className="text-base" />
      </Link>
      {pathnames.slice(1).map((name, index) => {
        const routeTo = `/config/${pathnames.slice(1, index + 2).join('/')}`;
        const isLast = index === pathnames.slice(1).length - 1;
        const label = routeLabels[name] || name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');

        return (
          <div key={routeTo} className="flex items-center space-x-2">
            <FiChevronRight className="text-gray-400 text-xs" />
            {isLast ? (
              <span className="text-gray-900 font-medium">{label}</span>
            ) : (
              <Link to={routeTo} className="hover:text-blue-600 transition-colors">
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};