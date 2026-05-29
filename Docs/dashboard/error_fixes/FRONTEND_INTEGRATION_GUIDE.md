# Dashboard Integration Checklist & Implementation Guide

**Status**: Dashboard backend is stable and ready for frontend integration  
**Last Updated**: May 27, 2026  
**By**: Code Audit & Stabilization Process

---

## Pre-Integration Checklist

Before calling any dashboard API from the frontend, complete these steps:

### Phase 1: Local Testing (Backend Only)

- [ ] Run Django tests: `python manage.py test apps.dashboard`
- [ ] Check for import errors:
  ```bash
  python manage.py shell
  from apps.dashboard.services import ManagerService, StaffService, ChampionService, ReadOnlyService
  ```
- [ ] Verify all migrations applied:
  ```bash
  python manage.py migrate
  ```
- [ ] Check for syntax errors:
  ```bash
  python manage.py check
  ```

### Phase 2: API Endpoint Testing

Test each endpoint directly (using Postman, curl, or Django test client):

```
✓ GET /api/v1/dashboard/executive/data/
✓ GET /api/v1/dashboard/client-admin/data/
✓ GET /api/v1/dashboard/super-admin/data/
✓ GET /api/v1/dashboard/manager/
✓ GET /api/v1/dashboard/staff/
✓ GET /api/v1/dashboard/champion/
✓ GET /api/v1/dashboard/read-only/
```

**Expected Response**:
```json
{
  "dashboard_type": "staff",
  "period": "current",
  "user": { ... },
  "kpis": [ ... ],
  "pending_submissions": [ ... ],
  "last_updated": "2026-05-27T14:30:00.123456Z"
}
```

### Phase 3: WebSocket Testing

Test WebSocket connections:

```bash
# Connect to WebSocket
wscat -c ws://localhost:8000/ws/dashboard/staff/

# Send message
{"action": "ping"}

# Expected response
{"type": "pong", "timestamp": "2026-05-27T14:30:00.123456Z"}
```

### Phase 4: Permission Testing

- [ ] Test as staff user (should see only staff dashboard)
- [ ] Test as manager (should see manager dashboard + team)
- [ ] Test as executive (should see executive dashboard)
- [ ] Test as read-only user (should see data but not edit)
- [ ] Test cross-tenant access (should get 403)

---

## Frontend Integration Implementation

### Step 1: API Client Setup

Create an API client module:

```javascript
// frontend/src/api/dashboardApi.js

const BASE_URL = '/api/v1/dashboard';

export const dashboardApi = {
  // Get dashboard data
  async getDashboard(dashboardType, params = {}) {
    const qs = new URLSearchParams(params).toString();
    const url = `${BASE_URL}/${dashboardType}/${qs ? '?' + qs : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (response.status === 403) {
      throw new Error('Permission denied for this dashboard');
    }
    if (response.status === 429) {
      throw new Error('Rate limited - please wait before retrying');
    }
    if (!response.ok) {
      throw new Error(`Dashboard API error: ${response.statusText}`);
    }
    
    return response.json();
  },

  // WebSocket connection
  connectWebSocket(dashboardType, handlers = {}) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(
      `${protocol}//${window.location.host}/ws/dashboard/${dashboardType}/`
    );
    
    ws.onopen = () => handlers.onOpen?.();
    ws.onmessage = (event) => handlers.onMessage?.(JSON.parse(event.data));
    ws.onerror = (error) => handlers.onError?.(error);
    ws.onclose = () => handlers.onClose?.();
    
    return ws;
  },

  // Drill down to specific user
  async drillDown(userId, period = 'current') {
    const response = await fetch(
      `${BASE_URL}/drill-down/${userId}/?period=${period}`,
      {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to load user dashboard');
    }
    
    return response.json();
  }
};
```

### Step 2: Dashboard Component

```javascript
// frontend/src/components/Dashboard.jsx

import React, { useState, useEffect, useRef } from 'react';
import { dashboardApi } from '../api/dashboardApi';

export function StaffDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    loadDashboard();
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      const dashboardData = await dashboardApi.getDashboard('staff', {
        period: 'current'
      });
      setData(dashboardData);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  function connectWebSocket() {
    wsRef.current = dashboardApi.connectWebSocket('staff', {
      onOpen: () => console.log('WebSocket connected'),
      onMessage: (message) => {
        if (message.type === 'kpi_update') {
          // Handle real-time KPI updates
          updateKpiData(message);
        } else if (message.type === 'alert') {
          // Handle alerts
          showAlert(message);
        }
      },
      onError: (error) => {
        console.error('WebSocket error:', error);
      },
      onClose: () => {
        console.log('WebSocket disconnected');
        // Optionally reconnect
      }
    });
  }

  function updateKpiData(message) {
    setData(prevData => {
      // Update KPI with new score
      const updatedKpis = prevData.kpis.map(kpi => 
        kpi.id === message.kpi_id 
          ? { ...kpi, score: message.new_score }
          : kpi
      );
      return { ...prevData, kpis: updatedKpis };
    });
  }

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data) return <div>No data available</div>;

  return (
    <div className="dashboard">
      <h1>Staff Dashboard</h1>
      
      <div className="user-info">
        <h2>{data.user.name}</h2>
        <p>Role: {data.user.role}</p>
        <p>Department: {data.user.department}</p>
      </div>

      <div className="kpis">
        <h3>KPIs</h3>
        {data.kpis.map(kpi => (
          <div key={kpi.id} className={`kpi ${kpi.traffic_light}`}>
            <h4>{kpi.name}</h4>
            <p>Target: {kpi.target}</p>
            <p>Actual: {kpi.actual}</p>
            <p>Score: {kpi.score}</p>
            <p>Status: {kpi.traffic_light}</p>
          </div>
        ))}
      </div>

      <div className="pending">
        <h3>Pending Approvals</h3>
        {data.pending_submissions.length === 0 ? (
          <p>No pending submissions</p>
        ) : (
          data.pending_submissions.map(submission => (
            <div key={submission.id} className="submission">
              <p>{submission.kpi_name}: {submission.actual_value}</p>
              <p>Submitted: {new Date(submission.submitted_at).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>

      <p className="last-updated">
        Last updated: {new Date(data.last_updated).toLocaleString()}
      </p>
    </div>
  );
}
```

### Step 3: Error Handling

```javascript
// Handle specific error types
async function handleDashboardError(error) {
  if (error.message.includes('Rate limited')) {
    // Show message and implement exponential backoff
    setTimeout(() => loadDashboard(), 5000);
  } else if (error.message.includes('Permission denied')) {
    // Redirect to unauthorized page
    window.location.href = '/unauthorized';
  } else if (error.message.includes('not found')) {
    // Show 404 message
    setError('Dashboard not found');
  } else {
    // Generic error
    setError('An error occurred loading the dashboard');
  }
}
```

### Step 4: State Management (if using Redux/Zustand)

```javascript
// frontend/src/store/dashboardSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardApi } from '../api/dashboardApi';

export const fetchDashboard = createAsyncThunk(
  'dashboard/fetchDashboard',
  async ({ dashboardType, params }, { rejectWithValue }) => {
    try {
      const data = await dashboardApi.getDashboard(dashboardType, params);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export default dashboardSlice.reducer;
```

---

## API Documentation

### Endpoints

#### 1. Staff Dashboard
```
GET /api/v1/dashboard/staff/?period=current
```

**Response**:
```json
{
  "dashboard_type": "staff",
  "period": "current",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "staff",
    "department": "Sales"
  },
  "kpis": [
    {
      "id": "kpi-uuid",
      "name": "Sales Target",
      "target": 100000,
      "actual": 85000,
      "score": 85.0,
      "traffic_light": "yellow",
      "unit": "USD",
      "weight": 1,
      "status": "submitted"
    }
  ],
  "overall_score": 85.0,
  "traffic_light": "yellow",
  "green_count": 2,
  "yellow_count": 1,
  "red_count": 0,
  "pending_submissions": [
    {
      "id": "uuid",
      "kpi_id": "uuid",
      "kpi_name": "Conversion Rate",
      "actual_value": 3.5,
      "submitted_at": "2026-05-27T10:30:00.000000Z"
    }
  ],
  "last_updated": "2026-05-27T14:30:00.000000Z"
}
```

#### 2. Manager Dashboard
```
GET /api/v1/dashboard/manager/?period=current&include_team=true
```

Similar structure to staff, but includes:
- `personal_kpis`: Manager's own KPIs
- `personal_score`: Manager's score
- `team_members`: Array of team member performance
- `team_summary`: Aggregated team statistics
- `pending_approvals`: Count of pending approvals

#### 3. Executive Dashboard
```
GET /api/v1/dashboard/executive/data/?period=monthly
```

Includes:
- `organization_overview`: Org-wide metrics
- `department_performance`: Performance by department
- `top_issues`: Critical KPIs
- `kpi_trends`: Historical trends
- `recent_alerts`: Recent alerts

#### 4. Drill-Down
```
GET /api/v1/dashboard/drill-down/{user_id}/?period=current
```

Loads another user's dashboard (if you have permission).

---

## Common API Patterns

### Handling Timestamps

All timestamps are ISO 8601 format strings. Parse them in JavaScript:

```javascript
const lastUpdated = new Date(data.last_updated);
const formattedDate = lastUpdated.toLocaleString();
```

### Handling UUIDs

All IDs are strings (already converted from UUIDs). Use them directly in API calls:

```javascript
// Correct
fetch(`/api/v1/dashboard/drill-down/${userId}/`)

// Wrong (don't convert)
fetch(`/api/v1/dashboard/drill-down/${new UUID(userId)}/`)
```

### Handling Null Values

Some fields can be null:

```javascript
// Safe to access
const score = kpi.actual ?? 0;
const supervisor = user.supervisor || null;
```

---

## Caching Strategy

### Client-Side Caching
```javascript
// Cache dashboard data for 5 minutes
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

async function getCachedDashboard(dashboardType) {
  const cached = cache.get(dashboardType);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await dashboardApi.getDashboard(dashboardType);
  cache.set(dashboardType, { data, timestamp: Date.now() });
  
  return data;
}
```

### Server-Side Caching
The backend caches dashboard data for 5 minutes automatically. You can see this in the `X-Cache` header:

```
X-Cache: HIT  (data served from cache)
X-Cache: MISS (data freshly computed)
```

---

## Troubleshooting

### "Permission denied" (403)
- Verify you're logged in
- Check your user role has access to this dashboard type
- Clear authentication and re-login

### "Rate limit exceeded" (429)
- You've made too many requests to this endpoint
- Wait 60 seconds before retrying
- Implement exponential backoff

### "Object cannot be converted to primitive" (500)
- This should not happen anymore (we fixed it!)
- If it does, clear cache and restart server

### WebSocket connection fails
- Check browser console for CORS errors
- Verify WebSocket proxy is configured
- Check that you're using `wss://` for HTTPS

---

## Performance Considerations

1. **Use Pagination** (if backend adds it):
   - Request only the data you need
   - Implement infinite scroll for large lists

2. **Cache Aggressively**:
   - Cache dashboard data for 5 minutes
   - Use WebSocket for real-time updates
   - Don't refresh more than once per minute

3. **Debounce Filters**:
   - Don't send API request on every keystroke
   - Wait 500ms after user stops typing

4. **Connection Pooling**:
   - Reuse WebSocket connection
   - Don't create new connections on every component mount

---

## Testing in Frontend

```javascript
// Test API connectivity
test('should fetch staff dashboard', async () => {
  const data = await dashboardApi.getDashboard('staff');
  expect(data).toHaveProperty('dashboard_type', 'staff');
  expect(data).toHaveProperty('user');
  expect(data).toHaveProperty('kpis');
  expect(data).toHaveProperty('last_updated');
});

// Test WebSocket
test('should connect to WebSocket', (done) => {
  const ws = dashboardApi.connectWebSocket('staff', {
    onOpen: () => {
      expect(ws.readyState).toBe(WebSocket.OPEN);
      ws.close();
      done();
    }
  });
});

// Test error handling
test('should handle permission denied', async () => {
  // Mock fetch to return 403
  global.fetch = jest.fn(() => 
    Promise.resolve({ status: 403, statusText: 'Forbidden' })
  );
  
  expect(dashboardApi.getDashboard('executive')).rejects.toThrow();
});
```

---

## Deployment Checklist

Before deploying to production:

- [ ] Run all tests: `npm test`
- [ ] No console errors or warnings
- [ ] Performance: Dashboard loads in < 2 seconds
- [ ] Responsive: Works on mobile/tablet/desktop
- [ ] Accessibility: ARIA labels present
- [ ] Security: No credentials in localStorage
- [ ] Error handling: All error cases handled gracefully
- [ ] WebSocket: Real-time updates working
- [ ] Cache: Proper cache invalidation

---

## Support & Debugging

### Enable Debug Logging

```javascript
// In development
localStorage.setItem('DEBUG', 'dashboard:*');

// See logs in console
console.debug('[dashboard] Loading staff dashboard...');
```

### Common Issues Checklist

| Issue | Solution |
|-------|----------|
| Dashboard won't load | Check authentication, network tab for errors |
| Data looks wrong | Clear cache, refresh page |
| WebSocket won't connect | Check firewall, CORS settings |
| Performance slow | Implement caching, reduce requests |
| Real-time updates lag | Check network latency, server load |

---

## Next Steps

1. ✅ Backend is ready - all endpoints working
2. 📋 Start building frontend components
3. 🧪 Test each component thoroughly
4. 🚀 Deploy to staging for integration testing
5. 📈 Monitor performance in production

**Happy building! The backend is stable and ready to support your frontend.**

