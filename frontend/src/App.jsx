import React, { useEffect, useState } from 'react'
import { organisationService } from './services/organisationService'
import { Building2, MapPin, Users, FileText } from 'lucide-react'
import OrgChart from './components/Organisation/OrgChart'

function App() {
  const [org, setOrg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState(null) // 'locations', 'departments', 'documents'
  const [viewData, setViewData] = useState([])
  const [viewLoading, setViewLoading] = useState(false)

  useEffect(() => {
    console.log("App: Fetching organisation data from /api/v1/organisations/tenants/current/...")
    organisationService.getCurrent()
      .then(res => {
        console.log("App: Organisation data received:", res.data)
        setOrg(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error("App: Error loading organisation:", err)
        setLoading(false)
      })
  }, [])

  const handleCardClick = (view) => {
    setActiveView(view)
    setViewLoading(true)
    
    let fetchPromise;
    if (view === 'locations') fetchPromise = organisationService.getLocations()
    else if (view === 'departments') fetchPromise = organisationService.getDepartments()
    else if (view === 'documents') fetchPromise = organisationService.getDocuments()
    else return;

    fetchPromise
      .then(res => {
        setViewData(res.data)
        setViewLoading(false)
      })
      .catch(err => {
        console.error(`Error fetching ${view}`, err)
        setViewLoading(false)
        setViewData([])
      })
  }

  if (loading) return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2 style={{ color: '#6366f1' }}>Loading Falcon PMS...</h2>
      <p style={{ color: '#9ca3af' }}>Connecting to backend service...</p>
    </div>
  )

  const renderActiveView = () => {
    if (!activeView) return null;

    return (
      <div className="organisation-profile" style={{ marginTop: '2rem', animation: 'fadeIn 0.3s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>{activeView.charAt(0).toUpperCase() + activeView.slice(1)}</h2>
          <button 
            onClick={() => setActiveView(null)}
            style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              border: 'none', 
              color: 'white', 
              padding: '0.5rem 1rem', 
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>

        {viewLoading ? (
          <p>Loading {activeView}...</p>
        ) : viewData.length > 0 ? (
          <div className="grid">
            {viewData.map(item => (
              <div key={item.id} className="card">
                <h3>{item.name}</h3>
                <p>{item.description || 'No description available.'}</p>
                {item.code && <span className="badge">{item.code}</span>}
              </div>
            ))}
          </div>
        ) : (
          <p>No {activeView} found. Try adding some in the backend!</p>
        )}
      </div>
    )
  }

  return (
    <div className="App">
      <header>
        <h1>Falcon Platform</h1>
      </header>

      <main>
        {org ? (
          <div className="organisation-profile">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Building2 size={48} color="#818cf8" />
              <div>
                <h2>{org.name}</h2>
                <span className="badge">{org.industry}</span>
              </div>
            </div>

            <div className="grid">
              <div className="card" onClick={() => handleCardClick('locations')}>
                <h3><MapPin size={18} /> Locations</h3>
                <p>Manage office branches and headquarters.</p>
              </div>
              <div className="card" onClick={() => handleCardClick('departments')}>
                <h3><Users size={18} /> Departments</h3>
                <p>Define teams and reporting structures.</p>
              </div>
              <div className="card" onClick={() => handleCardClick('documents')}>
                <h3><FileText size={18} /> Documents</h3>
                <p>Compliance and legal records.</p>
              </div>
            </div>

            {renderActiveView()}

            <OrgChart />
          </div>
        ) : (
          <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
            <h3>Sign In to Falcon</h3>
            <p>Please sign in to view your organisation chart and data.</p>
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                const email = e.target.email.value;
                const password = e.target.password.value;
                try {
                  const res = await fetch('/api/v1/auth/login/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                  });
                  const data = await res.json();
                  if (res.ok) {
                    localStorage.setItem('access_token', data.access);
                    if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
                    window.location.reload();
                  } else {
                    alert(data.detail || 'Login failed. Check credentials.');
                  }
                } catch (err) {
                  alert('Network Error: ' + err.message);
                }
              }} 
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}
            >
              <input 
                name="email" 
                type="email" 
                placeholder="Email address" 
                required 
                style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }} 
              />
              <input 
                name="password" 
                type="password" 
                placeholder="Password" 
                required 
                style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }} 
              />
              <button 
                type="submit" 
                style={{ padding: '0.75rem', borderRadius: '0.5rem', background: '#6366f1', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginTop: '0.5rem' }}
              >
                Sign In
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}

export default App