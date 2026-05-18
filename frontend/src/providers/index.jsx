// frontend/src/providers/index.jsx
import React from 'react';
import { AuthProvider } from '../contexts/accounts/AuthContext';
import { TenantProvider } from '../contexts/tenant/TenantContext';
import { PermissionProvider } from '../contexts/accounts/PermissionContext';
import { BillingProviders } from '../contexts/billing';
import { ConfigProvider, BackupProvider, MaintenanceProvider, DRProvider, WebSocketProvider, ConfigAlertProvider } from '../contexts/config';
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
                                <PermissionProvider>
                                    <TenantProvider>
                                        <BillingProviders>
                                            {/* Config App Providers */}
                                            <ConfigProvider>
                                                <BackupProvider>
                                                    <MaintenanceProvider>
                                                        <DRProvider>
                                                            <WebSocketProvider>
                                                                <ConfigAlertProvider>
                                                                    {children}
                                                                </ConfigAlertProvider>
                                                            </WebSocketProvider>
                                                        </DRProvider>
                                                    </MaintenanceProvider>
                                                </BackupProvider>
                                            </ConfigProvider>
                                        </BillingProviders>
                                    </TenantProvider>
                                </PermissionProvider>
                            </AuthProvider>
                        </ToastProvider>
                    </ThemeProvider>
                </QueryProvider>
            </StoreProvider>
        </ErrorBoundary>
    );
};

export default Providers;