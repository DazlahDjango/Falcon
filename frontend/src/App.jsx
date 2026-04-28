// src/App.jsx
import React, { Suspense } from 'react';
import Providers from './providers';
import AppRouter from './routes';
import './assets/styles/globals.css';
import './assets/styles/tailwind.css';
import './assets/styles/kpi/kpi.css';

const LoadingFallback = () => (
    <div className="kpi-loading">
        <div className="kpi-spinner" />
        <p>Loading Falcon PMS...</p>
    </div>
);

const App = () => {
    return (
        <Providers>
            <Suspense fallback={<LoadingFallback />}>
                <AppRouter />
            </Suspense>
        </Providers>
    );
};

export default App;