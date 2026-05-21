import { NavLink } from 'react-router-dom';
import { 
  FiDatabase, FiHardDrive, FiShield, FiClock, 
  FiBarChart2, FiKey, FiList, FiSettings, FiServer, FiGrid
} from 'react-icons/fi';
import { MdBackup, MdOutlineDashboard } from 'react-icons/md';
import { HiOutlineStatusOnline } from 'react-icons/hi';
import { BsShieldLock } from 'react-icons/bs';

const menuItems = [
  { path: '/config/dashboard', icon: MdOutlineDashboard, label: 'Dashboard' },
  { path: '/config/registry', icon: FiGrid, label: 'App Registry' },
  { path: '/config/backups', icon: MdBackup, label: 'Backups' },
  { path: '/config/maintenance', icon: FiHardDrive, label: 'Maintenance' },
  { path: '/config/disaster-recovery', icon: FiShield, label: 'Disaster Recovery' },
  { path: '/config/health', icon: HiOutlineStatusOnline, label: 'Health Check' },
  { path: '/config/schedules', icon: FiClock, label: 'Schedules' },
  { path: '/config/quotas', icon: FiBarChart2, label: 'Quotas' },
  { path: '/config/encryption', icon: FiKey, label: 'Encryption' },
  { path: '/config/audit-logs', icon: FiList, label: 'Audit Logs' },
  { path: '/config/settings', icon: FiSettings, label: 'Settings' }
];

export const ConfigSidebar = ({ isCollapsed = false }) => {
  return (
    <aside className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <FiServer className="text-blue-600 text-2xl" />
          {!isCollapsed && <span className="font-semibold text-gray-800">Config Manager</span>}
        </div>
      </div>
      <nav className="flex-1 py-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <item.icon className="text-xl" />
            {!isCollapsed && <span className="text-sm">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};