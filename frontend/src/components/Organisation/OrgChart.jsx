import React, { useEffect, useState } from 'react'
import { organisationService } from '../../services/organisationService'
import { Users, ChevronRight, User } from 'lucide-react'

const OrgTreeNode = ({ position, allPositions }) => {
  const children = allPositions.filter(p => p.reports_to === position.id)
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div style={{ marginLeft: '1.5rem', marginTop: '0.75rem' }}>
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '0.75rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
        onClick={() => setIsOpen(!isOpen)}
      >
        {children.length > 0 && (
          <ChevronRight 
            size={16} 
            color="#9ca3af"
            style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: '0.2s' }} 
          />
        )}
        <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.4rem', borderRadius: '0.5rem', display: 'flex' }}>
          <User size={16} color="#818cf8" />
        </div>
        <div>
          <div style={{ color: '#f3f4f6', fontWeight: '600', fontSize: '0.95rem' }}>{position.title}</div>
          <div style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
            {position.code}
          </div>
        </div>
      </div>

      {isOpen && children.length > 0 && (
        <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.1)', marginLeft: '1rem', paddingLeft: '0.5rem' }}>
          {children.map(child => (
            <OrgTreeNode key={child.id} position={child} allPositions={allPositions} />
          ))}
        </div>
      )}
    </div>
  )
}

function OrgChart() {
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    organisationService.getPositions()
      .then(res => {
        setPositions(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Error loading positions", err)
        setLoading(false)
      })
  }, [])

  if (loading) return <div>Loading Org Chart...</div>

  // Find root positions (those who don't report to anyone)
  const roots = positions.filter(p => !p.reports_to)

  return (
    <div className="org-chart" style={{ textAlign: 'left', marginTop: '2rem' }}>
      <h3><Users size={20} /> Organisational Structure</h3>
      {roots.length > 0 ? (
        roots.map(root => (
          <OrgTreeNode key={root.id} position={root} allPositions={positions} />
        ))
      ) : (
        <p>No positions defined yet. Use the Admin to add your first position!</p>
      )}
    </div>
  )
}

export default OrgChart
