// frontend/src/providers/index.jsx
import React from 'react';
import { AuthProvider } from '../contexts/accounts/AuthContext';
import { AccountsSecurityProvider } from '../contexts/accounts/AccountsSecurityContext';
import { KPIRealtimeProvider } from '../contexts/kpi/KPIRealtimeContext';
import { TenantProvider } from '../contexts/tenant/TenantContext';
import { TenantRealtimeProvider } from '../contexts/tenant/TenantRealtimeContext';
import { PermissionProvider } from '../contexts/accounts/PermissionContext';
import { BillingProviders } from '../contexts/billing';
import { ConfigProvider, BackupProvider, MaintenanceProvider, DRProvider, ConfigAlertProvider } from '../contexts/config';
import ThemeProvider from './ThemeProvider';
import ToastProvider from './ToastProvider';
import QueryProvider from './QueryProvider';
import StoreProvider from './StoreProvider';
import ErrorBoundary from './ErrorBoundary';

const Providers = ({ children }) => {
    return (
        <ErrorBoundary>
            <StoreProvider>
                <QueryProvider>
                    <ThemeProvider>
                        <ToastProvider>
                            <AuthProvider>
                                <AccountsSecurityProvider>
                                <PermissionProvider>
                                <KPIRealtimeProvider>
                                    <TenantProvider>
                                        <TenantRealtimeProvider>
                                        <ConfigProvider>
                                            <BackupProvider>
                                                <MaintenanceProvider>
                                                    <DRProvider>
                                                        <ConfigAlertProvider>
                                                            <BillingProviders>
                                                                {children}
                                                            </BillingProviders>
                                                        </ConfigAlertProvider>
                                                    </DRProvider>
                                                </MaintenanceProvider>
                                            </BackupProvider>
                                        </ConfigProvider>
                                        </TenantRealtimeProvider>
                                    </TenantProvider>
                                </KPIRealtimeProvider>
                                </PermissionProvider>
                                </AccountsSecurityProvider>
                            </AuthProvider>
                        </ToastProvider>
                    </ThemeProvider>
                </QueryProvider>
            </StoreProvider>
        </ErrorBoundary>
    );
};

export default Providers;