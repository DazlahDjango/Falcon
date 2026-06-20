// src/utils/debug.js
/**
 * Debugging utilities for API and network issues
 */

const DEBUG_ENABLED = true;

export const debug = {
  /**
   * Log API requests and responses
   */
  api: {
    request: (method, url, data = null) => {
      if (!DEBUG_ENABLED) return;
      console.group(`🔵 API Request: ${method} ${url}`);
      console.log('📤 Data:', data);
      console.log('⏰ Time:', new Date().toISOString());
      console.groupEnd();
    },
    
    response: (method, url, status, data = null) => {
      if (!DEBUG_ENABLED) return;
      const isError = status >= 400;
      const emoji = isError ? '🔴' : '🟢';
      console.group(`${emoji} API Response: ${method} ${url}`);
      console.log(`📊 Status: ${status}`);
      console.log('📥 Data:', data);
      console.log('⏰ Time:', new Date().toISOString());
      console.groupEnd();
    },
    
    error: (method, url, error) => {
      if (!DEBUG_ENABLED) return;
      console.group(`❌ API Error: ${method} ${url}`);
      console.log('💥 Error:', error);
      console.log('💬 Message:', error.message);
      console.log('📡 Code:', error.code);
      console.log('🔌 Is Network Error:', error.message === 'Network Error');
      console.log('⏰ Time:', new Date().toISOString());
      console.groupEnd();
    }
  },
  
  /**
   * Log environment variables
   */
  env: () => {
    if (!DEBUG_ENABLED) return;
    console.group('🌍 Environment Variables');
    console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
    console.log('VITE_WS_URL:', import.meta.env.VITE_WS_URL);
    console.log('MODE:', import.meta.env.MODE);
    console.log('BASE_URL:', import.meta.env.BASE_URL);
    console.log('DEV:', import.meta.env.DEV);
    console.log('PROD:', import.meta.env.PROD);
    console.groupEnd();
  },
  
  /**
   * Check backend connectivity
   */
  checkBackend: async () => {
    if (!DEBUG_ENABLED) return;
    console.group('🏥 Backend Health Check');
    
    const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
    console.log('Testing API URL:', apiUrl);
    
    try {
      const startTime = Date.now();
      const response = await fetch(`${apiUrl}/health/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const endTime = Date.now();
      
      console.log('✅ Backend reachable!');
      console.log(`⏱️ Response time: ${endTime - startTime}ms`);
      console.log(`📊 Status: ${response.status} ${response.statusText}`);
      
      try {
        const data = await response.json();
        console.log('📦 Response data:', data);
      } catch (e) {
        console.log('📦 No JSON response');
      }
    } catch (error) {
      console.error('❌ Backend NOT reachable!');
      console.error('💥 Error:', error);
      console.error('💬 Message:', error.message);
      console.error('🔌 This usually means:');
      console.error('   1. Backend server is not running');
      console.error('   2. Wrong API URL in .env file');
      console.error('   3. CORS not configured on backend');
      console.error('   4. Firewall blocking the connection');
    }
    
    console.groupEnd();
  }
};

export default debug;