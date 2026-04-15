import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// ============================================================
// Axios Client (for the app)
// ============================================================
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });
        localStorage.setItem('access_token', response.data.access);
        api.defaults.headers.common.Authorization = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ============================================================
// Test Functions (for debugging in console)
// ============================================================

// 1. Monitor all fetch requests
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('[FETCH] Request URL:', args[0]);
  console.log('[FETCH] Request Options:', args[1]);
  return originalFetch.apply(this, args).then(response => {
    console.log('[FETCH] Response Status:', response.status);
    console.log('[FETCH] Response OK:', response.ok);
    return response;
  });
};

console.log('✅ Fetch monitoring enabled');

// 2. Test login directly
async function testLogin() {
  console.log('\n🔐 Testing login...\n');
  
  try {
    const response = await fetch('http://localhost:8000/api/v1/auth/login/', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: 'acareen1@gmail.com',
        password: 'admin123'
      })
    });
    
    console.log('Response Status:', response.status);
    console.log('Response Status Text:', response.statusText);
    
    const data = await response.json();
    console.log('Response Data:', data);
    
    if (response.ok && data.access) {
      console.log('✅ Login successful!');
      console.log('Access Token:', data.access.substring(0, 50) + '...');
      console.log('Refresh Token:', data.refresh.substring(0, 50) + '...');
      
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      console.log('✅ Tokens stored in localStorage');
      
      return { success: true, data };
    } else {
      console.log('❌ Login failed:', data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    console.error('Error message:', error.message);
    return { success: false, error: error.message };
  }
}

// 3. Test getting organisation data
async function testGetOrganisation() {
  console.log('\n🏢 Testing get organisation...\n');
  
  const token = localStorage.getItem('access_token');
  if (!token) {
    console.log('❌ No token found. Please login first.');
    return;
  }
  
  try {
    const response = await fetch('http://localhost:8000/api/v1/organisations/current/', {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Organisation data:', data);
      return { success: true, data };
    } else {
      const error = await response.json();
      console.log('❌ Failed:', error);
      return { success: false, error };
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    return { success: false, error: error.message };
  }
}

// 4. Check current tokens
function checkTokens() {
  console.log('\n🔑 Current tokens in localStorage:\n');
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  
  console.log('Access Token exists:', !!accessToken);
  if (accessToken) {
    console.log('Access Token preview:', accessToken.substring(0, 50) + '...');
  }
  
  console.log('Refresh Token exists:', !!refreshToken);
  if (refreshToken) {
    console.log('Refresh Token preview:', refreshToken.substring(0, 50) + '...');
  }
}

// 5. Clear tokens
function clearTokens() {
  console.log('\n🗑️ Clearing tokens...\n');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  console.log('✅ Tokens cleared');
}

// Make test functions available globally
window.testLogin = testLogin;
window.testGetOrganisation = testGetOrganisation;
window.checkTokens = checkTokens;
window.clearTokens = clearTokens;

// Run the test
console.log('\n' + '='.repeat(60));
console.log('AVAILABLE FUNCTIONS:');
console.log('='.repeat(60));
console.log('  testLogin()          - Test login API');
console.log('  testGetOrganisation() - Test get organisation API');
console.log('  checkTokens()        - Check stored tokens');
console.log('  clearTokens()        - Clear stored tokens');
console.log('='.repeat(60) + '\n');

// Auto-run login test
testLogin();