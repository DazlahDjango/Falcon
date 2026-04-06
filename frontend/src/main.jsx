window.process = {
    env: {
        NODE_ENV: 'development',
        REACT_APP_API_URL: 'http://127.0.0.1:8000/api/v1'
    }
};

import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { BrowserRouter } from 'react-router-dom';
import { store, persistor } from './store';
import App from './App';
import './index.css';

const LoadingFallback = () => {
  <div className="app-loading">
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>Loading falcon PMS...</p>
    </div>
  </div>
};
// Initialize app
const  init = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Root element not found');
    return;
  }
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Provider store={store}>
        <PersistGate loading={<LoadingFallback />} persistor={persistor}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </PersistGate>
      </Provider>
    </React.StrictMode>
  );
};
// Register service worker if in production
if (import.meta.env.MODE === 'production' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').catch(error => {
            console.error('Service worker registration failed:', error);
        });
    });
}
// Start application
init();
