import React from 'react';
import { AuthProvider } from '../contexts/accounts/AuthContext'
import { TenantProvider } from '../contexts/tenant/TenantContext';
import { PermissionProvider } from '../contexts/accounts/PermissionContext';
import { BillingProviders } from '../contexts/billing';
import ThemeProvider from './ThemeProvider';
import ToastProvider from './ToastProvider';
import QueryProvider from './QueryProvider';
import StoreProvider from './StoreProvider';
import ErrorBoundary from './ErrorBoundary';

const Providers = ({ children }) => {
    return (
            <StoreProvider>
                <QueryProvider>
                    <ThemeProvider>
                        <ToastProvider>
                            <AuthProvider>
                                <PermissionProvider>
                                    <TenantProvider>
                                        <BillingProviders>
                                            {children}
                                        </BillingProviders>
                                    </TenantProvider>
                                </PermissionProvider>
                            </AuthProvider>
                        </ToastProvider>
                    </ThemeProvider>
                </QueryProvider>
            </StoreProvider>
    );
};
export default Providers;