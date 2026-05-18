import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ConfigSidebar } from './ConfigSidebar';
import { ConfigHeader } from './ConfigHeader';
import { ConfigProvider, BackupProvider, MaintenanceProvider, DRProvider, WebSocketProvider, ConfigAlertProvider } from '../../../contexts/config';

export const ConfigLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <ConfigProvider>
      <BackupProvider>
        <MaintenanceProvider>
          <DRProvider>
            <WebSocketProvider>
              <ConfigAlertProvider>
                <div className="flex h-screen bg-gray-50">
                  <ConfigSidebar isCollapsed={isSidebarCollapsed} />
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <ConfigHeader onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
                    <main className="flex-1 overflow-y-auto">
                      <Outlet />
                    </main>
                  </div>
                </div>
              </ConfigAlertProvider>
            </WebSocketProvider>
          </DRProvider>
        </MaintenanceProvider>
      </BackupProvider>
    </ConfigProvider>
  );
};